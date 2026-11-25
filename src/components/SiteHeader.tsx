import { Link } from 'react-router'
import { CartButton } from './CartButton'
import { Logo } from './Logo'
import { MainNav } from './MainNav'
import { SearchBox } from './SearchBox'

export function SiteHeader() {
  return (
    <header className="border-in-100 bg-crema-50/90 sticky top-0 z-10 border-b backdrop-blur">
      {/* On a phone the search takes its own row under the logo and buttons; wider, it sits between them. */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3">
        <Link to="/">
          <Logo />
        </Link>
        <div className="order-last basis-full sm:order-none sm:max-w-sm sm:flex-1 sm:basis-auto">
          <SearchBox />
        </div>
        <div className="flex items-center gap-2">
          <MainNav />
          <CartButton />
        </div>
      </div>
    </header>
  )
}
