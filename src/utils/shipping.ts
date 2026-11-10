import { FREE_SHIPPING_THRESHOLD_BANI, SHIPPING_COST_BANI } from '../constants'
import { assertBani } from './money'

/** Delivery for a cart worth `subtotalBani`: free from the threshold up, and for an empty cart. */
export function shippingCost(subtotalBani: number): number {
  assertBani(subtotalBani, 'A subtotal')
  const isEmpty = subtotalBani === 0
  return isEmpty || subtotalBani >= FREE_SHIPPING_THRESHOLD_BANI ? 0 : SHIPPING_COST_BANI
}

/**
 * What the buyer pays: the subtotal plus delivery, in bani. It can't overflow: delivery is only
 * charged below the free threshold, so near the top of the safe range it adds nothing.
 */
export function orderTotal(subtotalBani: number): number {
  return subtotalBani + shippingCost(subtotalBani)
}
