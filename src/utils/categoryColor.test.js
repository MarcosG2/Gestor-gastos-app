import { describe, expect, it } from 'vitest'
import { categoryChipProps, categoryDotProps, isHexColor } from './categoryColor.js'

describe('categoryColor', () => {
  it('keeps existing Tailwind category classes', () => {
    expect(categoryChipProps('bg-red-100 text-red-600')).toEqual({
      className: 'bg-red-100 text-red-600',
      style: undefined,
    })
    expect(categoryDotProps('bg-blue-100 text-blue-600').className).toBe('bg-blue-100 text-blue-600')
  })

  it('turns a custom hex into a light chip and a solid dot', () => {
    expect(isHexColor('#aabbcc')).toBe(true)
    const chip = categoryChipProps('#ff8800')
    expect(chip.className).toBe('')
    expect(chip.style.backgroundColor).toMatch(/^rgb\(/)
    expect(chip.style.color).toMatch(/^rgb\(/)
    expect(categoryDotProps('#ff8800').style.backgroundColor).toBe('#ff8800')
  })
})
