import { NBSP } from '../constants'

// Money is always an integer number of bani (1999 = 19,99 lei); this is the only place it becomes text.
const LEI = new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const BANI_PER_LEU = 100

/** Throws unless `amount` is a whole, non-negative, exactly representable number of bani. */
export function assertBani(amount: number, what: string): void {
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new RangeError(`${what} must be a whole, non-negative number of bani, got ${amount}`)
  }
}

/** 1999 → "19,99 lei", with a no-break space so the amount never wraps away from "lei". */
export function formatPrice(bani: number): string {
  assertBani(bani, 'A price')
  return `${LEI.format(bani / BANI_PER_LEU)}${NBSP}lei`
}
