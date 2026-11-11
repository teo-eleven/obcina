import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useRef, useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SEED_PRODUCTS } from '../constants/seedProducts'
import { cartStore } from '../stores'
import { renderWithRouter } from '../test/renderWithRouter'
import { formatPrice, lineQuantity, orderTotal, shippingCost } from '../utils'
import { CartDrawer } from './CartDrawer'

const fetchProductsBySlugs = vi.hoisted(() => vi.fn())
vi.mock('../services/productsRepository', () => ({ fetchProductsBySlugs }))

function seed(slug: string) {
  const product = SEED_PRODUCTS.find((candidate) => candidate.slug === slug)
  if (!product) throw new Error(`Missing seed product ${slug}`)
  return product
}

const honey = seed('miere-de-tei') // 42,00 lei
const jam = seed('gem-de-zmeura') // 29,00 lei
const firHoney = seed('miere-de-mana-de-brad') // 58,00 lei

/** Collapses every whitespace run (NBSP included) so amounts compare as the reader sees them. */
const text = (value: string | null | undefined) => (value ?? '').replace(/\s+/g, ' ').trim()

function renderDrawer(props: { onOpenChange?: (open: boolean) => void } = {}) {
  const onOpenChange = props.onOpenChange ?? vi.fn()
  const returnFocus = createRef<HTMLElement>()
  const view = renderWithRouter([
    {
      path: '*',
      element: <CartDrawer open onOpenChange={onOpenChange} returnFocus={returnFocus} />,
    },
  ])
  return { ...view, onOpenChange }
}

/** The element holding a label ("Subtotal") and its amount, found from the label. */
const rowOf = (label: string) => screen.getByText(label, { exact: true }).parentElement

