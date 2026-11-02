import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Ornament } from './Ornament'

describe('Ornament', () => {
  it('is a purely decorative drawing', () => {
    const { container } = render(<Ornament />)

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(container.textContent).toBe('')
  })
})
