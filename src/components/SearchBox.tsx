import { SEARCH_INPUT, SEARCH_MIN_LENGTH, SEARCH_TEXT } from '../constants'
import { useId, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useSearchCatalogue } from '../hooks'
import type { Product } from '../types'
import { normalizeForSearch, searchPath } from '../utils'
import { MagnifierIcon } from './illustrations'
import type { SearchAutocomplete as SearchAutocompleteComponent } from './SearchAutocomplete'

// Base UI's autocomplete is ~60 KB gzip, too much for every first page load: a plain field shows
// first and the autocomplete downloads when the visitor heads for it (PLAN 4.1, chosen by Teodor).
const loadAutocomplete = () =>
  import('./SearchAutocomplete').then((module) => module.SearchAutocomplete)

/**
 * The search in the header. Enter opens the results page; once the autocomplete has loaded, it
 * also suggests products while typing. The typed text lives here, so it survives the swap.
 */
export function SearchBox() {
  const navigate = useNavigate()
  const { catalogue, load } = useSearchCatalogue()
  const [query, setQuery] = useState('')
  const [loaded, setLoaded] = useState<{
    Autocomplete: typeof SearchAutocompleteComponent
    takesFocus: boolean
  } | null>(null)
  const plainInput = useRef<HTMLInputElement>(null)
  const inputId = useId()

  function prepare() {
    load()
    if (loaded) return
    // A failed download keeps the plain field, which still searches on Enter; the next focus retries.
    loadAutocomplete().then(
      (Autocomplete) =>
        // Checked at the swap itself: focus moves over only if the plain field holds it right now.
        setLoaded({ Autocomplete, takesFocus: document.activeElement === plainInput.current }),
      () => undefined,
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (normalizeForSearch(query).length < SEARCH_MIN_LENGTH) return
    void navigate(searchPath(query))
  }

  function openProduct(product: Product) {
    setQuery('')
    void navigate(`/produs/${product.slug}`)
  }

  return (
    <search>
      <form onSubmit={handleSubmit} className="relative w-full">
        <label htmlFor={inputId} className="sr-only">
          {SEARCH_TEXT.label}
        </label>
        {loaded ? (
          <loaded.Autocomplete
            inputId={inputId}
            query={query}
            onQueryChange={setQuery}
            catalogue={catalogue}
            onChoose={openProduct}
            takesFocus={loaded.takesFocus}
          />
        ) : (
          <input
            ref={plainInput}
            id={inputId}
            type="search"
            autoComplete="off"
            value={query}
            placeholder={SEARCH_TEXT.placeholder}
            onChange={(event) => setQuery(event.target.value)}
            onPointerEnter={prepare}
            onFocus={prepare}
            className={SEARCH_INPUT}
          />
        )}
        {/* Also what makes Enter submit: Base UI adds a hidden field, and a form with two fields and no
          submit button is not submitted by Enter. */}
        <button
          type="submit"
          aria-label={SEARCH_TEXT.submit}
          className="text-brad-700 hover:text-afina-700 absolute inset-y-0 right-1 flex items-center rounded-full px-2.5"
        >
          <MagnifierIcon />
        </button>
      </form>
    </search>
  )
}
