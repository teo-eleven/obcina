import { Link } from 'react-router'
import { formatPrice } from '../lib/money'
import type { Product } from '../lib/product'
import { stockLabel, stockLevel } from '../lib/stock'
import { Label } from './Label'
import { Stamp } from './Stamp'
import { STRETCHED_CARD, STRETCHED_LINK } from './stretchedLink'

const PRODUCT_IMAGE_SIZE = 800 // matches public/images/products (productImages.test.ts)

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
        <img
          src={product.image.src}
          alt={product.image.alt}
          width={PRODUCT_IMAGE_SIZE}
          height={PRODUCT_IMAGE_SIZE}
          loading={isPriority ? 'eager' : 'lazy'}
          fetchPriority={isPriority ? 'high' : undefined}
          decoding="async"
          className={`h-auto w-full ${stock?.kind === 'out' ? 'opacity-60' : ''}`}
        />
        <h2 className="mt-4 text-xl font-semibold">
          <Link to={`/produs/${product.slug}`} className={STRETCHED_LINK}>
            {product.name}
          </Link>
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Stamp tone="brad">{formatPrice(product.priceBani)}</Stamp>
          <Stamp tone="brad" className="rotate-1">
            {detail}
          </Stamp>
          {warning && <Stamp>{warning}</Stamp>}
        </div>
      </Label>
    </div>
  )
}
