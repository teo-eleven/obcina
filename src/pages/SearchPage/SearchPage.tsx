import { SEARCH_MIN_LENGTH, SEARCH_PARAM, SEARCH_TEXT, pageTitle } from '../../constants'
import { useSearchParams } from 'react-router'
import { normalizeForSearch } from '../../utils'
import { SearchResults } from './SearchResults'

/** /cautare?q=…: every product whose name holds the query (the header box opens it on Enter). */
export function SearchPage() {
  const [params] = useSearchParams()
  const query = (params.get(SEARCH_PARAM) ?? '').trim()
  const length = normalizeForSearch(query).length

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <title>{pageTitle(SEARCH_TEXT.pageTitle)}</title>
      <h1 className="text-3xl font-semibold sm:text-4xl">{SEARCH_TEXT.heading}</h1>
      {length === 0 && <p className="text-lemn-600 mt-3 text-lg">{SEARCH_TEXT.emptyQuery}</p>}
      {length > 0 && length < SEARCH_MIN_LENGTH && (
        <p className="text-lemn-600 mt-3 text-lg">{SEARCH_TEXT.tooShort}</p>
      )}
      {length >= SEARCH_MIN_LENGTH && (
        <>
          <p className="text-lemn-600 mt-3 text-lg">{SEARCH_TEXT.resultsFor(query)}</p>
          <SearchResults query={query} />
        </>
      )}
    </div>
  )
}
