import { describe, expect, it, vi } from 'vitest'
import { addItem, cartSubtotal, itemCount, removeItem, setQuantity } from './cart'
import { EMPTY_CART, MAX_LINE_QUANTITY } from '../constants'
import type { Cart } from '../types'

const MIERE = 'miere-de-tei'
const ZACUSCA = 'zacusca-de-ciuperci'
const BRANZA = 'branza-de-burduf'

/** Deep-frozen cart, so any in-place mutation throws in strict mode. */
function frozenCart(lines: ReadonlyArray<{ productId: string; quantity: number }>): Cart {
  return Object.freeze(lines.map((line) => Object.freeze({ ...line })))
}

// 2 ** 53 is a whole number but not a safe one: past it, integer arithmetic stops being exact.
const NOT_WHOLE_UNITS = [[-1], [1.5], [Number.NaN], [Number.POSITIVE_INFINITY], [2 ** 53]]
// Adding nothing is not a valid add; setting 0 is valid (it removes the line).
const INVALID_ADD_QUANTITIES = [[0], ...NOT_WHOLE_UNITS]

describe('EMPTY_CART', () => {
  it('is empty and frozen', () => {
    expect(EMPTY_CART).toEqual([])
    expect(Object.isFrozen(EMPTY_CART)).toBe(true)
  })
})

describe('addItem', () => {
  it('appends a new product with quantity 1 by default', () => {
    expect(addItem(EMPTY_CART, MIERE)).toEqual([{ productId: MIERE, quantity: 1 }])
  })

  it('keeps insertion order when several products are added', () => {
    const cart = addItem(addItem(addItem(EMPTY_CART, MIERE), ZACUSCA, 2), BRANZA)

    expect(cart.map((line) => line.productId)).toEqual([MIERE, ZACUSCA, BRANZA])
  })

  it('increases an existing line in place without reordering', () => {
    const cart = frozenCart([
      { productId: MIERE, quantity: 1 },
      { productId: ZACUSCA, quantity: 2 },
    ])

    expect(addItem(cart, MIERE, 3)).toEqual([
      { productId: MIERE, quantity: 4 },
      { productId: ZACUSCA, quantity: 2 },
    ])
  })

  it('clamps the line to MAX_LINE_QUANTITY', () => {
    const cart = frozenCart([{ productId: MIERE, quantity: MAX_LINE_QUANTITY - 1 }])

    expect(addItem(cart, MIERE, 5)).toEqual([{ productId: MIERE, quantity: MAX_LINE_QUANTITY }])
  })

  it('clamps a brand new line added above the cap', () => {
    expect(addItem(EMPTY_CART, MIERE, MAX_LINE_QUANTITY + 50)).toEqual([
      { productId: MIERE, quantity: MAX_LINE_QUANTITY },
    ])
  })

  it('accepts a new line of exactly MAX_LINE_QUANTITY', () => {
    expect(addItem(EMPTY_CART, MIERE, MAX_LINE_QUANTITY)).toEqual([
      { productId: MIERE, quantity: MAX_LINE_QUANTITY },
    ])
  })

  it('returns the same cart when the line is already at the cap', () => {
    const cart = frozenCart([{ productId: MIERE, quantity: MAX_LINE_QUANTITY }])

    expect(addItem(cart, MIERE)).toBe(cart)
  })

  it.each(INVALID_ADD_QUANTITIES)('throws RangeError for quantity %s', (quantity) => {
    expect(() => addItem(EMPTY_CART, MIERE, quantity)).toThrow(RangeError)
  })

  it('throws RangeError for an empty product id', () => {
    expect(() => addItem(EMPTY_CART, '')).toThrow(RangeError)
  })
})

describe('removeItem', () => {
  it('removes the line and keeps the others in order', () => {
    const cart = frozenCart([
      { productId: MIERE, quantity: 1 },
      { productId: ZACUSCA, quantity: 2 },
      { productId: BRANZA, quantity: 3 },
    ])

    expect(removeItem(cart, ZACUSCA)).toEqual([
      { productId: MIERE, quantity: 1 },
      { productId: BRANZA, quantity: 3 },
    ])
  })

  it('returns the same cart for an unknown product', () => {
    const cart = frozenCart([{ productId: MIERE, quantity: 1 }])

    expect(removeItem(cart, ZACUSCA)).toBe(cart)
  })

  it('returns an empty cart when the last line is removed', () => {
    const cart = frozenCart([{ productId: MIERE, quantity: 2 }])

    expect(removeItem(cart, MIERE)).toEqual([])
  })
})

