export type StockLevel =
  | { readonly kind: 'out' }
  | { readonly kind: 'low'; readonly left: number }
  | { readonly kind: 'in' }
