import { describe, expect, expectTypeOf, it } from 'vitest'
import { CATEGORIES } from '../constants'
import type { CategorySlug, GiftBasket, Product, SingleProduct } from '../types'
import { productSchema } from './product'

const validProduct = {
  kind: 'product',
  slug: 'dulceata-de-afine',
  name: 'Dulceață de afine',
  description: 'Afine culese de mână din pădurile Obcinelor, fierte încet cu puțin zahăr.',
  priceBani: 2499,
  image: { src: '/images/products/dulceata-de-afine.webp', alt: 'Borcan de dulceață de afine' },
  category: 'dulceturi',
  weightGrams: 350,
  ingredients: ['afine', 'zahăr'],
  stock: 12,
} as const

const validBasket = {
  kind: 'gift-basket',
  slug: 'cos-de-sarbatoare',
  name: 'Coș de sărbătoare',
  description: 'Câte puțin din toate, gata de dăruit: dulceață, miere și ceai de munte.',
  priceBani: 15999,
  image: { src: '/images/products/cos-de-sarbatoare.webp', alt: 'Coș cu bunătăți de munte' },
  category: 'cosuri-cadou',
  components: [
    { slug: 'dulceata-de-afine', quantity: 1 },
    { slug: 'miere-de-tei', quantity: 2 },
  ],
} as const

const NON_BASKET_SLUGS = CATEGORIES.map((c) => c.slug).filter((slug) => slug !== 'cosuri-cadou')

function rejectionPaths(input: unknown): PropertyKey[][] {
  const result = productSchema.safeParse(input)
  if (result.success) throw new Error('expected the input to be rejected')
  return result.error.issues.map((issue) => issue.path)
}

// Prefix match: a nested issue such as ['components', 1, 'quantity'] still points at 'components'.
function expectRejectedAt(input: unknown, path: readonly PropertyKey[]) {
  const paths = rejectionPaths(input)
  expect(paths.some((issuePath) => path.every((part, i) => issuePath[i] === part))).toBe(true)
}

// Exact match, for rules on the field itself rather than on something nested inside it.
function expectRejectedExactlyAt(input: unknown, path: readonly PropertyKey[]) {
  expect(rejectionPaths(input)).toContainEqual(path)
}

describe('productSchema valid input', () => {
  it.each([
    ['single product', validProduct],
    ['gift basket', validBasket],
  ])('accepts a valid %s unchanged', (_label, fixture) => {
    const result = productSchema.safeParse(fixture)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(fixture)
  })

  it('trims name, description, alt and ingredients', () => {
    const result = productSchema.parse({
      ...validProduct,
      name: '  Dulceață de afine  ',
      description: `  ${validProduct.description}  `,
      image: { ...validProduct.image, alt: '  Borcan de dulceață  ' },
      ingredients: ['  afine ', ' zahăr'],
    })

    expect(result.name).toBe('Dulceață de afine')
    expect(result.description).toBe(validProduct.description)
    expect(result.image.alt).toBe('Borcan de dulceață')
    expect(result).toMatchObject({ ingredients: ['afine', 'zahăr'] })
  })
})

describe('priceBani', () => {
  it.each([19.99, 0, -100, 100001, '1999', Number.NaN, Infinity, null])(
    'rejects %j',
    (priceBani) => {
      expectRejectedAt({ ...validProduct, priceBani }, ['priceBani'])
    },
  )

  it('rejects a missing price', () => {
    const { priceBani: _omitted, ...withoutPrice } = validProduct

    expectRejectedAt(withoutPrice, ['priceBani'])
  })

  it.each([1, 100000])('accepts the boundary value %s', (priceBani) => {
    expect(productSchema.safeParse({ ...validProduct, priceBani }).success).toBe(true)
  })
})

describe('category', () => {
  it.each(['vinuri', 'Miere', '', 'cosuri-cadou'])('rejects %j on a single product', (category) => {
    expectRejectedAt({ ...validProduct, category }, ['category'])
  })

  it('rejects a non-basket category on a gift basket', () => {
    expectRejectedAt({ ...validBasket, category: 'miere' }, ['category'])
  })

  it.each(NON_BASKET_SLUGS)('accepts %s on a single product', (category) => {
    expect(productSchema.safeParse({ ...validProduct, category }).success).toBe(true)
  })
})

