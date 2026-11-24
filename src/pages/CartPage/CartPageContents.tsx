import { useEffect, useRef } from 'react'
import { CartTotals, LoadError } from '../../components'
import { useCart, useCartProducts } from '../../hooks'
import type { Cart, CartChange, Product } from '../../types'
import { cartLimit, cartSubtotal, reconcileCart } from '../../utils'
import { CartPageLine } from './CartPageLine'

interface CartPageContentsProps {
  readonly cart: Cart
  /** Called with what had to change when the cart didn't match the catalogue or its stock. */
  readonly onCorrected: (changes: readonly CartChange[]) => void
}

/** The lines of a non-empty cart, kept payable: corrected against the catalogue once it is read. */
export function CartPageContents({ cart, onCorrected }: CartPageContentsProps) {
  const { removeItem, setQuantity, replace } = useCart()
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

  function remove(productId: string) {
    const index = cart.findIndex((line) => line.productId === productId)
    focusNext.current = (cart[index + 1] ?? cart[index - 1])?.productId ?? null
    removeItem(productId)
  }
  const products = state.status === 'ready' ? state.data : null

  // An external store write, so in an effect: one replace with every correction at once.
  useEffect(() => {
    if (!products) return
    const { cart: corrected, changes } = reconcileCart(cart, products)
    if (changes.length === 0) return
    onCorrected(changes)
    replace(corrected)
  }, [products, cart, onCorrected, replace])

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
  // Until the correction lands (next render), unknown lines count 0 and are not shown.
  const subtotal = cartSubtotal(cart, (productId) => bySlug.get(productId)?.priceBani ?? 0)

  return (
    <div className="mt-8 grid gap-10 md:grid-cols-[1fr_18rem]">
      <ul ref={list} aria-label="Produse în coș" className="divide-in-100 divide-y">
        {cart.flatMap((line) => {
          const product = bySlug.get(line.productId)
          if (!product) return []
          return [
            <li key={line.productId} className="py-5">
              <CartPageLine
                product={product}
                quantity={line.quantity}
                onQuantity={(quantity) => setQuantity(product.slug, quantity, cartLimit(product))}
                onRemove={() => remove(product.slug)}
              />
            </li>,
          ]
        })}
      </ul>
      <CartTotals subtotal={subtotal} className="border-in-100 h-fit rounded-md border p-5" />
    </div>
  )
}
