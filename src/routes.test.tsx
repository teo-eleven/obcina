import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { RouteObject } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { routes } from './routes'
import { renderWithRouter } from './test/renderWithRouter'

// The real app routes plus one extra page, to test navigation from outside the home page.
const rootRoute = routes[0]
const TEST_ROUTES: RouteObject[] = [
  {
    element: rootRoute?.element,
    children: [...(rootRoute?.children ?? []), { path: 'test', element: <p>Altă pagină</p> }],
  },
]

// jsdom has no scrollIntoView; tests that need it stub it and we restore the original here.
const originalScrollIntoView = Element.prototype.scrollIntoView

describe('app routes', () => {
  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView
  })

  it('renders the home page inside the shared layout', () => {
    renderWithRouter(routes, '/')

    const main = screen.getByRole('main')
    expect(within(main).getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('points every navigation link at a home page section that exists', () => {
    const { container } = renderWithRouter(routes, '/')

    const nav = screen.getByRole('navigation', { name: 'Principal' })
    for (const link of within(nav).getAllByRole('link')) {
      const [path, id] = (link.getAttribute('href') ?? '').split('#')
      expect(path).toBe('/')
      expect(id).toBeTruthy()
      expect(container.querySelector(`[id="${id}"]`)).not.toBeNull()
    }
  })

  it('navigates from another page to a home section in-app and scrolls to it', async () => {
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    const { router } = renderWithRouter(TEST_ROUTES, '/test')
    const banner = screen.getByRole('banner')

    await userEvent.click(screen.getByRole('link', { name: 'Povestea' }))

    expect(router.state.location.pathname).toBe('/')
    expect(router.state.location.hash).toBe('#povestea')
    expect(screen.getByRole('banner')).toBe(banner)
    await waitFor(() => {
      expect(scrollIntoView.mock.contexts.at(-1)).toBe(document.getElementById('povestea'))
    })
  })

  it.each(['/nu-exista', '/produse/dulceata/inexistent'])(
    'shows the not-found page inside the layout for %s',
    (path) => {
      renderWithRouter(routes, path)

      const main = screen.getByRole('main')
      expect(
        within(main).getByRole('heading', { level: 1, name: /nu e în cămară/i }),
      ).toBeInTheDocument()
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    },
  )

  it('takes the visitor from the not-found page back home', async () => {
    const { router } = renderWithRouter(routes, '/nu-exista')

    await userEvent.click(screen.getByRole('link', { name: 'Înapoi în cămară' }))

    expect(router.state.location.pathname).toBe('/')
    expect(
      within(screen.getByRole('main')).getByRole('heading', { level: 1, name: /Gusturi de munte/ }),
    ).toBeInTheDocument()
  })

  it('sends the visitor from the not-found page to the home categories', async () => {
    Element.prototype.scrollIntoView = vi.fn()
    const { router } = renderWithRouter(routes, '/nu-exista')

    await userEvent.click(screen.getByRole('link', { name: 'Vezi categoriile' }))

    expect(router.state.location.pathname).toBe('/')
    expect(router.state.location.hash).toBe('#categorii')
    expect(document.getElementById('categorii')).not.toBeNull()
  })
})