describe('invalid single product', () => {
  it.each([
    ['unknown kind', { kind: 'bundle' }, ['kind']],
    ['slug with capital', { slug: 'Dulceata' }, ['slug']],
    ['slug too short', { slug: 'a' }, ['slug']],
    ['slug with spaces', { slug: 'cu spatii' }, ['slug']],
    ['slug with edge hyphens', { slug: '-x-' }, ['slug']],
    ['slug too long', { slug: 'a'.repeat(81) }, ['slug']],
    ['name too short', { name: 'A' }, ['name']],
    ['name too long', { name: 'A'.repeat(81) }, ['name']],
    ['whitespace-only name', { name: '     ' }, ['name']],
    ['description too short', { description: 'Prea scurt' }, ['description']],
    ['description too long', { description: 'a'.repeat(601) }, ['description']],
    ['negative stock', { stock: -1 }, ['stock']],
    ['fractional stock', { stock: 2.5 }, ['stock']],
    ['stock above max', { stock: 10000 }, ['stock']],
    ['zero weight', { weightGrams: 0 }, ['weightGrams']],
    ['weight above max', { weightGrams: 5001 }, ['weightGrams']],
    ['no ingredients', { ingredients: [] }, ['ingredients']],
    ['too many ingredients', { ingredients: Array(21).fill('sare') }, ['ingredients']],
    ['blank ingredient', { ingredients: ['afine', '  '] }, ['ingredients', 1]],
    ['ingredient too long', { ingredients: ['a'.repeat(61)] }, ['ingredients', 0]],
    ['slug with a trailing newline', { slug: 'dulceata-de-afine\n' }, ['slug']],
    [
      'image name that is only hyphens',
      { image: { ...validProduct.image, src: '/images/products/--.webp' } },
      ['image', 'src'],
    ],
    [
      'image path traversal',
      { image: { ...validProduct.image, src: '/images/products/../x.webp' } },
      ['image', 'src'],
    ],
    [
      'external image',
      { image: { ...validProduct.image, src: 'https://evil.example/x.webp' } },
      ['image', 'src'],
    ],
    [
      'non-webp image',
      { image: { ...validProduct.image, src: '/images/products/x.jpg' } },
      ['image', 'src'],
    ],
    [
      'image outside products dir',
      { image: { ...validProduct.image, src: '/images/x.webp' } },
      ['image', 'src'],
    ],
    ['alt too short', { image: { ...validProduct.image, alt: 'Foto' } }, ['image', 'alt']],
  ])('rejects %s', (_label, override, path) => {
    expectRejectedAt({ ...validProduct, ...override }, path)
  })

  it('rejects a missing kind', () => {
    const { kind: _omitted, ...withoutKind } = validProduct

    expectRejectedAt(withoutKind, ['kind'])
  })
})

describe('invalid gift basket', () => {
  const component = { slug: 'miere-de-tei', quantity: 1 }

  it.each([
    ['a single component', [component]],
    [
      'more than 8 components',
      Array.from({ length: 9 }, (_, i) => ({ slug: `produs-${i}`, quantity: 1 })),
    ],
    ['quantity 0', [component, { slug: 'dulceata-de-afine', quantity: 0 }]],
    ['quantity 11', [component, { slug: 'dulceata-de-afine', quantity: 11 }]],
    ['bad component slug', [component, { slug: 'Dulceata', quantity: 1 }]],
  ])('rejects %s', (_label, components) => {
    expectRejectedAt({ ...validBasket, components }, ['components'])
  })

  it('rejects duplicate component slugs', () => {
    const components = [component, { ...component, quantity: 2 }]

    expectRejectedExactlyAt({ ...validBasket, components }, ['components'])
  })

  it('rejects a basket that contains itself', () => {
    const components = [component, { slug: validBasket.slug, quantity: 1 }]

    expectRejectedExactlyAt({ ...validBasket, components }, ['components'])
  })
})

// Invisible and control characters can make a name render as something else (RTL override),
// hide duplicates (zero-width) or break logs and Stripe metadata (NUL). React escaping does not
// help here, so the schema refuses them. Romanian diacritics must still pass.
describe('text safety', () => {
  it.each([
    ['right-to-left override', '\u202E'],
    ['zero-width space', '\u200B'],
    ['NUL', '\u0000'],
    ['line break', '\n'],
  ])('rejects a name containing a %s', (_label, character) => {
    expectRejectedAt({ ...validProduct, name: `Dulceață${character}de afine` }, ['name'])
  })

  it.each([
    [
      'alt text',
      { image: { ...validProduct.image, alt: 'Borcan\u202Ede afine' } },
      ['image', 'alt'],
    ],
    ['ingredient', { ingredients: ['afine\u200B'] }, ['ingredients', 0]],
    ['description', { description: `${validProduct.description}\u202E` }, ['description']],
  ])('rejects control characters in the %s', (_label, override, path) => {
    expectRejectedAt({ ...validProduct, ...override }, path)
  })

  it('allows line breaks in the description and keeps the diacritics', () => {
    const description = 'Afine culese de mână, fierte încet.\nȘi cu puțin zahăr, ca la bunica.'

    const result = productSchema.parse({ ...validProduct, description })

    expect(result.description).toBe(description)
  })
})

describe('unknown keys', () => {
  it('does not copy a __proto__ key from untrusted JSON', () => {
    const input: unknown = JSON.parse(
      JSON.stringify(validProduct).replace(/^\{/, '{"__proto__":{"isAdmin":true},'),
    )

    const result = productSchema.parse(input)

    expect(Object.hasOwn(result, '__proto__')).toBe(false)
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype)
    expect(({} as { isAdmin?: boolean }).isAdmin).toBeUndefined()
  })

  it.each([
    ['single product', validProduct],
    ['gift basket', validBasket],
  ])('strips unknown keys from a %s', (_label, fixture) => {
    const result = productSchema.parse({ ...fixture, createdAt: 1700000000, isAdmin: true })

    expect(result).not.toHaveProperty('createdAt')
    expect(result).not.toHaveProperty('isAdmin')
    expect(result).toEqual(fixture)
  })
})

describe('types', () => {
  it('derives category and price types from the schema', () => {
    expectTypeOf<Product['category']>().toEqualTypeOf<CategorySlug>()
    expectTypeOf<SingleProduct['priceBani']>().toBeNumber()
    expectTypeOf<GiftBasket['category']>().toEqualTypeOf<'cosuri-cadou'>()
    expectTypeOf<SingleProduct['category']>().toEqualTypeOf<Exclude<CategorySlug, 'cosuri-cadou'>>()
  })
})
