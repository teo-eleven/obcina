import { expect, test } from './fixtures'

/*
 * Needs a real browser: the header shows a plain field first and swaps in the Base UI autocomplete
 * once it downloads. Only real focus and key events show that nothing typed during the swap is lost
 * and that focus stays in the field. Matching and the keyboard flow are unit-tested.
 */

test('keeps typing and focus across the swap to the autocomplete', async ({ page }) => {
  await page.goto('/')
  const field = page.getByRole('search').getByLabel('Caută în cămară')

  await field.focus()
  await page.keyboard.type('dulceata', { delay: 30 })

  const box = page.getByRole('combobox', { name: 'Caută în cămară' })
  await expect(box).toHaveValue('dulceata')
  await expect(box).toBeFocused()
  await expect(page.getByRole('option', { name: /Dulceață de afine/ })).toBeVisible()
})

test('opens a suggestion with the keyboard, and the results page with Enter', async ({ page }) => {
  await page.goto('/')
  const field = page.getByRole('search').getByLabel('Caută în cămară')
  await field.focus()
  const box = page.getByRole('combobox', { name: 'Caută în cămară' })
  await expect(box).toBeFocused()

  await box.fill('dulceata de afine')
  await expect(page.getByRole('option', { name: /Dulceață de afine/ })).toBeVisible()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/produs\/dulceata-de-afine$/)

  await box.fill('dulceata')
  await expect(page.getByRole('option').first()).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/cautare\?q=dulceata$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Căutare')
  await expect(
    page.getByRole('list', { name: 'Produse' }).getByRole('link', { name: 'Dulceață de afine' }),
  ).toBeVisible()
})
