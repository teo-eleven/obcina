import { describe, expect, it } from 'vitest'
import { SEED_PRODUCTS } from '../constants/seedProducts'
import type { Cart, Product } from '../types'
import { cartChangeMessage, reconcileCart } from './reconcileCart'

function seed(slug: string): Product {
  const product = SEED_PRODUCTS.find((candidate) => candidate.slug === slug)
  if (!product) throw new Error(`Missing seed product ${slug}`)
  return product
}

const honey = seed('miere-de-tei') // stock 25
const seaBuckthorn = seed('dulceata-de-catina') // stock 3
const soldOut = seed('branza-in-coaja-de-brad') // stock 0
const basket = seed('cos-mic-dejun-la-stana')

const line = (productId: string, quantity: number) => ({ productId, quantity })

describe('reconcileCart', () => {
  it('returns the same cart and no changes when everything is in stock', () => {
    const cart: Cart = [line(honey.slug, 2), line(basket.slug, 1)]

    const result = reconcileCart(cart, [honey, basket])

    expect(result.cart).toBe(cart)
    expect(result.changes).toEqual([])
  })

  it('brings a line above the stock down to the stock', () => {
    const result = reconcileCart([line(seaBuckthorn.slug, 5)], [seaBuckthorn])

    expect(result.cart).toEqual([line(seaBuckthorn.slug, 3)])
    expect(result.changes).toEqual([{ kind: 'reduced', name: seaBuckthorn.name, quantity: 3 }])
  })

  it('removes a sold-out product', () => {
    const result = reconcileCart([line(soldOut.slug, 1), line(honey.slug, 1)], [soldOut, honey])

    expect(result.cart).toEqual([line(honey.slug, 1)])
    expect(result.changes).toEqual([{ kind: 'sold-out', name: soldOut.name }])
  })

  it('removes a product that is no longer in the catalogue', () => {
    const result = reconcileCart([line('produs-disparut', 2), line(honey.slug, 1)], [honey])

    expect(result.cart).toEqual([line(honey.slug, 1)])
    expect(result.changes).toEqual([{ kind: 'missing' }])
  })

  it('keeps the order of the remaining lines and reports every change', () => {
    const cart: Cart = [line(soldOut.slug, 1), line(honey.slug, 2), line(seaBuckthorn.slug, 9)]

    const result = reconcileCart(cart, [soldOut, honey, seaBuckthorn])

    expect(result.cart).toEqual([line(honey.slug, 2), line(seaBuckthorn.slug, 3)])
    expect(result.changes).toHaveLength(2)
  })

  it('leaves gift baskets to the per-line cap (their stock comes in phase 8)', () => {
    const cart: Cart = [line(basket.slug, 99)]

    expect(reconcileCart(cart, [basket]).cart).toBe(cart)
  })
})

describe('cartChangeMessage', () => {
  it.each([
    [
      { kind: 'reduced', name: 'Dulceață de cătină', quantity: 2 } as const,
      'Dulceață de cătină: mai sunt doar 2 buc.',
    ],
    [
      { kind: 'sold-out', name: 'Brânză în coajă de brad' } as const,
      'Am scos din coș Brânză în coajă de brad: nu mai e în stoc.',
    ],
    [{ kind: 'missing' } as const, 'Un produs nu mai e în catalog; l-am scos din coș.'],
  ])('describes %o', (change, message) => {
    expect(cartChangeMessage(change)).toBe(message)
  })
})
