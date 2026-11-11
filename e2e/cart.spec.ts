import { expect, test } from './fixtures'

/*
 * Needs a real browser: the card's link is stretched over the whole card (an ::after overlay), so
 * only real hit testing shows that the button, lifted with `relative z-10`, gets the click and the
 * link does not. Everything else about the button is unit-tested.
 */

test('adds from a shelf card without following the stretched link', async ({ page }) => {
  await page.goto('/categorie/miere')
  const card = page
    .getByRole('list', { name: 'Produse' })
    .getByRole('listitem')
    .filter({ has: page.getByRole('link', { name: 'Miere de tei', exact: true }) })

  await card.getByRole('button', { name: 'Adaugă în coș' }).click()

  await expect(card.getByRole('status')).toHaveText('În coș: 1 buc.')
  await expect(page).toHaveURL(/\/categorie\/miere$/)
})

// Only a real browser drops focus from a button that becomes `disabled`; this one must keep it.
test('keeps keyboard focus on the button after adding the last unit in stock', async ({ page }) => {
  await page.goto('/categorie/dulceturi')
  const card = page
    .getByRole('list', { name: 'Produse' })
    .getByRole('listitem')
    .filter({ has: page.getByRole('link', { name: 'Dulceață de cătină', exact: true }) })
  const button = card.getByRole('button', { name: 'Adaugă în coș' })

  await button.focus()
  for (let i = 0; i < 3; i += 1) await page.keyboard.press('Enter')

  await expect(card.getByRole('status')).toHaveText('Ai în coș tot stocul: 3 buc.')
  await expect(button).toBeFocused()
  await expect(button).toHaveAttribute('aria-disabled', 'true')
})

// Needs a real browser: the drawer is a lazy chunk, and only a browser shows where focus goes.
test('opens the cart drawer from the keyboard and returns focus to the button on Escape', async ({
  page,
}) => {
  await page.goto('/')
  const cartButton = page.getByRole('button', { name: /^Coș \d/ })

  await cartButton.focus()
  await page.keyboard.press('Enter')

  const drawer = page.getByRole('dialog', { name: 'Coșul tău' })
  await expect(drawer).toBeVisible()
  await expect
    .poll(() => drawer.evaluate((element) => element.contains(document.activeElement)))
    .toBe(true)

  await page.keyboard.press('Escape')

  await expect(drawer).toBeHidden()
  await expect(cartButton).toBeFocused()
})
