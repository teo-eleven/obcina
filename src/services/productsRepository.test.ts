import { CATEGORY_PAGE_LIMIT, FIRESTORE_IN_LIMIT } from '../constants'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SEED_PRODUCTS } from '../constants/seedProducts'

const fakeDb = { type: 'fake-firestore' }
// A server read: offline, getDocs would answer from the empty local cache and show an empty shelf.
const getDocsFromServer = vi.hoisted(() => vi.fn())
const getDocs = vi.hoisted(() => vi.fn())
const getDocFromServer = vi.hoisted(() => vi.fn())

vi.mock('./firebase', () => ({ getDb: () => fakeDb }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db: unknown, name: string) => ({ collection: name })),
  where: vi.fn((field: string, op: string, value: string) => ({ where: [field, op, value] })),
  limit: vi.fn((n: number) => ({ limit: n })),
  query: vi.fn((...parts: unknown[]) => ({ query: parts })),
  doc: vi.fn((_db: unknown, name: string, id: string) => ({ doc: [name, id] })),
  documentId: vi.fn(() => '__name__'),
  getDocs,
  getDocsFromServer,
  getDocFromServer,
}))

const { collection, doc, documentId, limit, query, where } = await import('firebase/firestore')
const { fetchCategoryProducts, fetchProduct, fetchProductsBySlugs } =
  await import('./productsRepository')

const honey = SEED_PRODUCTS.filter((product) => product.category === 'miere')
const toDoc = (data: unknown, id: string) => ({ id, data: () => data })

describe('fetchCategoryProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('queries the products of one category with the page limit the rules require', async () => {
    getDocsFromServer.mockResolvedValue({ docs: [] })

    await fetchCategoryProducts('miere')

    expect(CATEGORY_PAGE_LIMIT).toBe(50)
    expect(collection).toHaveBeenCalledWith(fakeDb, 'products')
    expect(where).toHaveBeenCalledWith('category', '==', 'miere')
    expect(limit).toHaveBeenCalledWith(50)
    expect(query).toHaveBeenCalledWith(
      { collection: 'products' },
      { where: ['category', '==', 'miere'] },
      { limit: 50 },
    )
  })

  it('reads from the server, never from the local cache', async () => {
    getDocsFromServer.mockResolvedValue({ docs: [] })

    await fetchCategoryProducts('miere')

    expect(getDocsFromServer).toHaveBeenCalledTimes(1)
    expect(getDocs).not.toHaveBeenCalled()
  })

  it('returns the parsed products sorted by name', async () => {
    const shuffled = honey.toReversed()
    getDocsFromServer.mockResolvedValue({ docs: shuffled.map((p) => toDoc(p, p.slug)) })

    const products = await fetchCategoryProducts('miere')

    const names = products.map((product) => product.name)
    expect(names).toEqual(
      honey.map((product) => product.name).toSorted((a, b) => a.localeCompare(b, 'ro')),
    )
    expect(names.indexOf('Miere de mană de brad')).toBeLessThan(names.indexOf('Miere de tei'))
  })

  it('skips an invalid document and warns with its id', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const [first] = honey
    getDocsFromServer.mockResolvedValue({
      docs: [toDoc({ name: 'broken' }, 'bad-doc'), toDoc(first, first?.slug ?? '')],
    })

    const products = await fetchCategoryProducts('miere')

    expect(products).toEqual([first])
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0]?.[0])).toContain('bad-doc')
  })

  it('logs where a document is wrong, never the values stored in it', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const [first] = honey
    getDocsFromServer.mockResolvedValue({
      docs: [toDoc({ ...first, priceBani: 'leak-me' }, 'bad-doc')],
    })

    await fetchCategoryProducts('miere')

    const logged = String(warn.mock.calls[0]?.[0])
    expect(logged).toContain('bad-doc')
    expect(logged).toContain('priceBani')
    expect(logged).not.toContain('leak-me')
  })

  it('skips a document whose id is not its slug', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const [first, second] = honey
    getDocsFromServer.mockResolvedValue({
      docs: [toDoc(first, 'other-id'), toDoc(second, second?.slug ?? '')],
    })

    const products = await fetchCategoryProducts('miere')

    expect(products).toEqual([second])
    expect(String(warn.mock.calls[0]?.[0])).toContain('other-id')
  })

  it('propagates a Firestore failure', async () => {
    getDocsFromServer.mockRejectedValue(new Error('permission-denied'))

    await expect(fetchCategoryProducts('miere')).rejects.toThrow('permission-denied')
  })
})

