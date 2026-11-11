import { describe, expect, it } from 'vitest'
import { cartLineMessage } from './cartMessage'
import { MAX_LINE_QUANTITY } from '../constants'

describe('cartLineMessage', () => {
  it.each([
    ['nothing when the product is not in the cart', 0, 5, ''],
    ['how many are in the cart below the limit', 2, 5, 'În coș: 2 buc.'],
    ['that the whole stock is in the cart', 3, 3, 'Ai în coș tot stocul: 3 buc.'],
    [
      'the per-line maximum when stock is not the limit',
      MAX_LINE_QUANTITY,
      MAX_LINE_QUANTITY,
      'Ai în coș cantitatea maximă: 99 buc.',
    ],
    [
      'that the stock went down below what is in the cart',
      5,
      2,
      'Stocul a scăzut: mai sunt doar 2 buc.',
    ],
    ['that the product sold out while in the cart', 2, 0, 'Nu mai avem în stoc. Scoate-l din coș.'],
  ])('says %s', (_label, inCart, limit, message) => {
    expect(cartLineMessage(inCart, limit)).toBe(message)
  })
})
