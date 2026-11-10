import { Jar } from './Jar'

const SHELF_TOP = 200

/* Hero illustration: three jars (jam, honey, zacuscă) on a wooden pantry shelf. */
export function PantryShelf({ className = '' }: { readonly className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 320 250" className={className}>
      <Jar x={34} width={72} height={112} contentsClass="fill-afina-500" bottom={SHELF_TOP} />
      <Jar x={122} width={82} height={142} contentsClass="fill-miere-300" bottom={SHELF_TOP} />
      <Jar x={220} width={66} height={92} contentsClass="fill-miere-500" bottom={SHELF_TOP} />
      <rect
        x="12"
        y={SHELF_TOP}
        width="296"
        height="14"
        rx="3"
        className="fill-lemn-600 stroke-brad-900"
        strokeWidth="3"
      />
      <path d="M44 214v28l20-28zM276 214v28l-20-28z" className="fill-lemn-800" />
    </svg>
  )
}
