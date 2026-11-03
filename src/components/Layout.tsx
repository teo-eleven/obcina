import { Outlet } from 'react-router'
import { useScrollToHash } from '../hooks/useScrollToHash'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export function Layout() {
  useScrollToHash()

  return (
    <>
      <a
        href="#continut"
        className="bg-brad-700 text-crema-50 sr-only z-20 rounded-md focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:px-4 focus:py-2"
      >
        Sari la conținut
      </a>
      <SiteHeader />
      <main id="continut" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  )
}
