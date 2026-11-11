import { Dialog } from '@base-ui/react/dialog'
import type { ReactNode } from 'react'

interface SheetProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly children: ReactNode
}

/** A panel that slides in from the side of the screen: a modal dialog (shadcn Sheet on Base UI). */
export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  )
}
