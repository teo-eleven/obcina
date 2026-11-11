// Romanian counting: from 20 on, a number takes "de" (20 de produse) unless its last two digits are
// 1–19 (101 produse, 119 produse).
const takesDe = (n: number): boolean => n >= 20 && (n % 100 === 0 || n % 100 >= 20)

function assertCount(n: number): void {
  if (!Number.isSafeInteger(n) || n < 0) {
    throw new RangeError(`A product count must be a whole, non-negative number, got ${n}`)
  }
}

/** The words after a number of products: 1 → "produs", 3 → "produse", 20 → "de produse". */
export function productNoun(n: number): string {
  assertCount(n)
  if (n === 1) return 'produs'
  return takesDe(n) ? 'de produse' : 'produse'
}

/** 0 → "niciun produs", 1 → "1 produs", 3 → "3 produse", 20 → "20 de produse". */
export function productCount(n: number): string {
  assertCount(n)
  return n === 0 ? 'niciun produs' : `${n} ${productNoun(n)}`
}
