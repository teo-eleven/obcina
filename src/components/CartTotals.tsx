import { CART_TEXT } from '../constants'
import { formatPrice, orderTotal, shippingCost } from '../utils'

/** Subtotal, delivery ("gratuit" from the threshold up) and what the buyer pays, in bani. */
export function CartTotals({
  subtotal,
  className = '',
}: {
  readonly subtotal: number
  readonly className?: string
}) {
  const shipping = shippingCost(subtotal)
  return (
    <dl className={`space-y-2 ${className}`}>
      <div className="flex justify-between gap-4">
        <dt>{CART_TEXT.subtotal}</dt>
        <dd>{formatPrice(subtotal)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt>{CART_TEXT.shipping}</dt>
        <dd>{shipping === 0 ? CART_TEXT.freeShipping : formatPrice(shipping)}</dd>
      </div>
      <div className="flex justify-between gap-4 text-lg font-semibold">
        <dt>{CART_TEXT.total}</dt>
        <dd>{formatPrice(orderTotal(subtotal))}</dd>
      </div>
    </dl>
  )
}
