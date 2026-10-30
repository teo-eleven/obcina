import { describe, expect, it } from 'vitest'
import { CATEGORIES } from './categories'

describe('CATEGORIES', () => {
  it('is not empty', () => {
    expect(CATEGORIES.length).toBeGreaterThan(0)
  })

  it('uses unique, url-safe slugs', () => {
    const slugs = CATEGORIES.map((category) => category.slug)

    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    }
  })

  it('gives every category a name and a description', () => {
    for (const category of CATEGORIES) {
      expect(category.name.trim()).not.toBe('')
      expect(category.description.trim()).not.toBe('')
    }
  })
})
