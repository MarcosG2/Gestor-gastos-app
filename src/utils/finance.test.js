import { describe, expect, it } from 'vitest'
import { buildExpensesCsvContent } from './csv.js'
import { budgetUsagePercent, isBudgetOver, monthlyBalance } from './finance.js'

describe('monthlyBalance', () => {
  it('subtracts expenses from income', () => {
    expect(monthlyBalance(100000, 35000)).toBe(65000)
  })
})

describe('budgetUsagePercent', () => {
  it('returns percentage capped at 100', () => {
    expect(budgetUsagePercent(50, 100)).toBe(50)
    expect(budgetUsagePercent(150, 100)).toBe(100)
  })

  it('returns 0 for invalid limit', () => {
    expect(budgetUsagePercent(50, 0)).toBe(0)
  })
})

describe('isBudgetOver', () => {
  it('detects overspend', () => {
    expect(isBudgetOver(101, 100)).toBe(true)
    expect(isBudgetOver(100, 100)).toBe(false)
  })
})

describe('buildExpensesCsvContent', () => {
  it('escapes commas and quotes in description', () => {
    const csv = buildExpensesCsvContent([
      {
        date: '2026-03-01',
        categories: { name: 'Comida' },
        description: 'Cena, "especial"',
        amount: 12.5,
      },
    ])
    expect(csv).toContain('"Cena, ""especial"""')
    expect(csv.split('\n')).toHaveLength(2)
  })
})
