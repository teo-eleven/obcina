import { readFileSync } from 'node:fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestContext,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  limitToLast,
  orderBy,
  query,
  setDoc,
  startAfter,
  updateDoc,
  where,
  type CollectionReference,
  type Query,
} from 'firebase/firestore'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { CategorySlug } from '../src/data/categories'
import { SEED_PRODUCTS } from '../src/data/seedProducts'
import { PRODUCTS_COLLECTION } from '../src/lib/catalog'
import {
  EMULATOR_HOST,
  EMULATOR_PROJECT_ID,
  FIRESTORE_EMULATOR_PORT,
} from '../src/lib/firebaseConfig'

// Must match the limit in firestore.rules.
const MAX_LIST_SIZE = 100

type QueryBuilder = (products: CollectionReference) => Query

function mustFind(category: CategorySlug) {
  const found = SEED_PRODUCTS.find((product) => product.category === category)
  if (!found) throw new Error(`The seed has no product in category ${category}`)
  return found
}

const single = mustFind('miere')
const basket = mustFind('cosuri-cadou')

let env: RulesTestEnvironment | undefined

function testEnv(): RulesTestEnvironment {
  if (!env) throw new Error('The rules test environment did not start (is the emulator running?)')
  return env
}

// No test here writes successfully, so the data is seeded once for the whole file.
beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: EMULATOR_PROJECT_ID,
    firestore: {
      rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'),
      host: EMULATOR_HOST,
      port: FIRESTORE_EMULATOR_PORT,
    },
  })
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()
    await setDoc(doc(db, PRODUCTS_COLLECTION, single.slug), single)
    await setDoc(doc(db, PRODUCTS_COLLECTION, basket.slug), basket)
    await setDoc(doc(db, PRODUCTS_COLLECTION, single.slug, 'private', 'cost'), { costBani: 900 })
    await setDoc(doc(db, 'orders', 'o1'), { status: 'pending' })
  })
})

afterAll(async () => {
  await env?.cleanup()
})

it('protects the collection the app actually reads', () => {
  // The rules hard-code "products"; renaming the constant alone would move data out of their reach.
  expect(PRODUCTS_COLLECTION).toBe('products')
})

const clients: readonly (readonly [string, (env: RulesTestEnvironment) => RulesTestContext])[] = [
  ['an unauthenticated visitor', (e) => e.unauthenticatedContext()],
  ['a signed-in user', (e) => e.authenticatedContext('alice')],
  // Admin rights will come from custom claims later; for now they must grant nothing extra.
  ['a user with an admin claim', (e) => e.authenticatedContext('boss', { admin: true })],
]

describe.each(clients)('Firestore rules for %s', (_name, makeContext) => {
  // rules-unit-testing hands out its own Firestore type; the modular functions accept it.
  let db: ReturnType<RulesTestContext['firestore']>
  const products = () => collection(db, PRODUCTS_COLLECTION)

  beforeAll(() => {
    db = makeContext(testEnv()).firestore()
  })

  it('reads a single product or gift basket', async () => {
    await assertSucceeds(getDoc(doc(db, PRODUCTS_COLLECTION, single.slug)))
    await assertSucceeds(getDoc(doc(db, PRODUCTS_COLLECTION, basket.slug)))
  })

  it.each<readonly [string, QueryBuilder]>([
    ['limit(50)', (c) => query(c, limit(50))],
    [`limit(${MAX_LIST_SIZE})`, (c) => query(c, limit(MAX_LIST_SIZE))],
    ['where category + limit', (c) => query(c, where('category', '==', 'miere'), limit(50))],
    ['a cursor + limit', (c) => query(c, orderBy('slug'), startAfter('a'), limit(10))],
  ])('lists products with %s', async (_label, build) => {
    const snapshot = await assertSucceeds(getDocs(build(products())))
    expect(snapshot.size).toBeGreaterThan(0)
  })

  it.each<readonly [string, QueryBuilder]>([
    ['no limit', (c) => query(c)],
    [`limit(${MAX_LIST_SIZE + 1})`, (c) => query(c, limit(MAX_LIST_SIZE + 1))],
    [
      `limitToLast(${MAX_LIST_SIZE + 1})`,
      (c) => query(c, orderBy('slug'), limitToLast(MAX_LIST_SIZE + 1)),
    ],
    ['where category and no limit', (c) => query(c, where('category', '==', 'miere'))],
  ])('rejects listing products with %s', async (_label, build) => {
    await assertFails(getDocs(build(products())))
  })

  // Aggregations are authorised as list queries, so the same bound applies.
  it('counts products only within a limit', async () => {
    await assertSucceeds(getCountFromServer(query(products(), limit(50))))
    await assertFails(getCountFromServer(products()))
  })

  // One test per operation, so each denial is proven on its own (a failure stops a test early).
  it.each([
    ['creating', () => setDoc(doc(db, PRODUCTS_COLLECTION, 'new-product'), single)],
    ['updating', () => updateDoc(doc(db, PRODUCTS_COLLECTION, single.slug), { priceBani: 1 })],
    ['deleting', () => deleteDoc(doc(db, PRODUCTS_COLLECTION, single.slug))],
  ])('rejects %s a product', async (_label, write) => {
    await assertFails(write())
  })

  // Nothing below has a rule of its own: these prove the default deny, so private data can live in
  // a subcollection or another collection without being exposed by the public product rule.
  it.each([
    [
      'reading a product subcollection',
      () => getDoc(doc(db, PRODUCTS_COLLECTION, single.slug, 'private', 'cost')),
    ],
    ['a collection-group query', () => getDocs(query(collectionGroup(db, 'private'), limit(10)))],
    ['reading an order', () => getDoc(doc(db, 'orders', 'o1'))],
    ['listing orders', () => getDocs(query(collection(db, 'orders'), limit(10)))],
    ['creating an order', () => setDoc(doc(db, 'orders', 'o2'), { status: 'pending' })],
    ['marking an order paid', () => updateDoc(doc(db, 'orders', 'o1'), { status: 'paid' })],
    ['reading any other collection', () => getDoc(doc(db, 'anything', 'x'))],
    ['writing any other collection', () => setDoc(doc(db, 'anything', 'x'), { a: 1 })],
  ])('denies %s', async (_label, operation) => {
    await assertFails(operation())
  })
})
