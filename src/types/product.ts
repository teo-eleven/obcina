import type { z } from 'zod'
import type { productSchema } from '../schemas'

// Product types come from the schema, so the type and the runtime check can never drift apart.
export type Product = z.infer<typeof productSchema>
export type SingleProduct = Extract<Product, { kind: 'product' }>
export type GiftBasket = Extract<Product, { kind: 'gift-basket' }>
