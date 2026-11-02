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
})
