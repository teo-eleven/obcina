import { useMemo, useSyncExternalStore } from 'react'
import { cartStore, type CartStore } from '../stores'
import type { Cart } from '../types'
import { itemCount } from '../utils'

export interface UseCart {
  readonly cart: Cart
  readonly itemCount: number
  readonly addItem: CartStore['addItem']
  readonly removeItem: CartStore['removeItem']
  readonly setQuantity: CartStore['setQuantity']
  readonly clear: CartStore['clear']
}

/** Binds a cart store to a component; tests pass their own store. */
export function useCartStore(store: CartStore): UseCart {
  // Client-only app (Vite SPA): the server snapshot is never used for hydration.
  const cart = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  return useMemo(
    () => ({
      cart,
      itemCount: itemCount(cart),
      addItem: store.addItem,
      removeItem: store.removeItem,
      setQuantity: store.setQuantity,
      clear: store.clear,
    }),
    [cart, store],
  )
}

/** The app's cart, saved in the browser and shared by every component and tab. */
export function useCart(): UseCart {
  return useCartStore(cartStore)
}
