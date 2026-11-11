import { describe, expect, it } from 'vitest'
import { productCount, productNoun } from './productCount'

describe('productCount', () => {
  it.each([
    [0, 'niciun produs'],
    [1, '1 produs'],
    [2, '2 produse'],
    [3, '3 produse'],
    [19, '19 produse'],
    [20, '20 de produse'],
    [21, '21 de produse'],
    [99, '99 de produse'],
    [100, '100 de produse'],
    [101, '101 produse'],
    [119, '119 produse'],
    [120, '120 de produse'],
    [1000, '1000 de produse'],
  ] as const)('says %i as "%s"', (count, expected) => {
    expect(productCount(count)).toBe(expected)
  })

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'throws a RangeError for the invalid count %s',
    (count) => {
      expect(() => productCount(count)).toThrow(RangeError)
    },
  )
})

describe('productNoun', () => {
  it.each([
    [0, 'produse'],
    [1, 'produs'],
    [3, 'produse'],
    [20, 'de produse'],
    [101, 'produse'],
  ])('%i takes "%s"', (n, noun) => {
    expect(productNoun(n)).toBe(noun)
  })
})
