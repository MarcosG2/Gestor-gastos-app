import { monthDateBounds } from './dates'
import { fetchRecurringItems } from '../services/recurring'
import * as expensesOnline from '../services/online/expenses'
import * as incomesOnline from '../services/online/incomes'

function eventDateForMonth(year, monthIndex, dayOfMonth) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const day = Math.min(dayOfMonth, daysInMonth)
  const d = new Date(year, monthIndex, day)
  return d.toISOString().slice(0, 10)
}

export async function runRecurringForUser(userId) {
  if (!navigator.onLine) return

  const { data: items, error } = await fetchRecurringItems(userId)
  if (error || !items?.length) return

  const now = new Date()
  const year = now.getFullYear()
  const monthIndex = now.getMonth()
  const { start, end } = monthDateBounds(year, monthIndex)

  for (const item of items) {
    if (!item.active) continue

    const date = eventDateForMonth(year, monthIndex, item.day_of_month)

    if (item.kind === 'expense') {
      const { data: existing } = await expensesOnline.expenseExistsForRecurring(
        userId,
        item.id,
        start,
        end,
      )
      if (existing) continue

      await expensesOnline.createExpense({
        user_id: userId,
        amount: item.amount,
        description: item.description,
        category_id: item.category_id,
        date,
        recurring_item_id: item.id,
      })
    } else {
      const { data: existing } = await incomesOnline.incomeExistsForRecurring(
        userId,
        item.id,
        start,
        end,
      )
      if (existing) continue

      await incomesOnline.createIncome({
        user_id: userId,
        amount: item.amount,
        description: item.description,
        date,
        recurring_item_id: item.id,
      })
    }
  }
}
