import { budgetUsagePercent, isBudgetOver } from './finance'

export function budgetAlertKey(year, month, categoryId) {
  return `budget-alert:${year}-${month}-${categoryId}`
}

export function shouldShowBudgetAlert(year, month, categoryId) {
  if (typeof sessionStorage === 'undefined') return true
  return !sessionStorage.getItem(budgetAlertKey(year, month, categoryId))
}

export function markBudgetAlertShown(year, month, categoryId) {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(budgetAlertKey(year, month, categoryId), '1')
}

export function buildBudgetAlertMessage(categoryName, spent, limit) {
  const pct = budgetUsagePercent(spent, limit)
  if (isBudgetOver(spent, limit)) {
    return `Presupuesto superado en «${categoryName}» (${pct}% de $${limit}).`
  }
  if (pct >= 80) {
    return `Presupuesto al ${pct}% en «${categoryName}».`
  }
  return null
}
