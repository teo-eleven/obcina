import { CART_TEXT, MAX_LINE_QUANTITY } from '../constants'

/**
 * What the buyer is told about one product's line: how many are in the cart, and whether the
 * stock (`limit`, see cartLimit) is reached, went down, or ran out while it sat in the cart.
 */
export function cartLineMessage(inCart: number, limit: number): string {
  if (inCart === 0) return ''
  if (limit === 0) return CART_TEXT.soldOutInCart
  if (inCart > limit) return CART_TEXT.stockDropped(limit)
  if (inCart < limit) return CART_TEXT.inCart(inCart)
  return limit < MAX_LINE_QUANTITY
    ? CART_TEXT.wholeStockInCart(inCart)
    : CART_TEXT.maxInCart(inCart)
}
