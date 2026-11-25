import {
  SEARCH_INPUT,
  SEARCH_MAX_LENGTH,
  SEARCH_MIN_LENGTH,
  SEARCH_SUGGESTION_LIMIT,
  SEARCH_TEXT,
} from '../constants'
import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import type { SearchCatalogue } from '../hooks'
import type { Product } from '../types'
import { formatPrice, normalizeForSearch, productCount, searchPath, searchProducts } from '../utils'
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteStatus,
} from './ui'

interface SearchAutocompleteProps {
  readonly inputId: string
  readonly query: string
  readonly onQueryChange: (query: string) => void
  readonly catalogue: SearchCatalogue
  readonly onChoose: (product: Product) => void
  /** Starts (or, after a failure, retries) reading the catalogue. */
  readonly onFocus: () => void
  /** True when it replaces the plain field while that one has focus: focus moves over, caret at the end. */
  readonly takesFocus: boolean
}

/**
 * The header search once Base UI has downloaded (SearchBox shows a plain field until then): while
 * typing, the list keeps only the products whose name holds what was typed.
 */
export function SearchAutocomplete({
  inputId,
  query,
  onQueryChange,
  catalogue,
  onChoose,
  onFocus,
  takesFocus,
}: SearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(takesFocus)
  const input = useRef<HTMLInputElement>(null)
  const products = catalogue.status === 'ready' ? catalogue.products : []
  const matches = searchProducts(products, query).slice(0, SEARCH_SUGGESTION_LIMIT)
  const hasQuery = normalizeForSearch(query).length >= SEARCH_MIN_LENGTH
  const message =
    catalogue.status === 'error'
      ? SEARCH_TEXT.loadError
      : catalogue.status !== 'ready'
        ? SEARCH_TEXT.loading
        : matches.length === 0
          ? SEARCH_TEXT.noMatches(query.trim())
          : productCount(matches.length)

  // Read once: focus moves over only when this first replaces the plain field.
  const [shouldTakeFocus] = useState(takesFocus)
  // Layout effect: focus moves in the same commit that removes the plain field, so no key is lost.
  useLayoutEffect(() => {
    if (!shouldTakeFocus || !input.current) return
    const end = input.current.value.length
    input.current.focus()
    input.current.setSelectionRange(end, end)
  }, [shouldTakeFocus])

  return (
    <Autocomplete
      items={products}
      filteredItems={matches}
      itemToStringValue={(product: Product) => product.name}
      value={query}
      onValueChange={(value, details) => {
        // Choosing a suggestion opens its page (the item's onClick; Enter clicks the highlighted
        // one), so it must not also fill in the field with the product's name.
        if (details.reason !== 'item-press') onQueryChange(value)
      }}
      open={isOpen && hasQuery}
      onOpenChange={setIsOpen}
    >
      <AutocompleteInput
        ref={input}
        id={inputId}
        type="search"
        maxLength={SEARCH_MAX_LENGTH}
        onFocus={onFocus}
        placeholder={SEARCH_TEXT.placeholder}
        className={SEARCH_INPUT}
      />
      <AutocompleteContent>
        <AutocompleteStatus>{message}</AutocompleteStatus>
        {matches.length === 0 && (
          // Announced by the status above; hidden here so it is not read twice.
          <p aria-hidden="true" className="text-lemn-600 p-2 text-sm">
            {message}
          </p>
        )}
        <AutocompleteList aria-label={SEARCH_TEXT.suggestions}>
          {(product: Product) => (
            <AutocompleteItem key={product.slug} value={product} onClick={() => onChoose(product)}>
              <span className="font-semibold">{product.name}</span>{' '}
              <span className="text-lemn-600 text-sm">{formatPrice(product.priceBani)}</span>
            </AutocompleteItem>
          )}
        </AutocompleteList>
        {matches.length > 0 && (
          <Link
            to={searchPath(query)}
            onClick={() => setIsOpen(false)}
            className="text-brad-700 mt-1 block px-2 py-1.5 text-sm font-semibold underline"
          >
            {SEARCH_TEXT.seeAll(query.trim())}
          </Link>
        )}
      </AutocompleteContent>
    </Autocomplete>
  )
}
