import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { RouteObject } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Layout, RouteError } from './components'
import { routes } from './routes'
import { SEED_PRODUCTS } from './constants/seedProducts'
import { fetchCategoryProducts, fetchProduct } from './services'
import { stubMatchMedia } from './test/matchMedia'
import { renderWithRouter } from './test/renderWithRouter'

vi.mock('./services/productsRepository')

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

  it('renders the category page for a known category', async () => {
    vi.mocked(fetchCategoryProducts).mockResolvedValue([])

    renderWithRouter(routes, '/categorie/miere')

    expect(await screen.findByRole('heading', { level: 1, name: 'Miere' })).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders the product page for /produs/:slug', async () => {
    const tea = SEED_PRODUCTS.find((product) => product.slug === 'miere-de-tei') ?? null
    vi.mocked(fetchProduct).mockResolvedValue(tea)

    renderWithRouter(routes, '/produs/miere-de-tei')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Miere de tei' }),
    ).toBeInTheDocument()
  })

  it('shows a fallback while a lazy page loads on first visit, and a Romanian error page', () => {
    expect(rootRoute?.HydrateFallback).toBeDefined()
    expect(rootRoute?.ErrorBoundary).toBe(RouteError)
  })

  it('shows a Romanian error page with a reload button when a page fails to load', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const failing: RouteObject[] = [
      {
        ErrorBoundary: RouteError,
        children: [{ index: true, lazy: () => Promise.reject(new Error('chunk failed')) }],
      },
    ]

    renderWithRouter(failing, '/')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Pagina nu s-a putut deschide' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reîncarcă pagina' })).toBeInTheDocument()
  })

  it('starts a newly opened page at the top', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    const { router } = renderWithRouter(TEST_ROUTES, '/')
    scrollTo.mockClear()

    await act(async () => {
      await router.navigate('/test')
    })

    expect(scrollTo).toHaveBeenCalledWith(0, 0)
    scrollTo.mockRestore()
  })

  it('marks the page busy while the next page is still loading', async () => {
    let release: () => void = () => undefined
    const pending = new Promise<void>((resolve) => {
      release = resolve
    })
    const slow: RouteObject[] = [
      {
        element: <Layout />,
        children: [
          { index: true, element: <a href="/incet">Mergi</a> },
          {
            path: 'incet',
            lazy: async () => {
              await pending
              return { Component: () => <h1>Gata</h1> }
            },
          },
        ],
      },
    ]
    const { router } = renderWithRouter(slow, '/')

    act(() => {
      void router.navigate('/incet')
    })

    await waitFor(() => expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true'))
    await act(async () => release())
    expect(await screen.findByRole('heading', { name: 'Gata' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false')
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

  // Smooth scrolling is only for jumping to a section; the page itself has no global smooth
  // scroll, so starting a new page at the top is instant and can't be cut short by a reflow.
  it.each([
    [false, 'smooth'],
    [true, 'auto'],
  ])('scrolls to a section smoothly unless reduced motion is %s', async (reduce, behavior) => {
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    stubMatchMedia(reduce)
    renderWithRouter(TEST_ROUTES, '/test')

    await userEvent.click(screen.getByRole('link', { name: 'Povestea' }))

    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledWith({ behavior }))
    stubMatchMedia()
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
