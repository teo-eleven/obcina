interface JarProps {
  readonly x: number
  readonly width: number
  readonly height: number
  readonly contentsClass: string
}

const SHELF_TOP = 200

function Jar({ x, width, height, contentsClass }: JarProps) {
  const top = SHELF_TOP - height
  const labelTop = top + height * 0.42
  return (
    <g>
      <rect
        x={x}
        y={top}
        width={width}
        height={height}
        rx="12"
        className="fill-crema-50 stroke-brad-900"
        strokeWidth="3"
      />
      <rect
        x={x + 5}
        y={top + height * 0.28}
        width={width - 10}
        height={height * 0.72 - 5}
        rx="8"
        className={contentsClass}
      />
      <rect
        x={x + 6}
        y={top - 14}
        width={width - 12}
        height="16"
        rx="3"
        className="fill-lemn-600 stroke-brad-900"
        strokeWidth="3"
      />
      <rect
        x={x + 9}
        y={labelTop}
        width={width - 18}
        height="30"
        rx="3"
        className="fill-in-100 stroke-lemn-600"
        strokeWidth="2"
      />
      <path
        d={`M${x + 17} ${labelTop + 12}h${width - 34}M${x + 22} ${labelTop + 20}h${width - 44}`}
        className="stroke-lemn-600"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  )
}

/* Hero illustration: three jars (jam, honey, zacuscă) on a wooden pantry shelf. */
export function PantryShelf({ className = '' }: { readonly className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 320 250" className={className}>
      <Jar x={34} width={72} height={112} contentsClass="fill-afina-500" />
      <Jar x={122} width={82} height={142} contentsClass="fill-miere-300" />
      <Jar x={220} width={66} height={92} contentsClass="fill-miere-500" />
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
