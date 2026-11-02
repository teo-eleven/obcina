import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LindenLeaf } from './LindenLeaf'
import { PantryShelf } from './PantryShelf'

describe.each([
  ['PantryShelf', PantryShelf],
  ['LindenLeaf', LindenLeaf],
])('%s', (_name, Illustration) => {
  it('is a purely decorative drawing', () => {
    const { container } = render(<Illustration />)

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(container.textContent).toBe('')
  })

  it('lets the caller size it', () => {
    const { container } = render(<Illustration className="w-40" />)

    expect(container.querySelector('svg')).toHaveClass('w-40')
  })
})
