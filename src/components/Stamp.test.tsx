import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Stamp } from './Stamp'

const stampOf = (text: string) => screen.getByText(text).closest('[data-stamp]')

describe('Stamp', () => {
  it('keeps its text in the accessibility tree as written (case is only visual)', () => {
    render(<Stamp>Făcut în Bucovina</Stamp>)

    expect(stampOf('Făcut în Bucovina')).toHaveTextContent('Făcut în Bucovina')
  })

  it('is inked in afina by default', () => {
    render(<Stamp>Din Bucovina</Stamp>)

    expect(stampOf('Din Bucovina')).toHaveClass('text-afina-700')
  })

  it('can be inked in brad', () => {
    render(<Stamp tone="brad">Din Bucovina</Stamp>)

    const stamp = stampOf('Din Bucovina')
    expect(stamp).toHaveClass('text-brad-700')
    expect(stamp).not.toHaveClass('text-afina-700')
  })

  it('lets the caller position it', () => {
    render(<Stamp className="self-start">Din Bucovina</Stamp>)

    expect(stampOf('Din Bucovina')).toHaveClass('self-start')
  })
})
