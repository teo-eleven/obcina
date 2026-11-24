import { Link } from 'react-router'
import type { Product } from '../../types'
import { cartLimit, formatPrice } from '../../utils'
import { QuantityField } from './QuantityField'

interface CartPageLineProps {
  readonly product: Product
  readonly quantity: number
  readonly onQuantity: (quantity: number) => void
  readonly onRemove: () => void
}

/** One product in the cart: name, unit price, quantity control, line total, "Scoate". */
export function CartPageLine({ product, quantity, onQuantity, onRemove }: CartPageLineProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-48 flex-1">
        <Link
          to={`/produs/${product.slug}`}
          className="hover:text-afina-700 text-lg font-semibold underline-offset-2 hover:underline"
        >
          {product.name}
        </Link>
        <p className="text-lemn-600 mt-1 text-sm">{`${formatPrice(product.priceBani)} / buc.`}</p>
        <QuantityField
          name={product.name}
          quantity={quantity}
          limit={cartLimit(product)}
          onChange={onQuantity}
          className="mt-3"
        />
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="text-lg font-semibold">{formatPrice(quantity * product.priceBani)}</span>
        <button
          type="button"
          data-remove-for={product.slug}
          onClick={onRemove}
          aria-label={`Scoate ${product.name} din coș`}
          className="text-brad-700 hover:text-afina-700 text-sm font-semibold underline"
        >
          Scoate
        </button>
      </div>
    </div>
  )
}
