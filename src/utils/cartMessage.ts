import { MAX_LINE_QUANTITY } from '../constants'

/**
 * What the buyer is told about one product's line: how many are in the cart, and whether the
 * stock (`limit`, see cartLimit) is reached, went down, or ran out while it sat in the cart.
 */
export function cartLineMessage(inCart: number, limit: number): string {
  if (inCart === 0) return ''
  if (limit === 0) return 'Nu mai avem în stoc. Scoate-l din coș.'
  if (inCart > limit) return `Stocul a scăzut: mai sunt doar ${limit} buc.`
  if (inCart < limit) return `În coș: ${inCart} buc.`
  return limit < MAX_LINE_QUANTITY
    ? `Ai în coș tot stocul: ${inCart} buc.`
    : `Ai în coș cantitatea maximă: ${inCart} buc.`
}
