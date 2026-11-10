import { describe, expect, it } from 'vitest'
import { LOW_STOCK_THRESHOLD } from '../constants'
import { stockLabel, stockLevel } from './stock'

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
