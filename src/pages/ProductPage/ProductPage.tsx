import { useRef } from 'react'
import { useParams } from 'react-router'
import { LoadError } from '../../components'
import { useRemoteData } from '../../hooks'
import { slugSchema } from '../../schemas'
import { fetchProduct } from '../../services'
import { NotFoundPage } from '../NotFoundPage'
import { ProductDetails } from './ProductDetails'

export function ProductPage() {
  // fetchProduct refuses anything that can't be a slug before it reaches Firestore.
  const slug = useParams().slug ?? ''
  // The key is also logged; an odd URL is named "invalid" rather than echoed into the console.
  const key = `product ${slugSchema.safeParse(slug).success ? slug : 'invalid'}`
  const state = useRemoteData(key, () => fetchProduct(slug))
  // Retry swaps the button for the loading state; keep keyboard focus here instead of on <body>.
  const region = useRef<HTMLDivElement>(null)

  if (state.status === 'ready' && state.data === null) return <NotFoundPage />

  return (
    <div ref={region} tabIndex={-1} className="mx-auto max-w-5xl px-4 py-12 outline-none">
      {/* Until the product is known, the tab must not keep the previous page's name. */}
      {state.status !== 'ready' && <title>Produs — Obcina</title>}
      {state.status === 'loading' && (
        <output className="text-lemn-600 block">Se încarcă produsul…</output>
      )}
      {state.status === 'error' && (
        <LoadError
          message="Nu am putut încărca produsul."
          onRetry={() => {
            state.retry()
            region.current?.focus()
          }}
        />
      )}
      {state.status === 'ready' && state.data && <ProductDetails product={state.data} />}
    </div>
  )
}
