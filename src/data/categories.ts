export interface Category {
  readonly slug: string
  readonly name: string
  readonly description: string
}

// Static until the catalog moves to Firestore (week 2).
export const CATEGORIES = [
  {
    slug: 'dulceturi',
    name: 'Dulcețuri și gemuri',
    description: 'Afine, zmeură și cătină, fierte încet, cu puțin zahăr.',
  },
  {
    slug: 'miere',
    name: 'Miere',
    description: 'De tei, de munte și polifloră, din stupine de pe obcine.',
  },
  {
    slug: 'conserve',
    name: 'Zacuscă și conserve',
    description: 'Zacuscă, ghiveci și ciuperci de pădure, ca pentru iarnă.',
  },
  {
    slug: 'branzeturi',
    name: 'Brânzeturi',
    description: 'Brânză de burduf și cașcaval afumat de la stâne din munte.',
  },
  {
    slug: 'ceaiuri',
    name: 'Ceaiuri de munte',
    description: 'Sunătoare, cimbrișor și amestecuri culese vara.',
  },
  {
    slug: 'cosuri-cadou',
    name: 'Coșuri cadou',
    description: 'Câte puțin din toate, gata de dăruit.',
  },
] as const satisfies readonly Category[]

// Categories stay in code; only products move to Firestore. A product's category arrives as a
// string and must be validated against these slugs at that boundary (plan step 2.3).
export type CategorySlug = (typeof CATEGORIES)[number]['slug']
