// The shopper's text shared across pages (team rule: UI text lives in constants/).

export const BRAND_NAME = 'Obcina'

/** Tab title: "<page> — Obcina". */
export const pageTitle = (page: string): string => `${page} — ${BRAND_NAME}`

export const COMMON_TEXT = {
  tagline: 'cămară de munte din Bucovina',
  skipToContent: 'Sari la conținut',
  footerNote:
    'Proiect universitar. Magazin demonstrativ: produsele și prețurile sunt fictive și nu se procesează plăți reale.',
  menu: 'Meniu',
  mainNavigation: 'Principal',
  navCategories: 'Categorii',
  navStory: 'Povestea',
  retry: 'Încearcă din nou',
  appLoading: 'Se deschide cămara…',
  routeErrorTitle: 'Pagina nu s-a putut deschide',
  routeErrorBody:
    'Poate s-a întrerupt conexiunea sau am pus între timp o versiune nouă a magazinului.',
  reload: 'Reîncarcă pagina',
  notFoundTitle: 'Pagină negăsită',
  notFoundEyebrow: 'Eroare 404',
  notFoundHeading: 'Borcanul ăsta nu e în cămară',
  notFoundBody:
    'Pagina pe care o cauți nu există sau a fost mutată. Hai înapoi, avem destule alte bunătăți.',
  backToPantry: 'Înapoi în cămară',
  seeCategories: 'Vezi categoriile',
} as const
