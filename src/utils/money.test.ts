import { describe, expect, it } from 'vitest'
import { formatPrice } from './money'
import { NBSP } from '../constants'

describe('formatPrice', () => {
  it.each([
    [1999, '19,99'],
    [1, '0,01'],
    [3200, '32,00'],
    [100000, '1.000,00'],
    [0, '0,00'],
  ])('formats %i bani as %s lei', (bani, amount) => {
    expect(formatPrice(bani)).toBe(`${amount}${NBSP}lei`)
  })

  it.each([[19.99], [-1], [Number.NaN], [Number.POSITIVE_INFINITY]])(
    'throws RangeError for %s',
    (bani) => {
      expect(() => formatPrice(bani)).toThrow(RangeError)
    },
  )
})
