// zod/mini (PLAN 3.8): the same checks as classic zod, written as functions, so only the checks we
// use end up in the download.
import { z } from 'zod/mini'
import { CATEGORIES, SLUG_BODY, SLUG_MAX_LENGTH, SLUG_MIN_LENGTH, SLUG_PATTERN } from '../constants'
import type { CategorySlug } from '../types'

// The single validation point for product data coming from Firestore, the seed file or the admin
// panel. Products are a discriminated union: a gift basket is made of other products and has no
// stock of its own (its stock is the lowest of its components', PRD feature 8).

const GIFT_BASKET_CATEGORY = 'cosuri-cadou' satisfies CategorySlug
type SingleCategorySlug = Exclude<CategorySlug, typeof GIFT_BASKET_CATEGORY>

const SINGLE_CATEGORY_SLUGS = CATEGORIES.map((category) => category.slug).filter(
  (slug): slug is SingleCategorySlug => slug !== GIFT_BASKET_CATEGORY,
)

// The slug rule lives in constants/product.ts; image paths reuse its kebab-case body.
const KEBAB = SLUG_BODY
export const slugSchema = z
  .string()
  .check(z.minLength(SLUG_MIN_LENGTH), z.maxLength(SLUG_MAX_LENGTH), z.regex(SLUG_PATTERN))

// No control, format or separator characters (NUL, zero-width, RTL override...): they can make a
// name render as something else or break logs and Stripe metadata. Diacritics are letters, so fine.
const SINGLE_LINE = /^[^\p{Cc}\p{Cf}\p{Zl}\p{Zp}]*$/u
const MULTI_LINE = /^(?:[^\p{Cc}\p{Cf}\p{Zl}\p{Zp}]|\n)*$/u
const text = (min: number, max: number, pattern = SINGLE_LINE) =>
  z.string().check(z.trim(), z.minLength(min), z.maxLength(max), z.regex(pattern))

const wholeNumber = (min: number, max: number) => z.int().check(z.gte(min), z.lte(max))

const MAX_PRICE_BANI = 100_000 // 1000 lei: anything above is a typo, not a jar of honey

const commonFields = {
  slug: slugSchema,
  name: text(2, 80),
  description: text(20, 600, MULTI_LINE),
  // Money is always integer bani (1999 = 19,99 lei), never a float.
  priceBani: wholeNumber(1, MAX_PRICE_BANI),
  image: z.object({
    // Only our own optimised images, so a product can't pull in an external URL.
    src: z.string().check(z.regex(new RegExp(`^/images/products/${KEBAB}\\.webp$`))),
    alt: text(5, 150),
  }),
}

const singleProductSchema = z.object({
  ...commonFields,
  kind: z.literal('product'),
  category: z.enum(SINGLE_CATEGORY_SLUGS),
  weightGrams: wholeNumber(1, 5000),
  ingredients: z.array(text(1, 60)).check(z.minLength(1), z.maxLength(20)),
  stock: wholeNumber(0, 9999),
})

const giftBasketSchema = z
  .object({
    ...commonFields,
    kind: z.literal('gift-basket'),
    category: z.literal(GIFT_BASKET_CATEGORY),
    components: z.array(z.object({ slug: slugSchema, quantity: wholeNumber(1, 10) })).check(
      z.minLength(2),
      z.maxLength(8),
      z.refine(
        (components) => new Set(components.map((c) => c.slug)).size === components.length,
        'A product can appear only once in a gift basket',
      ),
    ),
  })
  .check(
    z.refine((basket) => basket.components.every((c) => c.slug !== basket.slug), {
      message: 'A gift basket cannot contain itself',
      path: ['components'],
    }),
  )

export const productSchema = z.discriminatedUnion('kind', [singleProductSchema, giftBasketSchema])
