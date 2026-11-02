import type { ReactNode } from 'react'

interface LabelProps {
  readonly children: ReactNode
  readonly className?: string
}

/*
 * A jar label: paper card with a double thin frame and cut corners.
 * The frame is built from nested chamfered layers (line, paper, faint line, paper), so the
 * lines follow the diagonal corners too — a CSS border would be clipped away there.
 * For even line thickness on the diagonals, a layer inset by t has a cut of c − (2 − √2)·t,
 * i.e. c − 0.586·t: 14 → 13.41 (t=1), 11.66 (t=4), 11.07 (t=5).
 * clip-path also clips focus rings near the corners, so keep focusable content off the edges.
 */
export function Label({ children, className = '' }: LabelProps) {
  return (
    <div data-label className={`chamfer bg-lemn-600 p-px [--chamfer:14px] ${className}`}>
      <div className="chamfer bg-in-100 h-full p-[3px] [--chamfer:13.41px]">
        <div className="chamfer bg-lemn-600/40 h-full p-px [--chamfer:11.66px]">
          <div className="chamfer bg-in-100 paper h-full p-5 [--chamfer:11.07px]">{children}</div>
        </div>
      </div>
    </div>
  )
}
