// Builds the images served from public/images/ (WebP). Run by tsx (it imports src/ values).
//
// Product images, public/images/products/<slug>.webp (800×800), for each seed product:
//   1. assets/products/<slug>.(png|jpg|jpeg|webp) exists → crop to a square, resize, encode WebP.
//      These are the AI-generated originals (docs/images/prompturi-borcane.md).
//   2. otherwise, if the WebP already exists → keep it (it may come from an original made elsewhere).
//   3. otherwise → draw a provisional label-style jar in the brand palette, so pages have an image.
//   --placeholders redraws every product that has no original (this overwrites kept images).
//   WebP files whose product no longer exists are deleted.
// Atmosphere photos, public/images/atmosfera/<name>-<width>.webp: re-encoded at each width from
// assets/atmosfera/<name>.jpg when that original is present; kept as they are otherwise.
//
// assets/ is not in git (originals are large); only the optimised WebP files are committed.
// Metadata (EXIF, GPS, ICC) is never copied into the output.
//
// Usage: npm run images

import { existsSync } from 'node:fs'
import { mkdir, readdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import sharp from 'sharp'
import type { CategorySlug } from '../src/types/category.ts'
import { SEED_PRODUCTS } from '../src/constants/seedProducts.ts'
import { PRODUCT_IMAGE_SIZE } from '../src/constants/product.ts'
import type { Product } from '../src/types/product.ts'

const WEBP = { quality: 80, effort: 6 }
const PHOTO_WEBP = { quality: 74, effort: 6 }
// Our originals are a few megapixels; refuse anything absurd rather than exhaust memory.
const MAX_INPUT_PIXELS = 50_000_000
const PRODUCT_ORIGINALS = resolve('assets/products')
const PRODUCT_OUTPUT = resolve('public/images/products')
const ORIGINAL_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp']

// Credited in docs/CREDITS.md; srcset in src/pages/HomePage/Story.tsx uses the same widths.
const ATMOSPHERE = [{ name: 'poiana-negrii', widths: [640, 800, 1200] }]
const ATMOSPHERE_ORIGINALS = resolve('assets/atmosfera')
const ATMOSPHERE_OUTPUT = resolve('public/images/atmosfera')

// Brand palette (docs/BRAND.md). Scripts can't use the Tailwind tokens, so the hex values live here.
const COLOR = {
  paper: '#faf6ee',
  label: '#f1eadb',
  ink: '#4a3424',
  inkSoft: '#6e5038',
  pine: '#2f4a3a',
  cheeseTop: '#f3dc9c',
}
const CATEGORY_FILL: Record<CategorySlug, string> = {
  dulceturi: '#8a3f6e',
  miere: '#d9a441',
  conserve: '#a4553a',
  branzeturi: '#ebc97a',
  ceaiuri: '#4f7259',
  'cosuri-cadou': '#6e5038',
}
const LABEL_LINE_CHARS = 16
const LABEL_MAX_LINES = 3

const escapeXml = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.codePointAt(0)};`)

// Greedy wrap for the label. Fails loudly instead of silently cutting a long name.
function wrap(text: string): string[] {
  const lines: string[] = []
  for (const word of text.split(/\s+/)) {
    const last = lines.at(-1)
    if (last !== undefined && `${last} ${word}`.length <= LABEL_LINE_CHARS) {
      lines[lines.length - 1] = `${last} ${word}`
    } else {
      lines.push(word)
    }
  }
  if (lines.length > LABEL_MAX_LINES) {
    throw new Error(`"${text}" needs ${lines.length} label lines; shorten it or widen the label`)
  }
  return lines
}

function vessel(product: Product): string {
  const fill = CATEGORY_FILL[product.category]
  if (product.category === 'ceaiuri') {
    // Paper bag with a folded top.
    return `<path d="M230 250 L570 250 L600 690 L200 690 Z" fill="${COLOR.label}" stroke="${COLOR.inkSoft}" stroke-width="4"/>
      <path d="M230 250 L260 200 L540 200 L570 250 Z" fill="${fill}"/>`
  }
  if (product.category === 'cosuri-cadou') {
    // Wicker basket with a handle.
    const weave = [440, 500, 560, 620]
      .map(
        (y) =>
          `<line x1="190" y1="${y}" x2="610" y2="${y}" stroke="${COLOR.ink}" stroke-opacity=".35" stroke-width="6"/>`,
      )
      .join('')
    return `<path d="M250 380 Q400 120 550 380" fill="none" stroke="${fill}" stroke-width="22"/>
      <path d="M170 380 L630 380 L580 690 L220 690 Z" fill="${fill}"/>${weave}`
  }
  if (product.category === 'branzeturi') {
    // A round of cheese.
    return `<ellipse cx="400" cy="600" rx="250" ry="90" fill="${fill}" stroke="${COLOR.inkSoft}" stroke-width="4"/>
      <rect x="150" y="380" width="500" height="220" fill="${fill}"/>
      <ellipse cx="400" cy="380" rx="250" ry="90" fill="${COLOR.cheeseTop}" stroke="${COLOR.inkSoft}" stroke-width="4"/>`
  }
  // Jar: glass tinted by its contents, with a cloth-covered lid.
  return `<rect x="220" y="250" width="360" height="440" rx="60" fill="${fill}" stroke="${COLOR.inkSoft}" stroke-width="4"/>
    <rect x="240" y="190" width="320" height="70" rx="14" fill="${COLOR.pine}"/>
    <path d="M220 200 Q400 150 580 200 L560 240 Q400 205 240 240 Z" fill="${COLOR.label}" stroke="${COLOR.inkSoft}" stroke-width="3"/>`
}

// Provisional drawing in the "jar label" style: paper background, vessel, chamfered double-bordered
// label with the product name and weight. Replaced as soon as an original exists.
function placeholderSvg(product: Product): string {
  const lines = wrap(product.name)
  const detail = product.kind === 'product' ? `${product.weightGrams} g` : 'coș cadou'
  const firstLineY = 470 - (lines.length - 1) * 21
  const text = lines
    .map(
      (line, i) =>
        `<text x="400" y="${firstLineY + i * 42}" font-size="34">${escapeXml(line)}</text>`,
    )
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PRODUCT_IMAGE_SIZE}" height="${PRODUCT_IMAGE_SIZE}" viewBox="0 0 800 800">
    <rect width="800" height="800" fill="${COLOR.paper}"/>
    <ellipse cx="400" cy="705" rx="260" ry="26" fill="${COLOR.ink}" opacity=".12"/>
    ${vessel(product)}
    <path d="M262 380 H538 L558 400 V560 L538 580 H262 L242 560 V400 Z" fill="${COLOR.label}" stroke="${COLOR.ink}" stroke-width="3"/>
    <path d="M270 390 H530 L548 408 V552 L530 570 H270 L252 552 V408 Z" fill="none" stroke="${COLOR.ink}" stroke-width="1.5"/>
    <g font-family="Georgia, 'Times New Roman', serif" fill="${COLOR.ink}" text-anchor="middle">
      ${text}
      <text x="400" y="545" font-size="24" fill="${COLOR.inkSoft}" font-style="italic">${escapeXml(detail)}</text>
    </g>
  </svg>`
}

