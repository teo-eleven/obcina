import type { CategorySlug } from '../data/categories'
import type { Product } from '../lib/product'
import { fetchCategoryProducts } from '../lib/productsRepository'
import { useRemoteData, type RemoteData } from './useRemoteData'

export type CategoryProductsState =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly retry: () => void }
  | { readonly status: 'ready'; readonly products: readonly Product[] }

/** Loads a shelf; a late answer for a category you already left is ignored. */
export function useCategoryProducts(category: CategorySlug): CategoryProductsState {
  const state: RemoteData<readonly Product[]> = useRemoteData(`the ${category} shelf`, () =>
    fetchCategoryProducts(category),
  )
  return state.status === 'ready' ? { status: 'ready', products: state.data } : state
}
