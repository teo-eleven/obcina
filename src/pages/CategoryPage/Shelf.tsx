import { CATEGORIES } from '../../constants'
import { ShelfContents } from './ShelfContents'

type ShelfCategory = (typeof CATEGORIES)[number]

export function Shelf({ category }: { category: ShelfCategory }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <title>{`${category.name} — Obcina`}</title>
      <h1 className="text-3xl font-semibold sm:text-4xl">{category.name}</h1>
      <p className="text-lemn-600 mt-3 text-lg">{category.description}</p>
      <ShelfContents slug={category.slug} />
    </div>
  )
}
