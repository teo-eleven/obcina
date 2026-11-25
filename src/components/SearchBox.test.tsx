import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SEED_PRODUCTS } from '../constants/seedProducts'
import { fetchCatalogue } from '../services'
import { renderWithRouter } from '../test/renderWithRouter'
import { SearchBox } from './SearchBox'

vi.mock('../services/productsRepository')

function WhereAmI() {
  const location = useLocation()
  return <p>{`at ${location.pathname}${location.search}`}</p>
}

const ROUTES = [
  { path: '/', element: <SearchBox /> },
  { path: '*', element: <WhereAmI /> },
]

/** Focuses the plain field, waits for the autocomplete to replace it, then types. */
async function typeInSearch(text: string) {
  const user = userEvent.setup()
  renderWithRouter(ROUTES, '/')
  // Focus without a pointer: a hover first would load the autocomplete before the click lands.
  screen.getByRole('searchbox', { name: 'Caută în cămară' }).focus()
  const box = await screen.findByRole('combobox', { name: 'Caută în cămară' })
  expect(box).toHaveFocus()
  await user.type(box, text)
  return { user, box }
}

const optionNames = () =>
  within(screen.getByRole('listbox'))
    .getAllByRole('option')
    .map((option) => option.textContent)

describe('SearchBox', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(fetchCatalogue).mockResolvedValue([...SEED_PRODUCTS])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('suggests the products whose name holds what was typed, without diacritics', async () => {
    const { box } = await typeInSearch('dulceata')

    expect(await screen.findByRole('listbox')).toBeVisible()
    expect(box).toHaveAttribute('aria-expanded', 'true')
    expect(optionNames().some((name) => name?.includes('Dulceață de afine'))).toBe(true)
    expect(optionNames().every((name) => name?.startsWith('Dulceață'))).toBe(true)
  })

  it('drops the suggestions that stop matching as more letters are typed', async () => {
    const { user, box } = await typeInSearch('dulceata')
    await screen.findByRole('listbox')
    expect(optionNames().some((name) => name?.includes('cătină'))).toBe(true)

    await user.type(box, ' de afine')

    expect(optionNames().some((name) => name?.includes('cătină'))).toBe(false)
    expect(optionNames().some((name) => name?.includes('Dulceață de afine'))).toBe(true)
  })

  it('opens the product chosen with the arrow keys and Enter', async () => {
    const { user } = await typeInSearch('dulceata de afine')
    await screen.findByRole('listbox')

    await user.keyboard('{ArrowDown}{Enter}')

    expect(await screen.findByText('at /produs/dulceata-de-afine')).toBeInTheDocument()
  })

  it('opens the product clicked in the list', async () => {
    const { user } = await typeInSearch('dulceata de afine')

    await user.click(await screen.findByRole('option', { name: /Dulceață de afine/ }))

    expect(await screen.findByText('at /produs/dulceata-de-afine')).toBeInTheDocument()
  })

  it('opens the results page on Enter when no suggestion is chosen', async () => {
    const { user } = await typeInSearch('dulceata')
    await screen.findByRole('listbox')

    await user.keyboard('{Enter}')

    expect(await screen.findByText('at /cautare?q=dulceata')).toBeInTheDocument()
  })

  it('closes on Escape and says when nothing matches', async () => {
    const { user, box } = await typeInSearch('dulceata')
    await screen.findByRole('listbox')

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await user.clear(box)
    await user.type(box, 'ciocolata')
    expect(await screen.findByRole('status')).toHaveTextContent('Nimic pentru „ciocolata”.')
  })

  it('says so when the catalogue cannot be read', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.mocked(fetchCatalogue).mockRejectedValue(new Error('offline'))

    await typeInSearch('miere')

    await vi.waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/Căutarea nu merge acum/),
    )
  })

  it('tries the catalogue again on the next focus after a failed read', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.mocked(fetchCatalogue).mockRejectedValue(new Error('offline'))
    const { user, box } = await typeInSearch('miere')
    await vi.waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/Căutarea nu merge acum/),
    )

    const failedReads = vi.mocked(fetchCatalogue).mock.calls.length
    vi.mocked(fetchCatalogue).mockResolvedValue([...SEED_PRODUCTS])

    await user.tab()
    // Focus retries the read; one more key opens the list again (a trailing space is ignored).
    await user.type(box, ' ')

    expect(await screen.findByRole('option', { name: /Miere de tei/ })).toBeInTheDocument()
    expect(fetchCatalogue).toHaveBeenCalledTimes(failedReads + 1)
  })
})
