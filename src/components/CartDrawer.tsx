import { useEffect, useRef, useState, type RefObject } from 'react'
import { PRIMARY_BUTTON } from '../constants'
import { useCart } from '../hooks'
import { CartDrawerContents } from './CartDrawerContents'
import { Sheet, SheetClose, SheetContent, SheetTitle } from './ui'

interface CartDrawerProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  /** The button that opened the drawer: focus goes back to it on close. */
  readonly returnFocus: RefObject<HTMLElement | null>
}

// A live region only speaks when its text changes: the same message twice gets an invisible mark.
const ZERO_WIDTH_SPACE = '\u200b'

/** The mini-cart: what is in the cart, a way to take things out, and what it all costs. */
export function CartDrawer({ open, onOpenChange, returnFocus }: CartDrawerProps) {
  const { cart } = useCart()
  // What the drawer last did, read out by screen readers ("Am scos … din coș.").
  const [announcement, setAnnouncement] = useState('')
  // A closed drawer has nothing to say; reopening starts quiet (adjusted during render, no effect).
  if (!open && announcement) setAnnouncement('')
  const emptyAction = useRef<HTMLButtonElement>(null)
  const hadLines = useRef(cart.length > 0)

  // When the last line goes, its "Scoate" button goes with it: focus the one thing left to do.
  useEffect(() => {
    if (open && hadLines.current && cart.length === 0) emptyAction.current?.focus()
    hadLines.current = cart.length > 0
  }, [open, cart.length])

  function announce(message: string) {
    setAnnouncement((previous) => (previous === message ? message + ZERO_WIDTH_SPACE : message))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent finalFocus={returnFocus} className="w-full max-w-sm p-6">
        <div className="flex items-center justify-between gap-4">
          <SheetTitle className="text-2xl font-semibold">Coșul tău</SheetTitle>
          <SheetClose className="text-brad-700 hover:text-afina-700 rounded-full px-3 py-1 font-semibold underline">
            Închide
          </SheetClose>
        </div>
        <output aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </output>
        {cart.length === 0 ? (
          <div className="mt-8 flex flex-col items-start gap-4">
            <p>Coșul e gol deocamdată.</p>
            <button
              ref={emptyAction}
              type="button"
              onClick={() => onOpenChange(false)}
              className={PRIMARY_BUTTON}
            >
              Continuă cumpărăturile
            </button>
          </div>
        ) : (
          <CartDrawerContents
            cart={cart}
            onRemoved={(name) => announce(`Am scos ${name} din coș.`)}
            onNavigate={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
