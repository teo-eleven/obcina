import { describe, expect, it } from 'vitest'
import { SEED_PRODUCTS } from '../constants/seedProducts'
import type { Product } from '../types'
import { normalizeForSearch, searchPath, searchProducts } from './search'

const names = (query: string) => searchProducts(SEED_PRODUCTS, query).map((p) => p.name)

describe('normalizeForSearch', () => {
  it('drops diacritics, both comma-below and legacy cedilla forms', () => {
    expect(normalizeForSearch('Dulceață de cătină')).toBe('dulceata de catina')
    expect(normalizeForSearch('ȘȚĂÎÂ şţ')).toBe('staia st')
  })

  it('lowercases, trims and collapses inner spaces', () => {
    expect(normalizeForSearch('  Miere   DE  tei ')).toBe('miere de tei')
  })
})

describe('searchProducts', () => {
  it('finds "dulceață" when typed without diacritics', () => {
    expect(names('dulceata')).toEqual(expect.arrayContaining(['Dulceață de afine']))
    expect(names('dulceata')).toEqual(names('dulceață'))
  })

  it('matches any part of the name, not only the start', () => {
    expect(names('afine')).toContain('Dulceață de afine')
  })

  it('keeps only products that contain every typed word, in any order', () => {
    const found = names('afine dulceata')
    expect(found).toContain('Dulceață de afine')
    expect(found).not.toContain('Dulceață de cătină')
  })

  it('lists names that start with the query first, then the rest by name', () => {
    const [base] = SEED_PRODUCTS
    if (!base) throw new Error('Empty seed')
    const named = (slug: string, name: string): Product => ({ ...base, slug, name })
    const products = [
      named('b', 'Zacuscă cu ardei'),
      named('a', 'Ardei copți'),
      named('c', 'Bulion de ardei'),
    ]
    expect(searchProducts(products, 'ardei').map((p) => p.slug)).toEqual(['a', 'c', 'b'])
  })

  it('finds nothing for a query shorter than two letters or with no match', () => {
    expect(names('')).toEqual([])
    expect(names(' d ')).toEqual([])
    expect(names('ciocolata')).toEqual([])
  })
})

describe('searchPath', () => {
  it('links to the results page with the query encoded and trimmed', () => {
    expect(searchPath(' dulceață de afine ')).toBe('/cautare?q=dulcea%C8%9B%C4%83+de+afine')
  })
})
