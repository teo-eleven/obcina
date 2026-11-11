import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CATEGORIES } from '../../constants'
import { SEED_PRODUCTS } from '../../constants/seedProducts'
import { formatPrice, stockLabel, stockLevel } from '../../utils'
import type { Product } from '../../types'
import { fetchProduct, fetchProductsBySlugs } from '../../services'
import { renderWithRouter } from '../../test/renderWithRouter'
import { ProductPage } from '.'

vi.mock('../../services/productsRepository')

const ROUTES = [{ path: '/produs/:slug', element: <ProductPage /> }]
const bySlug = (slug: string): Product => {
  const product = SEED_PRODUCTS.find((candidate) => candidate.slug === slug)
  if (!product) throw new Error(`No seed product ${slug}`)
  return product
}
const tea = bySlug('miere-de-tei')
const lowStock = bySlug('dulceata-de-catina')
const soldOut = bySlug('branza-in-coaja-de-brad')
const basket = bySlug('cos-mic-dejun-la-stana')
const stamps = () => Array.from(document.querySelectorAll('[data-stamp]')).map((s) => s.textContent)

describe('ProductPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(fetchProduct).mockResolvedValue(tea)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('announces loading while the product is fetched', async () => {
    vi.mocked(fetchProduct).mockReturnValue(new Promise(() => undefined))

    renderWithRouter(ROUTES, '/produs/miere-de-tei')

    expect(await screen.findByRole('status')).toHaveTextContent('Se încarcă produsul…')
    // The tab must not keep the previous page's name while this one loads.
    expect(document.title).toBe('Produs — Obcina')
  })

  it('shows the not-found page for a slug that does not exist', async () => {
    vi.mocked(fetchProduct).mockResolvedValue(null)

    renderWithRouter(ROUTES, '/produs/nu-exista')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Borcanul ăsta nu e în cămară' }),
    ).toBeInTheDocument()
    expect(fetchProduct).toHaveBeenCalledWith('nu-exista')
  })

  it('never echoes a malformed URL into the console', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.mocked(fetchProduct).mockRejectedValue(new Error('offline'))

    renderWithRouter(ROUTES, '/produs/<script>')

    await screen.findByRole('alert')
    expect(String(error.mock.calls[0]?.[0])).toContain('product invalid')
    expect(String(error.mock.calls[0]?.[0])).not.toContain('<script>')
  })

  it('treats a route without a slug as not found', async () => {
    vi.mocked(fetchProduct).mockResolvedValue(null)

    renderWithRouter([{ path: '/produs', element: <ProductPage /> }], '/produs')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Borcanul ăsta nu e în cămară' }),
    ).toBeInTheDocument()
    expect(fetchProduct).toHaveBeenCalledWith('')
  })

  it('shows an error and loads the product after retrying, keeping focus in the page', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.mocked(fetchProduct).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(tea)
    renderWithRouter(ROUTES, '/produs/miere-de-tei')
    expect(await screen.findByRole('alert')).toHaveTextContent('Nu am putut încărca produsul.')

    await userEvent.click(screen.getByRole('button', { name: 'Încearcă din nou' }))

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Miere de tei' }),
    ).toBeInTheDocument()
    expect(fetchProduct).toHaveBeenCalledTimes(2)
    expect(document.activeElement).not.toBe(document.body)
    expect(document.activeElement?.contains(screen.getByRole('heading', { level: 1 }))).toBe(true)
    expect(error).toHaveBeenCalled()
  })

  it('names the tab and the single h1 after the product', async () => {
    renderWithRouter(ROUTES, '/produs/miere-de-tei')

    await screen.findByRole('heading', { level: 1, name: 'Miere de tei' })
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(document.title).toBe('Miere de tei — Obcina')
  })

  it('shows an enabled "Adaugă în coș" button for a product in stock', async () => {
    renderWithRouter(ROUTES, '/produs/miere-de-tei')

    expect(await screen.findByRole('button', { name: 'Adaugă în coș' })).toBeEnabled()
  })

  it('shows a disabled "Indisponibil" button for the sold-out product', async () => {
    vi.mocked(fetchProduct).mockResolvedValue(soldOut)

    renderWithRouter(ROUTES, '/produs/branza-in-coaja-de-brad')

    expect(await screen.findByRole('button', { name: 'Indisponibil' })).toBeDisabled()
  })

  it('links back to the shelf of its category', async () => {
    renderWithRouter(ROUTES, '/produs/miere-de-tei')

    await screen.findByRole('heading', { level: 1 })
    expect(screen.getByRole('link', { name: 'Înapoi la Miere' })).toHaveAttribute(
      'href',
      '/categorie/miere',
    )
  })

  it('names the shelf link after the category of the product', async () => {
    vi.mocked(fetchProduct).mockResolvedValue(lowStock)
    const jams = CATEGORIES.find((category) => category.slug === 'dulceturi')

    renderWithRouter(ROUTES, '/produs/dulceata-de-catina')

    const link = await screen.findByRole('link', { name: `Înapoi la ${jams?.name ?? ''}` })
    expect(link).toHaveAttribute('href', '/categorie/dulceturi')
  })

  it('shows the image eagerly with its size and alt text', async () => {
    renderWithRouter(ROUTES, '/produs/miere-de-tei')

    const image = await screen.findByRole('img', { name: tea.image.alt })
    expect(image).toHaveAttribute('src', tea.image.src)
    expect(image).toHaveAttribute('width', '800')
    expect(image).toHaveAttribute('height', '800')
    expect(image).toHaveAttribute('loading', 'eager')
    expect(image).toHaveAttribute('fetchpriority', 'high')
  })

  it('stamps the price and weight, and no stock warning when well stocked', async () => {
    renderWithRouter(ROUTES, '/produs/miere-de-tei')

    await screen.findByRole('heading', { level: 1 })
    expect(stamps()).toEqual([
      formatPrice(tea.priceBani),
      `${tea.kind === 'product' ? tea.weightGrams : 0} g`,
    ])
  })

  it('adds a stock stamp when the stock is low', async () => {
    vi.mocked(fetchProduct).mockResolvedValue(lowStock)

    renderWithRouter(ROUTES, '/produs/dulceata-de-catina')

    await screen.findByRole('heading', { level: 1 })
    expect(stamps()).toContain('Doar 3 în stoc')
    expect(stamps()).toContain(formatPrice(lowStock.priceBani))
  })

  it('adds a stock stamp when the product is sold out', async () => {
    vi.mocked(fetchProduct).mockResolvedValue(soldOut)
    const label = stockLabel(stockLevel(0))

    renderWithRouter(ROUTES, '/produs/branza-in-coaja-de-brad')

    await screen.findByRole('heading', { level: 1 })
    expect(label).toBe('Stoc epuizat')
    expect(stamps()).toContain('Stoc epuizat')
  })

  it('shows the description and one list item per ingredient', async () => {
    renderWithRouter(ROUTES, '/produs/miere-de-tei')

    expect(await screen.findByText(tea.description)).toBeInTheDocument()
    const items = within(screen.getByRole('list', { name: 'Ingrediente' })).getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual(
      tea.kind === 'product' ? tea.ingredients : [],
    )
  })

  describe('gift basket', () => {
    const components = basket.kind === 'gift-basket' ? basket.components : []

    beforeEach(() => {
      vi.mocked(fetchProduct).mockResolvedValue(basket)
      vi.mocked(fetchProductsBySlugs).mockResolvedValue(
        components.map((component) => bySlug(component.slug)),
      )
    })

    it('lists its components as links to their pages, without weight or ingredients', async () => {
      renderWithRouter(ROUTES, '/produs/cos-mic-dejun-la-stana')

      const list = await screen.findByRole('list', { name: 'Ce conține' })
      expect(within(list).getAllByRole('listitem')).toHaveLength(components.length)
      for (const component of components) {
        const link = await within(list).findByRole('link', { name: bySlug(component.slug).name })
        expect(link).toHaveAttribute('href', `/produs/${component.slug}`)
      }
      expect(fetchProductsBySlugs).toHaveBeenCalledWith(components.map((c) => c.slug))
      expect(stamps()).toEqual([formatPrice(basket.priceBani)])
      expect(screen.queryByRole('list', { name: 'Ingrediente' })).not.toBeInTheDocument()
    })

    it('says so when some of its products are missing, instead of a shorter list', async () => {
      const [first] = components
      vi.mocked(fetchProductsBySlugs).mockResolvedValue(first ? [bySlug(first.slug)] : [])

      renderWithRouter(ROUTES, '/produs/cos-mic-dejun-la-stana')

      expect(
        await screen.findByText('Unele produse din coș nu sunt disponibile acum.'),
      ).toBeInTheDocument()
    })

    it('shows no empty list when none of its products load', async () => {
      vi.mocked(fetchProductsBySlugs).mockResolvedValue([])

      renderWithRouter(ROUTES, '/produs/cos-mic-dejun-la-stana')

      await screen.findByText('Unele produse din coș nu sunt disponibile acum.')
      expect(screen.queryByRole('list', { name: 'Ce conține' })).not.toBeInTheDocument()
    })

    it('keeps focus in the basket section after retrying its contents', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined)
      vi.mocked(fetchProductsBySlugs)
        .mockRejectedValueOnce(new Error('offline'))
        .mockResolvedValueOnce(components.map((component) => bySlug(component.slug)))
      renderWithRouter(ROUTES, '/produs/cos-mic-dejun-la-stana')

      await userEvent.click(await screen.findByRole('button', { name: 'Încearcă din nou' }))

      await screen.findByRole('list', { name: 'Ce conține' })
      expect(document.activeElement).not.toBe(document.body)
    })

    it('shows the rest of the page while the components still load', async () => {
      vi.mocked(fetchProductsBySlugs).mockReturnValue(new Promise(() => undefined))

      renderWithRouter(ROUTES, '/produs/cos-mic-dejun-la-stana')

      expect(
        await screen.findByRole('heading', { level: 1, name: basket.name }),
      ).toBeInTheDocument()
      expect(screen.getByText(basket.description)).toBeInTheDocument()
      expect(stamps()).toContain(formatPrice(basket.priceBani))
    })
  })
})
