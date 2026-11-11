import { AddToCartButton, OnceLink, ProductImage, Stamp } from '../../components'
import { CATEGORIES } from '../../constants'
import { formatPrice, stockLabel, stockLevel } from '../../utils'
import type { Product } from '../../types'
import { BasketContents } from './BasketContents'

export function ProductDetails({ product }: { product: Product }) {
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
        <AddToCartButton product={product} className="mt-6" />
        <p className="mt-4 text-lg whitespace-pre-line">{product.description}</p>
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
