import { describe, expect, it } from 'vitest'
import { isProductId } from './productId'

describe('isProductId', () => {
  it.each(['abc', 'miere-de-tei', 'a'.repeat(80), 'cos-2'])('accepts %j', (value) => {
    expect(isProductId(value)).toBe(true)
  })

  it.each([
    '',
    'ab',
    'a'.repeat(81),
    'Miere',
    'miere-',
    '-miere',
    'mi--ere',
    '../x',
    'a b',
    3,
    null,
  ])('rejects %j', (value) => {
    expect(isProductId(value)).toBe(false)
  })
})
