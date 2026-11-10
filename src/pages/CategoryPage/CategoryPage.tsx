import { useParams } from 'react-router'
import { CATEGORIES } from '../../constants'
import { NotFoundPage } from '../NotFoundPage'
import { Shelf } from './Shelf'

export function CategoryPage() {
  const slug = useParams().slug
  // The slug comes from the URL, so it is checked against the known shelves before any query runs.
  const category = CATEGORIES.find((candidate) => candidate.slug === slug)
  if (!category) return <NotFoundPage />
  return <Shelf category={category} />
}
