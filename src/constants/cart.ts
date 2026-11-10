import type { Cart } from '../types'

// Sanity cap per line, so a stored or typed value can never grow without bound. Stock limits come
// on top of it (step 3.4).
export const MAX_LINE_QUANTITY = 99

export const EMPTY_CART: Cart = Object.freeze([])

// A saved cart is untrusted input: past this many distinct products, the rest is dropped. The
// catalogue has about 20 products, so a real cart never gets near it.
export const MAX_CART_LINES = 50

// parseCart looks at no more entries than this, so a huge saved array can't stall the page.
export const MAX_SCANNED_CART_ENTRIES = MAX_CART_LINES * 10

// A full 50-line cart is about 3 KB of JSON; anything longer is not ours and is not parsed at all.
export const MAX_SAVED_CART_CHARS = 8192

// Versioned, so a future change of shape can ignore (or migrate) carts saved by an older version.
export const CART_STORAGE_KEY = 'obcina.cart.v1'