describe('CartDrawer', () => {
  beforeEach(() => {
    fetchProductsBySlugs.mockImplementation((slugs: readonly string[]) =>
      Promise.resolve(slugs.flatMap((slug) => SEED_PRODUCTS.filter((p) => p.slug === slug))),
    )
  })

  it('is a dialog named "Coșul tău"', () => {
    renderDrawer()

    expect(screen.getByRole('dialog', { name: 'Coșul tău' })).toBeInTheDocument()
  })

  describe('with an empty cart', () => {
    it('says the cart is empty without reading the catalogue', () => {
      renderDrawer()

      expect(screen.getByText('Coșul e gol deocamdată.')).toBeInTheDocument()
      expect(fetchProductsBySlugs).not.toHaveBeenCalled()
    })

    it('closes the drawer from "Continuă cumpărăturile"', async () => {
      const user = userEvent.setup()
      const { onOpenChange } = renderDrawer()

      await user.click(screen.getByRole('button', { name: 'Continuă cumpărăturile' }))

      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('with products in the cart', () => {
    beforeEach(() => {
      cartStore.addItem(honey.slug, 2)
      cartStore.addItem(jam.slug, 1)
    })

    it('shows "Se încarcă produsele…" while the catalogue loads', async () => {
      fetchProductsBySlugs.mockReturnValue(new Promise(() => undefined))

      renderDrawer()

      expect(screen.getByText('Se încarcă produsele…')).toBeInTheDocument()
      expect(screen.queryByRole('list', { name: 'Produse în coș' })).not.toBeInTheDocument()
    })

    it('asks for the slugs of the cart lines only', async () => {
      renderDrawer()
      await screen.findByRole('list', { name: 'Produse în coș' })

      expect(fetchProductsBySlugs).toHaveBeenCalledWith([honey.slug, jam.slug])
    })

    it('lists one item per line with the name as a link to the product', async () => {
      renderDrawer()

      const list = await screen.findByRole('list', { name: 'Produse în coș' })

      const items = within(list).getAllByRole('listitem')
      expect(items).toHaveLength(2)
      expect(within(items[0]!).getByRole('link', { name: honey.name })).toHaveAttribute(
        'href',
        `/produs/${honey.slug}`,
      )
      expect(within(items[1]!).getByRole('link', { name: jam.name })).toHaveAttribute(
        'href',
        `/produs/${jam.slug}`,
      )
    })

    it('shows the quantity times the unit price and the line total', async () => {
      renderDrawer()

      const list = await screen.findByRole('list', { name: 'Produse în coș' })

      const [first] = within(list).getAllByRole('listitem')
      expect(text(first?.textContent)).toContain(`2 × ${text(formatPrice(honey.priceBani))}`)
      expect(text(first?.textContent)).toContain(text(formatPrice(2 * honey.priceBani)))
    })

    it('shows subtotal, shipping and total for a cart under the free-shipping threshold', async () => {
      renderDrawer()
      await screen.findByRole('list', { name: 'Produse în coș' })
      const subtotal = 2 * honey.priceBani + jam.priceBani

      expect(text(rowOf('Subtotal')?.textContent)).toContain(text(formatPrice(subtotal)))
      expect(text(rowOf('Transport')?.textContent)).toContain(
        text(formatPrice(shippingCost(subtotal))),
      )
      expect(text(rowOf('Total')?.textContent)).toContain(text(formatPrice(orderTotal(subtotal))))
    })

    it('says shipping is "gratuit" once it costs nothing', async () => {
      cartStore.addItem(firHoney.slug, 4)
      renderDrawer()
      await screen.findByRole('list', { name: 'Produse în coș' })

      expect(shippingCost(2 * honey.priceBani + jam.priceBani + 4 * firHoney.priceBani)).toBe(0)
      expect(text(rowOf('Transport')?.textContent)).toContain('gratuit')
    })

    it('removes a line with "Scoate … din coș" and announces it', async () => {
      const user = userEvent.setup()
      renderDrawer()
      await screen.findByRole('list', { name: 'Produse în coș' })

      await user.click(screen.getByRole('button', { name: `Scoate ${honey.name} din coș` }))

      expect(lineQuantity(cartStore.getSnapshot(), honey.slug)).toBe(0)
      expect(within(screen.getByRole('dialog')).getByRole('status')).toHaveTextContent(
        `Am scos ${honey.name} din coș.`,
      )
      const list = screen.getByRole('list', { name: 'Produse în coș' })
      expect(within(list).getAllByRole('listitem')).toHaveLength(1)
      expect(within(list).queryByRole('link', { name: honey.name })).not.toBeInTheDocument()
      expect(text(rowOf('Subtotal')?.textContent)).toContain(text(formatPrice(jam.priceBani)))
    })

    it('does not read the catalogue again when a line is removed', async () => {
      const user = userEvent.setup()
      renderDrawer()
      await screen.findByRole('list', { name: 'Produse în coș' })

      await user.click(screen.getByRole('button', { name: `Scoate ${honey.name} din coș` }))

      expect(fetchProductsBySlugs).toHaveBeenCalledTimes(1)
    })

    it('reads the catalogue again when a new product reaches the cart (e.g. another tab)', async () => {
      renderDrawer()
      await screen.findByRole('list', { name: 'Produse în coș' })

      act(() => cartStore.addItem(firHoney.slug))

      expect(
        await screen.findByRole('link', { name: firHoney.name }, { timeout: 3000 }),
      ).toBeInTheDocument()
      expect(fetchProductsBySlugs).toHaveBeenLastCalledWith([honey.slug, jam.slug, firHoney.slug])
    })

    it('moves focus to the next line\'s "Scoate" after a removal', async () => {
      const user = userEvent.setup()
      renderDrawer()
      await screen.findByRole('list', { name: 'Produse în coș' })

      await user.click(screen.getByRole('button', { name: `Scoate ${honey.name} din coș` }))

      expect(screen.getByRole('button', { name: `Scoate ${jam.name} din coș` })).toHaveFocus()
    })

    it('moves focus to the next line, not the previous one, when a middle line is removed', async () => {
      const user = userEvent.setup()
      cartStore.addItem(firHoney.slug)
      renderDrawer()
      await screen.findByRole('list', { name: 'Produse în coș' })

      await user.click(screen.getByRole('button', { name: `Scoate ${jam.name} din coș` }))

      expect(screen.getByRole('button', { name: `Scoate ${firHoney.name} din coș` })).toHaveFocus()
    })

    it('moves focus to the previous line\'s "Scoate" when the last line is removed', async () => {
      const user = userEvent.setup()
      renderDrawer()
      await screen.findByRole('list', { name: 'Produse în coș' })

      await user.click(screen.getByRole('button', { name: `Scoate ${jam.name} din coș` }))

      expect(screen.getByRole('button', { name: `Scoate ${honey.name} din coș` })).toHaveFocus()
    })

    it('moves focus to "Continuă cumpărăturile" when the cart becomes empty', async () => {
      const user = userEvent.setup()
      cartStore.removeItem(jam.slug)
      renderDrawer()
      await screen.findByRole('list', { name: 'Produse în coș' })

      await user.click(screen.getByRole('button', { name: `Scoate ${honey.name} din coș` }))

      expect(screen.getByRole('button', { name: 'Continuă cumpărăturile' })).toHaveFocus()
    })

    it('announces a second, identical removal too (the live region text changes)', async () => {
      const user = userEvent.setup()
      renderDrawer()
      await screen.findByRole('list', { name: 'Produse în coș' })
      const status = within(screen.getByRole('dialog')).getByRole('status')

      await user.click(screen.getByRole('button', { name: `Scoate ${honey.name} din coș` }))
      const first = status.textContent
      act(() => cartStore.addItem(honey.slug))
      await screen.findByRole('button', { name: `Scoate ${honey.name} din coș` }, { timeout: 3000 })
      await user.click(screen.getByRole('button', { name: `Scoate ${honey.name} din coș` }))

      expect(status.textContent).not.toBe(first)
      expect(text(status.textContent)).toContain(`Am scos ${honey.name} din coș.`)
    })

    it('keeps a product added and removed before the catalogue answers out of the list', async () => {
      let answer: (products: unknown) => void = () => undefined
      fetchProductsBySlugs.mockReturnValueOnce(
        new Promise((resolve) => {
          answer = resolve
        }),
      )
      renderDrawer()

      act(() => {
        cartStore.addItem(firHoney.slug)
        cartStore.removeItem(firHoney.slug)
      })
      await act(async () => answer([honey, jam]))

      const list = await screen.findByRole('list', { name: 'Produse în coș' }, { timeout: 3000 })
      expect(within(list).getAllByRole('listitem')).toHaveLength(2)
      expect(within(list).queryByRole('link', { name: firHoney.name })).not.toBeInTheDocument()
    })

    it('shows the empty state after the last line is removed', async () => {
      const user = userEvent.setup()
      cartStore.removeItem(jam.slug)
      renderDrawer()
      await screen.findByRole('list', { name: 'Produse în coș' })

      await user.click(screen.getByRole('button', { name: `Scoate ${honey.name} din coș` }))

      expect(screen.getByText('Coșul e gol deocamdată.')).toBeInTheDocument()
    })

    it('shows a product missing from the catalogue as unavailable, out of the subtotal', async () => {
      const user = userEvent.setup()
      fetchProductsBySlugs.mockResolvedValue([honey])

      renderDrawer()
      await screen.findByRole('list', { name: 'Produse în coș' })

      expect(screen.getByText('Un produs care nu mai e în catalog')).toBeInTheDocument()
      expect(screen.getByText('Nu intră în total.')).toBeInTheDocument()
      expect(text(rowOf('Subtotal')?.textContent)).toContain(text(formatPrice(2 * honey.priceBani)))

      await user.click(screen.getByRole('button', { name: 'Scoate produsul indisponibil din coș' }))

      expect(lineQuantity(cartStore.getSnapshot(), jam.slug)).toBe(0)
      expect(screen.queryByText('Un produs care nu mai e în catalog')).not.toBeInTheDocument()
    })

    it('shows the load error and refetches on "Încearcă din nou"', async () => {
      const user = userEvent.setup()
      vi.spyOn(console, 'error').mockImplementation(() => undefined)
      fetchProductsBySlugs.mockRejectedValueOnce(new Error('unavailable'))

      renderDrawer()

      expect(await screen.findByText('Nu am putut încărca produsele din coș.')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Încearcă din nou' }))
      expect(await screen.findByRole('list', { name: 'Produse în coș' })).toBeInTheDocument()
      expect(fetchProductsBySlugs).toHaveBeenCalledTimes(2)
    })

    it('closes the drawer when a product link is followed', async () => {
      const user = userEvent.setup()
      const { onOpenChange } = renderDrawer()
      await screen.findByRole('list', { name: 'Produse în coș' })

      await user.click(screen.getByRole('link', { name: honey.name }))

      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('gives focus to returnFocus after it closes', async () => {
    const user = userEvent.setup()
    function Host() {
      const [open, setOpen] = useState(true)
      const returnFocus = useRef<HTMLButtonElement>(null)
      return (
        <>
          <button type="button" ref={returnFocus}>
            Deschide coșul
          </button>
          <CartDrawer open={open} onOpenChange={setOpen} returnFocus={returnFocus} />
        </>
      )
    }
    renderWithRouter([{ path: '*', element: <Host /> }])

    await user.keyboard('{Escape}')

    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Deschide coșul' })).toHaveFocus()
  })

  it('starts quiet when reopened: the last announcement is not repeated', async () => {
    const user = userEvent.setup()
    cartStore.addItem(honey.slug)
    cartStore.addItem(jam.slug)
    function Host() {
      const [open, setOpen] = useState(true)
      const returnFocus = useRef<HTMLButtonElement>(null)
      return (
        <>
          <button type="button" ref={returnFocus} onClick={() => setOpen(true)}>
            Deschide coșul
          </button>
          <CartDrawer open={open} onOpenChange={setOpen} returnFocus={returnFocus} />
        </>
      )
    }
    renderWithRouter([{ path: '*', element: <Host /> }])
    await screen.findByRole('list', { name: 'Produse în coș' })
    await user.click(screen.getByRole('button', { name: `Scoate ${honey.name} din coș` }))
    await user.keyboard('{Escape}')
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Deschide coșul' }))

    expect(within(screen.getByRole('dialog')).getByRole('status')).toBeEmptyDOMElement()
  })
})
