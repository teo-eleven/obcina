import { useEffect } from 'react'
import { useLocation } from 'react-router'

function decodeHashId(hash: string): string | null {
  try {
    return decodeURIComponent(hash.slice(1))
  } catch {
    return null // malformed escape such as "#%E0" — nothing to scroll to
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// React Router scrolls neither to `#section` nor to the top of a new page on in-app navigation, so
// this hook does both, after the new page has rendered:
// - `#section`: scroll to it, smoothly unless the visitor asked for reduced motion;
// - a new page: start at the top. Instant on purpose; a global smooth scroll-behavior animated this
//   jump and a reflow (content arriving) could cut it short halfway down the page.
// Not React Router's <ScrollRestoration>: it jumps to a #section before paint, so the second click
// of a double-click landed on whatever card was now under the pointer. Restoring the position on
// Back would need the shelf data loaded before render (route loaders; plan step 4.4).
export function useScrollOnNavigation() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    const id = decodeHashId(hash)
    const behavior = prefersReducedMotion() ? 'auto' : 'smooth'
    if (id) document.getElementById(id)?.scrollIntoView({ behavior })
  }, [pathname, hash])
}
