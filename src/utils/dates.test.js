import { describe, expect, it } from 'vitest'
import { formatDateInput, monthDateBounds, parseExpenseDate } from './dates.js'

describe('formatDateInput', () => {
  it('formats local calendar date as YYYY-MM-DD', () => {
    expect(formatDateInput(new Date(2026, 2, 5))).toBe('2026-03-05')
  })
})

describe('monthDateBounds', () => {
  it('returns first and last day of month (monthIndex 0 = enero)', () => {
    expect(monthDateBounds(2026, 0)).toEqual({ start: '2026-01-01', end: '2026-01-31' })
  })

  it('handles february in leap year', () => {
    expect(monthDateBounds(2024, 1)).toEqual({ start: '2024-02-01', end: '2024-02-29' })
  })
})

describe('parseExpenseDate', () => {
  it('prefers date column', () => {
    expect(parseExpenseDate({ date: '2026-03-15T00:00:00+00:00' })).toBe('2026-03-15')
  })

  it('falls back to created_at', () => {
    expect(parseExpenseDate({ created_at: '2026-01-10T12:00:00.000Z' })).toMatch(/^2026-01-/)
  })
})
