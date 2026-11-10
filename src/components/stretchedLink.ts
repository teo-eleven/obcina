// A card whose heading link covers the whole card: one click target, one accessible name.
// The card (not just the heading text) shows the keyboard focus; the outline sits outside the
// chamfered label, whose clip-path would cut it.
export const STRETCHED_CARD =
  'has-[a:focus-visible]:outline-afina-500 relative outline-offset-4 has-[a:focus-visible]:outline-2'
export const STRETCHED_LINK = 'hover:text-afina-700 after:absolute after:inset-0'
