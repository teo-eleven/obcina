import { productSchema } from '../schemas'
import type { Product, SyncPlan } from '../types'

// Pure checks and planning for syncing a catalogue into Firestore (the seed script, later the admin
// panel). No Firebase here, so it is unit-tested without an emulator.

function entryLabel(entry: unknown, index: number): string {
  const slug =
    typeof entry === 'object' && entry !== null && 'slug' in entry ? entry.slug : undefined
  return typeof slug === 'string' ? slug : `#${index}`
}

interface Parsed {
  readonly products: readonly Product[]
  readonly problems: readonly string[]
  /** Slugs of entries that failed the schema: their own errors already explain them. */
  readonly invalidSlugs: ReadonlySet<string>
}

// One schema pass over every entry: the valid products, every schema problem, and which slugs failed.
function parseEntries(entries: readonly unknown[]): Parsed {
  const results = entries.map((entry, index) => ({
    label: entryLabel(entry, index),
    result: productSchema.safeParse(entry),
  }))
  return {
    products: results.flatMap(({ result }) => (result.success ? [result.data] : [])),
    problems: results.flatMap(({ label, result }) =>
      result.success
        ? []
        : result.error.issues.map(
            (issue) =>
              `${label}: ${issue.path.map(String).join('.') || '(entry)'}: ${issue.message}`,
          ),
    ),
    invalidSlugs: new Set(results.flatMap(({ label, result }) => (result.success ? [] : [label]))),
  }
}

function duplicateProblems(products: readonly Product[]): string[] {
  const slugs = products.map((product) => product.slug)
  const repeated = new Set(slugs.filter((slug, i) => slugs.indexOf(slug) !== i))
  return [...repeated].map((slug) => `${slug}: duplicate slug`)
}

// A basket's stock and price come from its components, so each must be a real single product.
function basketProblems(products: readonly Product[], invalidSlugs: ReadonlySet<string>): string[] {
  const bySlug = new Map(products.map((product) => [product.slug, product]))
  return products.flatMap((basket) =>
    basket.kind !== 'gift-basket'
      ? []
      : basket.components.flatMap(({ slug }) => {
          const component = bySlug.get(slug)
          if (!component && invalidSlugs.has(slug)) return []
          if (!component) return [`${basket.slug}: component ${slug} is not in the catalogue`]
          if (component.kind !== 'product') {
            return [`${basket.slug}: component ${slug} is a gift basket; baskets can't nest`]
          }
          return []
        }),
  )
}

/**
 * Parses every entry and checks the catalogue as a whole. Throws one error listing every problem,
 * so a bad seed file is fixed in one pass rather than one complaint at a time.
 */
export function validateCatalog(entries: readonly unknown[]): Product[] {
  if (entries.length === 0) {
    throw new Error('The catalogue is empty; refusing to sync, it would delete every product.')
  }

  const { products, problems: schema, invalidSlugs } = parseEntries(entries)
  const problems = [
    ...schema,
    ...duplicateProblems(products),
    ...basketProblems(products, invalidSlugs),
  ]
  if (problems.length > 0) {
    throw new Error(`Invalid catalogue (${problems.length}):\n  ${problems.join('\n  ')}`)
  }
  return [...products]
}

/** Every product is (re)written under its slug, which is what makes a re-run harmless. */
export function planSync(catalog: readonly Product[], existingIds: readonly string[]): SyncPlan {
  const wanted = new Set(catalog.map((product) => product.slug))
  return {
    upsert: [...catalog],
    remove: existingIds.filter((id) => !wanted.has(id)).toSorted(),
  }
}
