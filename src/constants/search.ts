/** Below this many letters the search shows nothing: one letter matches almost every name. */
export const SEARCH_MIN_LENGTH = 2

/** Longer queries are cut: no product name is near this long, and the page renders the query. */
export const SEARCH_MAX_LENGTH = 100

/** How many products the header suggests while typing; the search page shows them all. */
export const SEARCH_SUGGESTION_LIMIT = 6

/** The whole catalogue is read for searching; the Firestore rules cap any list at 100. */
export const SEARCH_CATALOGUE_LIMIT = 100

/** The search page and the query parameter that carries what was typed. */
export const SEARCH_PATH = '/cautare'
export const SEARCH_PARAM = 'q'
