import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete'
import type { ComponentProps } from 'react'

/** The text field of the autocomplete; `className` replaces its look. */
export function AutocompleteInput(props: ComponentProps<typeof BaseAutocomplete.Input>) {
  return <BaseAutocomplete.Input {...props} />
}
