// Up to three digits: a cart line holds at most MAX_LINE_QUANTITY (99), and more is capped anyway.
const WHOLE_NUMBER = /^\d{1,3}$/

/**
 * Reads what the buyer typed in a quantity field. A whole number from 1 up is the new quantity,
 * capped at `max` (the stock); anything else is null and the field goes back to its old value.
 */
export function parseQuantityInput(text: string, max: number): number | null {
  const trimmed = text.trim()
  if (!WHOLE_NUMBER.test(trimmed)) return null
  const quantity = Number(trimmed)
  return quantity < 1 ? null : Math.min(quantity, max)
}
