import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from '../lib/contrast'

// WCAG 2.2 AA for normal-size text.
const AA_NORMAL_TEXT = 4.5

// Read from disk: Vitest runs with `css: false`, so importing the stylesheet would yield nothing.
const INDEX_CSS = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')

function readBrandTokens(): Record<string, string> {
  const tokens: Record<string, string> = {}
  for (const [, name, hex] of INDEX_CSS.matchAll(
    /--color-([a-z0-9-]+):\s*(#[0-9a-f]{3,6})\s*;/gi,
  )) {
    if (name && hex) tokens[name] = hex
  }
  return tokens
}

interface TextureInk {
  readonly rgb: readonly [number, number, number]
  readonly maxAlpha: number
}

/*
 * The paper texture's darkest pixel, read from the feColorMatrix in --texture-paper.
 * RGB rows are constants (offset column); alpha = a·R + offset, and noise R is at most 1.
 */
function readTextureInk(): TextureInk {
  const values = /feColorMatrix values='([^']+)'/
    .exec(INDEX_CSS)?.[1]
    ?.trim()
    .split(/\s+/)
    .map(Number)
  if (!values || values.length !== 20) {
    throw new Error('Could not read the paper texture feColorMatrix from src/index.css')
  }
  const at = (index: number) => values[index] ?? Number.NaN
  const toByte = (unit: number) => Math.round(unit * 255)
  return {
    rgb: [toByte(at(4)), toByte(at(9)), toByte(at(14))],
    maxAlpha: Math.max(0, at(15)) + Math.max(0, at(16)) + Math.max(0, at(17)) + at(19),
  }
}

function blendOver(baseHex: string, ink: TextureInk): string {
  const base = [1, 3, 5].map((i) => parseInt(baseHex.slice(i, i + 2), 16))
  return `#${base
    .map((value, i) => Math.round(value * (1 - ink.maxAlpha) + (ink.rgb[i] ?? 0) * ink.maxAlpha))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`
}

// Every text/background pair the UI actually uses. Add a row when a new pairing appears.
const TEXT_ON_BACKGROUND = [
  ['lemn-800', 'crema-50'], // body text
  ['lemn-600', 'crema-50'], // secondary text
  ['lemn-600', 'in-100'], // secondary text on labels
  ['lemn-800', 'in-100'], // body text on labels and story
  ['brad-900', 'in-100'], // headings on labels
  ['brad-900', 'crema-50'], // headings
  ['brad-700', 'crema-50'], // eyebrow text, outline buttons
  ['brad-700', 'brad-100'], // hero eyebrow
  ['lemn-600', 'brad-100'], // hero paragraph
  ['brad-900', 'brad-100'], // hero heading
  ['crema-50', 'brad-700'], // primary buttons
  ['crema-50', 'afina-700'], // primary buttons on hover
  ['brad-100', 'brad-900'], // footer text
  ['afina-700', 'crema-50'], // link hover, italic heading accents
  ['afina-700', 'brad-100'], // italic accent in the hero heading
  ['afina-700', 'in-100'], // stamp and italic accent in the story
] as const

// Tokens never used for text or behind text: illustrations, focus rings, decorative fills.
const DECORATIVE_ONLY = ['brad-500', 'afina-500', 'miere-500', 'miere-300'] as const

describe('brand colour contrast', () => {
  const tokens = readBrandTokens()

  it('classifies every brand token as a checked text/background colour or decorative', () => {
    const covered = new Set<string>([...TEXT_ON_BACKGROUND.flat(), ...DECORATIVE_ONLY])
    const unclassified = Object.keys(tokens).filter((name) => !covered.has(name))

    expect(Object.keys(tokens).length).toBeGreaterThan(0)
    expect(unclassified, 'add new tokens to TEXT_ON_BACKGROUND or DECORATIVE_ONLY').toEqual([])
  })

  it.each(TEXT_ON_BACKGROUND)('%s text on %s meets WCAG AA', (text, background) => {
    const foreground = tokens[text]
    const backdrop = tokens[background]
    expect(foreground, `missing token ${text}`).toBeDefined()
    expect(backdrop, `missing token ${background}`).toBeDefined()

    expect(contrastRatio(foreground!, backdrop!)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT)
  })

  describe('over the paper texture', () => {
    it('blends the texture in sRGB, so its colours mean what the CSS says', () => {
      // The SVG is URL-encoded in the data URI, so '<filter' appears as '%3Cfilter'.
      expect(INDEX_CSS).toMatch(/(?:<|%3C)filter[^>%]*color-interpolation-filters='sRGB'/)
    })

    it('reads a plausible ink colour and opacity from the texture', () => {
      const ink = readTextureInk()

      expect(ink.maxAlpha).toBeGreaterThan(0)
      expect(ink.maxAlpha).toBeLessThanOrEqual(1)
      expect(ink.rgb.every((channel) => channel >= 0 && channel <= 255)).toBe(true)
    })

    it.each(TEXT_ON_BACKGROUND)(
      '%s text on %s still meets WCAG AA over the darkest texture pixel',
      (text, background) => {
        const textured = blendOver(tokens[background]!, readTextureInk())

        expect(contrastRatio(tokens[text]!, textured)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT)
      },
    )
  })
})
