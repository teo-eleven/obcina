import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { useCart, useCartProducts } from '../hooks'
import type { Cart, Product } from '../types'
import { cartSubtotal } from '../utils'
import { CartDrawerLine } from './CartDrawerLine'
import { CartTotals } from './CartTotals'
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
  const state = useCartProducts(cart)
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
  // Lines whose product left the catalogue are shown, and count 0 here (the /cos page removes them).
  const subtotal = cartSubtotal(cart, (productId) => bySlug.get(productId)?.priceBani ?? 0)

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
      <CartTotals subtotal={subtotal} className="border-in-100 mt-6 border-t pt-4" />
      <Link
        to="/cos"
        onClick={onNavigate}
        className="bg-brad-700 text-crema-50 hover:bg-afina-700 mt-6 rounded-full px-6 py-3 text-center font-semibold transition"
      >
        Vezi coșul
      </Link>
    </div>
  )
}
