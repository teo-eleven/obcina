import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete'
import type { ReactNode } from 'react'

/** The popup under the field, as wide as the field, in a portal so the header cannot clip it. */
export function AutocompleteContent({ children }: { readonly children: ReactNode }) {
  return (
    <BaseAutocomplete.Portal>
      <BaseAutocomplete.Positioner sideOffset={8} className="z-20 outline-none">
        <BaseAutocomplete.Popup className="border-in-100 bg-crema-50 text-lemn-800 max-h-[min(24rem,var(--available-height))] w-[var(--anchor-width)] overflow-y-auto rounded-md border p-2 shadow transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none">
          {children}
        </BaseAutocomplete.Popup>
      </BaseAutocomplete.Positioner>
    </BaseAutocomplete.Portal>
  )
}
