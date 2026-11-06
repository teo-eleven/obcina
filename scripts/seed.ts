// Loads the seed catalogue (src/data/seedProducts.ts) into the local Firestore emulator.
//
// Idempotent: every product is written with set() under its slug, so running it twice gives the
// same database; products no longer in the catalogue are deleted. The whole catalogue is validated
// first (schema, unique slugs, basket components), and nothing is written if anything is wrong.
//
// Emulator only. The Admin SDK writes past the security rules, so this script pins
// FIRESTORE_EMULATOR_HOST itself and uses the offline demo project; it cannot reach obcina-4f2a1.
//
// Usage: npm run emulators   (in one terminal)
//        npm run seed        (in another)

import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { SEED_PRODUCTS } from '../src/data/seedProducts.ts'
import { PRODUCTS_COLLECTION, planSync, validateCatalog } from '../src/lib/catalog.ts'
import {
  assertEmulatorOnly,
  EMULATOR_HOST,
  EMULATOR_PROJECT_ID,
  FIRESTORE_EMULATOR_PORT,
} from '../src/lib/firebaseConfig.ts'

const EMULATOR_ADDRESS = `${EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT}`
const EMULATOR_CHECK_TIMEOUT_MS = 2000
const MAX_BATCH_WRITES = 500 // Firestore's limit for one batch

// The Firestore emulator answers "Ok" on its root; anything else on that port is not it.
async function ensureEmulatorIsRunning() {
  const notRunning = new Error(
    `No Firestore emulator at ${EMULATOR_ADDRESS}. Start it first with "npm run emulators".`,
  )
  try {
    const response = await fetch(`http://${EMULATOR_ADDRESS}/`, {
      signal: AbortSignal.timeout(EMULATOR_CHECK_TIMEOUT_MS),
    })
    if ((await response.text()).trim() !== 'Ok') throw notRunning
  } catch {
    throw notRunning
  }
}

async function main() {
  // Second line of defence: refuse credentials or a real project before anything else happens.
  assertEmulatorOnly(process.env, EMULATOR_PROJECT_ID)
  // Overwrite, never inherit: an exported value pointing elsewhere must not redirect the writes.
  // firebase-admin reads it when Firestore is created below, not at import time.
  process.env.FIRESTORE_EMULATOR_HOST = EMULATOR_ADDRESS

  const catalog = validateCatalog(SEED_PRODUCTS)
  await ensureEmulatorIsRunning()

  const db = getFirestore(initializeApp({ projectId: EMULATOR_PROJECT_ID }))
  const products = db.collection(PRODUCTS_COLLECTION)
  const existing = await products.listDocuments()
  const plan = planSync(
    catalog,
    existing.map((doc) => doc.id),
  )

  // One batch, so a failure leaves the database untouched. Chunk it if the catalogue ever grows.
  if (plan.upsert.length + plan.remove.length > MAX_BATCH_WRITES) {
    throw new Error(`More than ${MAX_BATCH_WRITES} writes; split the seed into batches first.`)
  }
  const batch = db.batch()
  for (const product of plan.upsert) batch.set(products.doc(product.slug), product)
  for (const id of plan.remove) batch.delete(products.doc(id))
  await batch.commit()

  console.log(
    `Seeded ${plan.upsert.length} products into ${EMULATOR_PROJECT_ID}/${PRODUCTS_COLLECTION}` +
      (plan.remove.length > 0 ? `; removed ${plan.remove.join(', ')}` : ''),
  )
}

// Messages are written to stand alone; an SDK error's cause is shown too, anything else in full.
main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(`Seed failed: ${error.message}`)
    if (error.cause !== undefined) console.error('Cause:', error.cause)
  } else {
    console.error('Seed failed:', error)
  }
  process.exitCode = 1
})
