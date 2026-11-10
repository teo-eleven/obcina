import { EMULATOR_HOST, FIRESTORE_EMULATOR_PORT } from '../src/lib/firebaseConfig'
import { expect, test } from './fixtures'

/*
 * Phase-gate battery for the catalogue (docs/testing/README.md §2): network trouble, hostile URLs
 * and impatient clicks, on the real Firestore emulator. One page load per test (see catalog.spec).
 */

const FIRESTORE = `http://${EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT}/**`

test.describe('network trouble', () => {
  // One pattern each: Playwright reads a two-element array in test.use as [value, fixtureOptions].
  test.use({
    allowedRequestFailures: [/127\.0\.0\.1:8080/],
    // Our own log line, and the Firestore SDK's own warning about the backend it can't reach.
    allowedConsoleErrors: [/Could not load the miere shelf|@firebase\/firestore|127\.0\.0\.1:8080/],
  })

  test('shows the error state when Firestore is unreachable, and recovers on retry', async ({
    page,
  }) => {
    await page.route(FIRESTORE, (route) => route.abort('connectionrefused'))
    await page.goto('/categorie/miere')

    // Before 2.7's fix, an offline client got an empty shelf here instead of an error.
    await expect(page.getByRole('alert')).toContainText('Nu am putut încărca produsele.')
    await expect(page.getByText('Raftul ăsta e gol deocamdată.')).toHaveCount(0)

    await page.unroute(FIRESTORE)
    await page.getByRole('button', { name: 'Încearcă din nou' }).click()

    await expect(page.getByRole('list', { name: 'Produse' }).getByRole('listitem')).toHaveCount(3)
  })
})

test('shows the loading state on a slow connection, then the shelf', async ({ page }) => {
  // Firestore answers only once the loading state has been seen, however slow the machine is.
  let answer: () => void = () => undefined
  const loadingSeen = new Promise<void>((resolve) => {
    answer = resolve
  })
  await page.route(FIRESTORE, async (route) => {
    await loadingSeen
    await route.continue()
  })

  await page.goto('/categorie/ceaiuri')

  await expect(page.getByRole('status')).toHaveText('Se încarcă produsele…')
  answer()
  await expect(page.getByRole('list', { name: 'Produse' }).getByRole('listitem')).toHaveCount(3)
})

test.describe('hostile URLs', () => {
  for (const [label, path] of [
    ['product slug', '/produs/%3Cscript%3Ealert(1)%3C%2Fscript%3E'],
    ['category slug', '/categorie/%22%3E%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E'],
  ] as const) {
    test(`markup in a ${label} shows the not-found page and runs nothing`, async ({ page }) => {
      await page.goto(path)

      await expect(
        page.getByRole('heading', { level: 1, name: 'Borcanul ăsta nu e în cămară' }),
      ).toBeVisible()
      await expect(page.locator('img[src="x"]')).toHaveCount(0)
      await expect(page.locator('body')).not.toContainText('alert(1)')
    })
  }
})

test('double-clicking a product on its shelf opens it once', async ({ page }, testInfo) => {
  // Issue #5: about 1 run in 30-60, only here, a synthetic double-click still leaves one extra
  // history entry; it vanishes as soon as the page is instrumented. Kept visible, not deleted.
  test.fixme(testInfo.project.name === 'mobile-webkit', 'Issue #5: rare extra history entry')
  await page.goto('/categorie/miere')
  const historyBefore = await page.evaluate(() => history.length)

  await page
    .getByRole('list', { name: 'Produse' })
    .getByRole('link', { name: 'Miere de tei', exact: true })
    .dblclick()

  await expect(page).toHaveURL(/\/produs\/miere-de-tei$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Miere de tei', exact: true }),
  ).toBeVisible()
  // react-router replaces a navigation to the location it is already going to: one history entry.
  expect(await page.evaluate(() => history.length)).toBeLessThanOrEqual(historyBefore + 1)
})
