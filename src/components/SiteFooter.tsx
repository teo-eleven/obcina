import { Logo } from './Logo'

export function SiteFooter() {
  return (
    <footer className="bg-brad-900 text-brad-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="bg-crema-50 self-start rounded-xl px-4 py-3">
          <Logo withTagline />
        </div>
        <p className="max-w-md text-sm">
          Proiect universitar. Magazin demonstrativ: produsele și prețurile sunt fictive și nu se
          procesează plăți reale.
        </p>
      </div>
    </footer>
  )
}
