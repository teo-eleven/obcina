import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppLoading } from './AppLoading'

describe('AppLoading', () => {
  it('announces that the shop is opening while a page downloads', () => {
    render(<AppLoading />)

    expect(screen.getByRole('status')).toHaveTextContent('Se deschide cămara…')
  })
})
