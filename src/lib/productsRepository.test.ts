import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SEED_PRODUCTS } from '../data/seedProducts'

const fakeDb = { type: 'fake-firestore' }
// A server read: offline, getDocs would answer from the empty local cache and show an empty shelf.
const getDocsFromServer = vi.hoisted(() => vi.fn())
const getDocs = vi.hoisted(() => vi.fn())

vi.mock('./firebase', () => ({ getDb: () => fakeDb }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db: unknown, name: string) => ({ collection: name })),
  where: vi.fn((field: string, op: string, value: string) => ({ where: [field, op, value] })),
  limit: vi.fn((n: number) => ({ limit: n })),
  query: vi.fn((...parts: unknown[]) => ({ query: parts })),
  getDocs,
  getDocsFromServer,
}))

const { collection, limit, query, where } = await import('firebase/firestore')
const { CATEGORY_PAGE_LIMIT, fetchCategoryProducts } = await import('./productsRepository')

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
