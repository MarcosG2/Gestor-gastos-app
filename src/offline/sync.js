import { removeQueueItem, updateQueueItem, listQueueForUser } from './store.js'
import * as expensesOnline from '../services/online/expenses.js'
import * as incomesOnline from '../services/online/incomes.js'
import * as categoriesOnline from '../services/online/categories.js'

const MAX_RETRIES = 5

const executors = {
  'expense.create': (payload) => expensesOnline.createExpense(payload.payload),
  'expense.update': (payload) =>
    expensesOnline.updateExpense(payload.userId, payload.id, payload.fields),
  'expense.delete': (payload) => expensesOnline.deleteExpense(payload.userId, payload.id),
  'income.create': (payload) => incomesOnline.createIncome(payload.payload),
  'income.update': (payload) =>
    incomesOnline.updateIncome(payload.userId, payload.id, payload.fields),
  'income.delete': (payload) => incomesOnline.deleteIncome(payload.userId, payload.id),
  'category.create': (payload) =>
    categoriesOnline.createCategory(payload.userId, payload.name, payload.color),
  'category.delete': (payload) =>
    categoriesOnline.deleteCategoryAndExpenses(payload.userId, payload.categoryId),
}

export async function flushQueue(userId) {
  const queue = await listQueueForUser(userId)
  const errors = []

  for (const item of queue) {
    const run = executors[item.type]
    if (!run) {
      await removeQueueItem(item.id)
      continue
    }

    try {
      const result = await run(item.payload)
      const err = result?.error
      if (err) throw err
      await removeQueueItem(item.id)
    } catch (e) {
      const retries = (item.retries || 0) + 1
      if (retries >= MAX_RETRIES) {
        errors.push({ id: item.id, message: e?.message || 'Error de sync' })
        await removeQueueItem(item.id)
      } else {
        await updateQueueItem({ ...item, retries })
        errors.push({ id: item.id, message: e?.message || 'Error de sync' })
        break
      }
    }
  }

  return { processed: queue.length, errors }
}

/** @param {Array<{ id: string, createdAt: number }>} items */
export function sortQueueFifo(items) {
  return [...items].sort((a, b) => a.createdAt - b.createdAt)
}

export { executors }
