/* 404 illustration: an empty jar with a question mark on its label. */
export function EmptyJar({ className = '' }: { readonly className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 150" className={className}>
      <rect x="30" y="8" width="60" height="18" rx="4" className="fill-lemn-600" />
      <rect x="26" y="22" width="68" height="8" rx="3" className="fill-lemn-800" />
      <path
        d="M34 30 h52 c10 8 14 18 14 30 v62 c0 12 -8 20 -20 20 h-40 c-12 0 -20 -8 -20 -20 v-62 c0 -12 4 -22 14 -30 z"
        className="fill-crema-50 stroke-brad-700"
        strokeWidth="3"
      />
      <rect
        x="30"
        y="66"
        width="60"
        height="44"
        rx="4"
        className="fill-in-100 stroke-lemn-600"
        strokeWidth="2"
      />
      <text
        x="60"
        y="100"
        textAnchor="middle"
        className="fill-afina-500 font-display text-[32px] font-semibold"
      >
        ?
      </text>
      <path d="M40 46 q4 -6 10 -6" className="stroke-brad-100" strokeWidth="4" fill="none" />
    </svg>
  )
}
