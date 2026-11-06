import { collection, getDocsFromServer, limit, query, where } from 'firebase/firestore'
import type { CategorySlug } from '../data/categories'
import { PRODUCTS_COLLECTION } from './catalog'
import { getDb } from './firebase'
import { productSchema, type Product } from './product'

// The rules refuse unbounded lists (firestore.rules); a shelf never holds more than this.
export const CATEGORY_PAGE_LIMIT = 50

/**
 * The products on one shelf, sorted by name. Each document is validated on its own: a bad one is
 * skipped and reported, so it can't blank the whole page.
 */
export async function fetchCategoryProducts(category: CategorySlug): Promise<Product[]> {
  // From the server only: offline, getDocs answers from the (empty) local cache, and the shelf would
  // look empty instead of showing the error state.
  const snapshot = await getDocsFromServer(
    query(
      collection(getDb(), PRODUCTS_COLLECTION),
      where('category', '==', category),
      limit(CATEGORY_PAGE_LIMIT),
    ),
  )

  const products = snapshot.docs.flatMap((doc) => {
    const result = productSchema.safeParse(doc.data())
    // Logged on purpose so bad data gets fixed; field paths and codes only, never stored values.
    if (!result.success) {
      const issues = result.error.issues.map((i) => `${i.path.join('.')}:${i.code}`).join(', ')
      console.warn(`Skipping product ${doc.id}: ${issues}`)
      return []
    }
    // The slug is the doc id (and the /produs URL); a mismatch means the data was written wrong.
    if (result.data.slug !== doc.id) {
      console.warn(`Skipping product ${doc.id}: its slug is ${result.data.slug}`)
      return []
    }
    return [result.data]
  })
  // Sorted here rather than with orderBy, which would need a composite index next to the where.
  return products.toSorted((a, b) => a.name.localeCompare(b.name, 'ro'))
}
