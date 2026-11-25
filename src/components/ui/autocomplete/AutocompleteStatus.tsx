import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete'
import type { ReactNode } from 'react'

/** A polite live region in the popup: how many matched, or why there is nothing to show. */
export function AutocompleteStatus({ children }: { readonly children: ReactNode }) {
  return <BaseAutocomplete.Status className="sr-only">{children}</BaseAutocomplete.Status>
}
