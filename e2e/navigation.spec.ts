import { expect, isNarrow, tabKey, test } from './fixtures'

test.describe('home page', () => {
  test('loads with one h1 and the expected title', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle('Obcina — cămară de munte din Bucovina')
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  })

  test('has no horizontal overflow', async ({ page }) => {
    await page.goto('/')

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
  })

  test('skip link is the first Tab stop and jumps to the main content', async ({
    page,
    browserName,
  }) => {
    await page.goto('/')
    const skipLink = page.getByRole('link', { name: 'Sari la conținut' })

    await page.keyboard.press(tabKey(browserName))

    await expect(skipLink).toBeFocused()
    await expect(skipLink).toBeVisible()

    await page.keyboard.press('Enter')

    await expect(page).toHaveURL(/#continut$/)
    await expect(page.locator('main#continut')).toBeInViewport()
    // Focus really moves into the content, so the next Tab reaches the first control in it.
    await expect(page.locator('main#continut')).toBeFocused()
    await page.keyboard.press(tabKey(browserName))
    await expect(page.getByRole('link', { name: 'Vezi ce avem în cămară' })).toBeFocused()
  })
})

test.describe('section navigation', () => {
  test.beforeEach(({ page }) => {
    test.skip(isNarrow(page), 'inline links exist only from 640px; see mobile-menu.spec.ts')
  })

  for (const [label, hash] of [
    ['Categorii', 'categorii'],
    ['Povestea', 'povestea'],
  ] as const) {
    test(`clicking "${label}" updates the hash and scrolls the section into view`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto('/')
      const section = page.locator(`#${hash}`)

      await page
        .getByRole('navigation', { name: 'Principal' })
        .getByRole('link', { name: label })
        .click()

      await expect(page).toHaveURL(new RegExp(`/#${hash}$`))
      await expect(section).toBeInViewport()
    })
  }
})

// The only test that keeps the default motion: the jump to a section is smooth (useScrollOnNavigation).
test('a section link from another page scrolls smoothly to that section', async ({ page }) => {
  await page.goto('/nu-exista')

  await page.getByRole('link', { name: 'Vezi categoriile' }).click()

  await expect(page).toHaveURL(/\/#categorii$/)
  await expect(page.locator('#categorii')).toBeInViewport()
})

test('deep link to /#povestea lands with that section in view', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })

  await page.goto('/#povestea')

  await expect(page.locator('#povestea')).toBeInViewport()
})

test('the logo link returns to the home page from another page', async ({ page }) => {
  await page.goto('/pagina-inexistenta')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('nu e în cămară')

  await page.getByRole('banner').getByRole('link', { name: 'Obcina' }).click()

  await expect(page).toHaveURL(/\/$/)
  await expect(page).toHaveTitle('Obcina — cămară de munte din Bucovina')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Gusturi de munte')
})

test.describe('keyboard focus', () => {
  // afina-500, the brand focus colour (src/index.css). A transition on the control must not
  // fade the ring in from the text colour: the ring has to be there the moment focus lands.
  const FOCUS_RING = 'rgb(138, 63, 110)'

  for (const path of ['/', '/nu-exista']) {
    test(`every control on ${path} shows the brand focus ring immediately`, async ({
      page,
      browserName,
    }) => {
      await page.goto(path)
      const controls = page.locator('a[href]:visible, button:visible')
      const count = await controls.count()
      expect(count).toBeGreaterThan(2)

      for (let i = 0; i < count; i++) {
        await page.keyboard.press(tabKey(browserName))
        const ring = await page.evaluate(() => {
          const element = document.activeElement as HTMLElement
          const style = getComputedStyle(element)
          return {
            label: element.textContent?.trim(),
            style: style.outlineStyle,
            color: style.outlineColor,
          }
        })
        expect(ring.style, `${ring.label} outline style`).not.toBe('none')
        expect(ring.color, `${ring.label} outline colour at the moment of focus`).toBe(FOCUS_RING)
      }
    })
  }
})
