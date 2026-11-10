/*
 * The cart as plain data and pure functions. A line holds only what the server will accept at
 * checkout ({ productId, quantity }); prices come from the catalogue when a total is needed, so a
 * cart kept in the browser never carries a stale price. Every function returns a new cart, or the
 * same reference when nothing changes (cheap equality checks for React).
 */

import { MAX_LINE_QUANTITY } from '../constants'
import type { Cart } from '../types'
import { assertBani } from './money'

function assertProductId(productId: string): void {
  if (productId === '') throw new RangeError('A cart line needs a product id')
}

function assertQuantity(quantity: number, { allowZero }: { allowZero: boolean }): void {
  const isWhole = Number.isSafeInteger(quantity)
  if (!isWhole || quantity < 0 || (quantity === 0 && !allowZero)) {
    throw new RangeError(`A quantity must be a whole number of units, got ${quantity}`)
  }
}

const clamp = (quantity: number): number => Math.min(quantity, MAX_LINE_QUANTITY)

/** Replaces one line's quantity, keeping its place; the same cart when the quantity is the same. */
function withQuantity(cart: Cart, index: number, quantity: number): Cart {
  const line = cart[index]
  if (!line || line.quantity === quantity) return cart
  return cart.map((current, i) => (i === index ? { ...current, quantity } : current))
}

export function addItem(cart: Cart, productId: string, quantity = 1): Cart {
  assertProductId(productId)
  assertQuantity(quantity, { allowZero: false })
  const index = cart.findIndex((line) => line.productId === productId)
  const existing = cart[index]
  if (!existing) return [...cart, { productId, quantity: clamp(quantity) }]
  return withQuantity(cart, index, clamp(existing.quantity + quantity))
}

export function removeItem(cart: Cart, productId: string): Cart {
  const remaining = cart.filter((line) => line.productId !== productId)
  return remaining.length === cart.length ? cart : remaining
}

/** Sets a line's quantity exactly (0 removes it); a product not in the cart is not added. */
export function setQuantity(cart: Cart, productId: string, quantity: number): Cart {
  assertQuantity(quantity, { allowZero: true })
  if (quantity === 0) return removeItem(cart, productId)
  const index = cart.findIndex((line) => line.productId === productId)
  return withQuantity(cart, index, clamp(quantity))
}

export function itemCount(cart: Cart): number {
  return cart.reduce((sum, line) => sum + line.quantity, 0)
}

/**
 * The cart's value in bani. Every line must have a known price: prune unknown products first.
 * The lines are checked too, since a cart read back from storage is only typed as one.
 */
export function cartSubtotal(
  cart: Cart,
  priceOf: (productId: string) => number | undefined,
): number {
  return cart.reduce((sum, { productId, quantity }) => {
    assertQuantity(quantity, { allowZero: false })
    const price = priceOf(productId)
    if (price === undefined) throw new Error(`No price for the cart line ${productId}`)
    assertBani(price, 'A price')
    const next = sum + price * quantity
    assertBani(next, 'A cart total')
    return next
  }, 0)
}
