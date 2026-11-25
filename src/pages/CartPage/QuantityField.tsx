import { CART_TEXT } from '../../constants'
import { useState } from 'react'
import { cartLineMessage, parseQuantityInput } from '../../utils'

interface QuantityFieldProps {
  /** The product's name, for the controls' accessible names. */
  readonly name: string
  readonly quantity: number
  /** The most this line may hold (the stock, see cartLimit). */
  readonly limit: number
  readonly onChange: (quantity: number) => void
  readonly className?: string
}

const STEP_BUTTON =
  'border-brad-700 text-brad-700 hover:bg-brad-100 aria-disabled:border-in-100 aria-disabled:text-lemn-600 aria-disabled:hover:bg-transparent aria-disabled:cursor-not-allowed size-10 rounded-full border-2 text-lg font-semibold'

/**
 * − / field / +. The field takes what the buyer types, checks it when they leave it or press Enter,
 * and goes back to the current quantity with a message when it isn't a number. − and + stay
 * focusable at their limits (aria-disabled), so keyboard focus is never dropped.
 */
export function QuantityField({
  name,
  quantity,
  limit,
  onChange,
  className = '',
}: QuantityFieldProps) {
  const [draft, setDraft] = useState(String(quantity))
  const [shown, setShown] = useState(quantity)
  const [message, setMessage] = useState('')
  // The quantity changed elsewhere (buttons, another tab): the field follows (adjusted during render).
  if (shown !== quantity) {
    setShown(quantity)
    setDraft(String(quantity))
  }
  const isAtMinimum = quantity <= 1
  const isAtLimit = quantity >= limit

  function commit() {
    // Enter then leaving the field: the second commit has nothing new (and keeps the message).
    if (draft === String(quantity)) return
    const parsed = parseQuantityInput(draft, limit)
    if (parsed === null) {
      setDraft(String(quantity))
      setMessage(CART_TEXT.quantityInvalid(limit))
      return
    }
    const typed = Number(draft.trim())
    setDraft(String(parsed))
    setMessage(parsed < typed ? CART_TEXT.quantityCapped(limit) : '')
    onChange(parsed)
  }

  function step(delta: number) {
    setMessage('')
    onChange(quantity + delta)
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={CART_TEXT.decreaseLabel(name)}
          aria-disabled={isAtMinimum || undefined}
          onClick={() => !isAtMinimum && step(-1)}
          className={STEP_BUTTON}
        >
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          enterKeyHint="done"
          autoComplete="off"
          onFocus={(event) => event.target.select()}
          aria-label={CART_TEXT.quantityLabel(name)}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit()
          }}
          className="border-lemn-600 bg-crema-50 w-14 rounded-md border px-2 py-2 text-center"
        />
        <button
          type="button"
          aria-label={CART_TEXT.increaseLabel(name)}
          aria-disabled={isAtLimit || undefined}
          onClick={() => !isAtLimit && step(1)}
          className={STEP_BUTTON}
        >
          +
        </button>
      </div>
      <output
        aria-live="polite"
        aria-atomic="true"
        className="text-lemn-600 mt-2 block min-h-5 text-sm"
      >
        {message || (isAtLimit ? cartLineMessage(quantity, limit) : '')}
      </output>
    </div>
  )
}
