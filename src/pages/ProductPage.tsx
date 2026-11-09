import { useRef } from 'react'
import { useParams } from 'react-router'
import { LoadError } from '../components/LoadError'
import { OnceLink } from '../components/OnceLink'
import { ProductImage } from '../components/ProductImage'
import { Stamp } from '../components/Stamp'
import { CATEGORIES } from '../data/categories'
import { useRemoteData } from '../hooks/useRemoteData'
import { formatPrice } from '../lib/money'
import { slugSchema, type GiftBasket, type Product } from '../lib/product'
import { fetchProduct, fetchProductsBySlugs } from '../lib/productsRepository'
import { stockLabel, stockLevel } from '../lib/stock'
import { NotFoundPage } from './NotFoundPage'

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

function ProductDetails({ product }: { product: Product }) {
  const shelf = CATEGORIES.find((category) => category.slug === product.category)
  const stock = product.kind === 'product' ? stockLevel(product.stock) : null
  const warning = stock && stockLabel(stock)

  return (
    <article className="grid gap-10 md:grid-cols-2">
      <title>{`${product.name} — Obcina`}</title>
      <ProductImage product={product} isPriority isSoldOut={stock?.kind === 'out'} />
      <div>
        {shelf && (
          <OnceLink
            to={`/categorie/${shelf.slug}`}
            className="text-brad-700 hover:text-afina-700 text-sm font-semibold underline"
          >
            <span aria-hidden="true">← </span>Înapoi la {shelf.name}
          </OnceLink>
        )}
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{product.name}</h1>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Stamp tone="brad">{formatPrice(product.priceBani)}</Stamp>
          {product.kind === 'product' && (
            <Stamp tone="brad" className="rotate-1">{`${product.weightGrams} g`}</Stamp>
          )}
          {warning && <Stamp>{warning}</Stamp>}
        </div>
        <p className="mt-6 text-lg whitespace-pre-line">{product.description}</p>
        {product.kind === 'product' ? (
          <section className="mt-8">
            <h2 id="ingrediente" className="text-xl font-semibold">
              Ingrediente
            </h2>
            <ul aria-labelledby="ingrediente" className="text-lemn-600 mt-3 list-disc pl-5">
              {product.ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
          </section>
        ) : (
          <BasketContents basket={product} />
        )}
      </div>
    </article>
  )
}

function BasketContents({ basket }: { basket: GiftBasket }) {
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
