/** @param {number} totalIncome */
/** @param {number} totalExpenses */
export function monthlyBalance(totalIncome, totalExpenses) {
  return Number(totalIncome) - Number(totalExpenses)
}

export function budgetUsagePercent(spent, limit) {
  const lim = Number(limit)
  if (!Number.isFinite(lim) || lim <= 0) return 0
  return Math.min(100, (Number(spent) / lim) * 100)
}

export function isBudgetOver(spent, limit) {
  return Number(spent) > Number(limit)
}
