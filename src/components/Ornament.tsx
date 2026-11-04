interface OrnamentProps {
  readonly className?: string
}

/* Hand-drawn divider: two wavy lines meeting at three small fir trees. */
export function Ornament({ className = '' }: OrnamentProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 28"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-brad-500 h-7 w-60 ${className}`}
    >
      <path
        d="M6 16c14-2.4 28 1.8 42-.4s28-2 42 .2M150 15.6c14-2.2 28 2 42-.2s28-1.8 42 .4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M108 22l6-15 6 15zM120 22l5-12 5 12zM98 22l5-12 5 12z" className="fill-brad-500" />
      <path d="M114 22v4M125 22v3M103 22v3" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
