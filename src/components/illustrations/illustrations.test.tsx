import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyJar } from './EmptyJar'
import { LindenLeaf } from './LindenLeaf'
import { PantryShelf } from './PantryShelf'

describe.each([
  ['PantryShelf', PantryShelf],
  ['EmptyJar', EmptyJar],
  ['LindenLeaf', LindenLeaf],
])('%s', (_name, Illustration) => {
  it('is a purely decorative drawing, hidden from assistive technology as a whole', () => {
    const { container } = render(<Illustration />)

    // The root svg must be hidden: anything drawn inside it, even <text>, is then hidden too.
    const root = container.firstElementChild
    expect(root?.tagName.toLowerCase()).toBe('svg')
    expect(root).toHaveAttribute('aria-hidden', 'true')
  })

  it('lets the caller size it', () => {
    const { container } = render(<Illustration className="w-40" />)

    expect(container.querySelector('svg')).toHaveClass('w-40')
  })
})
