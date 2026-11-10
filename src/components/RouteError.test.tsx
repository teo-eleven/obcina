import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RouteError } from './RouteError'

describe('RouteError', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reloads the page when the visitor asks', async () => {
    const reload = vi.fn()
    vi.stubGlobal('location', { ...window.location, reload })
    render(<RouteError />)

    await userEvent.click(screen.getByRole('button', { name: 'Reîncarcă pagina' }))

    expect(reload).toHaveBeenCalledTimes(1)
  })
})
