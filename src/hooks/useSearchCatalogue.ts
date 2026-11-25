import { useCallback, useRef, useState } from 'react'
import type { Product } from '../types'

export type SearchCatalogue =
  | { readonly status: 'idle' | 'loading' | 'error' }
  | { readonly status: 'ready'; readonly products: readonly Product[] }

// The header must not bring Firebase into the first page load (npm run check:bundle): the read is
// downloaded the first time someone heads for the search box.
const loadCatalogue = () => import('../services').then((services) => services.fetchCatalogue())

/**
 * The catalogue for the header search, read on demand: `load` starts the read, and calling it
 * again while it is loading or once it has loaded does nothing; after a failure it tries again.
 */
export function useSearchCatalogue(): { catalogue: SearchCatalogue; load: () => void } {
  const [catalogue, setCatalogue] = useState<SearchCatalogue>({ status: 'idle' })
  // Read synchronously by `load`, so two quick calls (focus, then typing) start one request.
  const isBusyOrDone = useRef(false)

  const load = useCallback(() => {
    if (isBusyOrDone.current) return
    isBusyOrDone.current = true
    setCatalogue({ status: 'loading' })
    loadCatalogue().then(
      (products) => setCatalogue({ status: 'ready', products }),
      (error: unknown) => {
        console.error('Could not load the search catalogue:', error)
        isBusyOrDone.current = false
        setCatalogue({ status: 'error' })
      },
    )
  }, [])

  return { catalogue, load }
}
