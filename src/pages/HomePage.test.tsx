import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CATEGORIES } from '../data/categories'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('renders a single main heading', () => {
    render(<HomePage />)

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('lists every category', () => {
    render(<HomePage />)

    const list = screen.getByRole('list', { name: 'Categorii' })
    for (const category of CATEGORIES) {
      expect(within(list).getByRole('heading', { name: category.name })).toBeInTheDocument()
    }
  })

  it('states that this is a demo shop with no real payments', () => {
    render(<HomePage />)

    expect(screen.getByText(/nu se procesează plăți reale/i)).toBeInTheDocument()
  })

  it('points every navigation link at a section that exists', () => {
    const { container } = render(<HomePage />)

    const nav = screen.getByRole('navigation', { name: 'Principal' })
    for (const link of within(nav).getAllByRole('link')) {
      const id = link.getAttribute('href')?.replace('#', '') ?? ''
      expect(container.querySelector(`[id="${id}"]`)).not.toBeNull()
    }
  })

  it('offers a skip link to the main content', () => {
    render(<HomePage />)

    const skipLink = screen.getByRole('link', { name: 'Sari la conținut' })
    expect(skipLink).toHaveAttribute('href', '#continut')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'continut')
  })
})
