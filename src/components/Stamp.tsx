import type { ReactNode } from 'react'

const TONES = {
  afina: 'text-afina-700',
  brad: 'text-brad-700',
} as const

interface StampProps {
  readonly children: ReactNode
  readonly tone?: keyof typeof TONES
  readonly className?: string
}

/* A rubber stamp: uppercase text in a double ring, slightly tilted. Used for origin, weight, price. */
export function Stamp({ children, tone = 'afina', className = '' }: StampProps) {
  return (
    <span
      data-stamp
      className={`${TONES[tone]} inline-block -rotate-2 rounded-md border-2 border-current px-3 py-1 text-xs font-bold tracking-[0.18em] uppercase outline-1 outline-offset-2 outline-current ${className}`}
    >
      {children}
    </span>
  )
}
