import { LOW_STOCK_THRESHOLD, MAX_LINE_QUANTITY } from '../constants'
import type { Product, StockLevel } from '../types'

export function stockLevel(stock: number): StockLevel {
  if (stock <= 0) return { kind: 'out' }
  if (stock <= LOW_STOCK_THRESHOLD) return { kind: 'low', left: stock }
  return { kind: 'in' }
}

/** The warning shown next to a product, or null when there is plenty. */
export function stockLabel(level: StockLevel): string | null {
  if (level.kind === 'out') return 'Stoc epuizat'
  if (level.kind === 'low') return `Doar ${level.left} în stoc`
  return null
}

/**
 * How many of a product one cart may hold: its stock, capped per line. A gift basket has no stock
 * of its own yet (it is the lowest of its components', PLAN 8.1); the server checks at checkout.
 */
export function cartLimit(product: Product): number {
  return product.kind === 'product' ? Math.min(product.stock, MAX_LINE_QUANTITY) : MAX_LINE_QUANTITY
}
