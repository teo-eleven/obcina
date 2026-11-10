import { defineConfig, devices } from '@playwright/test'

const PREVIEW_URL = 'http://localhost:4180'
// The Firestore emulator answers "Ok" here once it is ready (firebase.json, src/constants/firebase.ts).
const FIRESTORE_EMULATOR_URL = 'http://127.0.0.1:8080'
const isCI = Boolean(process.env.CI)

/*
 * End-to-end tests run against a production build (vite preview), not the dev server, in Chromium
 * and WebKit (Safari's engine) at desktop and phone sizes. The build is made with --mode emulators
 * and reads the catalogue from a seeded Firestore emulator under the offline demo-obcina project,
 * so no test can touch the live project (docs/adr/0006).
 */
export default defineConfig({
  // This file lives in e2e/; the servers and reports work from the repository root.
  testDir: '.',
  outputDir: '../test-results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI
    ? [['github'], ['html', { open: 'never', outputFolder: '../playwright-report' }]]
    : [['list']],
  use: {
    baseURL: PREVIEW_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'desktop-webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-webkit', use: { ...devices['iPhone 14'] } },
  ],
  // Started in order: the emulator first, because the second command seeds it before building.
  webServer: [
    {
      command: 'npx firebase emulators:start --only firestore --project demo-obcina',
      cwd: '..',
      url: FIRESTORE_EMULATOR_URL,
      // Locally an emulator you already started (npm run emulators) is fine; it gets reseeded.
      reuseExistingServer: !isCI,
      timeout: 120_000,
      // Let Java shut down cleanly, so no orphaned emulator keeps the port for the next run.
      gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
      // In CI a failed start (Java, port, download) should be readable in the log.
      stdout: isCI ? 'pipe' : 'ignore',
    },
    {
      command: 'npm run e2e:serve',
      cwd: '..',
      url: PREVIEW_URL,
      // Always build fresh: reusing a running preview could test an old dist/. A busy port fails loudly.
      reuseExistingServer: false,
      timeout: 180_000,
      stdout: isCI ? 'pipe' : 'ignore',
    },
  ],
})