describe('setQuantity', () => {
  const cart = frozenCart([
    { productId: MIERE, quantity: 2 },
    { productId: ZACUSCA, quantity: 1 },
  ])

  it('sets the exact quantity and keeps the line in place', () => {
    expect(setQuantity(cart, MIERE, 7)).toEqual([
      { productId: MIERE, quantity: 7 },
      { productId: ZACUSCA, quantity: 1 },
    ])
  })

  it('removes the line when the quantity is 0', () => {
    expect(setQuantity(cart, MIERE, 0)).toEqual([{ productId: ZACUSCA, quantity: 1 }])
  })

  it('clamps to MAX_LINE_QUANTITY', () => {
    expect(setQuantity(cart, MIERE, MAX_LINE_QUANTITY + 1)).toEqual([
      { productId: MIERE, quantity: MAX_LINE_QUANTITY },
      { productId: ZACUSCA, quantity: 1 },
    ])
  })

  it('returns the same cart when the product is not in it (does not add)', () => {
    expect(setQuantity(cart, BRANZA, 3)).toBe(cart)
  })

  it('returns the same cart when the quantity is unchanged', () => {
    expect(setQuantity(cart, MIERE, 2)).toBe(cart)
  })

  it('returns the same cart when clamping leaves a capped line unchanged', () => {
    const capped = frozenCart([{ productId: MIERE, quantity: MAX_LINE_QUANTITY }])

    expect(setQuantity(capped, MIERE, MAX_LINE_QUANTITY + 10)).toBe(capped)
  })

  it.each(NOT_WHOLE_UNITS)('throws RangeError for quantity %s', (quantity) => {
    expect(() => setQuantity(cart, MIERE, quantity)).toThrow(RangeError)
  })

  it('returns the same cart for an empty product id (nothing matches it)', () => {
    expect(setQuantity(cart, '', 3)).toBe(cart)
    expect(removeItem(cart, '')).toBe(cart)
  })
})

describe('itemCount', () => {
  it('is 0 for an empty cart', () => {
    expect(itemCount(EMPTY_CART)).toBe(0)
  })

  it('sums the quantities of all lines', () => {
    const cart = frozenCart([
      { productId: MIERE, quantity: 3 },
      { productId: ZACUSCA, quantity: 2 },
    ])

    expect(itemCount(cart)).toBe(5)
  })
})

describe('cartSubtotal', () => {
  const prices: Record<string, number> = { [MIERE]: 1999, [ZACUSCA]: 3200 }
  const priceOf = (productId: string) => prices[productId]
  const cart = frozenCart([
    { productId: MIERE, quantity: 3 },
    { productId: ZACUSCA, quantity: 1 },
  ])

  it('sums price times quantity in integer bani', () => {
    expect(cartSubtotal(cart, priceOf)).toBe(9197)
  })

  it('is 0 for an empty cart and never asks for a price', () => {
    const lookup = vi.fn(() => 1999)

    expect(cartSubtotal(EMPTY_CART, lookup)).toBe(0)
    expect(lookup).not.toHaveBeenCalled()
  })

  it('counts a free product as 0 bani', () => {
    expect(cartSubtotal(cart, (id) => (id === ZACUSCA ? 0 : 1999))).toBe(5997)
  })

  it('throws a plain Error naming the product when its price is unknown', () => {
    const subtotal = () => cartSubtotal(cart, (id) => (id === ZACUSCA ? undefined : 1999))

    expect(subtotal).toThrow(ZACUSCA)
    expect(subtotal).not.toThrow(RangeError)
  })

  // A cart read back from storage is only typed as Cart; a broken line must not become NaN lei.
  it.each([[0], ...NOT_WHOLE_UNITS])('throws RangeError for a line of quantity %s', (quantity) => {
    const broken: Cart = [{ productId: MIERE, quantity }]

    expect(() => cartSubtotal(broken, () => 1999)).toThrow(RangeError)
  })

  it('throws RangeError when the total is too large to stay an exact integer', () => {
    const huge: Cart = [{ productId: MIERE, quantity: 3 }]

    expect(() => cartSubtotal(huge, () => 2 ** 52)).toThrow(RangeError)
  })

  it.each([[19.99], [-1], [Number.NaN], [Number.POSITIVE_INFINITY]])(
    'throws RangeError for price %s',
    (price) => {
      expect(() => cartSubtotal(cart, () => price)).toThrow(RangeError)
    },
  )
})

describe('immutability', () => {
  const operations: ReadonlyArray<readonly [string, (cart: Cart) => unknown]> = [
    ['addItem (existing)', (cart) => addItem(cart, MIERE, 2)],
    ['addItem (new)', (cart) => addItem(cart, BRANZA)],
    ['removeItem', (cart) => removeItem(cart, MIERE)],
    ['setQuantity', (cart) => setQuantity(cart, ZACUSCA, 9)],
    ['setQuantity to 0', (cart) => setQuantity(cart, ZACUSCA, 0)],
    ['itemCount', (cart) => itemCount(cart)],
    ['cartSubtotal', (cart) => cartSubtotal(cart, (id) => (id === MIERE ? 1999 : 3200))],
  ]

  it.each(operations)('%s leaves its input untouched', (_name, operate) => {
    const cart = frozenCart([
      { productId: MIERE, quantity: 1 },
      { productId: ZACUSCA, quantity: 2 },
    ])
    const snapshot = structuredClone(cart)

    operate(cart)

    expect(cart).toEqual(snapshot)
  })

  it('returns a new array when the cart changes', () => {
    const cart = frozenCart([{ productId: MIERE, quantity: 1 }])

    expect(addItem(cart, MIERE)).not.toBe(cart)
  })
})
