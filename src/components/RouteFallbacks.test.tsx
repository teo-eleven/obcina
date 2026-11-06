import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppLoading, RouteError } from './RouteFallbacks'

describe('route fallbacks', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('announces that the shop is opening while a page downloads', () => {
    render(<AppLoading />)

    expect(screen.getByRole('status')).toHaveTextContent('Se deschide cămara…')
  })

  it('reloads the page when the visitor asks', async () => {
    const reload = vi.fn()
    vi.stubGlobal('location', { ...window.location, reload })
    render(<RouteError />)

    await userEvent.click(screen.getByRole('button', { name: 'Reîncarcă pagina' }))

    expect(reload).toHaveBeenCalledTimes(1)
  })
})