const tea = SEED_PRODUCTS.find((product) => product.slug === 'miere-de-tei')
const snapshotOf = (data: unknown, id: string) => ({
  exists: () => data !== undefined,
  id,
  data: () => data,
})

describe('fetchProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reads one document from the server by its slug', async () => {
    getDocFromServer.mockResolvedValue(snapshotOf(tea, 'miere-de-tei'))

    const product = await fetchProduct('miere-de-tei')

    expect(product).toEqual(tea)
    expect(doc).toHaveBeenCalledWith(fakeDb, 'products', 'miere-de-tei')
    expect(getDocFromServer).toHaveBeenCalledWith({ doc: ['products', 'miere-de-tei'] })
  })

  it.each([
    '',
    'ab',
    'Miere-De-Tei',
    'miere_de_tei',
    'a/b',
    '-miere',
    'miere-',
    'a--b',
    '..',
    '__name__',
    'miere%2Fde-tei',
    'x'.repeat(81),
  ])('returns null without calling Firestore for the malformed slug %j', async (slug) => {
    const product = await fetchProduct(slug)

    expect(product).toBeNull()
    expect(getDocFromServer).not.toHaveBeenCalled()
  })

  it('returns null for a missing document', async () => {
    getDocFromServer.mockResolvedValue(snapshotOf(undefined, 'nu-exista'))

    expect(await fetchProduct('nu-exista')).toBeNull()
  })

  it('warns with field paths only and returns null for invalid data', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    getDocFromServer.mockResolvedValue(snapshotOf({ ...tea, priceBani: 'leak-me' }, 'miere-de-tei'))

    const product = await fetchProduct('miere-de-tei')

    expect(product).toBeNull()
    const logged = String(warn.mock.calls[0]?.[0])
    expect(logged).toContain('miere-de-tei')
    expect(logged).toContain('priceBani')
    expect(logged).not.toContain('leak-me')
  })

  it('warns and returns null when the data slug is not the requested one', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    getDocFromServer.mockResolvedValue(snapshotOf(tea, 'alt-slug'))

    expect(await fetchProduct('alt-slug')).toBeNull()
    expect(String(warn.mock.calls[0]?.[0])).toContain('alt-slug')
  })

  it('propagates a Firestore failure', async () => {
    getDocFromServer.mockRejectedValue(new Error('unavailable'))

    await expect(fetchProduct('miere-de-tei')).rejects.toThrow('unavailable')
  })
})

