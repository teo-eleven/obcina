import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete'

type AutocompleteProps<Item> = Omit<
  BaseAutocomplete.Root.Props<Item>,
  'items' | 'filteredItems'
> & {
  /** A flat list (no groups). */
  readonly items: readonly Item[]
  /** What the list shows, when the caller filters itself. */
  readonly filteredItems?: readonly Item[]
}

/**
 * Groups the parts of an autocomplete (WAI-ARIA combobox, shadcn Autocomplete on Base UI): Base UI
 * handles the roles, the arrow keys, Enter and Escape; AutocompleteStatus announces the results.
 */
export function Autocomplete<Item>({ items, filteredItems, ...props }: AutocompleteProps<Item>) {
  return <BaseAutocomplete.Root items={items} filteredItems={filteredItems} {...props} />
}
