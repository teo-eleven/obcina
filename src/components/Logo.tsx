interface LogoProps {
  readonly withTagline?: boolean
  readonly className?: string
}

export function Logo({ withTagline = false, className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 64 64" className="size-10 shrink-0">
        <circle cx="44" cy="20" r="8" className="fill-miere-300" />
        <path d="M0 40 C14 26 26 26 38 36 C46 30 56 30 64 36 V64 H0 Z" className="fill-brad-500" />
        <path d="M0 48 C12 38 24 38 34 46 C44 38 54 40 64 46 V64 H0 Z" className="fill-brad-700" />
        <path d="M0 56 C16 48 30 48 42 54 C50 50 58 50 64 54 V64 H0 Z" className="fill-brad-900" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-brad-900 text-2xl font-semibold">Obcina</span>
        {withTagline && (
          <span className="text-lemn-600 mt-1 text-xs tracking-wide">
            cămară de munte din Bucovina
          </span>
        )}
      </span>
    </span>
  )
}
