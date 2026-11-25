import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete'
import type { ComponentProps } from 'react'

/** One suggestion (role option); highlighted by the arrow keys or the pointer. */
export function AutocompleteItem({
  className = '',
  ...props
}: ComponentProps<typeof BaseAutocomplete.Item> & { readonly className?: string }) {
  return (
    <BaseAutocomplete.Item
      {...props}
      className={`data-[highlighted]:bg-in-100 flex cursor-pointer justify-between gap-4 rounded px-2 py-1.5 outline-none ${className}`}
    />
  )
}
