// At or below this many units left, the card says how many remain.
export const LOW_STOCK_THRESHOLD = 3

export type StockLevel =
  | { readonly kind: 'out' }
  | { readonly kind: 'low'; readonly left: number }
  | { readonly kind: 'in' }

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
