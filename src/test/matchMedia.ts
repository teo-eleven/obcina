import { vi } from 'vitest'

/** jsdom has no matchMedia; every query answers `matches` (false by default, as in setup.ts). */
export function stubMatchMedia(matches = false) {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches, media: query }))
}
