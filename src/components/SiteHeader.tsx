import { Logo } from './Logo'

const NAV_LINKS = [
  { href: '#categorii', label: 'Categorii' },
  { href: '#povestea', label: 'Povestea' },
] as const

export function SiteHeader() {
  return (
    <header className="border-in-100 bg-crema-50/90 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <a href="/" className="rounded-md">
          <Logo />
        </a>
        <nav aria-label="Principal">
          <ul className="flex gap-4 text-sm font-medium whitespace-nowrap sm:gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-lemn-800 hover:text-afina-700">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
