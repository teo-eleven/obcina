import { PRODUCT_IMAGE_SIZE } from '../constants'
import type { Product } from '../types'

interface ProductImageProps {
  readonly product: Product
  /** Above the fold: load it at once, it is the page's largest paint. */
  readonly isPriority: boolean
  /** Dimmed as a visual cue; the "Stoc epuizat" stamp says it in text. */
  readonly isSoldOut: boolean
}

export function ProductImage({ product, isPriority, isSoldOut }: ProductImageProps) {
  return (
    <img
      src={product.image.src}
      alt={product.image.alt}
      width={PRODUCT_IMAGE_SIZE}
      height={PRODUCT_IMAGE_SIZE}
      loading={isPriority ? 'eager' : 'lazy'}
      fetchPriority={isPriority ? 'high' : undefined}
      decoding="async"
      className={`h-auto w-full ${isSoldOut ? 'opacity-60' : ''}`}
    />
  )
}
