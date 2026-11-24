import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SEED_PRODUCTS } from '../../constants/seedProducts'
import { cartStore } from '../../stores'
import { renderWithRouter } from '../../test/renderWithRouter'
import type { Product } from '../../types'
import { formatPrice, lineQuantity, orderTotal } from '../../utils'
import { CartPage } from './CartPage'

const fetchProductsBySlugs = vi.hoisted(() => vi.fn())
vi.mock('../../services/productsRepository', () => ({ fetchProductsBySlugs }))

function seed(slug: string): Product {
  const product = SEED_PRODUCTS.find((candidate) => candidate.slug === slug)
  if (!product) throw new Error(`Missing seed product ${slug}`)
  return product
}

const honey = seed('miere-de-tei') // 42,00 lei, stock 25
const seaBuckthorn = seed('dulceata-de-catina') // stock 3
const soldOut = seed('branza-in-coaja-de-brad') // stock 0

const text = (value: string | null | undefined) => (value ?? '').replace(/\s+/g, ' ').trim()
const rowOf = (label: string) => screen.getByText(label, { exact: true }).parentElement

function renderPage() {
  return renderWithRouter([{ path: '*', element: <CartPage /> }], '/cos')
}

async function listItem(name: string) {
  const list = await screen.findByRole('list', { name: 'Produse în coș' })
  const item = within(list)
    .getAllByRole('listitem')
    .find((candidate) => within(candidate).queryByRole('link', { name }))
  if (!item) throw new Error(`No line for ${name}`)
  return item
}

