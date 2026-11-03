import { expect, test } from './fixtures'

const UNKNOWN_PATH = '/produse/dulceata/inexistent'

test.describe('404 page', () => {
  test('shows the 404 heading inside the site layout', async ({ page }) => {
    await page.goto(UNKNOWN_PATH)

    await expect(page.getByRole('heading', { level: 1 })).toContainText('nu e în cămară')
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
  })

  test('has no horizontal overflow', async ({ page }) => {
    await page.goto(UNKNOWN_PATH)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
  })

  test('"Înapoi în cămară" goes to the home page', async ({ page }) => {
    await page.goto(UNKNOWN_PATH)

    await page.getByRole('link', { name: 'Înapoi în cămară' }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Gusturi de munte')
  })

  test('"Vezi categoriile" goes to /#categorii with the section in view', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(UNKNOWN_PATH)

    await page.getByRole('link', { name: 'Vezi categoriile' }).click()

    await expect(page).toHaveURL(/\/#categorii$/)
    await expect(page.locator('#categorii')).toBeInViewport()
  })
})
