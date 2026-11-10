import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { SEED_PRODUCTS } from '../constants/seedProducts'
import { formatPrice } from '../utils'
import type { Product } from '../types'
import { ProductCard } from './ProductCard'

function seed(slug: string): Product {
  const product = SEED_PRODUCTS.find((candidate) => candidate.slug === slug)
  if (!product) throw new Error(`Missing seed product ${slug}`)
  return product
}

function renderCard(slug: string, isPriority = false) {
  const product = seed(slug)
  const view = render(
    <MemoryRouter>
      <ul>
        <li>
          <ProductCard product={product} isPriority={isPriority} />
        </li>
      </ul>
    </MemoryRouter>,
  )
  const stamps = Array.from(view.container.querySelectorAll('[data-stamp]'), (node) =>
    (node.textContent ?? '').trim(),
  )
  return { product, view, stamps }
}

describe('ProductCard', () => {
  it('is a label card', () => {
    const { view } = renderCard('miere-de-tei')

    expect(view.container.querySelector('[data-label]')).not.toBeNull()
  })

  it('links the product name, as a heading, to its page', () => {
    const { product } = renderCard('miere-de-tei')

    const heading = screen.getByRole('heading', { level: 2 })
    const link = screen.getByRole('link', { name: product.name })
    expect(heading).toContainElement(link)
    expect(link).toHaveAttribute('href', '/produs/miere-de-tei')
  })

  it('shows the image with its alt text and size', () => {
    const { product } = renderCard('miere-de-tei')

    const image = screen.getByRole('img', { name: product.image.alt })
    expect(image).toHaveAttribute('width', '800')
    expect(image).toHaveAttribute('height', '800')
  })

  it('loads a priority image eagerly with high fetch priority', () => {
    renderCard('miere-de-tei', true)

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('loading', 'eager')
    expect(image).toHaveAttribute('fetchpriority', 'high')
  })

  it('loads a non-priority image lazily without fetch priority', () => {
    renderCard('miere-de-tei', false)

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('loading', 'lazy')
    expect(image).not.toHaveAttribute('fetchpriority')
  })

  it('shows the formatted price as a stamp', () => {
    const { product, stamps } = renderCard('miere-de-tei')

    expect(product.priceBani).toBeGreaterThan(0)
    expect(stamps).toContain(formatPrice(product.priceBani))
  })

  it('shows the weight of a single product', () => {
    const { stamps } = renderCard('dulceata-de-afine')

    expect(screen.getByText('350 g')).toBeInTheDocument()
    expect(stamps).toContain('350 g')
  })

  it('shows the number of products of a gift basket and no weight', () => {
    const { product, stamps } = renderCard('cos-mic-dejun-la-stana')

    expect(stamps).toEqual([formatPrice(product.priceBani), '3 produse'])
  })

  it('warns when only a few are left', () => {
    const { stamps } = renderCard('dulceata-de-catina')

    expect(screen.getByText('Doar 3 în stoc')).toBeInTheDocument()
    expect(stamps).toContain('Doar 3 în stoc')
  })

  it('marks a sold-out product', () => {
    const { stamps } = renderCard('branza-in-coaja-de-brad')

    expect(screen.getByText('Stoc epuizat')).toBeInTheDocument()
    expect(stamps).toContain('Stoc epuizat')
  })

  it('shows no stock badge for a well-stocked product', () => {
    renderCard('miere-de-tei')

    expect(screen.queryByText(/Stoc epuizat/)).not.toBeInTheDocument()
    expect(screen.queryByText(/în stoc/)).not.toBeInTheDocument()
  })

  it('never shows a stock badge on a gift basket', () => {
    renderCard('cos-mic-dejun-la-stana')

    expect(screen.queryByText(/Stoc epuizat/)).not.toBeInTheDocument()
    expect(screen.queryByText(/în stoc/)).not.toBeInTheDocument()
  })
})
