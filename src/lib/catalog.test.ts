import { describe, expect, it } from 'vitest'
import { SEED_PRODUCTS } from '../data/seedProducts'
import { planSync, validateCatalog } from './catalog'
import type { GiftBasket, SingleProduct } from './product'

const jam: SingleProduct = {
  kind: 'product',
  slug: 'dulceata-de-afine',
  name: 'Dulceață de afine',
  description: 'Afine culese de mână din pădurile Obcinelor, fierte încet cu puțin zahăr.',
  priceBani: 2499,
  image: { src: '/images/products/dulceata-de-afine.webp', alt: 'Borcan de dulceață de afine' },
  category: 'dulceturi',
  weightGrams: 350,
  ingredients: ['afine', 'zahăr'],
  stock: 12,
}

const honey: SingleProduct = {
  ...jam,
  slug: 'miere-de-tei',
  name: 'Miere de tei',
  image: { src: '/images/products/miere-de-tei.webp', alt: 'Borcan de miere de tei' },
  category: 'miere',
  ingredients: ['miere de tei'],
}

const basket: GiftBasket = {
  kind: 'gift-basket',
  slug: 'cos-de-sarbatoare',
  name: 'Coș de sărbătoare',
  description: 'Câte puțin din toate, gata de dăruit: dulceață și miere de munte.',
  priceBani: 15999,
  image: { src: '/images/products/cos-de-sarbatoare.webp', alt: 'Coș cu bunătăți de munte' },
  category: 'cosuri-cadou',
  components: [
    { slug: jam.slug, quantity: 1 },
    { slug: honey.slug, quantity: 2 },
  ],
}

function errorMessage(entries: readonly unknown[]): string {
  try {
    validateCatalog(entries)
  } catch (error) {
    if (error instanceof Error) return error.message
  }
  throw new Error('expected validateCatalog to throw')
}

describe('validateCatalog valid input', () => {
  it('returns the parsed products in the same order', () => {
    expect(validateCatalog([basket, jam, honey])).toEqual([basket, jam, honey])
  })

  it('accepts the real seed catalogue', () => {
    expect(validateCatalog(SEED_PRODUCTS)).toHaveLength(SEED_PRODUCTS.length)
  })
})

describe('validateCatalog problems', () => {
  it('throws on an empty catalogue', () => {
    expect(() => validateCatalog([])).toThrow(/empty/)
  })

  it('does not also call a component missing when it is only invalid', () => {
    const brokenHoney = { ...honey, priceBani: 19.99 }

    expect(() => validateCatalog([jam, brokenHoney, basket])).toThrow(/priceBani/)
    expect(() => validateCatalog([jam, brokenHoney, basket])).not.toThrow(/not in the catalogue/)
  })

  it('reports a schema failure with the slug and the field path', () => {
    const message = errorMessage([jam, { ...honey, priceBani: 19.99 }])

    expect(message).toContain(honey.slug)
    expect(message).toContain('priceBani')
  })

  it.each([null, 'miere', { kind: 'product' }])('prefixes %j with its index', (bad) => {
    expect(errorMessage([jam, bad])).toContain('#1')
  })

  it('reports a duplicate slug once', () => {
    const message = errorMessage([jam, honey, { ...jam, priceBani: 100 }])

    expect(message).toContain(jam.slug)
    expect(message.match(/duplicate/gi)).toHaveLength(1)
  })

  it('reports a basket component missing from the catalogue', () => {
    const message = errorMessage([jam, basket])

    expect(message).toContain(basket.slug)
    expect(message).toContain(honey.slug)
  })

  it('reports a basket nested inside another basket', () => {
    const outer: GiftBasket = {
      ...basket,
      slug: 'cos-mare',
      components: [
        { slug: basket.slug, quantity: 1 },
        { slug: jam.slug, quantity: 1 },
      ],
    }

    const message = errorMessage([jam, honey, basket, outer])

    expect(message).toContain(outer.slug)
    expect(message).toMatch(/basket/i)
  })

  it('lists independent problems from different entries in one error', () => {
    const lonely: GiftBasket = {
      ...basket,
      slug: 'cos-gol',
      components: [
        { slug: jam.slug, quantity: 1 },
        { slug: 'nu-exista', quantity: 1 },
      ],
    }
    const message = errorMessage([jam, { ...honey, priceBani: 19.99 }, lonely])

    expect(message).toContain('priceBani')
    expect(message).toContain('cos-gol: component nu-exista')
  })
})

describe('planSync', () => {
  const catalog = [jam, honey, basket]

  it('upserts every catalogue product', () => {
    expect(planSync(catalog, []).upsert).toEqual(catalog)
  })

  it('removes stale ids, sorted', () => {
    const plan = planSync(catalog, ['zzz-vechi', jam.slug, 'aaa-vechi'])

    expect(plan.remove).toEqual(['aaa-vechi', 'zzz-vechi'])
    expect(plan.upsert).toHaveLength(catalog.length)
  })

  it('is idempotent: a second run removes nothing', () => {
    const plan = planSync(catalog, ['stale-product'])

    const second = planSync(
      catalog,
      catalog.map((p) => p.slug),
    )

    expect(plan.upsert).toEqual(second.upsert)
    expect(second.remove).toEqual([])
  })

  it('does not mutate its inputs', () => {
    const ids = ['b-vechi', 'a-vechi']
    const catalogSnapshot = structuredClone(catalog)

    planSync(catalog, ids)

    expect(ids).toEqual(['b-vechi', 'a-vechi'])
    expect(catalog).toEqual(catalogSnapshot)
  })
})
