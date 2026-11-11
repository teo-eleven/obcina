// A card whose heading link covers the whole card: one click target, one accessible name.
// The card (not just the heading text) shows the keyboard focus; the outline sits outside the
// chamfered label, whose clip-path would cut it.
export const STRETCHED_CARD =
  'has-[a:focus-visible]:outline-afina-500 relative outline-offset-4 has-[a:focus-visible]:outline-2'
export const STRETCHED_LINK = 'hover:text-afina-700 after:absolute after:inset-0'

// The main call to action on error and empty states.
export const PRIMARY_BUTTON =
  'bg-brad-700 text-crema-50 hover:bg-afina-700 rounded-full px-6 py-3 font-semibold transition'

// A primary button that can't be used right now: `disabled` (sold out) or `aria-disabled` (stock
// already in the cart, kept focusable). Solid colours, so the label keeps its contrast.
export const DISABLED_BUTTON =
  'disabled:bg-lemn-600 disabled:cursor-not-allowed disabled:hover:bg-lemn-600 aria-disabled:bg-lemn-600 aria-disabled:cursor-not-allowed aria-disabled:hover:bg-lemn-600'
