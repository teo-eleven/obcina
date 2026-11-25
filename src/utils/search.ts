import { SEARCH_MIN_LENGTH, SEARCH_PARAM, SEARCH_PATH } from '../constants'
import type { Product } from '../types'

/**
 * Text as the search compares it: no diacritics (comma-below and cedilla forms too), lowercase, single spaces.
 * NFD splits each accented letter into the letter and a combining mark, which is then dropped.
 */
export function normalizeForSearch(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim().replace(/\s+/g, ' ')
}

/**
 * The products whose name contains every typed word, wherever it sits in the name. Names that
 * start with the query come first, then the rest by name; a query too short to mean much finds nothing.
 */
export function searchProducts(products: readonly Product[], query: string): Product[] {
  const normalized = normalizeForSearch(query)
  if (normalized.length < SEARCH_MIN_LENGTH) return []
  const words = normalized.split(' ')
  return products
    .map((product) => ({ product, name: normalizeForSearch(product.name) }))
    .filter(({ name }) => words.every((word) => name.includes(word)))
    .toSorted((a, b) => {
      const byStart = Number(b.name.startsWith(normalized)) - Number(a.name.startsWith(normalized))
      return byStart || a.product.name.localeCompare(b.product.name, 'ro')
    })
    .map(({ product }) => product)
}

/** The results page for a query, as a link. */
export function searchPath(query: string): string {
  return `${SEARCH_PATH}?${new URLSearchParams({ [SEARCH_PARAM]: query.trim() })}`
}
