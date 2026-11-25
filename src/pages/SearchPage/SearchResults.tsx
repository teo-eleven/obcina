import { SEARCH_TEXT } from '../../constants'
import { useRef } from 'react'
import { Link } from 'react-router'
import { LoadError, ProductGrid } from '../../components'
import { useRemoteData } from '../../hooks'
import { fetchCatalogue } from '../../services'
import { searchProducts } from '../../utils'

/** The products matching `query`, read from the whole catalogue and matched in the browser. */
export function SearchResults({ query }: { query: string }) {
  // One read per visit to the page: a new query filters the same catalogue again.
  const state = useRemoteData('the search catalogue', fetchCatalogue)
  // Retry swaps the button for the loading state; keep keyboard focus here instead of on <body>.
  const region = useRef<HTMLDivElement>(null)
  const matches = state.status === 'ready' ? searchProducts(state.data, query) : []

  return (
    <div ref={region} tabIndex={-1} className="mt-10 outline-none">
      {state.status === 'loading' && (
        <output className="text-lemn-600 block">{SEARCH_TEXT.loading}</output>
      )}
      {state.status === 'error' && (
        <LoadError
          message={SEARCH_TEXT.loadError}
          onRetry={() => {
            state.retry()
            region.current?.focus()
          }}
        />
      )}
      {state.status === 'ready' && matches.length === 0 && (
        <div className="flex flex-col items-start gap-4">
          <p>{SEARCH_TEXT.noMatches(query)}</p>
          <Link
            to={{ pathname: '/', hash: '#categorii' }}
            className="text-brad-700 font-semibold underline"
          >
            {SEARCH_TEXT.seeCategories}
          </Link>
        </div>
      )}
      {matches.length > 0 && <ProductGrid products={matches} />}
    </div>
  )
}
