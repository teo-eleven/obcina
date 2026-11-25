/* The search button's icon: a magnifying glass drawn with the brand ink. */
export function MagnifierIcon({ className = 'size-5' }: { readonly className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" className="stroke-current" strokeWidth="2" />
      <path d="m15.5 15.5 5 5" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
