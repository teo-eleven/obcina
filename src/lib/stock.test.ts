import { describe, expect, it } from 'vitest'
import { LOW_STOCK_THRESHOLD, stockLevel } from './stock'

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
