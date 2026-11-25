import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete'
import type { ComponentProps } from 'react'

/** The list of suggestions (role listbox). */
export function AutocompleteList(props: ComponentProps<typeof BaseAutocomplete.List>) {
  return <BaseAutocomplete.List {...props} />
}
