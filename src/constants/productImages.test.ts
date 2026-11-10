// @vitest-environment node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, extname, resolve } from 'node:path'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { PRODUCT_IMAGE_SIZE } from './product'
import { SEED_PRODUCTS } from './seedProducts'

const MAX_IMAGE_BYTES = 120 * 1024
const IMAGES_DIR = resolve(process.cwd(), 'public/images/products')

const cases = SEED_PRODUCTS.map((product) => ({
  slug: product.slug,
  path: resolve(process.cwd(), `public${product.image.src}`),
}))

describe('product images', () => {
  it.each(cases)('$slug has an image file in public/', ({ path }) => {
    expect(existsSync(path)).toBe(true)
  })

  it.each(cases)('$slug is a real 800x800 WebP', async ({ path }) => {
    const { format, width, height } = await sharp(path).metadata()
    expect({ format, width, height }).toEqual({
      format: 'webp',
      width: PRODUCT_IMAGE_SIZE,
      height: PRODUCT_IMAGE_SIZE,
    })
  })

  it.each(cases)('$slug weighs at most 120 KB', ({ path }) => {
    expect(statSync(path).size).toBeLessThanOrEqual(MAX_IMAGE_BYTES)
  })

  it('holds only .webp files, each belonging to a seed product', () => {
    const files = readdirSync(IMAGES_DIR)
    const slugs = new Set(SEED_PRODUCTS.map((product) => product.slug))
    const orphans = files.filter(
      (file) => extname(file) !== '.webp' || !slugs.has(basename(file, '.webp')),
    )
    expect(orphans).toEqual([])
  })

  // The AI originals are generated from this file, so a new or renamed product needs a prompt row.
  const readPrompts = () =>
    readFileSync(resolve(process.cwd(), 'docs/images/prompturi-borcane.md'), 'utf8')

  it.each(SEED_PRODUCTS)('$slug has a prompt row with its exact label text', (product) => {
    const prompts = readPrompts()

    expect(prompts).toContain(`\`${product.slug}\``)
    expect(prompts).toContain(product.name)
  })
})

describe('atmosphere photos', () => {
  const dir = resolve(process.cwd(), 'public/images/atmosfera')
  const MAX_PHOTO_BYTES = 150 * 1024
  // Read at collection time, so guard it: a missing folder fails the test below, not the whole file.
  const files = existsSync(dir) ? readdirSync(dir) : []

  it('exist', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it.each(files)('%s is a WebP of at most 150 KB, credited in CREDITS.md', async (file) => {
    const path = resolve(dir, file)
    const credits = readFileSync(resolve(process.cwd(), 'docs/CREDITS.md'), 'utf8')

    expect((await sharp(path).metadata()).format).toBe('webp')
    expect(statSync(path).size).toBeLessThanOrEqual(MAX_PHOTO_BYTES)
    expect(credits).toContain(file.replace(/-\d+\.webp$/, ''))
  })
})