describe('CartPage', () => {
  beforeEach(() => {
    fetchProductsBySlugs.mockImplementation((slugs: readonly string[]) =>
      Promise.resolve(slugs.flatMap((slug) => SEED_PRODUCTS.filter((p) => p.slug === slug))),
    )
  })

  it('has one h1 and the tab title', () => {
    renderPage()

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: 'Coșul tău' })).toBeInTheDocument()
    expect(document.title).toBe('Coșul tău — Obcina')
  })

  describe('with an empty cart', () => {
    it('shows an illustrated empty state with a way back to the shelves, without reading the catalogue', () => {
      const { container } = renderPage()

      expect(screen.getByText('Coșul e gol deocamdată.')).toBeInTheDocument()
      expect(container.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Vezi ce avem în cămară' })).toHaveAttribute(
        'href',
        '/#categorii',
      )
      expect(fetchProductsBySlugs).not.toHaveBeenCalled()
    })
  })

  describe('with products', () => {
    beforeEach(() => {
      cartStore.addItem(honey.slug, 2)
    })

    it('lists each product with its unit price, quantity field and line total', async () => {
      renderPage()
      const item = await listItem(honey.name)

      expect(text(item.textContent)).toContain(`${text(formatPrice(honey.priceBani))} / buc.`)
      expect(
        within(item).getByRole('textbox', { name: `Cantitate pentru ${honey.name}` }),
      ).toHaveValue('2')
      expect(text(item.textContent)).toContain(text(formatPrice(2 * honey.priceBani)))
    })

    it('increases and decreases the quantity with + and −', async () => {
      const user = userEvent.setup()
      renderPage()
      const item = await listItem(honey.name)

      await user.click(
        within(item).getByRole('button', { name: `Crește cantitatea pentru ${honey.name}` }),
      )
      expect(lineQuantity(cartStore.getSnapshot(), honey.slug)).toBe(3)

      await user.click(
        within(item).getByRole('button', { name: `Scade cantitatea pentru ${honey.name}` }),
      )
      expect(lineQuantity(cartStore.getSnapshot(), honey.slug)).toBe(2)
    })

    it('does not go below 1 with − (the line is removed with "Scoate")', async () => {
      const user = userEvent.setup()
      cartStore.setQuantity(honey.slug, 1)
      renderPage()
      const item = await listItem(honey.name)
      const minus = within(item).getByRole('button', {
        name: `Scade cantitatea pentru ${honey.name}`,
      })

      await user.click(minus)

      expect(minus).toHaveAttribute('aria-disabled', 'true')
      expect(lineQuantity(cartStore.getSnapshot(), honey.slug)).toBe(1)
    })

    it('does not go above the stock with +, and says why', async () => {
      const user = userEvent.setup()
      cartStore.addItem(seaBuckthorn.slug, 3)
      renderPage()
      const item = await listItem(seaBuckthorn.name)
      const plus = within(item).getByRole('button', {
        name: `Crește cantitatea pentru ${seaBuckthorn.name}`,
      })

      await user.click(plus)

      expect(plus).toHaveAttribute('aria-disabled', 'true')
      expect(lineQuantity(cartStore.getSnapshot(), seaBuckthorn.slug)).toBe(3)
      expect(within(item).getByText('Ai în coș tot stocul: 3 buc.')).toBeInTheDocument()
    })

    it('sets the quantity typed in the field on Enter', async () => {
      const user = userEvent.setup()
      renderPage()
      const field = within(await listItem(honey.name)).getByRole('textbox', {
        name: `Cantitate pentru ${honey.name}`,
      })

      await user.clear(field)
      await user.type(field, '7{Enter}')

      expect(lineQuantity(cartStore.getSnapshot(), honey.slug)).toBe(7)
    })

    it('caps a typed quantity at the stock and says so', async () => {
      const user = userEvent.setup()
      cartStore.addItem(seaBuckthorn.slug, 1)
      renderPage()
      const item = await listItem(seaBuckthorn.name)
      const field = within(item).getByRole('textbox', {
        name: `Cantitate pentru ${seaBuckthorn.name}`,
      })

      await user.clear(field)
      await user.type(field, '9')
      await user.tab()

      expect(lineQuantity(cartStore.getSnapshot(), seaBuckthorn.slug)).toBe(3)
      expect(field).toHaveValue('3')
      expect(within(item).getByText('Mai sunt doar 3 buc.')).toBeInTheDocument()
    })

    it('puts back the old quantity when the typed text is not a number', async () => {
      const user = userEvent.setup()
      renderPage()
      const item = await listItem(honey.name)
      const field = within(item).getByRole('textbox', { name: `Cantitate pentru ${honey.name}` })

      await user.clear(field)
      await user.type(field, 'doi')
      await user.tab()

      expect(field).toHaveValue('2')
      expect(lineQuantity(cartStore.getSnapshot(), honey.slug)).toBe(2)
      expect(within(item).getByText('Scrie un număr între 1 și 25.')).toBeInTheDocument()
    })

    it('removes a line with "Scoate"', async () => {
      const user = userEvent.setup()
      renderPage()
      const item = await listItem(honey.name)

      await user.click(within(item).getByRole('button', { name: `Scoate ${honey.name} din coș` }))

      expect(lineQuantity(cartStore.getSnapshot(), honey.slug)).toBe(0)
      expect(screen.getByText('Coșul e gol deocamdată.')).toBeInTheDocument()
    })

    it('moves focus to the next line\'s "Scoate" after a removal', async () => {
      const user = userEvent.setup()
      cartStore.addItem(seaBuckthorn.slug, 1)
      renderPage()
      const item = await listItem(honey.name)

      await user.click(within(item).getByRole('button', { name: `Scoate ${honey.name} din coș` }))

      expect(
        screen.getByRole('button', { name: `Scoate ${seaBuckthorn.name} din coș` }),
      ).toHaveFocus()
    })

    it('moves focus to the page heading when the last line is removed', async () => {
      const user = userEvent.setup()
      renderPage()
      const item = await listItem(honey.name)

      await user.click(within(item).getByRole('button', { name: `Scoate ${honey.name} din coș` }))

      expect(screen.getByRole('heading', { level: 1, name: 'Coșul tău' })).toHaveFocus()
    })

    it('keeps the "capped at stock" message when Enter is followed by leaving the field', async () => {
      const user = userEvent.setup()
      cartStore.addItem(seaBuckthorn.slug, 1)
      renderPage()
      const item = await listItem(seaBuckthorn.name)
      const field = within(item).getByRole('textbox', {
        name: `Cantitate pentru ${seaBuckthorn.name}`,
      })

      await user.clear(field)
      await user.type(field, '9{Enter}')
      await user.tab()

      expect(within(item).getByText('Mai sunt doar 3 buc.')).toBeInTheDocument()
    })

    it('makes the quantity field easy on a phone keyboard', async () => {
      renderPage()
      const field = within(await listItem(honey.name)).getByRole('textbox', {
        name: `Cantitate pentru ${honey.name}`,
      })

      expect(field).toHaveAttribute('inputmode', 'numeric')
      expect(field).toHaveAttribute('enterkeyhint', 'done')
      expect(field).toHaveAttribute('autocomplete', 'off')
    })

    it('shows subtotal, shipping and total', async () => {
      renderPage()
      await listItem(honey.name)
      const subtotal = 2 * honey.priceBani

      expect(text(rowOf('Subtotal')?.textContent)).toContain(text(formatPrice(subtotal)))
      expect(text(rowOf('Total')?.textContent)).toContain(text(formatPrice(orderTotal(subtotal))))
    })
  })

  describe('when the stock changed since the products were added', () => {
    it('corrects the cart in one change and tells the buyer what changed', async () => {
      cartStore.addItem(honey.slug, 2)
      cartStore.addItem(soldOut.slug, 1, 1)
      cartStore.addItem(seaBuckthorn.slug, 3)
      fetchProductsBySlugs.mockResolvedValue([honey, soldOut, { ...seaBuckthorn, stock: 2 }])
      const replace = vi.spyOn(cartStore, 'replace')

      renderPage()

      const notice = await screen.findByText('Am actualizat coșul')
      const box = notice.closest('section') ?? notice.parentElement
      expect(text(box?.textContent)).toContain(`Am scos din coș ${soldOut.name}: nu mai e în stoc.`)
      expect(text(box?.textContent)).toContain(`${seaBuckthorn.name}: mai sunt doar 2 buc.`)
      expect(replace).toHaveBeenCalledTimes(1)
      expect(cartStore.getSnapshot()).toEqual([
        { productId: honey.slug, quantity: 2 },
        { productId: seaBuckthorn.slug, quantity: 2 },
      ])
    })

    it('removes a product that left the catalogue', async () => {
      cartStore.addItem(honey.slug, 1)
      cartStore.addItem('produs-disparut', 1)
      fetchProductsBySlugs.mockResolvedValue([honey])

      renderPage()

      expect(
        await screen.findByText('Un produs nu mai e în catalog; l-am scos din coș.'),
      ).toBeInTheDocument()
      await vi.waitFor(() =>
        expect(lineQuantity(cartStore.getSnapshot(), 'produs-disparut')).toBe(0),
      )
    })

    it('lists two products that left the catalogue as two separate messages', async () => {
      const errors = vi.spyOn(console, 'error')
      cartStore.addItem(honey.slug, 1)
      cartStore.addItem('produs-disparut', 1)
      cartStore.addItem('alt-produs-disparut', 1)
      fetchProductsBySlugs.mockResolvedValue([honey])

      renderPage()

      const notice = await screen.findByText('Am actualizat coșul')
      const box = notice.closest('section') as HTMLElement
      expect(within(box).getAllByRole('listitem')).toHaveLength(2)
      expect(errors.mock.calls.flat().join(' ')).not.toContain('same key')
    })

    it('keeps earlier corrections in the notice when a later one happens', async () => {
      cartStore.addItem(honey.slug, 1)
      cartStore.addItem(soldOut.slug, 1, 1)
      renderPage()
      await screen.findByText(`Am scos din coș ${soldOut.name}: nu mai e în stoc.`)

      act(() => cartStore.addItem('produs-disparut', 1))

      expect(
        await screen.findByText(
          'Un produs nu mai e în catalog; l-am scos din coș.',
          {},
          { timeout: 3000 },
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText(`Am scos din coș ${soldOut.name}: nu mai e în stoc.`),
      ).toBeInTheDocument()
    })

    it('says nothing when every line is fine', async () => {
      cartStore.addItem(honey.slug, 1)
      const replace = vi.spyOn(cartStore, 'replace')

      renderPage()
      await listItem(honey.name)

      expect(screen.queryByText('Am actualizat coșul')).not.toBeInTheDocument()
      expect(replace).not.toHaveBeenCalled()
    })
  })

  it('shows the load error with a retry', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    cartStore.addItem(honey.slug, 1)
    fetchProductsBySlugs.mockRejectedValueOnce(new Error('offline'))
    const user = userEvent.setup()

    renderPage()

    expect(await screen.findByText('Nu am putut încărca produsele din coș.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Încearcă din nou' }))
    expect(await listItem(honey.name)).toBeInTheDocument()
  })

  it('follows a product added in another tab', async () => {
    renderPage()
    act(() => cartStore.addItem(honey.slug, 1))

    expect(await listItem(honey.name)).toBeInTheDocument()
  })
})
