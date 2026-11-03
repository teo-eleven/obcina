import { act, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '../test/renderWithRouter'
import { Layout } from './Layout'

const TEST_ROUTES = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <h1>Acasă de test</h1> },
      { path: '/test', element: <h1>Pagina de test</h1> },
    ],
  },
]

describe('Layout', () => {
  it.each([
    ['/', 'Acasă de test'],
    ['/test', 'Pagina de test'],
  ] as const)('wraps %s in the shared header, main and footer', (path, heading) => {
    renderWithRouter(TEST_ROUTES, path)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(
      within(screen.getByRole('main')).getByRole('heading', { name: heading }),
    ).toBeInTheDocument()
  })

  it('keeps the same header and footer when navigating between routes', async () => {
    const { router } = renderWithRouter(TEST_ROUTES, '/')
    const banner = screen.getByRole('banner')
    const footer = screen.getByRole('contentinfo')

    await act(() => router.navigate('/test'))

    expect(screen.getByRole('heading', { name: 'Pagina de test' })).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBe(banner)
    expect(screen.getByRole('contentinfo')).toBe(footer)
  })

  it('does not crash on a malformed hash in the url', () => {
    renderWithRouter(TEST_ROUTES, '/test#%E0%A4%A')

    expect(screen.getByRole('heading', { name: 'Pagina de test' })).toBeInTheDocument()
  })

  it('offers a skip link to the main content', () => {
    renderWithRouter(TEST_ROUTES, '/test')

    expect(screen.getByRole('link', { name: 'Sari la conținut' })).toHaveAttribute(
      'href',
      '#continut',
    )
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'continut')
    // Focusable by script/fragment only, so the skip link moves keyboard focus into it.
    expect(main).toHaveAttribute('tabindex', '-1')
  })

  it('links the logo back to the home page', () => {
    renderWithRouter(TEST_ROUTES, '/test')

    const banner = screen.getByRole('banner')
    expect(within(banner).getByRole('link', { name: /Obcina/ })).toHaveAttribute('href', '/')
  })

  it('states that this is a demo shop with no real payments', () => {
    renderWithRouter(TEST_ROUTES, '/test')

    expect(screen.getByText(/nu se procesează plăți reale/i)).toBeInTheDocument()
  })
})
