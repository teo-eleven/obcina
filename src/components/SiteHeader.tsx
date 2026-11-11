import { Link } from 'react-router'
import { CartButton } from './CartButton'
import { Logo } from './Logo'
import { MainNav } from './MainNav'

export function SiteHeader() {
  return (
    <header className="border-in-100 bg-crema-50/90 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <MainNav />
          <CartButton />
        </div>
      </div>
    </header>
  )
}
