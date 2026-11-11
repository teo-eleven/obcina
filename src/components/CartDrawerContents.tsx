import { useEffect, useRef, useState } from 'react'
import { useCart, useRemoteData } from '../hooks'
import { fetchProductsBySlugs } from '../services'
import type { Cart, Product } from '../types'
import { formatPrice, orderTotal, shippingCost } from '../utils'
import { CartDrawerLine } from './CartDrawerLine'
import { LoadError } from './LoadError'

interface CartDrawerContentsProps {
  readonly cart: Cart
  readonly onRemoved: (name: string) => void
  readonly onNavigate: () => void
}

const UNAVAILABLE = 'produsul indisponibil'

/**
 * The lines of a non-empty cart with their prices. The catalogue is read for the products in the
 * cart, and read again only when a product appears that wasn't read yet: removing a line updates
 * the list at once, without a new request.
 */
export function CartDrawerContents({ cart, onRemoved, onNavigate }: CartDrawerContentsProps) {
  const { removeItem } = useCart()
  const slugs = cart.map((line) => line.productId)
  // Adjusted during render (no effect): a new product in the cart widens what we ask for.
  const [requested, setRequested] = useState(slugs)
  if (!slugs.every((slug) => requested.includes(slug))) setRequested(slugs)
  const state = useRemoteData(`the cart products ${requested.join(',')}`, () =>
    fetchProductsBySlugs(requested),
  )
  const region = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLUListElement>(null)
  // The line whose "Scoate" gets focus once a removal re-renders the list (its button is gone).
  const focusNext = useRef<string | null>(null)

  useEffect(() => {
    const target = focusNext.current
    focusNext.current = null
    if (target) list.current?.querySelector<HTMLElement>(`[data-remove-for="${target}"]`)?.focus()
  }, [cart])

  function remove(productId: string, name: string) {
    const index = cart.findIndex((line) => line.productId === productId)
    focusNext.current = (cart[index + 1] ?? cart[index - 1])?.productId ?? null
    removeItem(productId)
    onRemoved(name)
  }

  if (state.status === 'loading') {
    return <output className="text-lemn-600 mt-8 block">Se încarcă produsele…</output>
  }
  if (state.status === 'error') {
    return (
      <div ref={region} tabIndex={-1} className="mt-8 outline-none">
        <LoadError
          message="Nu am putut încărca produsele din coș."
          onRetry={() => {
            state.retry()
            region.current?.focus()
          }}
        />
      </div>
    )
  }

  const bySlug = new Map<string, Product>(state.data.map((product) => [product.slug, product]))
  // Lines whose product left the catalogue are shown, and kept out of the money (pruned at 3.6).
  const subtotal = cart.reduce(
    (sum, line) => sum + (bySlug.get(line.productId)?.priceBani ?? 0) * line.quantity,
    0,
  )
  const shipping = shippingCost(subtotal)

  return (
    <div className="mt-6 flex flex-1 flex-col">
      <ul ref={list} aria-label="Produse în coș" className="divide-in-100 divide-y">
        {cart.map((line) => {
          const product = bySlug.get(line.productId)
          return (
            <li key={line.productId} className="py-4">
              <CartDrawerLine
                productId={line.productId}
                product={product}
                quantity={line.quantity}
                onRemove={() => remove(line.productId, product?.name ?? UNAVAILABLE)}
                onNavigate={onNavigate}
              />
            </li>
          )
        })}
      </ul>
      <dl className="border-in-100 mt-6 space-y-2 border-t pt-4">
        <div className="flex justify-between gap-4">
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Transport</dt>
          <dd>{shipping === 0 ? 'gratuit' : formatPrice(shipping)}</dd>
        </div>
        <div className="flex justify-between gap-4 text-lg font-semibold">
          <dt>Total</dt>
          <dd>{formatPrice(orderTotal(subtotal))}</dd>
        </div>
      </dl>
    </div>
  )
}
