import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CATEGORIES } from '../data/categories'
import { CategoryIcon } from './CategoryIcon'

describe('CategoryIcon', () => {
  it.each(CATEGORIES.map((category) => category.slug))('draws a decorative svg for %s', (slug) => {
    const { container } = render(<CategoryIcon slug={slug} />)

    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).not.toHaveAttribute('role')
    expect(svg?.querySelector('path, circle, rect, ellipse')).not.toBeNull()
  })

  it('draws a different icon for every category', () => {
    const drawings = CATEGORIES.map((category) => {
      const { container, unmount } = render(<CategoryIcon slug={category.slug} />)
      const drawing = container.querySelector('svg')?.innerHTML
      unmount()
      return drawing
    })

    expect(new Set(drawings).size).toBe(CATEGORIES.length)
  })

  it('uses a default size, replaced (not combined) by the caller size', () => {
    const { container, rerender } = render(<CategoryIcon slug="miere" />)
    expect(container.querySelector('svg')).toHaveClass('size-12')

    rerender(<CategoryIcon slug="miere" className="size-16" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('size-16')
    expect(svg).not.toHaveClass('size-12')
  })
})
