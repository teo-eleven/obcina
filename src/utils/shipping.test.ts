import { describe, expect, it } from 'vitest'
import { orderTotal, shippingCost } from './shipping'
import { FREE_SHIPPING_THRESHOLD_BANI, SHIPPING_COST_BANI } from '../constants'

// 2 ** 53 is a whole number but not a safe one: past it, integer arithmetic stops being exact.
const INVALID_SUBTOTALS = [[19.99], [-1], [Number.NaN], [Number.POSITIVE_INFINITY], [2 ** 53]]

describe('shipping constants', () => {
  it('pins the flat fee at 19,99 lei and the free threshold at 200,00 lei, in bani', () => {
    expect(SHIPPING_COST_BANI).toBe(1999)
    expect(FREE_SHIPPING_THRESHOLD_BANI).toBe(20000)
  })
})

describe('shippingCost', () => {
  it.each([
    ['1 ban', 1, 1999],
    ['199,99 lei', 19999, 1999],
    ['200,00 lei', 20000, 0],
    ['200,01 lei', 20001, 0],
    ['a large order', 1_000_000, 0],
  ])('charges for a subtotal of %s', (_label, subtotal, expected) => {
    expect(shippingCost(subtotal)).toBe(expected)
  })

  it('charges nothing for an empty cart: there is nothing to ship', () => {
    expect(shippingCost(0)).toBe(0)
  })

  it('takes the boundary from the constant: one ban below pays, the threshold is free', () => {
    expect(shippingCost(FREE_SHIPPING_THRESHOLD_BANI - 1)).toBe(SHIPPING_COST_BANI)
    expect(shippingCost(FREE_SHIPPING_THRESHOLD_BANI)).toBe(0)
  })

  it.each(INVALID_SUBTOTALS)('throws RangeError for the invalid subtotal %s', (subtotal) => {
    expect(() => shippingCost(subtotal)).toThrow(
      new RangeError(`A subtotal must be a whole, non-negative number of bani, got ${subtotal}`),
    )
  })
})

describe('orderTotal', () => {
  it.each([
    ['an empty cart', 0, 0],
    ['1 ban', 1, 2000],
    ['199,99 lei', 19999, 21998],
    ['200,00 lei', 20000, 20000],
    ['the largest exact amount', Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  ])('adds shipping to a subtotal of %s', (_label, subtotal, expected) => {
    expect(orderTotal(subtotal)).toBe(expected)
  })

  it.each(INVALID_SUBTOTALS)('throws RangeError for the invalid subtotal %s', (subtotal) => {
    expect(() => orderTotal(subtotal)).toThrow(/^A subtotal must be/)
  })
})
