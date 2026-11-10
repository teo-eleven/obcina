import type { MouseEvent } from 'react'
import { Link, useLocation, type LinkProps } from 'react-router'

/**
 * A Link that never pushes the page you are already on a second time. React Router pushes a new
 * history entry even for the current location, so a double-tap on a card could leave two entries
 * for the same product and Back needed two taps (issue #5). `to` is a plain path: a hash or query
 * would never equal the pathname, so such links aren't guarded (use Link for those).
 */
export function OnceLink({ to, onClick, ...props }: LinkProps & { to: string }) {
  const { pathname } = useLocation()

  function guard(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    // A modified or middle click opens a new tab or window; that is never a duplicate.
    const opensElsewhere = event.ctrlKey || event.metaKey || event.shiftKey || event.altKey
    if (opensElsewhere || event.button !== 0) return
    // window.location is read at click time: it is already the new page if the first tap landed.
    if (window.location.pathname === to || pathname === to) event.preventDefault()
  }

  return <Link to={to} onClick={guard} {...props} />
}
