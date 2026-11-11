import { Dialog } from '@base-ui/react/dialog'
import type { ReactNode } from 'react'

interface SheetTitleProps {
  readonly children: ReactNode
  readonly className?: string
}

/** The sheet's heading; it also names the dialog for assistive technology. */
export function SheetTitle({ children, className = '' }: SheetTitleProps) {
  return <Dialog.Title className={className}>{children}</Dialog.Title>
}
