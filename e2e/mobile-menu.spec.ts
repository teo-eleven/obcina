import type { Page } from '@playwright/test'
import { expect, isNarrow, nextFrames, tabKey, test } from './fixtures'

const MIN_TOUCH_TARGET = 44

/*
 * Only what needs a real browser lives here: real focus, CSS visibility, scrolling, WebKit's
 * Tab and click-focus behaviour, and touch-target sizes. Pure open/close state transitions
 * (Space, outside click, page change) are covered by src/components/MainNav.test.tsx.
 */
test.beforeEach(({ page }) => {
  test.skip(!isNarrow(page), 'the menu button exists only below 640px')
})

function menu(page: Page) {
  const nav = page.getByRole('navigation', { name: 'Principal' })
  return {
    button: nav.getByRole('button', { name: 'Meniu' }),
    categorii: nav.getByRole('link', { name: 'Categorii' }),
    povestea: nav.getByRole('link', { name: 'Povestea' }),
  }
}

async function openWithKeyboard(page: Page) {
  const { button } = menu(page)
  await button.focus()
  await page.keyboard.press('Enter')
  await expect(button).toHaveAttribute('aria-expanded', 'true')
}

test.describe('mobile menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
  })

  test('starts collapsed with the links hidden', async ({ page }) => {
    const { button, categorii, povestea } = menu(page)

    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(categorii).toBeHidden()
    await expect(povestea).toBeHidden()
  })

  test('opens with Enter, shows the links and focuses the first one', async ({ page }) => {
    const { button, categorii, povestea } = menu(page)

    await button.focus()
    await page.keyboard.press('Enter')

    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await expect(categorii).toBeVisible()
    await expect(povestea).toBeVisible()
    await expect(categorii).toBeFocused()
  })

  test('Escape closes the menu and returns focus to the button', async ({ page }) => {
    const { button, categorii } = menu(page)
    await openWithKeyboard(page)

    await page.keyboard.press('Escape')

    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(categorii).toBeHidden()
    await expect(button).toBeFocused()
  })

  test('tabbing out of the last link closes the menu', async ({ page, browserName }) => {
    const { button, povestea } = menu(page)
    await openWithKeyboard(page)
    await page.keyboard.press(tabKey(browserName))
    await expect(povestea).toBeFocused()

    await page.keyboard.press(tabKey(browserName))

    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(povestea).toBeHidden()
  })

  test('choosing a link closes the menu and scrolls to the section', async ({ page }) => {
    const { button, povestea } = menu(page)
    await button.click()
    await expect(povestea).toBeVisible()

    await povestea.click()

    await expect(page).toHaveURL(/#povestea$/)
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('#povestea')).toBeInViewport()
  })

  test('regression: clicking the button again with the mouse closes the menu and keeps it closed', async ({
    page,
  }) => {
    const { button, categorii } = menu(page)
    await button.click()
    await expect(button).toHaveAttribute('aria-expanded', 'true')

    await button.click()
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    // The old Safari bug reopened the menu in a follow-up render; give it the frames to try.
    await nextFrames(page)

    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(categorii).toBeHidden()
  })

  test('button is at least 44x44 and links are at least 44px tall', async ({ page }) => {
    const { button, categorii, povestea } = menu(page)
    await button.click()
    await expect(categorii).toBeVisible()

    const boxes = {
      button: await button.boundingBox(),
      categorii: await categorii.boundingBox(),
      povestea: await povestea.boundingBox(),
    }

    for (const [name, box] of Object.entries(boxes)) {
      expect(box, `${name} must be rendered`).not.toBeNull()
      expect(box!.height, `${name} height`).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET)
    }
    expect(boxes.button!.width, 'button width').toBeGreaterThanOrEqual(MIN_TOUCH_TARGET)
  })
})
