import { useEffect, useId, useRef, useState, type FocusEvent } from 'react'
import { Link, useLocation } from 'react-router'

const NAV_LINKS = [
  { hash: '#categorii', label: 'Categorii' },
  { hash: '#povestea', label: 'Povestea' },
] as const

/*
 * Main navigation. From `sm` up the links sit inline; below it they collapse behind a
 * "Meniu" button (WAI-ARIA disclosure pattern — not a modal, so focus is not trapped).
 * Open: focus moves to the first link. Closes on Escape (focus back on the button), on a
 * click or focus outside, after choosing a link, and when the page changes.
 */
export function MainNav() {
  const { pathname, hash } = useLocation()
  const currentPage = `${pathname}${hash}`
  // Remember which page the menu was opened on: any navigation closes it, with no effect needed.
  const [openOnPage, setOpenOnPage] = useState<string | null>(null)
  const isOpen = openOnPage === currentPage
  const close = () => setOpenOnPage(null)

  const panelId = useId()
  const navRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (isOpen) listRef.current?.querySelector('a')?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !navRef.current?.contains(event.target)) {
        setOpenOnPage(null)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpenOnPage(null)
      // Return focus to the button only if it was in the menu (or nowhere) — never steal it.
      const focused = document.activeElement
      if (!focused || focused === document.body || navRef.current?.contains(focused)) {
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  // Close only when focus lands on something outside the menu. A blur with no relatedTarget
  // happens when Safari/Firefox (macOS) click a button without focusing it — that must not
  // close the menu, or the toggle's own click would reopen it. Outside clicks are handled above.
  const closeWhenFocusLeaves = (event: FocusEvent) => {
    const next = event.relatedTarget
    if (isOpen && next instanceof Node && !navRef.current?.contains(next)) close()
  }

  return (
    <nav ref={navRef} aria-label="Principal" className="relative">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setOpenOnPage(isOpen ? null : currentPage)}
        onBlur={closeWhenFocusLeaves}
        className="border-lemn-600/40 text-brad-900 hover:bg-in-100 inline-flex size-11 items-center justify-center rounded-md border sm:hidden"
      >
        <span className="sr-only">Meniu</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="size-6"
        >
          {isOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <ul
        ref={listRef}
        id={panelId}
        data-open={isOpen}
        className={`${isOpen ? 'flex' : 'hidden'} border-lemn-600 bg-crema-50 paper absolute top-full right-0 mt-2 w-56 flex-col border p-2 text-base font-medium shadow-lg sm:static sm:mt-0 sm:flex sm:w-auto sm:flex-row sm:gap-6 sm:border-0 sm:bg-transparent sm:bg-none sm:p-0 sm:text-sm sm:shadow-none`}
      >
        {NAV_LINKS.map((link) => (
          <li key={link.hash}>
            <Link
              to={{ pathname: '/', hash: link.hash }}
              onClick={close}
              onBlur={closeWhenFocusLeaves}
              className="text-lemn-800 hover:bg-in-100 hover:text-afina-700 block rounded-sm px-4 py-3 whitespace-nowrap sm:p-0 sm:hover:bg-transparent"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
