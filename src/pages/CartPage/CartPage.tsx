import { useCallback, useEffect, useRef, useState } from 'react'
import { useCart } from '../../hooks'
import type { CartChange } from '../../types'
import { CartChangesNotice } from './CartChangesNotice'
import { CartPageContents } from './CartPageContents'
import { EmptyCart } from './EmptyCart'

/** /cos: the whole cart, with quantities, removal and what it all costs. */
export function CartPage() {
  const { cart } = useCart()
  // Everything the page corrected (stock went down, a product left the catalogue), oldest first.
  const [changes, setChanges] = useState<readonly CartChange[]>([])
  const addChanges = useCallback(
    (next: readonly CartChange[]) => setChanges((previous) => [...previous, ...next]),
    [],
  )
  const heading = useRef<HTMLHeadingElement>(null)
  const hadLines = useRef(cart.length > 0)

  // When the last line goes, its "Scoate" button goes with it: focus lands on the page heading.
  useEffect(() => {
    if (hadLines.current && cart.length === 0) heading.current?.focus()
    hadLines.current = cart.length > 0
  }, [cart.length])

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <title>Coșul tău — Obcina</title>
      <h1 ref={heading} tabIndex={-1} className="text-3xl font-semibold outline-none sm:text-4xl">
        Coșul tău
      </h1>
      <CartChangesNotice changes={changes} />
      {cart.length === 0 ? (
        <EmptyCart />
      ) : (
        <CartPageContents cart={cart} onCorrected={addChanges} />
      )}
    </div>
  )
}
