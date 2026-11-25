import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SEED_PRODUCTS } from '../../constants/seedProducts'
import { fetchCatalogue } from '../../services'
import { renderWithRouter } from '../../test/renderWithRouter'
import { SearchPage } from '.'

vi.mock('../../services/productsRepository')

const ROUTES = [{ path: '/cautare', element: <SearchPage /> }]

describe('SearchPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(fetchCatalogue).mockResolvedValue([...SEED_PRODUCTS])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lists every product whose name holds the query, with or without diacritics', async () => {
    renderWithRouter(ROUTES, '/cautare?q=dulceata')

    const list = await screen.findByRole('list', { name: 'Produse' })
    const headings = within(list)
      .getAllByRole('heading')
      .map((h) => h.textContent)
    const expected = SEED_PRODUCTS.filter((p) => p.name.startsWith('Dulceață')).length
    expect(headings).toHaveLength(expected)
    expect(headings).toContain('Dulceață de afine')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Căutare')
    expect(screen.getByText('Rezultate pentru „dulceata”')).toBeInTheDocument()
    expect(document.title).toBe('Căutare — Obcina')
  })

  it('says when nothing matches and points to the shelves', async () => {
    renderWithRouter(ROUTES, '/cautare?q=ciocolata')

    expect(await screen.findByText('Nimic pentru „ciocolata”.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Vezi rafturile' })).toHaveAttribute(
      'href',
      '/#categorii',
    )
  })

  it('asks for a name, without reading the catalogue, when the query is empty or too short', () => {
    renderWithRouter(ROUTES, '/cautare?q=d')
    expect(screen.getByText('Scrie cel puțin 2 litere.')).toBeInTheDocument()

    renderWithRouter(ROUTES, '/cautare')
    expect(screen.getByText(/Scrie numele unui produs/)).toBeInTheDocument()
    expect(fetchCatalogue).not.toHaveBeenCalled()
  })

  it('offers a retry when the catalogue cannot be read', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.mocked(fetchCatalogue).mockRejectedValueOnce(new Error('offline'))
    renderWithRouter(ROUTES, '/cautare?q=miere')

    await userEvent.click(await screen.findByRole('button', { name: 'Încearcă din nou' }))

    expect(await screen.findByRole('list', { name: 'Produse' })).toBeInTheDocument()
  })

  it('cuts a very long query from the URL to the length the field accepts', async () => {
    renderWithRouter(ROUTES, `/cautare?q=miere${'x'.repeat(500)}`)

    const echoed = await screen.findByText(/^Rezultate pentru/)
    expect(echoed.textContent?.length).toBeLessThan(130)
  })
})
