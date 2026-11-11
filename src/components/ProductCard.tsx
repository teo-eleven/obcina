import { formatPrice, stockLabel, stockLevel } from '../utils'
import type { Product } from '../types'
import { AddToCartButton } from './AddToCartButton'
import { Label } from './Label'
import { OnceLink } from './OnceLink'
import { ProductImage } from './ProductImage'
import { Stamp } from './Stamp'
import { STRETCHED_CARD, STRETCHED_LINK } from '../constants'

interface ProductCardProps {
  readonly product: Product
  /** Above the fold: load the image at once, it is the page's largest paint. */
  readonly isPriority: boolean
}

/** A jar label for one product: picture, name, weight or contents, price stamp, stock warning. */
export function ProductCard({ product, isPriority }: ProductCardProps) {
  const detail =
    product.kind === 'product' ? `${product.weightGrams} g` : `${product.components.length} produse`
  const stock = product.kind === 'product' ? stockLevel(product.stock) : null
  const warning = stock && stockLabel(stock)

  return (
    <div className={`${STRETCHED_CARD} h-full`}>
      <Label className="h-full">
        <ProductImage product={product} isPriority={isPriority} isSoldOut={stock?.kind === 'out'} />
        <h2 className="mt-4 text-xl font-semibold">
          <OnceLink to={`/produs/${product.slug}`} className={STRETCHED_LINK}>
            {product.name}
          </OnceLink>
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Stamp tone="brad">{formatPrice(product.priceBani)}</Stamp>
          <Stamp tone="brad" className="rotate-1">
            {detail}
          </Stamp>
          {warning && <Stamp>{warning}</Stamp>}
        </div>
        <AddToCartButton product={product} className="mt-5" />
      </Label>
    </div>
  )
}