describe('fetchProductsBySlugs', () => {
  const wanted = ['miere-de-tei', 'branza-de-burduf', 'gem-de-zmeura']
  const wantedProducts = wanted.map((slug) => SEED_PRODUCTS.find((p) => p.slug === slug))

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns [] without a query for no slugs', async () => {
    expect(await fetchProductsBySlugs([])).toEqual([])
    expect(getDocsFromServer).not.toHaveBeenCalled()
  })

  it('queries by document id with a limit equal to the number of slugs', async () => {
    getDocsFromServer.mockResolvedValue({ docs: [] })

    await fetchProductsBySlugs(wanted)

    expect(documentId).toHaveBeenCalled()
    expect(where).toHaveBeenCalledWith('__name__', 'in', wanted)
    expect(limit).toHaveBeenCalledWith(3)
    expect(getDocsFromServer).toHaveBeenCalledTimes(1)
  })

  it('returns the products in the order of the input slugs', async () => {
    getDocsFromServer.mockResolvedValue({
      docs: wantedProducts.toReversed().map((p) => toDoc(p, p?.slug ?? '')),
    })

    expect(await fetchProductsBySlugs(wanted)).toEqual(wantedProducts)
  })

  it('skips an invalid document and one whose id is not its slug, with warnings', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    getDocsFromServer.mockResolvedValue({
      docs: [
        toDoc({ name: 'broken' }, 'bad-doc'),
        toDoc(tea, 'other-id'),
        toDoc(wantedProducts[1], 'branza-de-burduf'),
      ],
    })

    const products = await fetchProductsBySlugs(wanted)

    expect(products).toEqual([wantedProducts[1]])
    expect(warn).toHaveBeenCalledTimes(2)
  })

  describe('with more slugs than one "in" query takes', () => {
    // Real slugs are looked up by id, so the fake documents only need an id and a valid product body.
    const template = SEED_PRODUCTS[0]!
    const manySlugs = (n: number) => Array.from({ length: n }, (_, i) => `produs-${i + 1}`)
    const productFor = (slug: string) => ({ ...template, slug })

    /** Answers each query with the products whose slugs are in that query's `in` batch. */
    function answerPerBatch() {
      getDocsFromServer.mockImplementation((q: { query: unknown[] }) => {
        const clause = q.query.find(
          (part): part is { where: [string, string, string[]] } =>
            typeof part === 'object' && part !== null && 'where' in part,
        )
        const batch = clause?.where[2] ?? []
        return Promise.resolve({ docs: batch.toReversed().map((s) => toDoc(productFor(s), s)) })
      })
    }

    it('limits one "in" query to 30 values, the Firestore maximum', () => {
      expect(FIRESTORE_IN_LIMIT).toBe(30)
    })

    it('uses a single query for exactly 30 slugs', async () => {
      const slugs = manySlugs(30)
      answerPerBatch()

      const products = await fetchProductsBySlugs(slugs)

      expect(getDocsFromServer).toHaveBeenCalledTimes(1)
      expect(where).toHaveBeenCalledWith('__name__', 'in', slugs)
      expect(products.map((p) => p.slug)).toEqual(slugs)
    })

    it('splits 31 slugs into a batch of 30 and a batch of 1', async () => {
      const slugs = manySlugs(31)
      answerPerBatch()

      await fetchProductsBySlugs(slugs)

      expect(getDocsFromServer).toHaveBeenCalledTimes(2)
      expect(where).toHaveBeenNthCalledWith(1, '__name__', 'in', slugs.slice(0, 30))
      expect(where).toHaveBeenNthCalledWith(2, '__name__', 'in', slugs.slice(30))
      expect(limit).toHaveBeenCalledWith(30)
      expect(limit).toHaveBeenCalledWith(1)
    })

    it('splits 65 slugs into batches of 30, 30 and 5', async () => {
      const slugs = manySlugs(65)
      answerPerBatch()

      await fetchProductsBySlugs(slugs)

      const batches = vi.mocked(where).mock.calls.map((call) => (call[2] as string[]).length)
      expect(batches).toEqual([30, 30, 5])
    })

    it('keeps the order of the input slugs across batches', async () => {
      const slugs = manySlugs(45)
      answerPerBatch()

      const products = await fetchProductsBySlugs(slugs)

      expect(products.map((p) => p.slug)).toEqual(slugs)
    })

    it('fails the whole read when one batch fails', async () => {
      // No once-queue: an unconsumed one would leak into the next test while batching is missing.
      getDocsFromServer.mockImplementation((q: { query: unknown[] }) =>
        JSON.stringify(q).includes('produs-31')
          ? Promise.reject(new Error('unavailable'))
          : Promise.resolve({ docs: [] }),
      )

      await expect(fetchProductsBySlugs(manySlugs(31))).rejects.toThrow('unavailable')
    })
  })

  it('propagates a Firestore failure', async () => {
    getDocsFromServer.mockRejectedValue(new Error('permission-denied'))

    await expect(fetchProductsBySlugs(wanted)).rejects.toThrow('permission-denied')
  })
})
