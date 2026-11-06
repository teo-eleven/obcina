import { useCallback, useEffect, useState } from 'react'
import type { CategorySlug } from '../data/categories'
import type { Product } from '../lib/product'
import { fetchCategoryProducts } from '../lib/productsRepository'

export type CategoryProductsState =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly retry: () => void }
  | { readonly status: 'ready'; readonly products: readonly Product[] }

type Result =
  { readonly status: 'error' } | { readonly status: 'ready'; readonly products: readonly Product[] }

/** Loads a shelf; a late answer for a category you already left is ignored. */
export function useCategoryProducts(category: CategorySlug): CategoryProductsState {
  // Each result remembers which request it answers, so loading is derived, not stored.
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<{ key: string; result: Result } | null>(null)
  const key = `${category}#${attempt}`

  useEffect(() => {
    let isCurrent = true
    fetchCategoryProducts(category).then(
      (products) => {
        if (isCurrent) setSettled({ key, result: { status: 'ready', products } })
      },
      (error: unknown) => {
        if (!isCurrent) return
        // The page shows a plain message; the cause (offline, permission-denied...) goes to the console.
        console.error(`Could not load the ${category} shelf:`, error)
        setSettled({ key, result: { status: 'error' } })
      },
    )
    return () => {
      isCurrent = false
    }
  }, [category, key])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  if (settled?.key !== key) return { status: 'loading' }
  return settled.result.status === 'error' ? { status: 'error', retry } : settled.result
}
