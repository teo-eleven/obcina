import { defineConfig, devices } from '@playwright/test'

const PREVIEW_URL = 'http://localhost:4180'
const isCI = Boolean(process.env.CI)

/*
 * End-to-end tests run against the production build (vite preview), not the dev server,
 * in Chromium and WebKit (Safari's engine) at desktop and phone sizes.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list']],
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
  webServer: {
    command: 'npm run build-and-preview',
    url: PREVIEW_URL,
    // Always build fresh: reusing a running preview could test an old dist/. A busy port fails loudly.
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
