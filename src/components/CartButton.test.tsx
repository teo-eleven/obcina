import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SEED_PRODUCTS } from '../constants/seedProducts'
import { cartStore } from '../stores'
import { renderWithRouter } from '../test/renderWithRouter'
import { CartButton } from './CartButton'

const fetchProductsBySlugs = vi.hoisted(() => vi.fn())
vi.mock('../services/productsRepository', () => ({ fetchProductsBySlugs }))

// The drawer is a lazy chunk: its first download can take a while on a busy machine or in CI.
const LAZY = { timeout: 5000 }

function renderButton() {
  return renderWithRouter([{ path: '*', element: <CartButton /> }])
}

describe('CartButton', () => {
  beforeEach(() => {
    fetchProductsBySlugs.mockImplementation((slugs: readonly string[]) =>
      Promise.resolve(slugs.flatMap((slug) => SEED_PRODUCTS.filter((p) => p.slug === slug))),
    )
  })

  it('is a button of type button named "Coș 0 produse" for an empty cart', () => {
    renderButton()

    const button = screen.getByRole('button', { name: 'Coș 0 produse' })
    expect(button).toHaveAttribute('type', 'button')
  })

  it('counts the sum of the quantities in its accessible name', () => {
    cartStore.addItem('miere-de-tei', 2)
    cartStore.addItem('gem-de-zmeura')

    renderButton()

    expect(screen.getByRole('button', { name: 'Coș 3 produse' })).toBeInTheDocument()
  })

  it('updates its name when the cart changes', async () => {
    renderButton()
    expect(screen.getByRole('button', { name: 'Coș 0 produse' })).toBeInTheDocument()

    cartStore.addItem('miere-de-tei')

    expect(await screen.findByRole('button', { name: 'Coș 1 produs' })).toBeInTheDocument()
  })

  // WCAG 2.5.3: the name starts with what is on screen ("Coș 3"), so voice control finds it.
  it('is named by its visible text plus a hidden noun, with no aria-label', () => {
    cartStore.addItem('miere-de-tei', 2)
    cartStore.addItem('gem-de-zmeura')

    renderButton()

    const button = screen.getByRole('button', { name: 'Coș 3 produse' })
    expect(button).not.toHaveAttribute('aria-label')
    expect(screen.getByText('3')).not.toHaveAttribute('aria-hidden')
  })

  it('uses "de" in the hidden noun from 20 on', () => {
    cartStore.addItem('miere-de-tei', 20)

    renderButton()

    expect(screen.getByRole('button', { name: 'Coș 20 de produse' })).toBeInTheDocument()
  })

  it('announces that it opens a dialog, closed at first', () => {
    renderButton()

    const button = screen.getByRole('button', { name: /^Coș \d/ })
    expect(button).toHaveAttribute('aria-haspopup', 'dialog')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the cart drawer on click and says it is expanded', async () => {
    const user = userEvent.setup()
    renderButton()

    await user.click(screen.getByRole('button', { name: /^Coș \d/ }))

    expect(await screen.findByRole('dialog', { name: 'Coșul tău' }, LAZY)).toBeInTheDocument()
    // While the modal is open the page behind it is aria-hidden, so its text name is empty there.
    expect(screen.getByRole('button', { expanded: true, hidden: true })).toBeInTheDocument()
  })

  it('does not load the drawer before the first open', () => {
    cartStore.addItem('miere-de-tei')

    renderButton()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(fetchProductsBySlugs).not.toHaveBeenCalled()
  })

  it('closes on Escape and gives focus back to the button', async () => {
    const user = userEvent.setup()
    renderButton()
    const button = screen.getByRole('button', { name: /^Coș \d/ })
    await user.click(button)
    await screen.findByRole('dialog', { name: 'Coșul tău' }, LAZY)

    await user.keyboard('{Escape}')

    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(button).toHaveFocus()
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens again after closing, from the drawer already downloaded', async () => {
    const user = userEvent.setup()
    renderButton()
    const button = screen.getByRole('button', { name: /^Coș \d/ })
    await user.click(button)
    await screen.findByRole('dialog', { name: 'Coșul tău' }, LAZY)
    await user.keyboard('{Escape}')
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    await user.click(button)

    expect(screen.getByRole('dialog', { name: 'Coșul tău' })).toBeInTheDocument()
  })
})
