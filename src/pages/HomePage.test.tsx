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

  it('shows every category on a jar label', () => {
    render(<HomePage />)

    for (const category of CATEGORIES) {
      const heading = screen.getByRole('heading', { name: category.name })
      expect(heading.closest('[data-label]')).not.toBeNull()
    }
  })

  it('gives every category a decorative icon on its label', () => {
    render(<HomePage />)

    for (const category of CATEGORIES) {
      const label = screen.getByRole('heading', { name: category.name }).closest('[data-label]')
      const icon = label?.querySelector('svg')
      expect(icon, `${category.name} has no icon`).not.toBeNull()
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it('accents the headings visually with <i>, not with stressed <em>', () => {
    render(<HomePage />)

    const headings = screen.getAllByRole('heading').filter((h) => /^H[12]$/.test(h.tagName))
    expect(headings.length).toBeGreaterThanOrEqual(3)
    for (const heading of headings) {
      expect(heading.querySelector('i'), heading.textContent ?? '').not.toBeNull()
      expect(heading.querySelector('em')).toBeNull()
    }
  })

  it('stamps the hero and the story with the brand origin', () => {
    render(<HomePage />)

    expect(screen.getByText('Din Bucovina, în cămara ta').closest('[data-stamp]')).not.toBeNull()
    expect(screen.getByText('Făcut în Bucovina').closest('[data-stamp]')).not.toBeNull()
  })

  it('keeps every illustration hidden from screen readers', () => {
    const { container } = render(<HomePage />)

    const drawings = [...container.querySelectorAll('svg')]
    expect(drawings.length).toBeGreaterThan(CATEGORIES.length)
    for (const svg of drawings) {
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it('leads the call to action to the categories', () => {
    render(<HomePage />)

    expect(screen.getByRole('link', { name: 'Vezi ce avem în cămară' })).toHaveAttribute(
      'href',
      '#categorii',
    )
  })
})