// rotate() applies the EXIF orientation before the metadata is dropped, so photos aren't sideways.
const load = (input: string | Buffer) =>
  sharp(input, { limitInputPixels: MAX_INPUT_PIXELS }).rotate()

const findOriginal = (dir: string, name: string, extensions: readonly string[]) =>
  extensions.map((ext) => resolve(dir, `${name}.${ext}`)).find((path) => existsSync(path))

async function buildProductImages(redrawPlaceholders: boolean) {
  await mkdir(PRODUCT_OUTPUT, { recursive: true })
  const counts = { original: 0, kept: 0, placeholder: 0 }

  for (const product of SEED_PRODUCTS) {
    const output = resolve(PRODUCT_OUTPUT, `${product.slug}.webp`)
    const original = findOriginal(PRODUCT_ORIGINALS, product.slug, ORIGINAL_EXTENSIONS)
    if (original) {
      await load(original)
        .resize(PRODUCT_IMAGE_SIZE, PRODUCT_IMAGE_SIZE, { fit: 'cover' })
        .webp(WEBP)
        .toFile(output)
      counts.original++
    } else if (existsSync(output) && !redrawPlaceholders) {
      counts.kept++
    } else {
      await load(Buffer.from(placeholderSvg(product)))
        .webp(WEBP)
        .toFile(output)
      counts.placeholder++
    }
  }
  return counts
}

// Only WebP files we would have written are candidates; anything else in the folder is left alone.
async function removeOrphanProductImages(): Promise<string[]> {
  const slugs = new Set(SEED_PRODUCTS.map((product) => product.slug))
  const files = await readdir(PRODUCT_OUTPUT)
  const orphans = files.filter((file) => file.endsWith('.webp') && !slugs.has(file.slice(0, -5)))
  for (const file of orphans) await rm(resolve(PRODUCT_OUTPUT, file), { force: true })
  return orphans
}

async function buildAtmospherePhotos() {
  await mkdir(ATMOSPHERE_OUTPUT, { recursive: true })
  let rebuilt = 0
  for (const { name, widths } of ATMOSPHERE) {
    const original = findOriginal(ATMOSPHERE_ORIGINALS, name, ['jpg', 'jpeg'])
    if (!original) continue
    for (const width of widths) {
      const output = resolve(ATMOSPHERE_OUTPUT, `${name}-${width}.webp`)
      await load(original)
        .resize({ width, withoutEnlargement: true })
        .webp(PHOTO_WEBP)
        .toFile(output)
    }
    rebuilt++
  }
  return rebuilt
}

async function main() {
  // An empty catalogue would make every product image an "orphan"; never run in that state.
  if (SEED_PRODUCTS.length === 0)
    throw new Error('SEED_PRODUCTS is empty; refusing to touch images')

  const counts = await buildProductImages(process.argv.includes('--placeholders'))
  const orphans = await removeOrphanProductImages()
  const photos = await buildAtmospherePhotos()

  console.log(
    `Products: ${counts.original} from originals, ${counts.kept} kept, ${counts.placeholder} placeholders` +
      (orphans.length > 0 ? `; removed ${orphans.join(', ')}` : ''),
  )
  console.log(`Atmosphere: ${photos} of ${ATMOSPHERE.length} rebuilt from originals`)
}

main().catch((error: unknown) => {
  console.error('Image build failed:', error)
  process.exitCode = 1
})
