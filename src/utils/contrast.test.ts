import { describe, expect, it } from 'vitest'
import { contrastRatio } from './contrast'

describe('contrastRatio', () => {
  it('is 21 for black on white, in either order', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5)
  })

  it('is 1 for identical colours', () => {
    expect(contrastRatio('#8a3f6e', '#8a3f6e')).toBe(1)
  })

  it('matches the WCAG reference value for #777 on white', () => {
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2)
  })

  it('accepts 3-digit hex and is case-insensitive', () => {
    expect(contrastRatio('#FFF', '#000')).toBeCloseTo(21, 5)
  })

  it('rejects malformed colours', () => {
    expect(() => contrastRatio('red', '#fff')).toThrow(/invalid hex colour/i)
    expect(() => contrastRatio('#12345', '#fff')).toThrow(/invalid hex colour/i)
  })
})
