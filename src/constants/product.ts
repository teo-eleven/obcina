// A product's slug is also its Firestore doc id and its /produs/:slug URL: lowercase kebab-case.
// Shared by the zod schema and the cart parser (which runs on every page, without zod).
export const SLUG_BODY = '[a-z0-9]+(?:-[a-z0-9]+)*'
export const SLUG_PATTERN = new RegExp(`^${SLUG_BODY}$`)
export const SLUG_MIN_LENGTH = 3
export const SLUG_MAX_LENGTH = 80

// Every product picture is a square WebP of this size (scripts/images.ts, productImages.test.ts).
export const PRODUCT_IMAGE_SIZE = 800

// The Firestore collection the catalogue lives in; firebase/firestore.rules names it too.
export const PRODUCTS_COLLECTION = 'products'

// The rules refuse unbounded lists (firestore.rules); a shelf never holds more than this.
export const CATEGORY_PAGE_LIMIT = 50
