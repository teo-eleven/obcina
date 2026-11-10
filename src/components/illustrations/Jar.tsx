interface JarProps {
  readonly x: number
  readonly width: number
  readonly height: number
  readonly contentsClass: string
  /** Where the jar stands: the top of the shelf. */
  readonly bottom: number
}

export function Jar({ x, width, height, contentsClass, bottom }: JarProps) {
  const top = bottom - height
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
