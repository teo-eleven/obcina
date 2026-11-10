export const PRIMARY_BUTTON =
  'bg-brad-700 text-crema-50 hover:bg-afina-700 rounded-full px-6 py-3 font-semibold transition'

interface LoadErrorProps {
  readonly message: string
  /** The caller also moves focus into its own region: the button disappears on retry. */
  readonly onRetry: () => void
}

/** What a data page shows when its read fails: a plain message and a way to try again. */
export function LoadError({ message, onRetry }: LoadErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-start gap-4">
      <p>{message}</p>
      <button type="button" onClick={onRetry} className={PRIMARY_BUTTON}>
        Încearcă din nou
      </button>
    </div>
  )
}
