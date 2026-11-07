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

// React Router does not scroll to `#section` on in-app navigation, so we do it here. Smooth only
// here: a global smooth scroll-behavior also animated "start the new page at the top", and a
// reflow (content arriving) could cut that animation short halfway down the page.
export function useScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const id = decodeHashId(hash)
    const behavior = prefersReducedMotion() ? 'auto' : 'smooth'
    if (id) document.getElementById(id)?.scrollIntoView({ behavior })
  }, [pathname, hash])
}
