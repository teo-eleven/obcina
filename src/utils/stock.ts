import { LOW_STOCK_THRESHOLD } from '../constants'
import type { StockLevel } from '../types'

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
