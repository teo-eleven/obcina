import { Dialog } from '@base-ui/react/dialog'
import type { ReactNode, RefObject } from 'react'

interface SheetContentProps {
  readonly children: ReactNode
  /** Width and spacing; the panel always sits on the right edge, full height. */
  readonly className?: string
  /** Where focus goes when the sheet closes (the button that opened it). */
  readonly finalFocus?: RefObject<HTMLElement | null>
}

/**
 * The sheet itself, rendered in a portal over a dimmed backdrop. Base UI traps focus inside it,
 * closes it on Escape or a click outside, and labels it with SheetTitle.
 */
export function SheetContent({
  children,
  className = 'w-full max-w-sm',
  finalFocus,
}: SheetContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop className="bg-brad-900/40 fixed inset-0 z-40 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
      <Dialog.Popup
        finalFocus={finalFocus}
        className={`bg-crema-50 text-lemn-800 fixed inset-y-0 right-0 z-50 flex flex-col overflow-y-auto shadow-xl transition-transform data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full motion-reduce:transition-none ${className}`}
      >
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  )
}
