import { CART_TEXT } from '../constants'
import type { Cart, CartChange, CartLine, Product } from '../types'
import { cartLimit } from './stock'

interface Reconciled {
  readonly cart: Cart
  readonly changes: readonly CartChange[]
}

/** One line checked against its product: kept, brought down to the stock, or dropped. */
function reconcileLine(
  line: CartLine,
  product: Product | undefined,
): { line: CartLine | null; change?: CartChange } {
  if (!product) return { line: null, change: { kind: 'missing' } }
  const limit = cartLimit(product)
  if (limit === 0) return { line: null, change: { kind: 'sold-out', name: product.name } }
  if (line.quantity <= limit) return { line }
  return {
    line: { ...line, quantity: limit },
    change: { kind: 'reduced', name: product.name, quantity: limit },
  }
}

/**
 * Makes the cart payable: products that left the catalogue or sold out are taken out, lines above
 * the stock come down to it. The same cart comes back when nothing had to change.
 */
export function reconcileCart(cart: Cart, products: readonly Product[]): Reconciled {
  const bySlug = new Map(products.map((product) => [product.slug, product]))
  const checked = cart.map((line) => reconcileLine(line, bySlug.get(line.productId)))
  const changes = checked.flatMap(({ change }) => (change ? [change] : []))
  if (changes.length === 0) return { cart, changes }
  return { cart: checked.flatMap(({ line }) => (line ? [line] : [])), changes }
}

/** What the buyer is told about one change. */
export function cartChangeMessage(change: CartChange): string {
  if (change.kind === 'missing') return CART_TEXT.changeMissing

  if (change.kind === 'sold-out') return CART_TEXT.changeSoldOut(change.name)
  return CART_TEXT.changeReduced(change.name, change.quantity)
}
