import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { CATEGORIES } from '../data/categories'
import { HomePage } from './HomePage'

// Category cards are router links, so the page needs a router around it.
const renderHome = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )

describe('HomePage', () => {
  it('renders a single main heading', () => {
    renderHome()

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('lists every category', () => {
    renderHome()

    const list = screen.getByRole('list', { name: 'Categorii' })
    for (const category of CATEGORIES) {
      expect(within(list).getByRole('heading', { name: category.name })).toBeInTheDocument()
    }
  })

  it('links every category to its own page', () => {
    renderHome()

    const list = screen.getByRole('list', { name: 'Categorii' })
    for (const category of CATEGORIES) {
      const link = within(list).getByRole('link', { name: category.name })
      expect(link).toHaveAttribute('href', `/categorie/${category.slug}`)
    }
  })

  it('shows every category on a jar label', () => {
    renderHome()

    for (const category of CATEGORIES) {
      const heading = screen.getByRole('heading', { name: category.name })
      expect(heading.closest('[data-label]')).not.toBeNull()
    }
  })

  it('gives every category a decorative icon on its label', () => {
    renderHome()

    for (const category of CATEGORIES) {
      const label = screen.getByRole('heading', { name: category.name }).closest('[data-label]')
      const icon = label?.querySelector('svg')
      expect(icon, `${category.name} has no icon`).not.toBeNull()
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it('accents the headings visually with <i>, not with stressed <em>', () => {
    renderHome()

    const headings = screen.getAllByRole('heading').filter((h) => /^H[12]$/.test(h.tagName))
    expect(headings.length).toBeGreaterThanOrEqual(3)
    for (const heading of headings) {
      expect(heading.querySelector('i'), heading.textContent ?? '').not.toBeNull()
      expect(heading.querySelector('em')).toBeNull()
    }
  })

  it('stamps the hero and the story with the brand origin', () => {
    renderHome()

    expect(screen.getByText('Din Bucovina, în cămara ta').closest('[data-stamp]')).not.toBeNull()
    expect(screen.getByText('Făcut în Bucovina').closest('[data-stamp]')).not.toBeNull()
  })

  it('keeps every illustration hidden from screen readers', () => {
    const { container } = renderHome()

    const drawings = [...container.querySelectorAll('svg')]
    expect(drawings.length).toBeGreaterThan(CATEGORIES.length)
    for (const svg of drawings) {
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it('shows a Bucovina photo in the story, lazy-loaded at the right size, crediting its author', () => {
    renderHome()

    const figure = screen.getByRole('figure')
    const photo = within(figure).getByRole('img', { name: /fânețe.*Poiana Negrii/i })
    expect(photo).toHaveAttribute('loading', 'lazy')
    expect(photo).toHaveAttribute('width', '1200')
    expect(photo).toHaveAttribute('height', '598')
    expect(photo.getAttribute('srcset')?.split(', ')).toEqual([
      '/images/atmosfera/poiana-negrii-640.webp 640w',
      '/images/atmosfera/poiana-negrii-800.webp 800w',
      '/images/atmosfera/poiana-negrii-1200.webp 1200w',
    ])

    const credit = within(figure).getByRole('link', { name: 'Sinziana Mihalache' })
    expect(credit).toHaveAttribute('href', 'https://unsplash.com/@sinzianamihalache')
  })

  it('leads the call to action to the categories', () => {
    renderHome()

    expect(screen.getByRole('link', { name: 'Vezi ce avem în cămară' })).toHaveAttribute(
      'href',
      '#categorii',
    )
  })
})
