import { z } from 'zod'
import { CATEGORIES, type CategorySlug } from '../data/categories'

// The single validation point for product data coming from Firestore, the seed file or the admin
// panel. Products are a discriminated union: a gift basket is made of other products and has no
// stock of its own (its stock is the lowest of its components', PRD feature 8).

const GIFT_BASKET_CATEGORY = 'cosuri-cadou' satisfies CategorySlug
type SingleCategorySlug = Exclude<CategorySlug, typeof GIFT_BASKET_CATEGORY>

const SINGLE_CATEGORY_SLUGS = CATEGORIES.map((category) => category.slug).filter(
  (slug): slug is SingleCategorySlug => slug !== GIFT_BASKET_CATEGORY,
)

// Also the Firestore doc id and the /produs/:slug URL, so: lowercase kebab-case only.
const KEBAB = '[a-z0-9]+(?:-[a-z0-9]+)*'
export const slugSchema = z
  .string()
  .min(3)
  .max(80)
  .regex(new RegExp(`^${KEBAB}$`))

// No control, format or separator characters (NUL, zero-width, RTL override...): they can make a
// name render as something else or break logs and Stripe metadata. Diacritics are letters, so fine.
const SINGLE_LINE = /^[^\p{Cc}\p{Cf}\p{Zl}\p{Zp}]*$/u
const MULTI_LINE = /^(?:[^\p{Cc}\p{Cf}\p{Zl}\p{Zp}]|\n)*$/u
const text = (min: number, max: number, pattern = SINGLE_LINE) =>
  z.string().trim().min(min).max(max).regex(pattern)

// Every product picture is a square WebP of this size (scripts/images.ts, productImages.test.ts).
export const PRODUCT_IMAGE_SIZE = 800

const MAX_PRICE_BANI = 100_000 // 1000 lei: anything above is a typo, not a jar of honey

const commonFields = {
  slug: slugSchema,
  name: text(2, 80),
  description: text(20, 600, MULTI_LINE),
  // Money is always integer bani (1999 = 19,99 lei), never a float.
  priceBani: z.int().min(1).max(MAX_PRICE_BANI),
  image: z.object({
    // Only our own optimised images, so a product can't pull in an external URL.
    src: z.string().regex(new RegExp(`^/images/products/${KEBAB}\\.webp$`)),
    alt: text(5, 150),
  }),
}

const singleProductSchema = z.object({
  ...commonFields,
  kind: z.literal('product'),
  category: z.enum(SINGLE_CATEGORY_SLUGS),
  weightGrams: z.int().min(1).max(5000),
  ingredients: z.array(text(1, 60)).min(1).max(20),
  stock: z.int().min(0).max(9999),
})

const giftBasketSchema = z
  .object({
    ...commonFields,
    kind: z.literal('gift-basket'),
    category: z.literal(GIFT_BASKET_CATEGORY),
    components: z
      .array(z.object({ slug: slugSchema, quantity: z.int().min(1).max(10) }))
      .min(2)
      .max(8)
      .refine(
        (components) => new Set(components.map((c) => c.slug)).size === components.length,
        'A product can appear only once in a gift basket',
      ),
  })
  .refine((basket) => basket.components.every((c) => c.slug !== basket.slug), {
    message: 'A gift basket cannot contain itself',
    path: ['components'],
  })

export const productSchema = z.discriminatedUnion('kind', [singleProductSchema, giftBasketSchema])

export type SingleProduct = z.infer<typeof singleProductSchema>
export type GiftBasket = z.infer<typeof giftBasketSchema>
export type Product = z.infer<typeof productSchema>
