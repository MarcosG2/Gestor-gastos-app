import * as online from './online/expenses.js'
import { isOnline } from '../offline/idb.js'
import { withOfflineRead, tempId } from '../offline/wrap.js'
import {
  cacheKeyRecentExpenses,
  cacheKeyDashboardTotals,
} from '../offline/keys.js'
import { enqueueWrite, getReadCache, setReadCache } from '../offline/store.js'

export async function fetchRecentExpenses(userId, limit = 10) {
  const key = cacheKeyRecentExpenses(userId)
  const wrapped = await withOfflineRead(key, () => online.fetchRecentExpenses(userId, limit))
  if (wrapped.fromCache && wrapped.data) {
    return { data: wrapped.data, error: wrapped.error, offlineMessage: wrapped.offlineMessage }
  }
  return { data: wrapped.data, error: wrapped.error, offlineMessage: wrapped.offlineMessage }
}

export async function fetchExpensesPage(userId, opts) {
  if (!isOnline()) {
    return {
      data: [],
      error: { message: 'Historial no disponible sin conexión' },
      count: 0,
    }
  }
  return online.fetchExpensesPage(userId, opts)
}

export async function fetchExpensesInRange(userId, start, end) {
  if (!isOnline()) {
    return { data: [], error: { message: 'Sin conexión' } }
  }
  return online.fetchExpensesInRange(userId, start, end)
}

export async function sumExpensesInRange(userId, start, end) {
  const key = cacheKeyDashboardTotals(userId, start, end)
  if (isOnline()) {
    const result = await online.sumExpensesInRange(userId, start, end)
    if (!result.error) {
      const prev = (await getReadCache(key)) || {}
      await setReadCache(key, { ...prev, expenseTotal: result.total })
    }
    return result
  }
  const cached = await getReadCache(key)
  if (cached?.expenseTotal != null) {
    return {
      total: cached.expenseTotal,
      error: null,
      offlineMessage: 'Datos guardados — puede estar desactualizado',
    }
  }
  return { total: 0, error: { message: 'Sin conexión' } }
}

export async function createExpense(payload) {
  if (isOnline()) {
    return online.createExpense(payload)
  }
  const id = tempId()
  await enqueueWrite(payload.user_id, {
    id: crypto.randomUUID(),
    type: 'expense.create',
    payload: { payload },
    createdAt: Date.now(),
    retries: 0,
  })
  return {
    data: { ...payload, id, _pending: true },
    error: null,
    queued: true,
  }
}

export async function updateExpense(userId, id, fields) {
  if (isOnline()) {
    return online.updateExpense(userId, id, fields)
  }
  await enqueueWrite(userId, {
    id: crypto.randomUUID(),
    type: 'expense.update',
    payload: { userId, id, fields },
    createdAt: Date.now(),
    retries: 0,
  })
  return { data: null, error: null, queued: true }
}

export async function deleteExpense(userId, id) {
  if (isOnline()) {
    return online.deleteExpense(userId, id)
  }
  await enqueueWrite(userId, {
    id: crypto.randomUUID(),
    type: 'expense.delete',
    payload: { userId, id },
    createdAt: Date.now(),
    retries: 0,
  })
  return { data: null, error: null, queued: true }
}

export async function fetchExpensesForExport(userId, filters) {
  if (!isOnline()) {
    return { data: null, error: { message: 'Exportación requiere conexión' } }
  }
  return online.fetchExpensesForExport(userId, filters)
}

export { online }
