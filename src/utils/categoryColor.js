const HEX = /^#([0-9a-f]{6})$/i

export function isHexColor(value) {
  return typeof value === 'string' && HEX.test(value.trim())
}

function hexToRgb(hex) {
  const n = hex.replace('#', '')
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  }
}

function mix(hex, toward, amount) {
  const { r, g, b } = hexToRgb(hex)
  const target = toward === 'white' ? 255 : 0
  const channel = (c) => Math.round(c + (target - c) * amount)
  return `rgb(${channel(r)}, ${channel(g)}, ${channel(b)})`
}

/** Tailwind class string, or a #rrggbb the user picked. */
export function categoryChipProps(color) {
  if (isHexColor(color)) {
    const hex = color.trim()
    return {
      className: '',
      style: {
        backgroundColor: mix(hex, 'white', 0.78),
        color: mix(hex, 'black', 0.45),
      },
    }
  }
  return { className: color || 'bg-paper text-ink', style: undefined }
}

export function categoryDotProps(color) {
  if (isHexColor(color)) {
    return { className: '', style: { backgroundColor: color.trim() } }
  }
  return { className: color || 'bg-line', style: undefined }
}
