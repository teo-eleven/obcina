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
        <dt>Subtotal</dt>
        <dd>{formatPrice(subtotal)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt>Transport</dt>
        <dd>{shipping === 0 ? 'gratuit' : formatPrice(shipping)}</dd>
      </div>
      <div className="flex justify-between gap-4 text-lg font-semibold">
        <dt>Total</dt>
        <dd>{formatPrice(orderTotal(subtotal))}</dd>
      </div>
    </dl>
  )
}
