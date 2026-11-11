import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Sheet, SheetClose, SheetContent, SheetTitle } from './index'

describe('Sheet', () => {
  it('renders a dialog labelled by its title when open', () => {
    render(
      <Sheet open onOpenChange={() => undefined}>
        <SheetContent>
          <SheetTitle>Coșul tău</SheetTitle>
          <SheetClose>Închide</SheetClose>
        </SheetContent>
      </Sheet>,
    )

    expect(screen.getByRole('dialog', { name: 'Coșul tău' })).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    render(
      <Sheet open={false} onOpenChange={() => undefined}>
        <SheetContent>
          <SheetTitle>Coșul tău</SheetTitle>
        </SheetContent>
      </Sheet>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Coșul tău')).not.toBeInTheDocument()
  })

  it('asks to close on Escape', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Sheet open onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetTitle>Coșul tău</SheetTitle>
          <SheetClose>Închide</SheetClose>
        </SheetContent>
      </Sheet>,
    )

    await user.keyboard('{Escape}')

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything())
  })

  it('asks to close when the close button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Sheet open onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetTitle>Coșul tău</SheetTitle>
          <SheetClose>Închide</SheetClose>
        </SheetContent>
      </Sheet>,
    )

    await user.click(screen.getByRole('button', { name: 'Închide' }))

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything())
  })

  it('passes className on to the dialog popup', () => {
    render(
      <Sheet open onOpenChange={() => undefined}>
        <SheetContent className="test-extra w-96">
          <SheetTitle>Coșul tău</SheetTitle>
        </SheetContent>
      </Sheet>,
    )

    expect(screen.getByRole('dialog', { name: 'Coșul tău' })).toHaveClass('w-96', 'test-extra')
  })

  it('moves focus to the finalFocus element after closing', async () => {
    const user = userEvent.setup()
    function Harness() {
      const [open, setOpen] = useState(true)
      const returnTo = useRef<HTMLButtonElement>(null)
      return (
        <>
          <button type="button" ref={returnTo}>
            Înapoi aici
          </button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent finalFocus={returnTo}>
              <SheetTitle>Coșul tău</SheetTitle>
              <SheetClose>Închide</SheetClose>
            </SheetContent>
          </Sheet>
        </>
      )
    }
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Închide' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Înapoi aici' })).toHaveFocus()
  })
})
