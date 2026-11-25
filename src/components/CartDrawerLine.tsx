import { CART_TEXT } from '../constants'
import { Link } from 'react-router'
import type { Product } from '../types'
import { formatPrice } from '../utils'

interface CartDrawerLineProps {
  readonly productId: string
  /** Undefined when the product is no longer in the catalogue. */
  readonly product: Product | undefined
  readonly quantity: number
  readonly onRemove: () => void
  readonly onNavigate: () => void
}

const REMOVE_BUTTON = 'text-brad-700 hover:text-afina-700 text-sm font-semibold underline'

/** One line of the mini-cart: the product, how many, what they cost, and a way to take them out. */
export function CartDrawerLine({
  productId,
  product,
  quantity,
  onRemove,
  onNavigate,
}: CartDrawerLineProps) {
  if (!product) {
    return (
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lemn-600">{CART_TEXT.unavailableLine}</p>
          <p className="text-lemn-600 mt-1 text-sm">{CART_TEXT.notInTotal}</p>
        </div>
        <button
          type="button"
          data-remove-for={productId}
          onClick={onRemove}
          aria-label={CART_TEXT.removeUnavailableLabel}
          className={REMOVE_BUTTON}
        >
          {CART_TEXT.remove}
        </button>
      </div>
    )
  }
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <Link
          to={`/produs/${product.slug}`}
          onClick={onNavigate}
          className="hover:text-afina-700 font-semibold underline-offset-2 hover:underline"
        >
          {product.name}
        </Link>
        <p className="text-lemn-600 mt-1 text-sm">
          {quantity} × {formatPrice(product.priceBani)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="font-semibold">{formatPrice(quantity * product.priceBani)}</span>
        <button
          type="button"
          data-remove-for={productId}
          onClick={onRemove}
          aria-label={CART_TEXT.removeLabel(product.name)}
          className={REMOVE_BUTTON}
        >
          {CART_TEXT.remove}
        </button>
      </div>
    </div>
  )
}
