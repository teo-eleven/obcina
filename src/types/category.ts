import type { CATEGORIES } from '../constants'

export interface Category {
  readonly slug: string
  readonly name: string
  readonly description: string
}

// Categories stay in code; only products move to Firestore. A product's category arrives as a
// string and must be validated against these slugs at that boundary (plan step 2.3).
export type CategorySlug = (typeof CATEGORIES)[number]['slug']
