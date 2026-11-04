import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Outlet } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { renderWithRouter } from '../test/renderWithRouter'
import { MainNav } from './MainNav'

// MainNav lives in a persistent layout, like the real header, so it survives page changes.
const ROUTES = [
  {
    element: (
      <>
        <MainNav />
        <Outlet />
      </>
    ),
    children: [
      { path: '/', element: <button type="button">În afara meniului</button> },
      { path: '/alta', element: <p>Altă pagină</p> },
    ],
  },
]

function setup(path = '/') {
  const user = userEvent.setup()
  const result = renderWithRouter(ROUTES, path)
  const toggle = screen.getByRole('button', { name: 'Meniu' })
  const panel = document.getElementById(toggle.getAttribute('aria-controls') ?? '')
  return { user, toggle, panel, ...result }
}

describe('MainNav', () => {
  it('starts closed, with a menu button that controls the link list', () => {
    const { toggle, panel } = setup()

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(panel).not.toBeNull()
    expect(within(panel!).getAllByRole('link').length).toBeGreaterThan(0)
    expect(panel).toHaveAttribute('data-open', 'false')
  })

  it('opens from the keyboard and moves focus to the first link', async () => {
    const { user, toggle, panel } = setup()

    toggle.focus()
    await user.keyboard('{Enter}')

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(panel).toHaveAttribute('data-open', 'true')
    expect(within(panel!).getAllByRole('link')[0]).toHaveFocus()
  })

  it('also toggles with Space', async () => {
    const { user, toggle } = setup()

    toggle.focus()
    await user.keyboard(' ')
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    toggle.focus()
    await user.keyboard(' ')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes on Escape and returns focus to the menu button', async () => {
    const { user, toggle } = setup()

    await user.click(toggle)
    await user.keyboard('{Escape}')

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })

  it('closes on Escape without stealing focus from elsewhere on the page', async () => {
    const { user, toggle } = setup()
    await user.click(toggle)
    const outside = screen.getByRole('button', { name: 'În afara meniului' })
    // Focus can sit outside the menu while it is still open (e.g. a click-only blur in Safari).
    const activeElement = vi.spyOn(document, 'activeElement', 'get').mockReturnValue(outside)

    await user.keyboard('{Escape}')
    activeElement.mockRestore()

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).not.toHaveFocus()
  })

  it('closes when the keyboard tabs out of the menu', async () => {
    const { user, toggle } = setup()

    await user.click(toggle)
    await user.tab() // first link -> last link
    await user.tab() // last link -> the next control on the page
    expect(screen.getByRole('button', { name: 'În afara meniului' })).toHaveFocus()

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes from the button even where clicking a button does not focus it (Safari)', async () => {
    const { user, toggle, panel } = setup()
    await user.click(toggle)
    const firstLink = within(panel!).getAllByRole('link')[0]!
    expect(firstLink).toHaveFocus()

    // Safari/Firefox on macOS: the link blurs with no relatedTarget, then the click lands.
    fireEvent.pointerDown(toggle)
    fireEvent.blur(firstLink, { relatedTarget: null })
    fireEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes on a click outside the menu', async () => {
    const { user, toggle } = setup()

    await user.click(toggle)
    await user.click(screen.getByRole('button', { name: 'În afara meniului' }))

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes after choosing a link', async () => {
    const { user, toggle, panel } = setup()

    await user.click(toggle)
    await user.click(within(panel!).getAllByRole('link')[0]!)

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes when the page changes', async () => {
    const { user, toggle, router } = setup()

    await user.click(toggle)
    await act(() => router.navigate('/alta'))

    expect(screen.getByText('Altă pagină')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Meniu' })).toBe(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes when choosing the link for the section already in the url', async () => {
    const { user, toggle, panel } = setup('/#categorii')

    await user.click(toggle)
    await user.click(within(panel!).getByRole('link', { name: 'Categorii' }))

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})
