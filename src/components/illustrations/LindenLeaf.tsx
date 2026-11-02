/* Linden (tei) leaf: heart-shaped base at the stalk, pointed tip, veins from the midrib. */
export function LindenLeaf({ className = '' }: { readonly className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 124" fill="none" className={className}>
      <path
        d="M60 98C44 108 18 98 16 72 14 46 36 22 60 8c24 14 46 38 44 64-2 26-28 36-44 26z"
        className="fill-brad-100 stroke-brad-500"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M60 98V16M60 40 42 30M60 40l18-10M60 60 34 48M60 60l26-12M60 80 36 72M60 80l24-8"
        className="stroke-brad-500"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M60 98c0 8-2 14-7 19"
        className="stroke-lemn-600"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
