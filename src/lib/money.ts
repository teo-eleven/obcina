// Money is always an integer number of bani (1999 = 19,99 lei); this is the only place it becomes text.
const LEI = new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const BANI_PER_LEU = 100
// Written as an escape: a typed U+00A0 is invisible and easy to lose to an editor.
export const NBSP = '\u00a0'

/** 1999 → "19,99 lei", with a no-break space so the amount never wraps away from "lei". */
export function formatPrice(bani: number): string {
  if (!Number.isSafeInteger(bani) || bani < 0) {
    throw new RangeError(`A price must be a whole, non-negative number of bani, got ${bani}`)
  }
  return `${LEI.format(bani / BANI_PER_LEU)}${NBSP}lei`
}
