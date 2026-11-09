import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CATEGORIES } from '../data/categories'
import { SEED_PRODUCTS } from '../data/seedProducts'
import { formatPrice } from '../lib/money'
import { fetchCategoryProducts } from '../lib/productsRepository'
import { renderWithRouter } from '../test/renderWithRouter'
import { CategoryPage } from './CategoryPage'

vi.mock('../lib/productsRepository')

const ROUTES = [{ path: '/categorie/:slug', element: <CategoryPage /> }]
const honey = SEED_PRODUCTS.filter((product) => product.category === 'miere')
const jams = SEED_PRODUCTS.filter((product) => product.category === 'dulceturi')
const miere = CATEGORIES.find((category) => category.slug === 'miere')

describe('CategoryPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(fetchCategoryProducts).mockResolvedValue(honey)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('names the browser tab after the category', async () => {
    renderWithRouter(ROUTES, '/categorie/miere')

    await screen.findByRole('list', { name: 'Produse' })
    expect(document.title).toBe('Miere — Obcina')
  })

  it('loads the first row of images eagerly and the rest lazily', async () => {
    vi.mocked(fetchCategoryProducts).mockResolvedValue(jams)
    expect(jams.length).toBeGreaterThan(3)

    renderWithRouter(ROUTES, '/categorie/dulceturi')

    const images = within(await screen.findByRole('list', { name: 'Produse' })).getAllByRole('img')
    images.forEach((image, index) => {
      const isFirstRow = index < 3
      expect(image).toHaveAttribute('loading', isFirstRow ? 'eager' : 'lazy')
      expect(image.getAttribute('fetchpriority')).toBe(isFirstRow ? 'high' : null)
    })
  })

  it('shows the not-found page for an unknown category without loading products', () => {
    renderWithRouter(ROUTES, '/categorie/nu-exista')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Borcanul ăsta nu e în cămară' }),
    ).toBeInTheDocument()
    expect(fetchCategoryProducts).not.toHaveBeenCalled()
  })

  it('shows the category name and description', async () => {
    renderWithRouter(ROUTES, '/categorie/miere')

    expect(screen.getByRole('heading', { level: 1, name: 'Miere' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByText(miere?.description ?? '')).toBeInTheDocument()
    await screen.findByRole('list', { name: 'Produse' })
  })

  it('announces loading while products are fetched', async () => {
    vi.mocked(fetchCategoryProducts).mockReturnValue(new Promise(() => undefined))

    renderWithRouter(ROUTES, '/categorie/miere')

    expect(await screen.findByRole('status')).toHaveTextContent('Se încarcă produsele…')
  })

  it('lists one linked product with its image per item', async () => {
    renderWithRouter(ROUTES, '/categorie/miere')

    const list = await screen.findByRole('list', { name: 'Produse' })
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(honey.length)
    for (const product of honey) {
      const link = within(list).getByRole('link', { name: product.name })
      expect(link).toHaveAttribute('href', `/produs/${product.slug}`)
      const image = within(link.closest('li') ?? list).getByRole('img', {
        name: product.image.alt,
      })
      expect(image).toHaveAttribute('width', '800')
      expect(image).toHaveAttribute('height', '800')
    }
  })

  it('renders each item as a label card with its formatted price', async () => {
    renderWithRouter(ROUTES, '/categorie/miere')

    const list = await screen.findByRole('list', { name: 'Produse' })
    const items = within(list).getAllByRole('listitem')
    items.forEach((item, index) => {
      expect(item.querySelector('[data-label]')).not.toBeNull()
      const price = honey[index]?.priceBani ?? -1
      expect(item.querySelector('[data-stamp]')).not.toBeNull()
      expect(item.textContent).toContain(formatPrice(price))
    })
  })

  it('shows an empty shelf with a way back to the categories', async () => {
    vi.mocked(fetchCategoryProducts).mockResolvedValue([])

    renderWithRouter(ROUTES, '/categorie/miere')

    expect(await screen.findByText('Raftul ăsta e gol deocamdată.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Vezi celelalte categorii' })).toHaveAttribute(
      'href',
      '/#categorii',
    )
    expect(screen.queryByRole('list', { name: 'Produse' })).not.toBeInTheDocument()
  })

  it('shows an error and loads the products after retrying', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.mocked(fetchCategoryProducts)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(honey)
    renderWithRouter(ROUTES, '/categorie/miere')
    expect(await screen.findByRole('alert')).toHaveTextContent('Nu am putut încărca produsele.')

    await userEvent.click(screen.getByRole('button', { name: 'Încearcă din nou' }))

    expect(await screen.findByRole('list', { name: 'Produse' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(fetchCategoryProducts).toHaveBeenCalledTimes(2)
    expect(error).toHaveBeenCalledWith(expect.stringContaining('miere'), expect.any(Error))
  })

  it('keeps keyboard focus on the shelf after retrying', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.mocked(fetchCategoryProducts)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(honey)
    renderWithRouter(ROUTES, '/categorie/miere')

    await userEvent.click(await screen.findByRole('button', { name: 'Încearcă din nou' }))

    await screen.findByRole('list', { name: 'Produse' })
    expect(document.activeElement).not.toBe(document.body)
    expect(document.activeElement?.contains(screen.getByRole('list', { name: 'Produse' }))).toBe(
      true,
    )
  })

  it('shows the shelf you moved to, even if the previous one answers late', async () => {
    const teas = SEED_PRODUCTS.filter((product) => product.category === 'ceaiuri')
    let answerHoney: (products: typeof honey) => void = () => undefined
    vi.mocked(fetchCategoryProducts).mockImplementation((category) =>
      category === 'miere'
        ? new Promise((resolve) => {
            answerHoney = resolve
          })
        : Promise.resolve(teas),
    )
    const { router } = renderWithRouter(ROUTES, '/categorie/miere')

    await act(async () => {
      await router.navigate('/categorie/ceaiuri')
    })
    const list = await screen.findByRole('list', { name: 'Produse' })
    await act(async () => answerHoney(honey))

    const names = within(list)
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent)
    expect(names).toEqual(teas.map((product) => product.name))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ceaiuri de munte')
  })
})
