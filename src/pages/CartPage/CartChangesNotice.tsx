import { CART_TEXT } from '../../constants'
import type { CartChange } from '../../types'
import { cartChangeMessage } from '../../utils'

/** Tells the buyer what the page had to change in the cart. The live region is always there. */
export function CartChangesNotice({ changes }: { readonly changes: readonly CartChange[] }) {
  return (
    <output aria-live="polite" className="block">
      {changes.length > 0 && (
        <section className="border-afina-700 bg-in-100 mt-6 rounded-md border-l-4 p-4">
          <h2 className="font-semibold">{CART_TEXT.correctedHeading}</h2>
          <ul className="mt-2 list-disc pl-5">
            {/* Index keys: the list only grows, and two messages can read the same. */}
            {changes.map((change, index) => (
              <li key={index}>{cartChangeMessage(change)}</li>
            ))}
          </ul>
        </section>
      )}
    </output>
  )
}
