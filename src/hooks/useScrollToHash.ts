import { useEffect } from 'react'
import { useLocation } from 'react-router'

function decodeHashId(hash: string): string | null {
  try {
    return decodeURIComponent(hash.slice(1))
  } catch {
    return null // malformed escape such as "#%E0" — nothing to scroll to
  }
}

// React Router does not scroll to `#section` on in-app navigation, so we do it here.
// scrollIntoView() follows the CSS scroll-behavior, which already respects reduced motion.
export function useScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const id = decodeHashId(hash)
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [pathname, hash])
}
