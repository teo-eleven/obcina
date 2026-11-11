import { DISABLED_BUTTON, PRIMARY_BUTTON } from '../constants'
import { useCart } from '../hooks'
import type { Product } from '../types'
import { cartLimit, cartLineMessage, lineQuantity } from '../utils'

interface AddToCartButtonProps {
  readonly product: Product
  readonly className?: string
}

/**
 * Adds one of the product per click, never past its stock. The status below says how many are in
 * the cart (also when they were added in another tab). On a card the button sits above the card's
 * stretched link (`relative z-10`), so the click is the button's, not the link's.
 */
export function AddToCartButton({ product, className = '' }: AddToCartButtonProps) {
  const { cart, addItem } = useCart()
  const limit = cartLimit(product)
  const inCart = lineQuantity(cart, product.slug)
  const isSoldOut = limit === 0
  // aria-disabled rather than disabled: the click that reaches the limit must not drop focus.
  const isAtLimit = !isSoldOut && inCart >= limit

  return (
    <div className={className}>
      <button
        type="button"
        disabled={isSoldOut}
        aria-disabled={isAtLimit || undefined}
        // At the limit addItem changes nothing, so the click is a no-op without a guard here.
        onClick={() => addItem(product.slug, 1, limit)}
        className={`${PRIMARY_BUTTON} ${DISABLED_BUTTON} relative z-10`}
      >
        {/* The label's stamp already says "Stoc epuizat"; the button says only that it can't be used. */}
        {isSoldOut ? 'Indisponibil' : 'Adaugă în coș'}
      </button>
      <output
        aria-live="polite"
        aria-atomic="true"
        className="text-lemn-600 mt-2 block min-h-6 text-sm"
      >
        {cartLineMessage(inCart, limit)}
      </output>
    </div>
  )
}
