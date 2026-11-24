import { describe, expect, it } from 'vitest'
import { parseQuantityInput } from './parseQuantityInput'

describe('parseQuantityInput', () => {
  it.each([
    ['3', 25, 3],
    [' 12 ', 25, 12],
    ['1', 25, 1],
    ['25', 25, 25],
  ])('reads %j (stock %i) as %i', (text, max, quantity) => {
    expect(parseQuantityInput(text, max)).toBe(quantity)
  })

  it('caps a number above the stock at the stock', () => {
    expect(parseQuantityInput('40', 25)).toBe(25)
  })

  it.each(['', '0', '-1', '1.5', '2,5', 'abc', '3 buc', '1e3', '1000', ' '])(
    'refuses %j (null: the field goes back to the previous value)',
    (text) => {
      expect(parseQuantityInput(text, 25)).toBeNull()
    },
  )
})
