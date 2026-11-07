import {
  collection,
  doc,
  documentId,
  getDocFromServer,
  getDocsFromServer,
  limit,
  query,
  where,
} from 'firebase/firestore'
import type { CategorySlug } from '../data/categories'
import { PRODUCTS_COLLECTION } from './catalog'
import { getDb } from './firebase'
import { productSchema, slugSchema, type Product } from './product'

// Every read here goes to the server: offline, the getDoc(s) variants answer from the (empty)
// local cache, and a page would look empty instead of showing its error state.

// The rules refuse unbounded lists (firestore.rules); a shelf never holds more than this.
export const CATEGORY_PAGE_LIMIT = 50

/**
 * Validates one document. A bad one is reported (field paths and codes only, never stored values)
 * and dropped, so it can't break a whole page; its slug must also be its id, which is its URL.
 */
function parseProductDoc(id: string, data: unknown): Product | null {
  const result = productSchema.safeParse(data)
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}:${i.code}`).join(', ')
    console.warn(`Skipping product ${id}: ${issues}`)
    return null
  }
  if (result.data.slug !== id) {
    console.warn(`Skipping product ${id}: its slug is ${result.data.slug}`)
    return null
  }
  return result.data
}

function parseDocs(docs: readonly { id: string; data: () => unknown }[]): Product[] {
  return docs.flatMap((snapshot) => parseProductDoc(snapshot.id, snapshot.data()) ?? [])
}

/** The products on one shelf, sorted by name. */
export async function fetchCategoryProducts(category: CategorySlug): Promise<Product[]> {
  const snapshot = await getDocsFromServer(
    query(
      collection(getDb(), PRODUCTS_COLLECTION),
      where('category', '==', category),
      limit(CATEGORY_PAGE_LIMIT),
    ),
  )
  // Sorted here rather than with orderBy, which would need a composite index next to the where.
  return parseDocs(snapshot.docs).toSorted((a, b) => a.name.localeCompare(b.name, 'ro'))
}

/** One product by its slug, or null when there is none (or the URL can't be a slug at all). */
export async function fetchProduct(slug: string): Promise<Product | null> {
  // The slug comes from the URL; anything that can't be a slug never reaches Firestore.
  if (!slugSchema.safeParse(slug).success) return null
  const snapshot = await getDocFromServer(doc(getDb(), PRODUCTS_COLLECTION, slug))
  return snapshot.exists() ? parseProductDoc(snapshot.id, snapshot.data()) : null
}

/** The products a gift basket is made of, in the basket's order. */
export async function fetchProductsBySlugs(slugs: readonly string[]): Promise<Product[]> {
  if (slugs.length === 0) return []
  // 'in' takes up to 30 values; a basket has at most 8 components (productSchema).
  const snapshot = await getDocsFromServer(
    query(
      collection(getDb(), PRODUCTS_COLLECTION),
      where(documentId(), 'in', [...slugs]),
      limit(slugs.length),
    ),
  )
  const bySlug = new Map(parseDocs(snapshot.docs).map((product) => [product.slug, product]))
  return slugs.flatMap((slug) => bySlug.get(slug) ?? [])
}
