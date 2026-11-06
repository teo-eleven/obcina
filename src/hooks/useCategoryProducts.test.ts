import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SEED_PRODUCTS } from '../data/seedProducts'
import type { CategorySlug } from '../data/categories'
import type { Product } from '../lib/product'
import { fetchCategoryProducts } from '../lib/productsRepository'
import { useCategoryProducts } from './useCategoryProducts'

vi.mock('../lib/productsRepository')

const byCategory = (category: string): Product[] =>
  SEED_PRODUCTS.filter((product) => product.category === category)

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

describe('useCategoryProducts', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('starts loading, then returns the products', async () => {
    vi.mocked(fetchCategoryProducts).mockResolvedValue(byCategory('miere'))

    const { result } = renderHook(() => useCategoryProducts('miere'))

    expect(result.current).toEqual({ status: 'loading' })
    await waitFor(() => {
      expect(result.current).toEqual({ status: 'ready', products: byCategory('miere') })
    })
    expect(fetchCategoryProducts).toHaveBeenCalledWith('miere')
  })

  it('reports an error and refetches on retry', async () => {
    vi.mocked(fetchCategoryProducts)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(byCategory('miere'))
    const { result } = renderHook(() => useCategoryProducts('miere'))
    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })

    act(() => {
      if (result.current.status === 'error') result.current.retry()
    })

    expect(result.current.status).toBe('loading')
    await waitFor(() => {
      expect(result.current).toEqual({ status: 'ready', products: byCategory('miere') })
    })
    expect(fetchCategoryProducts).toHaveBeenCalledTimes(2)
  })

  it('keeps only the latest category when an earlier request resolves late', async () => {
    const first = deferred<Product[]>()
    const second = deferred<Product[]>()
    vi.mocked(fetchCategoryProducts)
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    const { result, rerender } = renderHook(
      ({ category }: { category: CategorySlug }) => useCategoryProducts(category),
      { initialProps: { category: 'miere' } },
    )

    rerender({ category: 'ceaiuri' })
    expect(result.current).toEqual({ status: 'loading' })
    await act(async () => {
      second.resolve(byCategory('ceaiuri'))
      await second.promise
    })
    await act(async () => {
      first.resolve(byCategory('miere'))
      await first.promise
    })

    expect(result.current).toEqual({ status: 'ready', products: byCategory('ceaiuri') })
  })

  it('ignores a late failure from a category the visitor already left', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    let rejectFirst: (reason: unknown) => void = () => undefined
    vi.mocked(fetchCategoryProducts)
      .mockReturnValueOnce(
        new Promise<Product[]>((_resolve, reject) => {
          rejectFirst = reject
        }),
      )
      .mockResolvedValueOnce(byCategory('ceaiuri'))
    const firstShelf: { category: CategorySlug } = { category: 'miere' }
    const { result, rerender } = renderHook(
      ({ category }: { category: CategorySlug }) => useCategoryProducts(category),
      { initialProps: firstShelf },
    )

    rerender({ category: 'ceaiuri' })
    await waitFor(() => expect(result.current.status).toBe('ready'))
    await act(async () => rejectFirst(new Error('late')))

    expect(result.current.status).toBe('ready')
    expect(error).not.toHaveBeenCalled()
    error.mockRestore()
  })
})
