import { useEffect } from 'react'
import { fetchBudgetsForMonth } from '../services/budgets'
import { fetchExpensesInRange } from '../services/expenses'
import { useToast } from '../context/ToastContext'
import {
  buildBudgetAlertMessage,
  markBudgetAlertShown,
  shouldShowBudgetAlert,
} from '../utils/budgetAlerts'

export function useBudgetAlerts(userId, categories, start, end, year, month) {
  const { showToast } = useToast()

  useEffect(() => {
    if (!userId || !categories?.length || !navigator.onLine) return

    let cancelled = false

    ;(async () => {
      const [{ data: expenses, error: expErr }, { data: budgets, error: budErr }] =
        await Promise.all([
          fetchExpensesInRange(userId, start, end),
          fetchBudgetsForMonth(userId, year, month),
        ])

      if (cancelled || expErr || budErr) return

      const spentByCat = (expenses || []).reduce((acc, row) => {
        const id = row.category_id
        if (id) acc[id] = (acc[id] || 0) + Number(row.amount)
        return acc
      }, {})

      for (const budget of budgets || []) {
        const catId = budget.category_id
        const spent = spentByCat[catId] || 0
        const limit = Number(budget.amount_limit)
        if (!limit) continue
        if (!shouldShowBudgetAlert(year, month, catId)) continue

        const catName =
          categories.find((c) => c.id === catId)?.name || budget.categories?.name || 'Categoría'
        const msg = buildBudgetAlertMessage(catName, spent, limit)
        if (msg) {
          showToast(msg, 'info')
          markBudgetAlertShown(year, month, catId)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [userId, categories, start, end, year, month, showToast])
}
