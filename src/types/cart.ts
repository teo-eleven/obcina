// A line holds only what the server accepts at checkout; prices come from the catalogue.
export type CartLine = { readonly productId: string; readonly quantity: number }
export type Cart = readonly CartLine[]
