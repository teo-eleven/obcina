import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithRouter } from '../test/renderWithRouter'
import { CartButton } from './CartButton'

// The drawer's code can't be downloaded (offline, or a deploy replaced the chunk).
vi.mock('./CartDrawer', () => {
  throw new Error('Failed to fetch dynamically imported module')
})

describe('CartButton when the drawer cannot load', () => {
  it('keeps the page and the button, says what happened, and lets the visitor try again', async () => {
    const user = userEvent.setup()
    renderWithRouter([{ path: '*', element: <CartButton /> }])
    const button = screen.getByRole('button', { name: /^Coș \d/ })

    await user.click(button)

    expect(
      await screen.findByText(
        'Nu am putut deschide coșul. Verifică conexiunea și încearcă din nou.',
      ),
    ).toBeInTheDocument()
    expect(button).toBeEnabled()
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
