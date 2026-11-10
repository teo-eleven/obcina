import {
  EMPTY_CART,
  MAX_CART_LINES,
  MAX_LINE_QUANTITY,
  MAX_SCANNED_CART_ENTRIES,
} from '../constants'
import type { Cart, CartLine } from '../types'
import { isProductId } from './productId'

// Turns whatever was read back from storage (or another tab) into a valid cart. Written by hand,
// not with zod: the cart is on every page, and zod stays out of the code every visitor loads.

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isQuantity = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 1

/** One valid line with only its two fields, or null when the entry can't be a line. */
function toLine(entry: unknown): CartLine | null {
  if (!isRecord(entry)) return null
  const { productId, quantity } = entry
  if (!isProductId(productId) || !isQuantity(quantity)) return null
  return { productId, quantity }
}

/**
 * Never throws. Invalid lines are skipped, duplicates merge into their first position, quantities
 * are capped at MAX_LINE_QUANTITY, at most MAX_CART_LINES distinct products are kept and only the
 * first MAX_SCANNED_CART_ENTRIES entries are looked at.
 */
export function parseCart(raw: unknown): Cart {
  if (!Array.isArray(raw)) return EMPTY_CART
  // A Map, not an object: ids like "constructor" or "__proto__" must stay plain keys.
  const quantities = new Map<string, number>()
  // Only the first entries: a huge array costs the same as a full cart.
  const entries: readonly unknown[] = raw.slice(0, MAX_SCANNED_CART_ENTRIES)
  for (const entry of entries) {
    const line = toLine(entry)
    if (!line) continue
    const current = quantities.get(line.productId)
    if (current === undefined && quantities.size >= MAX_CART_LINES) continue
    quantities.set(line.productId, Math.min((current ?? 0) + line.quantity, MAX_LINE_QUANTITY))
  }
  if (quantities.size === 0) return EMPTY_CART
  return [...quantities].map(([productId, quantity]) => ({ productId, quantity }))
}
