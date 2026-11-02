import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Label } from './Label'

describe('Label', () => {
  it('renders its content inside the jar-label frame', () => {
    render(
      <Label>
        <h3>Miere de tei</h3>
      </Label>,
    )

    const heading = screen.getByRole('heading', { name: 'Miere de tei' })
    expect(heading.closest('[data-label]')).not.toBeNull()
  })

  it('lets the caller size the frame', () => {
    render(<Label className="h-full">conținut</Label>)

    expect(screen.getByText('conținut').closest('[data-label]')).toHaveClass('h-full')
  })
})
