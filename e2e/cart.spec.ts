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

/*
 * The whole cart journey in a real browser: real links, the lazy drawer and page, and above all
 * the reload, which only a browser's localStorage can show. Unit tests cover each piece on its own.
 */
test.describe('a reload', () => {
  // Reloading tears down Firestore's open Listen channel; WebKit reports that teardown as an
  // uncaught "access control" error. Only that message is allowed (see catalog.spec.ts).
  test.use({ allowedPageErrors: [/Firestore\/Listen\/channel.*due to access control checks/] })

  test('adds, changes and removes products, and keeps the cart across a reload', async ({
    page,
  }) => {
    await page.goto('/categorie/miere')
    const shelf = page.getByRole('list', { name: 'Produse' })
    const cardOf = (name: string) =>
      shelf.getByRole('listitem').filter({ has: page.getByRole('link', { name, exact: true }) })
    const cartButton = page.getByRole('button', { name: /^Coș \d/ })

    // Add: two jars of linden honey and one of fir honeydew.
    await cardOf('Miere de tei').getByRole('button', { name: 'Adaugă în coș' }).click()
    await cardOf('Miere de tei').getByRole('button', { name: 'Adaugă în coș' }).click()
    await cardOf('Miere de mană de brad').getByRole('button', { name: 'Adaugă în coș' }).click()
    await expect(cartButton).toHaveAccessibleName('Coș 3 produse')

    // From the drawer to the cart page.
    await cartButton.click()
    await page
      .getByRole('dialog', { name: 'Coșul tău' })
      .getByRole('link', { name: 'Vezi coșul' })
      .click()
    await expect(page).toHaveURL(/\/cos$/)
    const lines = page.getByRole('list', { name: 'Produse în coș' })
    const lineOf = (name: string) =>
      lines.getByRole('listitem').filter({ has: page.getByRole('link', { name, exact: true }) })

    // Change: + on the linden honey, then type 4 for the fir honeydew.
    await lineOf('Miere de tei')
      .getByRole('button', { name: 'Crește cantitatea pentru Miere de tei' })
      .click()
    const firField = lineOf('Miere de mană de brad').getByRole('textbox', {
      name: 'Cantitate pentru Miere de mană de brad',
    })
    await firField.fill('4')
    await firField.press('Enter')
    await expect(cartButton).toHaveAccessibleName('Coș 7 produse')

    // Remove the linden honey.
    await lineOf('Miere de tei')
      .getByRole('button', { name: 'Scoate Miere de tei din coș' })
      .click()
    await expect(lineOf('Miere de tei')).toHaveCount(0)
    await expect(cartButton).toHaveAccessibleName('Coș 4 produse')

    // Reload: the cart comes back from the browser's storage, exactly as it was left.
    await page.reload()
    await expect(lineOf('Miere de mană de brad').getByRole('textbox')).toHaveValue('4')
    await expect(lineOf('Miere de tei')).toHaveCount(0)
    await expect(cartButton).toHaveAccessibleName('Coș 4 produse')
  })
})
