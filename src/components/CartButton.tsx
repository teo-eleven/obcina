import { useRef, useState } from 'react'
import { useCart } from '../hooks'
import { productNoun } from '../utils'
import type { CartDrawer as CartDrawerComponent } from './CartDrawer'

// The drawer brings Base UI and the Firestore read: it downloads on first use (ADR 0009). Loaded
// from the click rather than with React.lazy: a failed download (offline, a newer deploy) must not
// throw during render and replace the page with the route error, and it must be retryable.
const loadCartDrawer = () => import('./CartDrawer').then((module) => module.CartDrawer)

type LoadState = 'idle' | 'loading' | 'failed'

/** The cart in the header: how many products it holds, and the button that opens the drawer. */
export function CartButton() {
  const { itemCount } = useCart()
  const [Drawer, setDrawer] = useState<typeof CartDrawerComponent | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const buttonRef = useRef<HTMLButtonElement>(null)

  function open() {
    if (Drawer) return setIsOpen(true)
    setLoadState('loading')
    loadCartDrawer().then(
      (component) => {
        setDrawer(() => component)
        setLoadState('idle')
        setIsOpen(true)
      },
      () => setLoadState('failed'),
    )
  }

  // Start the download as soon as the visitor heads for the button; a failure here is retried on click.
  function prefetch() {
    if (!Drawer) loadCartDrawer().catch(() => undefined)
  }

  return (
    <div className="relative">
      {/* Named by what it shows ("Coș 3") plus a hidden noun, so voice control finds it (WCAG 2.5.3). */}
      <button
        ref={buttonRef}
        type="button"
        onClick={open}
        onPointerEnter={prefetch}
        onFocus={prefetch}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-busy={loadState === 'loading' || undefined}
        className="border-in-100 text-brad-700 hover:border-brad-700 flex items-center gap-2 rounded-full border px-3 py-1.5 font-semibold transition"
      >
        Coș{' '}
        <span className="bg-brad-700 text-crema-50 min-w-6 rounded-full px-1.5 text-center text-sm">
          {itemCount}
        </span>
        {/* A whitespace-only text node: part of the name, invisible in the flex layout. */}{' '}
        <span className="sr-only">{productNoun(itemCount)}</span>
      </button>
      <output
        aria-live="polite"
        className={
          loadState === 'failed'
            ? 'bg-crema-50 border-in-100 text-lemn-800 absolute top-full right-0 z-20 mt-2 w-60 rounded-md border p-3 text-sm shadow'
            : 'sr-only'
        }
      >
        {loadState === 'failed' &&
          'Nu am putut deschide coșul. Verifică conexiunea și încearcă din nou.'}
      </output>
      {Drawer && <Drawer open={isOpen} onOpenChange={setIsOpen} returnFocus={buttonRef} />}
    </div>
  )
}
