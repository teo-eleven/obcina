import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Firestore security-rules tests. They need the Firestore emulator, so they are kept out of
// `npm test` and run by `npm run test:rules`, which starts the emulator around them.
export default defineConfig({
  // Paths below are relative to the repository root, not to this folder.
  root: fileURLToPath(new URL('..', import.meta.url)),
  test: {
    include: ['firebase/**/*.test.ts'],
    environment: 'node',
    // Each test talks to the emulator over HTTP; the first call also loads the rules.
    testTimeout: 15_000,
    // Starting the test environment and seeding happen in beforeAll.
    hookTimeout: 30_000,
    // One emulator, shared state: run files one after another.
    fileParallelism: false,
  },
})
