// A line holds only what the server accepts at checkout; prices come from the catalogue.
export type CartLine = { readonly productId: string; readonly quantity: number }
export type Cart = readonly CartLine[]

/** What reconcileCart had to change so the cart matches the catalogue and its stock. */
export type CartChange =
  | { readonly kind: 'reduced'; readonly name: string; readonly quantity: number }
  | { readonly kind: 'sold-out'; readonly name: string }
  | { readonly kind: 'missing' }
