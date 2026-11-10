import { describe, expect, it } from 'vitest'
import { productSchema } from '../schemas'
import type { GiftBasket, Product, SingleProduct } from '../types'
import { CATEGORIES } from './categories'
import { SEED_PRODUCTS } from './seedProducts'

const bySlug = new Map<string, Product>(SEED_PRODUCTS.map((p) => [p.slug, p]))

function singles(): SingleProduct[] {
  return SEED_PRODUCTS.flatMap((p) => (p.kind === 'product' ? [p] : []))
}

function baskets(): GiftBasket[] {
  return SEED_PRODUCTS.flatMap((p) => (p.kind === 'gift-basket' ? [p] : []))
}

function componentPrice(slug: string): number {
  const found = bySlug.get(slug)
  if (found?.kind !== 'product') throw new Error(`${slug} is not a single product in the catalogue`)
  return found.priceBani
}

const CASES = SEED_PRODUCTS.map((p) => [p.slug, p] as const)

// docs/BRAND.md: concrete details, no empty superlatives. Stems, so inflected forms count too
// ("perfectă", "unică", "cea mai bună").
const EMPTY_SUPERLATIVES = [
  /(?<![\p{L}\p{N}])ce(?:l|a|i|le) mai bun\p{L}*/iu,
  /(?<![\p{L}\p{N}])perfect\p{L}*/iu,
  /(?<![\p{L}\p{N}])incredibil\p{L}*/iu,
  /(?<![\p{L}\p{N}])unic(?:ă|i|e|ul|a)?(?![\p{L}\p{N}])/iu,
  /(?<![\p{L}\p{N}])premium(?![\p{L}\p{N}])/iu,
  /(?<![\p{L}\p{N}])super(?![\p{L}\p{N}])/iu,
]

// Shop prices are whole lei or end in ,99 (e.g. 32,00 or 31,99 lei).
const PRICE_ENDINGS = [0, 99]

describe('SEED_PRODUCTS', () => {
  it.each(CASES)('%s passes the schema unchanged', (_s, p) => {
    expect(productSchema.parse(p)).toEqual(p)
  })

  it('has 15-20 single products and 3-4 gift baskets', () => {
    expect(singles().length).toBeGreaterThanOrEqual(15)
    expect(singles().length).toBeLessThanOrEqual(20)
    expect(baskets().length).toBeGreaterThanOrEqual(3)
    expect(baskets().length).toBeLessThanOrEqual(4)
  })

  it('has unique slugs and names', () => {
    expect(new Set(SEED_PRODUCTS.map((p) => p.slug)).size).toBe(SEED_PRODUCTS.length)
    expect(new Set(SEED_PRODUCTS.map((p) => p.name)).size).toBe(SEED_PRODUCTS.length)
  })

  it.each(CATEGORIES.map((c) => c.slug))('category %s has at least one entry', (slug) => {
    expect(SEED_PRODUCTS.filter((p) => p.category === slug).length).toBeGreaterThan(0)
  })

  it.each(CASES)('%s image path matches its slug', (_s, p) => {
    expect(p.image.src).toBe(`/images/products/${p.slug}.webp`)
  })

  it.each(baskets().map((b) => [b.slug, b] as const))(
    '%s only contains existing single products',
    (_s, b) => {
      for (const component of b.components) {
        expect(bySlug.get(component.slug)?.kind, component.slug).toBe('product')
      }
    },
  )

  it.each(baskets().map((b) => [b.slug, b] as const))('%s is cheaper than its parts', (_s, b) => {
    const partsTotal = b.components.reduce((sum, c) => sum + componentPrice(c.slug) * c.quantity, 0)
    expect(b.priceBani).toBeLessThan(partsTotal)
  })

  it('has an out-of-stock single product and a low-stock one (1-3)', () => {
    expect(singles().some((p) => p.stock === 0)).toBe(true)
    expect(singles().some((p) => p.stock >= 1 && p.stock <= 3)).toBe(true)
  })

  it.each(CASES)('%s avoids empty superlatives', (_s, p) => {
    const found = EMPTY_SUPERLATIVES.filter(
      (pattern) => pattern.test(p.name) || pattern.test(p.description),
    )
    expect(found).toEqual([])
  })

  it.each(CASES)('%s has a shop-like price', (_s, p) => {
    expect(PRICE_ENDINGS).toContain(p.priceBani % 100)
  })
})
