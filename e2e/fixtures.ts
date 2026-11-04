import { test as base, expect, type Page, type PlaywrightWorkerOptions } from '@playwright/test'

type BrowserName = PlaywrightWorkerOptions['browserName']

const ASSET_TYPES = new Set(['image', 'font', 'stylesheet', 'script', 'media'])

/*
 * Every spec also asserts a healthy page: an automatic fixture records console errors,
 * uncaught page errors, failed requests, same-origin 4xx/5xx responses, and assets that came
 * back as HTML. That last one is how a missing file shows up here: `vite preview` (like most
 * SPA hosts) answers any unknown path with index.html and status 200, so a missing image or
 * font never produces a 404. The fixture fails the test at teardown if anything was seen.
 */
interface HealthOptions {
  /** Request URLs allowed to fail, for tests that cut the network on purpose. */
  allowedRequestFailures: RegExp[]
}

export const test = base.extend<HealthOptions & { healthyPage: void }>({
  allowedRequestFailures: [[], { option: true }],
  healthyPage: [
    async ({ page, baseURL, allowedRequestFailures }, use) => {
      const problems: string[] = []
      const origin = baseURL ? new URL(baseURL).origin : null

      const isAllowedFailure = (url: string) =>
        allowedRequestFailures.some((pattern) => pattern.test(url))

      page.on('console', (message) => {
        if (message.type() !== 'error') return
        // Browsers also log a failed resource load to the console; honour the same allow-list.
        if (isAllowedFailure(message.location().url)) return
        problems.push(`console.error: ${message.text()}`)
      })
      page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))
      page.on('response', (response) => {
        const url = new URL(response.url())
        if (url.origin !== origin) return
        if (response.status() >= 400) {
          problems.push(`HTTP ${response.status()}: ${url.pathname}`)
          return
        }
        const isAsset = ASSET_TYPES.has(response.request().resourceType())
        const contentType = response.headers()['content-type'] ?? ''
        if (isAsset && contentType.startsWith('text/html')) {
          problems.push(`asset served as HTML (missing file?): ${url.pathname}`)
        }
      })
      page.on('requestfailed', (request) => {
        const reason = request.failure()?.errorText ?? 'unknown'
        // Aborts are normal when a test navigates away while something is still loading.
        if (isAllowedFailure(request.url())) return
        if (!/abort|cancel/i.test(reason))
          problems.push(`request failed: ${request.url()} (${reason})`)
      })

      await use()

      expect(problems, 'the page must load cleanly: no console errors or failed requests').toEqual(
        [],
      )
    },
    { auto: true },
  ],
})

export { expect }

/* Tailwind's `sm` breakpoint (40rem = 640px): below it the nav collapses behind "Meniu". */
export const DESKTOP_MIN_WIDTH = 640

export function viewportWidth(page: Page): number {
  const viewport = page.viewportSize()
  if (!viewport) throw new Error('Every Playwright project must set a viewport')
  return viewport.width
}

export const isNarrow = (page: Page): boolean => viewportWidth(page) < DESKTOP_MIN_WIDTH

/*
 * Safari's default is that Tab skips links (only Option+Tab reaches every control), and
 * Playwright's WebKit build on macOS inherits that. Elsewhere, including Linux CI, plain Tab
 * visits links.
 */
export function tabKey(browserName: BrowserName): string {
  return browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab'
}

/* Waits two animation frames: long enough for any follow-up render (e.g. a stray reopen). */
export async function nextFrames(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  )
}
