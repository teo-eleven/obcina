/*
 * The cart as plain data and pure functions. A line holds only what the server will accept at
 * checkout ({ productId, quantity }); prices come from the catalogue when a total is needed, so a
 * cart kept in the browser never carries a stale price. Every function returns a new cart, or the
 * same reference when nothing changes (cheap equality checks for React).
 */

import { MAX_LINE_QUANTITY } from '../constants'
import type { Cart } from '../types'
import { assertBani } from './money'
import { isProductId } from './productId'

// The same rule parseCart applies on load, so anything added here survives a refresh.
function assertProductId(productId: string): void {
  if (!isProductId(productId)) throw new RangeError('A cart line needs a product slug as its id')
}

function assertQuantity(quantity: number, { allowZero }: { allowZero: boolean }): void {
  const isWhole = Number.isSafeInteger(quantity)
  if (!isWhole || quantity < 0 || (quantity === 0 && !allowZero)) {
    throw new RangeError(`A quantity must be a whole number of units, got ${quantity}`)
  }
}

function assertLimit(limit: number): void {
  if (!Number.isSafeInteger(limit) || limit < 0) {
    throw new RangeError(`A limit must be a whole, non-negative number of units, got ${limit}`)
  }
}

/** The highest quantity a line may hold: the stock (when given), never above MAX_LINE_QUANTITY. */
function capFor(limit: number | undefined): number {
  if (limit === undefined) return MAX_LINE_QUANTITY
  assertLimit(limit)
  return Math.min(limit, MAX_LINE_QUANTITY)
}

/** Replaces one line's quantity, keeping its place; the same cart when the quantity is the same. */
function withQuantity(cart: Cart, index: number, quantity: number): Cart {
  const line = cart[index]
  if (!line || line.quantity === quantity) return cart
  return cart.map((current, i) => (i === index ? { ...current, quantity } : current))
}

/**
 * Adds `quantity` of a product, never past `limit` (its stock) or MAX_LINE_QUANTITY. A line that is
 * already above a lowered limit comes down to it; at the limit the same cart comes back.
 */
export function addItem(cart: Cart, productId: string, quantity = 1, limit?: number): Cart {
  assertProductId(productId)
  assertQuantity(quantity, { allowZero: false })
  const cap = capFor(limit)
  const index = cart.findIndex((line) => line.productId === productId)
  const existing = cart[index]
  if (!existing)
    return cap === 0 ? cart : [...cart, { productId, quantity: Math.min(quantity, cap) }]
  const next = Math.min(existing.quantity + quantity, cap)
  return next === 0 ? removeItem(cart, productId) : withQuantity(cart, index, next)
}

export function removeItem(cart: Cart, productId: string): Cart {
  const remaining = cart.filter((line) => line.productId !== productId)
  return remaining.length === cart.length ? cart : remaining
}

/** Sets a line's quantity exactly (0 removes it); a product not in the cart is not added. */
export function setQuantity(cart: Cart, productId: string, quantity: number, limit?: number): Cart {
  assertQuantity(quantity, { allowZero: true })
  const next = Math.min(quantity, capFor(limit))
  if (next === 0) return removeItem(cart, productId)
  const index = cart.findIndex((line) => line.productId === productId)
  return withQuantity(cart, index, next)
}

/** How many of a product the cart holds (0 when it isn't there). */
export function lineQuantity(cart: Cart, productId: string): number {
  return cart.find((line) => line.productId === productId)?.quantity ?? 0
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
