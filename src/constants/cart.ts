import type { Cart } from '../types'

// Sanity cap per line, so a stored or typed value can never grow without bound. Stock limits come
// on top of it (step 3.4).
export const MAX_LINE_QUANTITY = 99

export const EMPTY_CART: Cart = Object.freeze([])
