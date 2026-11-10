// WCAG 2.x contrast ratio between two sRGB hex colours (https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio).

const HEX_COLOUR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

type Rgb = readonly [red: number, green: number, blue: number]

function parseHex(hex: string): Rgb {
  const digits = HEX_COLOUR.exec(hex)?.[1]
  if (!digits) {
    throw new Error(`Invalid hex colour: ${hex}`)
  }
  const full = digits.length === 3 ? digits.replace(/./g, (digit) => digit + digit) : digits
  const channel = (offset: number) => parseInt(full.slice(offset, offset + 2), 16)
  return [channel(0), channel(2), channel(4)]
}

function channelToLinear(channel: number): number {
  const srgb = channel / 255
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(hex: string): number {
  const [red, green, blue] = parseHex(hex)
  return (
    0.2126 * channelToLinear(red) + 0.7152 * channelToLinear(green) + 0.0722 * channelToLinear(blue)
  )
}

export function contrastRatio(foreground: string, background: string): number {
  const first = relativeLuminance(foreground)
  const second = relativeLuminance(background)
  const lighter = Math.max(first, second)
  const darker = Math.min(first, second)
  return (lighter + 0.05) / (darker + 0.05)
}
