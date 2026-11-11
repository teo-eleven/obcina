import { CART_STORAGE_KEY, EMPTY_CART, MAX_SAVED_CART_CHARS } from '../constants'
import type { Cart } from '../types'
import { addItem, parseCart, removeItem, setQuantity } from '../utils'

// The cart shared by the whole app, saved in the browser so it survives a refresh and stays in
// step across tabs. No React here: components read it through hooks/useCart.

type CartStorage = Pick<Storage, 'getItem' | 'setItem'>

/** Every action throws RangeError on a bad id or quantity (a programming error, not user input). */
export interface CartStore {
  getSnapshot(): Cart
  subscribe(listener: () => void): () => void
  /** `limit` is the product's stock (see utils cartLimit); the line never goes past it. */
  addItem(productId: string, quantity?: number, limit?: number): void
  removeItem(productId: string): void
  setQuantity(productId: string, quantity: number, limit?: number): void
  clear(): void
}

/** Saved JSON (or a missing value) → a valid cart. Never throws. */
function readSaved(json: string | null): Cart {
  // Too long to be a cart we saved: don't spend the time parsing it.
  if (json === null || json.length > MAX_SAVED_CART_CHARS) return EMPTY_CART
  try {
    return parseCart(JSON.parse(json))
  } catch {
    return EMPTY_CART
  }
}

const sameCart = (a: Cart, b: Cart): boolean =>
  a.length === b.length &&
  a.every((line, i) => line.productId === b[i]?.productId && line.quantity === b[i]?.quantity)

/** `storage` is undefined where the browser refuses it (some private modes): the cart then lives in memory. */
export function createCartStore(storage: CartStorage | undefined): CartStore {
  const listeners = new Set<() => void>()
  let hasWarnedAboutReads = false
  let hasWarnedAboutWrites = false
  let cart = readStorage() ?? EMPTY_CART

  /** The saved cart, or undefined when there is no storage or it can't be read right now. */
  function readStorage(): Cart | undefined {
    if (!storage) return undefined
    try {
      return readSaved(storage.getItem(CART_STORAGE_KEY))
    } catch {
      // Never the error itself: some browsers put the stored value or a path in the message.
      if (!hasWarnedAboutReads)
        console.warn('Could not read the saved cart; using the one in memory.')
      hasWarnedAboutReads = true
      return undefined
    }
  }

  function save(next: Cart): void {
    try {
      storage?.setItem(CART_STORAGE_KEY, JSON.stringify(next))
    } catch {
      if (!hasWarnedAboutWrites) console.warn('Could not save the cart; it is kept in memory only.')
      hasWarnedAboutWrites = true
    }
  }

  function emit(next: Cart, { persist }: { persist: boolean }): void {
    if (next === cart) return
    cart = next
    if (persist) save(next)
    for (const listener of [...listeners]) listener()
  }

  // Adopts a cart saved elsewhere (another tab); it is already stored, so it isn't written back.
  function adopt(incoming: Cart): void {
    if (!sameCart(incoming, cart)) emit(incoming, { persist: false })
  }

  // Another tab changed the cart, or cleared all storage (key null).
  function onStorage(event: StorageEvent): void {
    if (event.storageArea && event.storageArea !== storage) return
    if (event.key === null) return adopt(EMPTY_CART)
    if (event.key === CART_STORAGE_KEY) adopt(readSaved(event.newValue))
  }

  return {
    getSnapshot: () => cart,
    subscribe(listener) {
      if (listeners.size === 0) {
        // Nobody heard the other tabs while no one was listening: catch up first.
        const saved = readStorage()
        if (saved) adopt(saved)
        if (typeof window !== 'undefined') window.addEventListener('storage', onStorage)
      }
      listeners.add(listener)
      return () => {
        if (!listeners.delete(listener)) return
        if (listeners.size === 0 && typeof window !== 'undefined') {
          window.removeEventListener('storage', onStorage)
        }
      }
    },
    addItem: (productId, quantity, limit) =>
      emit(addItem(cart, productId, quantity, limit), { persist: true }),
    removeItem: (productId) => emit(removeItem(cart, productId), { persist: true }),
    setQuantity: (productId, quantity, limit) =>
      emit(setQuantity(cart, productId, quantity, limit), { persist: true }),
    clear: () => emit(cart.length === 0 ? cart : EMPTY_CART, { persist: true }),
  }
}

/** localStorage, or undefined where merely touching it throws (blocked storage, private modes). */
function browserStorage(): CartStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

/** The app's one cart. */
export const cartStore = createCartStore(browserStorage())
