// Every product picture is a square WebP of this size (scripts/images.ts, productImages.test.ts).
export const PRODUCT_IMAGE_SIZE = 800

// The Firestore collection the catalogue lives in; firebase/firestore.rules names it too.
export const PRODUCTS_COLLECTION = 'products'

// The rules refuse unbounded lists (firestore.rules); a shelf never holds more than this.
export const CATEGORY_PAGE_LIMIT = 50
