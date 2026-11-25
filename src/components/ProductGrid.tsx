import { CATALOG_TEXT } from '../constants'
import type { Product } from '../types'
import { ProductCard } from './ProductCard'

// The first row (three columns on desktop) is above the fold: load it at once, it is the LCP.
const EAGER_IMAGES = 3

/** Products as label cards: one column on a phone, up to three on desktop. */
export function ProductGrid({ products }: { products: readonly Product[] }) {
  return (
    <ul aria-label={CATALOG_TEXT.productsList} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <li key={product.slug}>
          <ProductCard product={product} isPriority={index < EAGER_IMAGES} />
        </li>
      ))}
    </ul>
  )
}
