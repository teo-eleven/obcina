import type { Page } from '@playwright/test'
import { SEED_PRODUCTS } from '../src/data/seedProducts'
import { formatPrice } from '../src/lib/money'
import { EMULATOR_HOST, FIRESTORE_EMULATOR_PORT } from '../src/lib/firebaseConfig'
import { expect, test } from './fixtures'

/*
 * The catalogue journey against the seeded Firestore emulator (playwright.config.ts). Only what
 * needs a real browser lives here: real link navigation and real network traffic. The page states
 * themselves are unit-tested.
 *
 * One page load per test: a second page.goto would tear down Firestore's open listen channel, and
 * WebKit reports that teardown as an access-control error.
 */

const NOT_FOUND_TITLE = 'Pagină negăsită — Obcina'
const NOT_FOUND_HEADING = 'Borcanul ăsta nu e în cămară'
const EMULATOR_ORIGIN = `http://${EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT}/`

const lindenHoney = SEED_PRODUCTS.find((product) => product.slug === 'miere-de-tei')

/** Records the app's calls to the Firestore emulator (XHR/fetch only, nothing else). */
function recordFirestoreCalls(page: Page): string[] {
  const calls: string[] = []
  page.on('request', (request) => {
    const isCall = ['xhr', 'fetch'].includes(request.resourceType())
    if (isCall && request.url().startsWith(EMULATOR_ORIGIN)) calls.push(request.url())
  })
  return calls
}

test('walks from the home page to a shelf and a product through real links', async ({ page }) => {
  await page.goto('/')

  await page
    .getByRole('list', { name: 'Categorii' })
    .getByRole('link', { name: 'Miere', exact: true })
    .click()

  await expect(page).toHaveURL(/\/categorie\/miere$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Miere', exact: true })).toBeVisible()
  const shelf = page.getByRole('list', { name: 'Produse' })
  await expect(shelf.getByRole('listitem')).toHaveCount(3)

  await shelf.getByRole('link', { name: 'Miere de tei', exact: true }).click()

  await expect(page).toHaveURL(/\/produs\/miere-de-tei$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Miere de tei', exact: true }),
  ).toBeVisible()
  // The price comes from Firestore; the stamp uppercases it with CSS, so compare its text content.
  await expect(
    page.locator('[data-stamp]').filter({ hasText: formatPrice(lindenHoney?.priceBani ?? 0) }),
  ).toBeVisible()
  await expect(page.getByRole('list', { name: 'Ingrediente' })).toBeVisible()

  await page.getByRole('link', { name: 'Înapoi la Miere', exact: true }).click()

  await expect(page).toHaveURL(/\/categorie\/miere$/)
})

test('looks up a well-formed but unknown product, then shows the not-found page', async ({
  page,
}) => {
  const calls = recordFirestoreCalls(page)

  await page.goto('/produs/nu-exista')

  await expect(page.getByRole('heading', { level: 1, name: NOT_FOUND_HEADING })).toBeVisible()
  await expect(page).toHaveTitle(NOT_FOUND_TITLE)
  // Also proves the recorder sees Firestore traffic, so the next test's "none" means something.
  expect(calls.length).toBeGreaterThan(0)
})

test('shows the not-found page for a malformed slug without asking Firestore', async ({ page }) => {
  const calls = recordFirestoreCalls(page)

  await page.goto('/produs/Nu%20Exista')

  await expect(page.getByRole('heading', { level: 1, name: NOT_FOUND_HEADING })).toBeVisible()
  await expect(page).toHaveTitle(NOT_FOUND_TITLE)
  // Let anything late go out before concluding nothing did.
  await page.waitForLoadState('networkidle')
  expect(calls).toEqual([])
})

test('opens a gift basket from its shelf and follows a link to one of its products', async ({
  page,
}) => {
  await page.goto('/categorie/cosuri-cadou')
  await page
    .getByRole('list', { name: 'Produse' })
    .getByRole('link', { name: 'Coș „Mic dejun la stână”', exact: true })
    .click()

  await expect(page).toHaveURL(/\/produs\/cos-mic-dejun-la-stana$/)
  const first = page.getByRole('list', { name: 'Ce conține' }).getByRole('link').first()
  await expect(first).toHaveText(/\S/)
  const name = await first.innerText()

  await first.click()

  await expect(page).toHaveURL(/\/produs\/(?!cos-)[a-z0-9-]+$/)
  await expect(page.getByRole('heading', { level: 1, name, exact: true })).toBeVisible()
})
