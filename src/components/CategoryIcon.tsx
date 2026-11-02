import type { ReactNode } from 'react'
import type { CategorySlug } from '../data/categories'

/*
 * Hand-drawn category icons: 48×48, round strokes in the current text colour, brand-token accents.
 * Typed as Record<CategorySlug, …> so a new category without an icon fails the type check.
 */
const ICONS: Record<CategorySlug, ReactNode> = {
  // Jar of jam with berries.
  dulceturi: (
    <>
      <rect x="14" y="7" width="20" height="6" rx="2" className="fill-lemn-600" />
      <path d="M15.5 13c-3 3-4.4 6.2-4.4 10.2v12.3c0 3.6 2.6 6 6.1 6h13.9c3.4 0 6-2.4 6-6V23.2c0-4-1.5-7.3-4.5-10.2" />
      <circle cx="20" cy="28" r="3.2" className="fill-afina-500" />
      <circle cx="27.5" cy="25.5" r="3.2" className="fill-afina-500" />
      <circle cx="25.5" cy="33" r="3.2" className="fill-afina-500" />
    </>
  ),
  // Three honeycomb cells and a falling drop.
  miere: (
    <>
      <path d="M16 8l6 3.5v7L16 22l-6-3.5v-7z" className="fill-miere-300" />
      <path d="M28.1 8l6 3.5v7l-6 3.5-6.1-3.5v-7z" className="fill-miere-300" />
      <path d="M22 18.5l6.1 3.5v7L22 32.5 16 29v-7z" className="fill-miere-300" />
      <path
        d="M35.5 27.5s-6.5 7.4-6.5 11.4a6.5 6.5 0 0 0 13 0c0-4-6.5-11.4-6.5-11.4z"
        className="fill-miere-500"
      />
    </>
  ),
  // Upright pepper (stem, green calyx, pointed tip), roasted for zacuscă.
  conserve: (
    <>
      <path
        d="M15.5 13.5C12.1 17.5 11.5 23.9 13.5 30.5S19.5 41.7 23.9 43.5c.9.4 1.6-.2 1.6-1.1 3.6-2.6 6.6-7.4 7.8-13.4 1-5.2.6-11.1-.8-15.5z"
        className="fill-miere-500"
      />
      <path
        d="M15.5 13.5c1.6-3 4.6-4.4 8.5-4.4s6.9 1.4 8.5 4.4c-2.6 1.2-5.4 1.8-8.5 1.8s-5.9-.6-8.5-1.8z"
        className="fill-brad-500"
      />
      <path d="M24 9c0-2.4.8-4 2.6-5" />
      <path d="M18.6 19.5c-1 3.6-.8 8 .6 12.2" />
    </>
  ),
  // Wedge of cheese with holes.
  branzeturi: (
    <>
      <path d="M7.5 29.5 33.8 15.4c2.4 3 4.2 7.8 6.7 14.1z" className="fill-miere-300" />
      <path d="M7.5 29.5h33v9.2h-33z" className="fill-miere-300" />
      <circle cx="17" cy="34" r="2" />
      <circle cx="31" cy="33.2" r="2.6" />
      <circle cx="28" cy="24.6" r="1.8" />
    </>
  ),
  // Cup of mountain tea with steam and a leaf.
  ceaiuri: (
    <>
      <path d="M17.5 15.5c-1.8-2.4 1.8-3.6 0-6.4M24.5 15.5c-1.8-2.4 1.8-3.6 0-6.4" />
      <path
        d="M9.5 21.5h25v7.8c0 6.4-5.2 10.9-12.5 10.9S9.5 35.7 9.5 29.3z"
        className="fill-crema-50"
      />
      <path d="M34.5 24.5c3.8-.4 5.8 1.4 5.8 3.8s-2.1 4.2-6.2 4" />
      <path
        d="M17 31.5c2.4-5 7.6-6.2 10.6-5.6-.6 3.4-4.6 7.4-10.6 5.6z"
        className="fill-brad-500"
      />
    </>
  ),
  // Gift basket with a handle and a bow.
  'cosuri-cadou': (
    <>
      <path d="M12.5 22.5c.4-9.6 22.6-9.6 23 0" />
      <path
        d="M7.5 22.5h33l-4.2 16.8c-.3 1.3-1.4 2.2-2.7 2.2H14.4c-1.3 0-2.4-.9-2.7-2.2z"
        className="fill-miere-300"
      />
      <path d="M12 29.5h24M17.5 22.5l1.5 19M30.5 22.5l-1.5 19" />
      <path
        d="M24 13.5c-2.8-3.8-7-3-6.4-.4.5 2.2 4.4 1.8 6.4.4zm0 0c2.8-3.8 7-3 6.4-.4-.5 2.2-4.4 1.8-6.4.4z"
        className="fill-afina-500"
      />
    </>
  ),
}

interface CategoryIconProps {
  readonly slug: CategorySlug
  readonly className?: string
}

export function CategoryIcon({ slug, className = 'size-12' }: CategoryIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-brad-700 shrink-0 ${className}`}
    >
      {ICONS[slug]}
    </svg>
  )
}
