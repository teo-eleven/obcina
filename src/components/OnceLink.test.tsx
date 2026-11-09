import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { RouteObject } from 'react-router'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '../test/renderWithRouter'
import { OnceLink } from './OnceLink'

// Issue #5: a double-tap on WebKit pushed the same product twice, so Back needed two taps.
describe('OnceLink', () => {
  it('does not navigate again to the page you are already on', async () => {
    const routes: RouteObject[] = [{ path: '/raft', element: <OnceLink to="/raft">Raft</OnceLink> }]
    const { router } = renderWithRouter(routes, '/raft')
    const keyBefore = router.state.location.key

    await userEvent.click(screen.getByRole('link', { name: 'Raft' }))

    expect(router.state.location.key).toBe(keyBefore)
  })

  it('navigates normally to another page', async () => {
    const routes: RouteObject[] = [
      { path: '/raft', element: <OnceLink to="/produs">Miere de tei</OnceLink> },
      { path: '/produs', element: <h1>Miere de tei</h1> },
    ]
    const { router } = renderWithRouter(routes, '/raft')

    await userEvent.click(screen.getByRole('link', { name: 'Miere de tei' }))

    expect(router.state.location.pathname).toBe('/produs')
  })

  it('ignores a click once the browser already shows the target (the first tap landed)', () => {
    // jsdom's window.location stays at "/", standing in for a page the browser already moved to.
    const routes: RouteObject[] = [{ path: '/raft', element: <OnceLink to="/">Acasă</OnceLink> }]
    renderWithRouter(routes, '/raft')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })

    screen.getByRole('link', { name: 'Acasă' }).dispatchEvent(event)

    expect(window.location.pathname).toBe('/')
    expect(event.defaultPrevented).toBe(true)
  })

  it.each([
    ['Ctrl', { ctrlKey: true }],
    ['Cmd', { metaKey: true }],
    ['Shift', { shiftKey: true }],
    ['middle button', { button: 1 }],
  ])('leaves a %s click alone, so the page can still open in a new tab', (_label, init) => {
    const routes: RouteObject[] = [{ path: '/raft', element: <OnceLink to="/raft">Raft</OnceLink> }]
    renderWithRouter(routes, '/raft')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...init })

    screen.getByRole('link', { name: 'Raft' }).dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
  })
})
