import { useState } from 'react'
import { fetchProductsBySlugs } from '../services'
import type { Cart, Product } from '../types'
import { useRemoteData, type RemoteData } from './useRemoteData'

/**
 * The catalogue entries for the products in the cart. Read again only when a product appears that
 * wasn't read yet: removing a line or changing a quantity needs no new request.
 */
export function useCartProducts(cart: Cart): RemoteData<readonly Product[]> {
  const slugs = cart.map((line) => line.productId)
  // Adjusted during render (no effect): a new product in the cart widens what we ask for.
  const [requested, setRequested] = useState(slugs)
  if (!slugs.every((slug) => requested.includes(slug))) setRequested(slugs)
  return useRemoteData(`the cart products ${requested.join(',')}`, () =>
    fetchProductsBySlugs(requested),
  )
}
