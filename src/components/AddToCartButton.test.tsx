import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MAX_LINE_QUANTITY } from '../constants'
import { SEED_PRODUCTS } from '../constants/seedProducts'
import { cartStore } from '../stores'
import type { Product } from '../types'
import { lineQuantity } from '../utils'
import { AddToCartButton } from './AddToCartButton'

function seed(slug: string): Product {
  const product = SEED_PRODUCTS.find((candidate) => candidate.slug === slug)
  if (!product) throw new Error(`Missing seed product ${slug}`)
  return product
}

const honey = seed('miere-de-tei')
const seaBuckthorn = seed('dulceata-de-catina') // stock 3
const soldOut = seed('branza-in-coaja-de-brad') // stock 0
const basket = seed('cos-mic-dejun-la-stana')

describe('AddToCartButton', () => {
  it('renders a button of type button named "Adaugă în coș"', () => {
    render(<AddToCartButton product={honey} />)

    const button = screen.getByRole('button', { name: 'Adaugă în coș' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toBeEnabled()
  })

  it('adds one of the product slug to the cart on every click', async () => {
    const user = userEvent.setup()
    render(<AddToCartButton product={honey} />)

    await user.click(screen.getByRole('button', { name: 'Adaugă în coș' }))
    await user.click(screen.getByRole('button', { name: 'Adaugă în coș' }))

    expect(lineQuantity(cartStore.getSnapshot(), honey.slug)).toBe(2)
  })

  it('has an empty polite status while the product is not in the cart', () => {
    render(<AddToCartButton product={honey} />)

    const status = screen.getByRole('status')
    expect(status).toBeEmptyDOMElement()
    expect(status).toHaveAttribute('aria-live', 'polite')
  })

  it('announces the quantity in the cart after two clicks', async () => {
    const user = userEvent.setup()
    render(<AddToCartButton product={honey} />)

    await user.click(screen.getByRole('button', { name: 'Adaugă în coș' }))
    await user.click(screen.getByRole('button', { name: 'Adaugă în coș' }))

    expect(screen.getByRole('status')).toHaveTextContent('În coș: 2 buc.')
  })

  it('disables the button and says the whole stock is in the cart at the limit', async () => {
    const user = userEvent.setup()
    render(<AddToCartButton product={seaBuckthorn} />)

    for (let i = 0; i < 3; i += 1) {
      await user.click(screen.getByRole('button', { name: 'Adaugă în coș' }))
    }

    const button = screen.getByRole('button', { name: 'Adaugă în coș' })
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Ai în coș tot stocul: 3 buc.')
    expect(lineQuantity(cartStore.getSnapshot(), seaBuckthorn.slug)).toBe(3)
  })

  // Not `disabled`: a natively disabled button drops keyboard focus on the click that reaches the
  // limit (checked in a real browser in e2e/cart.spec.ts). It stays focusable and does nothing.
  it('keeps the button focusable at the limit and ignores further clicks', async () => {
    const user = userEvent.setup()
    render(<AddToCartButton product={seaBuckthorn} />)
    const button = screen.getByRole('button', { name: 'Adaugă în coș' })

    for (let i = 0; i < 4; i += 1) await user.click(button)

    expect(button).toBeEnabled()
    expect(button).toHaveFocus()
    expect(lineQuantity(cartStore.getSnapshot(), seaBuckthorn.slug)).toBe(3)
  })

  it('says so when the stock went down below what the cart holds', () => {
    cartStore.addItem(seaBuckthorn.slug, 3)

    render(<AddToCartButton product={{ ...seaBuckthorn, stock: 1 } as Product} />)

    expect(screen.getByRole('status')).toHaveTextContent('Stocul a scăzut: mai sunt doar 1 buc.')
  })

  it('tells a buyer whose product sold out to remove it from the cart', () => {
    cartStore.addItem(soldOut.slug, 1)

    render(<AddToCartButton product={soldOut} />)

    expect(screen.getByRole('button', { name: 'Indisponibil' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Nu mai avem în stoc. Scoate-l din coș.')
  })

  it('reads the whole status when it changes (aria-atomic)', () => {
    render(<AddToCartButton product={honey} />)

    expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'true')
  })

  it('shows the maximum-quantity message for a gift basket at MAX_LINE_QUANTITY', () => {
    cartStore.addItem(basket.slug, MAX_LINE_QUANTITY)

    render(<AddToCartButton product={basket} />)

    expect(screen.getByRole('button', { name: 'Adaugă în coș' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(screen.getByRole('status')).toHaveTextContent('Ai în coș cantitatea maximă: 99 buc.')
  })

  // "Indisponibil", not "Stoc epuizat": the label's stamp already says that, once is enough.
  it('is disabled and named "Indisponibil" from the start for a sold-out product', () => {
    render(<AddToCartButton product={soldOut} />)

    expect(screen.getByRole('button', { name: 'Indisponibil' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Adaugă în coș' })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('shows the quantity of a cart that already holds the product on first render', () => {
    cartStore.addItem(honey.slug, 4)

    render(<AddToCartButton product={honey} />)

    expect(screen.getByRole('status')).toHaveTextContent('În coș: 4 buc.')
  })

  it('applies className to the wrapper', () => {
    const { container } = render(<AddToCartButton product={honey} className="mt-6 w-full" />)

    expect(container.firstElementChild).toHaveClass('mt-6', 'w-full')
    expect(container.firstElementChild).toContainElement(
      screen.getByRole('button', { name: 'Adaugă în coș' }),
    )
  })
})
