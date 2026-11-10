import { useRef } from 'react'
import { Link, useParams } from 'react-router'
import { LoadError } from '../components/LoadError'
import { ProductCard } from '../components/ProductCard'
import { CATEGORIES, type CategorySlug } from '../data/categories'
import { useRemoteData } from '../hooks/useRemoteData'
import { fetchCategoryProducts } from '../lib/productsRepository'
import { NotFoundPage } from './NotFoundPage'

// The first row (three columns on desktop) is above the fold: load it at once, it is the LCP.
const EAGER_IMAGES = 3

type ShelfCategory = (typeof CATEGORIES)[number]

export function CategoryPage() {
  const slug = useParams().slug
  // The slug comes from the URL, so it is checked against the known shelves before any query runs.
  const category = CATEGORIES.find((candidate) => candidate.slug === slug)
  if (!category) return <NotFoundPage />
  return <Shelf category={category} />
}

function Shelf({ category }: { category: ShelfCategory }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <title>{`${category.name} — Obcina`}</title>
      <h1 className="text-3xl font-semibold sm:text-4xl">{category.name}</h1>
      <p className="text-lemn-600 mt-3 text-lg">{category.description}</p>
      <ShelfContents slug={category.slug} />
    </div>
  )
}

function ShelfContents({ slug }: { slug: CategorySlug }) {
  const state = useRemoteData(`the ${slug} shelf`, () => fetchCategoryProducts(slug))
  // Retry swaps the button for the loading state; keep keyboard focus here instead of on <body>.
  const region = useRef<HTMLDivElement>(null)

  return (
    <div ref={region} tabIndex={-1} className="mt-10 outline-none">
      {state.status === 'loading' && (
        <output className="text-lemn-600 block">Se încarcă produsele…</output>
      )}
      {state.status === 'error' && (
        <LoadError
          message="Nu am putut încărca produsele."
          onRetry={() => {
            state.retry()
            region.current?.focus()
          }}
        />
      )}
      {state.status === 'ready' && state.data.length === 0 && (
        <div className="flex flex-col items-start gap-4">
          <p>Raftul ăsta e gol deocamdată.</p>
          <Link
            to={{ pathname: '/', hash: '#categorii' }}
            className="text-brad-700 font-semibold underline"
          >
            Vezi celelalte categorii
          </Link>
        </div>
      )}
      {state.status === 'ready' && state.data.length > 0 && (
        <ul aria-label="Produse" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {state.data.map((product, index) => (
            <li key={product.slug}>
              <ProductCard product={product} isPriority={index < EAGER_IMAGES} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
