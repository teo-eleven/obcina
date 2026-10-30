import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Logo } from './Logo'

describe('Logo', () => {
  it('exposes the brand name to screen readers as text, with a decorative mark', () => {
    const { container } = render(<Logo />)

    expect(screen.getByText('Obcina').closest('[aria-hidden="true"]')).toBeNull()
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('shows the tagline only when asked', () => {
    const { rerender } = render(<Logo />)
    expect(screen.queryByText('cămară de munte din Bucovina')).not.toBeInTheDocument()

    rerender(<Logo withTagline />)
    const tagline = screen.getByText('cămară de munte din Bucovina')
    expect(tagline).toBeInTheDocument()
    expect(tagline.closest('[aria-hidden="true"]')).toBeNull()
  })
})
