import { useRef } from 'react'
import { LoadError, OnceLink } from '../../components'
import { useRemoteData } from '../../hooks'
import type { GiftBasket } from '../../types'
import { fetchProductsBySlugs } from '../../services'

export function BasketContents({ basket }: { basket: GiftBasket }) {
  const slugs = basket.components.map((component) => component.slug)
  const state = useRemoteData(`the contents of ${basket.slug}`, () => fetchProductsBySlugs(slugs))
  const section = useRef<HTMLElement>(null)
  // A missing or invalid component is dropped by the repository; say so instead of a shorter list.
  const isIncomplete = state.status === 'ready' && state.data.length < slugs.length

  return (
    <section ref={section} tabIndex={-1} className="mt-8 outline-none">
      <h2 id="ce-contine" className="text-xl font-semibold">
        Ce conține
      </h2>
      {state.status === 'loading' && (
        <output className="text-lemn-600 mt-3 block">Se încarcă produsele din coș…</output>
      )}
      {state.status === 'error' && (
        <div className="mt-3">
          <LoadError
            message="Nu am putut încărca produsele din coș."
            onRetry={() => {
              state.retry()
              section.current?.focus()
            }}
          />
        </div>
      )}
      {isIncomplete && (
        <p className="text-lemn-600 mt-3">Unele produse din coș nu sunt disponibile acum.</p>
      )}
      {state.status === 'ready' && state.data.length > 0 && (
        <ul aria-labelledby="ce-contine" className="mt-3 list-disc pl-5">
          {state.data.map((component) => (
            <li key={component.slug}>
              <OnceLink
                to={`/produs/${component.slug}`}
                className="text-brad-700 hover:text-afina-700 underline"
              >
                {component.name}
              </OnceLink>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
