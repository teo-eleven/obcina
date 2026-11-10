import { SLUG_MAX_LENGTH, SLUG_MIN_LENGTH, SLUG_PATTERN } from '../constants'

/** A product id is its slug: lowercase kebab-case within the slug length limits. */
export const isProductId = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length >= SLUG_MIN_LENGTH &&
  value.length <= SLUG_MAX_LENGTH &&
  SLUG_PATTERN.test(value)
