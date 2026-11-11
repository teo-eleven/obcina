import { describe, expect, it } from 'vitest'
import { LOW_STOCK_THRESHOLD, MAX_LINE_QUANTITY } from '../constants'
import { SEED_PRODUCTS } from '../constants/seedProducts'
import type { Product } from '../types'
import { cartLimit, stockLabel, stockLevel } from './stock'

function seed(slug: string): Product {
  const product = SEED_PRODUCTS.find((candidate) => candidate.slug === slug)
  if (!product) throw new Error(`Missing seed product ${slug}`)
  return product
}

describe('stockLevel', () => {
  it('uses a low-stock threshold of 3', () => {
    expect(LOW_STOCK_THRESHOLD).toBe(3)
  })

  it.each([
    [0, { kind: 'out' }],
    [1, { kind: 'low', left: 1 }],
    [2, { kind: 'low', left: 2 }],
    [3, { kind: 'low', left: 3 }],
    [4, { kind: 'in' }],
    [50, { kind: 'in' }],
  ])('maps stock %i to %j', (stock, level) => {
    expect(stockLevel(stock)).toEqual(level)
  })
})

describe('stockLabel', () => {
  it.each([
    [{ kind: 'out' }, 'Stoc epuizat'],
    [{ kind: 'low', left: 2 }, 'Doar 2 în stoc'],
    [{ kind: 'low', left: 1 }, 'Doar 1 în stoc'],
    [{ kind: 'in' }, null],
  ] as const)('labels %j as %j', (level, label) => {
    expect(stockLabel(level)).toBe(label)
  })
})

describe('cartLimit', () => {
  it('is the stock for a product with little stock', () => {
    expect(cartLimit(seed('dulceata-de-catina'))).toBe(3)
  })

  it('is 0 for a sold-out product', () => {
    expect(cartLimit(seed('branza-in-coaja-de-brad'))).toBe(0)
  })

  it('is MAX_LINE_QUANTITY when the stock is larger', () => {
    const plenty = { ...seed('miere-de-tei'), stock: MAX_LINE_QUANTITY + 100 }

    expect(cartLimit(plenty)).toBe(MAX_LINE_QUANTITY)
  })

  it('is the stock when it is below MAX_LINE_QUANTITY', () => {
    expect(cartLimit(seed('miere-de-tei'))).toBe(25)
  })

  it('is MAX_LINE_QUANTITY for a gift basket', () => {
    expect(cartLimit(seed('cos-mic-dejun-la-stana'))).toBe(MAX_LINE_QUANTITY)
  })
})
