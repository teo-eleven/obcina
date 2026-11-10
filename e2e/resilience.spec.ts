import type { Page } from '@playwright/test'
import { expect, isNarrow, nextFrames, test } from './fixtures'

/*
 * Phase-gate battery (docs/testing/README.md §2): corrupt input, hostile input, chaos and
 * network trouble. The health fixture also fails any test that logs an error or loses a request.
 */

async function expectSinglePage(page: Page) {
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await expect(page.getByRole('banner')).toBeVisible()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow, 'no horizontal scroll').toBeLessThanOrEqual(0)
}

// A malformed percent-encoding in the *path* (e.g. /%E0%A4%A) never reaches the app: the host
// rejects it before serving index.html (vite preview answers 404 with an empty body). That is
// host behaviour, checked on Vercel at plan step 6.1. In the hash it is the app's job, tested here.
test.describe('limits and corrupt input', () => {
  for (const [label, path] of [
    ['malformed percent-encoding in the hash', '/#%E0%A4%A'],
    ['unicode and emoji in the path', '/produse/dulceață-de-afine-🍯'],
    ['a 2000-character path', `/${'a'.repeat(2000)}`],
    ['a query string the app does not use', '/?pret=-1&cantitate=999999999999'],
  ] as const) {
    test(`renders a usable page for ${label}`, async ({ page }) => {
      await page.goto(path)

      await expectSinglePage(page)
    })
  }
})

test.describe('adversarial input', () => {
  test('a script tag in the path is never executed or echoed', async ({ page }) => {
    await page.goto('/%3Cscript%3Ealert(1)%3C%2Fscript%3E')

    await expect(page.getByRole('heading', { level: 1 })).toContainText('nu e în cămară')
    await expect(page.locator('body')).not.toContainText('alert(1)')
  })

  test('markup in the hash does not inject elements or run handlers', async ({ page }) => {
    await page.goto('/#%22%3E%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E')
    await nextFrames(page)

    await expect(page.locator('img[src="x"]')).toHaveCount(0)
    await expectSinglePage(page)
  })
})

test.describe('chaos and concurrency', () => {
  test('the menu survives nine rapid toggles and ends in a consistent state', async ({ page }) => {
    test.skip(!isNarrow(page), 'the menu button exists only below 640px')
    await page.goto('/')
    const button = page.getByRole('button', { name: 'Meniu' })
    const firstLink = page.getByRole('navigation', { name: 'Principal' }).getByRole('link').first()

    for (let i = 0; i < 9; i++) await button.click({ delay: 0 })
    await nextFrames(page)

    // Odd number of toggles: open, and the visible state matches the announced one.
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await expect(firstLink).toBeVisible()
  })

  test('double-clicking navigation links lands on the right section once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/nu-exista')

    await page.getByRole('link', { name: 'Vezi categoriile' }).dblclick()

    await expect(page).toHaveURL(/\/#categorii$/)
    await expect(page.locator('#categorii')).toBeInViewport()
    await expectSinglePage(page)
  })

  test('rapid back/forward between pages keeps the layout intact', async ({ page }) => {
    await page.goto('/')
    await page.goto('/nu-exista')
    await page.goto('/')

    for (let i = 0; i < 3; i++) {
      await page.goBack()
      await page.goForward()
    }

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Gusturi de munte')
    await expectSinglePage(page)
  })
})

test.describe('network trouble', () => {
  test('a very slow network still ends in a complete, styled page', async ({ page }) => {
    await page.route('**/assets/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800))
      await route.continue()
    })

    await page.goto('/')

    await expectSinglePage(page)
    const headingFont = await page
      .getByRole('heading', { level: 1 })
      .evaluate((h1) => getComputedStyle(h1).fontFamily)
    expect(headingFont).toContain('Fraunces')
  })

  // Pages not visited yet may need fonts or lazy images that can't download offline; the app must
  // still work.
  test.describe(() => {
    // One pattern: Playwright reads a two-element array in test.use as [value, fixtureOptions].
    test.use({ allowedRequestFailures: [/\.woff2$|\/images\/.+\.webp$/] })

    test('losing the connection after load keeps in-app navigation working', async ({
      page,
      context,
    }) => {
      await page.goto('/nu-exista')
      await expectSinglePage(page)

      await context.setOffline(true)
      await page.getByRole('link', { name: 'Înapoi în cămară' }).click()

      await expect(page.getByRole('heading', { level: 1 })).toContainText('Gusturi de munte')
      await context.setOffline(false)
    })
  })
})
