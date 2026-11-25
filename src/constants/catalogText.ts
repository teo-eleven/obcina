// The shelves' and product pages' text (team rule: UI text lives in constants/).

export const CATALOG_TEXT = {
  productsList: 'Produse',
  loadingProducts: 'Se încarcă produsele…',
  shelfLoadError: 'Nu am putut încărca produsele.',
  emptyShelf: 'Raftul ăsta e gol deocamdată.',
  seeOtherCategories: 'Vezi celelalte categorii',
  productTitle: 'Produs',
  loadingProduct: 'Se încarcă produsul…',
  productLoadError: 'Nu am putut încărca produsul.',
  backTo: 'Înapoi la',
  ingredients: 'Ingrediente',
  basketContents: 'Ce conține',
  loadingBasketContents: 'Se încarcă produsele din coș…',
  basketContentsLoadError: 'Nu am putut încărca produsele din coș.',
  basketIncomplete: 'Unele produse din coș nu sunt disponibile acum.',
  soldOut: 'Stoc epuizat',
  lowStock: (left: number) => `Doar ${left} în stoc`,
  weight: (grams: number) => `${grams} g`,
} as const
