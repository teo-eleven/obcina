import { useRef } from 'react'
import { Link } from 'react-router'
import { LoadError, ProductCard } from '../../components'
import type { CategorySlug } from '../../types'
import { useRemoteData } from '../../hooks'
import { fetchCategoryProducts } from '../../services'

// The first row (three columns on desktop) is above the fold: load it at once, it is the LCP.
const EAGER_IMAGES = 3

export function ShelfContents({ slug }: { slug: CategorySlug }) {
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
