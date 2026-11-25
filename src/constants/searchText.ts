import { SEARCH_MIN_LENGTH } from './search'

/** The search box in the header and the results page. */
export const SEARCH_TEXT = {
  label: 'Caută în cămară',
  placeholder: 'Caută: miere, dulceață…',
  submit: 'Caută',
  suggestions: 'Produse găsite',
  loading: 'Se încarcă produsele…',
  loadError: 'Căutarea nu merge acum. Încearcă din nou puțin mai târziu.',
  tooShort: `Scrie cel puțin ${SEARCH_MIN_LENGTH} litere.`,
  noMatches: (query: string) => `Nimic pentru „${query}”.`,
  seeAll: (query: string) => `Toate rezultatele pentru „${query}”`,
  pageTitle: 'Căutare',
  heading: 'Căutare',
  resultsFor: (query: string) => `Rezultate pentru „${query}”`,
  emptyQuery: 'Scrie numele unui produs în căsuța de căutare de sus.',
  seeCategories: 'Vezi rafturile',
} as const
