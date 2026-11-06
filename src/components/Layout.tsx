import { Outlet, useNavigation } from 'react-router'
import { useScrollToHash } from '../hooks/useScrollToHash'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export function Layout() {
  useScrollToHash()
  // A lazy page can take a moment to download; say so instead of looking frozen.
  const isNavigating = useNavigation().state !== 'idle'

  return (
    <>
      <a
        href="#continut"
        className="bg-brad-700 text-crema-50 sr-only z-20 rounded-md focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:px-4 focus:py-2"
      >
        Sari la conținut
      </a>
      {isNavigating && (
        <div
          aria-hidden="true"
          className="bg-afina-500 fixed inset-x-0 top-0 z-30 h-1 animate-pulse"
        />
      )}
      <SiteHeader />
      <main id="continut" tabIndex={-1} aria-busy={isNavigating} className="outline-none">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  )
}
