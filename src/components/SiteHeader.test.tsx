import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '../test/renderWithRouter'
import { SiteHeader } from './SiteHeader'

describe('SiteHeader', () => {
  it('contains the cart button', () => {
    renderWithRouter([{ path: '*', element: <SiteHeader /> }])

    const banner = screen.getByRole('banner')
    expect(within(banner).getByRole('button', { name: /^Coș \d/ })).toBeInTheDocument()
  })
})
