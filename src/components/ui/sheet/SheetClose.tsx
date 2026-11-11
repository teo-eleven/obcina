import { Dialog } from '@base-ui/react/dialog'
import type { ReactNode } from 'react'

interface SheetCloseProps {
  readonly children: ReactNode
  readonly className?: string
}

/** A button that closes the sheet (Base UI calls onOpenChange(false) and restores focus). */
export function SheetClose({ children, className = '' }: SheetCloseProps) {
  return <Dialog.Close className={className}>{children}</Dialog.Close>
}
