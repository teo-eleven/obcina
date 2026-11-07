import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { stubMatchMedia } from './matchMedia'

afterEach(() => {
  cleanup()
})

// jsdom lacks these browser APIs; give every test a quiet default (tests can still override them).
// Node-environment test files (e.g. image checks) have no window at all.
if (typeof window !== 'undefined') {
  stubMatchMedia()
  window.scrollTo = () => undefined
}
