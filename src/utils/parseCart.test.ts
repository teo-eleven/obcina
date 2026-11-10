import { describe, expect, it } from 'vitest'
import { parseCart } from './parseCart'
import {
  EMPTY_CART,
  MAX_CART_LINES,
  MAX_LINE_QUANTITY,
  MAX_SCANNED_CART_ENTRIES,
} from '../constants'

const MIERE = 'miere-de-tei'
const ZACUSCA = 'zacusca-de-ciuperci'
const BRANZA = 'branza-de-burduf'

const line = (productId: string, quantity: number) => ({ productId, quantity })

describe('parseCart', () => {
  describe('input that is not an array', () => {
    it.each([
      ['null', null],
      ['undefined', undefined],
      ['a string', '[]'],
      ['a number', 3],
      ['an object', { productId: MIERE, quantity: 1 }],
      ['true', true],
    ])('returns the empty cart for %s', (_name, raw) => {
      expect(parseCart(raw)).toEqual(EMPTY_CART)
    })
  })

  it('returns an empty cart for an empty array', () => {
    expect(parseCart([])).toEqual(EMPTY_CART)
  })

  describe('invalid lines', () => {
    const INVALID_LINES: Array<[string, unknown]> = [
      ['a null entry', null],
      ['an array entry', [MIERE, 1]],
      ['a string entry', MIERE],
      ['a number entry', 7],
      ['an empty object', {}],
      ['a missing quantity', { productId: MIERE }],
      ['a missing productId', { quantity: 1 }],
      ['a numeric productId', { productId: 1, quantity: 1 }],
      ['an empty productId', line('', 1)],
      ['an uppercase productId', line('Miere De Tei', 1)],
      ['a path-like productId', line('../x', 1)],
      ['a script productId', line('<script>', 1)],
      ['a too short productId', line('ab', 1)],
      ['a too long productId', line('a'.repeat(81), 1)],
      ['a trailing dash productId', line('miere-', 1)],
      ['a fractional quantity', line(MIERE, 1.5)],
      ['a zero quantity', line(MIERE, 0)],
      ['a negative quantity', line(MIERE, -2)],
      ['a null quantity (NaN after JSON)', { productId: MIERE, quantity: null }],
      ['a string quantity', { productId: MIERE, quantity: '3' }],
      ['an unsafe integer quantity', line(MIERE, 2 ** 53)],
      ['an infinite quantity', line(MIERE, Number.POSITIVE_INFINITY)],
    ]

    it.each(INVALID_LINES)('skips a line with %s', (_name, bad) => {
      expect(parseCart([bad])).toEqual([])
    })

    it('keeps the valid lines around the invalid ones', () => {
      const raw = [line(MIERE, 1), null, line('../x', 2), line(ZACUSCA, 3), { productId: BRANZA }]

      expect(parseCart(raw)).toStrictEqual([line(MIERE, 1), line(ZACUSCA, 3)])
    })

    it('accepts productIds at the length boundaries', () => {
      const shortest = 'abc'
      const longest = 'a'.repeat(80)

      expect(parseCart([line(shortest, 1), line(longest, 1)])).toStrictEqual([
        line(shortest, 1),
        line(longest, 1),
      ])
    })
  })

  describe('quantities', () => {
    it('caps a quantity above MAX_LINE_QUANTITY', () => {
      expect(parseCart([line(MIERE, MAX_LINE_QUANTITY + 1000)])).toStrictEqual([
        line(MIERE, MAX_LINE_QUANTITY),
      ])
    })

    it('keeps a quantity exactly at the cap', () => {
      expect(parseCart([line(MIERE, MAX_LINE_QUANTITY)])).toStrictEqual([
        line(MIERE, MAX_LINE_QUANTITY),
      ])
    })

    it('keeps the smallest valid quantity', () => {
      expect(parseCart([line(MIERE, 1)])).toStrictEqual([line(MIERE, 1)])
    })
  })

  describe('duplicates', () => {
    it('merges into the first occurrence, summing quantities', () => {
      const raw = [line(MIERE, 1), line(ZACUSCA, 2), line(MIERE, 4)]

      expect(parseCart(raw)).toStrictEqual([line(MIERE, 5), line(ZACUSCA, 2)])
    })

    it('caps the merged quantity', () => {
      const raw = [line(MIERE, MAX_LINE_QUANTITY - 1), line(MIERE, 50)]

      expect(parseCart(raw)).toStrictEqual([line(MIERE, MAX_LINE_QUANTITY)])
    })

    it('does not merge an invalid duplicate', () => {
      expect(parseCart([line(MIERE, 2), line(MIERE, 0)])).toStrictEqual([line(MIERE, 2)])
    })
  })

  it('drops extra fields from a line', () => {
    const raw = [{ productId: MIERE, quantity: 2, price: 1, __proto__x: 1, note: 'hi' }]

    expect(parseCart(raw)).toStrictEqual([line(MIERE, 2)])
  })

  describe('the line limit', () => {
    const manyLines = (count: number) =>
      Array.from({ length: count }, (_, i) => line(`produs-${i}`, 1))

    it('keeps at most MAX_CART_LINES distinct lines, dropping later ones', () => {
      const parsed = parseCart(manyLines(MAX_CART_LINES + 10))

      expect(parsed).toHaveLength(MAX_CART_LINES)
      expect(parsed[0]).toStrictEqual(line('produs-0', 1))
      expect(parsed.at(-1)).toStrictEqual(line(`produs-${MAX_CART_LINES - 1}`, 1))
    })

    it('keeps exactly MAX_CART_LINES lines', () => {
      expect(parseCart(manyLines(MAX_CART_LINES))).toHaveLength(MAX_CART_LINES)
    })

    it('still merges a duplicate of a kept line after the limit is reached', () => {
      const raw = [...manyLines(MAX_CART_LINES), line('produs-0', 2)]

      expect(parseCart(raw)[0]).toStrictEqual(line('produs-0', 3))
    })

    it('does not count skipped invalid lines against the limit', () => {
      const raw = [...Array.from({ length: 20 }, () => null), ...manyLines(MAX_CART_LINES)]

      expect(parseCart(raw)).toHaveLength(MAX_CART_LINES)
    })

    it('looks at no more than MAX_SCANNED_CART_ENTRIES entries, so a huge array stays cheap', () => {
      const junk = Array.from({ length: MAX_SCANNED_CART_ENTRIES }, () => null)

      expect(parseCart([...junk, line(MIERE, 1)])).toEqual(EMPTY_CART)
      expect(parseCart([...junk.slice(1), line(MIERE, 1)])).toStrictEqual([line(MIERE, 1)])
    })

    it('scans ten times the line limit', () => {
      expect(MAX_SCANNED_CART_ENTRIES).toBe(MAX_CART_LINES * 10)
    })

    it('has a limit of 50', () => {
      expect(MAX_CART_LINES).toBe(50)
    })
  })

  it('round-trips a valid cart unchanged, keeping the order', () => {
    const cart = [line(BRANZA, 3), line(MIERE, 1), line(ZACUSCA, MAX_LINE_QUANTITY)]

    expect(parseCart(JSON.parse(JSON.stringify(cart)))).toStrictEqual(cart)
  })

  it('does not mutate a frozen input', () => {
    const raw = Object.freeze([Object.freeze(line(MIERE, 1)), Object.freeze(line(MIERE, 2))])

    expect(parseCart(raw)).toStrictEqual([line(MIERE, 3)])
  })

  describe('never throws', () => {
    const deeplyNested = Array.from({ length: 5000 }).reduce<unknown>((inner) => [inner], [])
    const ODD_VALUES: Array<[string, unknown]> = [
      ['deeply nested arrays', deeplyNested],
      ['a __proto__ key object', JSON.parse('{"__proto__":{"x":1}}')],
      ['a __proto__ key line', [JSON.parse('{"__proto__":{"x":1},"productId":"miere-de-tei"}')]],
      ['a toJSON-like key', { toJSON: 1, valueOf: 2, toString: 3 }],
      ['a line with toString keys', [{ productId: { toString: () => MIERE }, quantity: 1 }]],
      ['a symbol', Symbol('x')],
      ['a function', () => 1],
      ['a bigint', 10n],
      ['a Date', new Date()],
      ['NaN', Number.NaN],
      ['an array with holes', [, , line(MIERE, 1)]], // eslint-disable-line no-sparse-arrays
    ]

    it.each(ODD_VALUES)('copes with %s', (_name, raw) => {
      expect(() => parseCart(raw)).not.toThrow()
      expect(Array.isArray(parseCart(raw))).toBe(true)
    })

    it('does not pollute Object.prototype through a __proto__ key', () => {
      parseCart(
        JSON.parse('[{"productId":"miere-de-tei","quantity":1,"__proto__":{"polluted":1}}]'),
      )

      expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    })

    it('does not treat inherited keys as productIds (constructor)', () => {
      expect(parseCart([line('constructor', 1), line('constructor', 1)])).toStrictEqual([
        line('constructor', 2),
      ])
    })
  })
})
