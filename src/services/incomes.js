import * as online from './online/incomes.js'
import { isOnline } from '../offline/idb.js'
import { withOfflineRead, tempId } from '../offline/wrap.js'
import { cacheKeyRecentIncomes } from '../offline/keys.js'
import { enqueueWrite, getReadCache, setReadCache } from '../offline/store.js'
import { cacheKeyDashboardTotals } from '../offline/keys.js'

export async function fetchRecentIncomes(userId, limit = 5) {
  const key = cacheKeyRecentIncomes(userId)
  const wrapped = await withOfflineRead(key, () => online.fetchRecentIncomes(userId, limit))
  return {
    data: wrapped.data,
    error: wrapped.error,
    offlineMessage: wrapped.offlineMessage,
  }
}

export async function sumIncomesInRange(userId, start, end) {
  const key = cacheKeyDashboardTotals(userId, start, end)
  if (isOnline()) {
    const result = await online.sumIncomesInRange(userId, start, end)
    if (!result.error) {
      const prev = (await getReadCache(key)) || {}
      await setReadCache(key, { ...prev, incomeTotal: result.total })
    }
    return result
  }
  const cached = await getReadCache(key)
  if (cached?.incomeTotal != null) {
    return {
      total: cached.incomeTotal,
      error: null,
      offlineMessage: 'Datos guardados — puede estar desactualizado',
    }
  }
  return { total: 0, error: { message: 'Sin conexión' } }
}

export async function createIncome(payload) {
  if (isOnline()) {
    return online.createIncome(payload)
  }
  const id = tempId()
  await enqueueWrite(payload.user_id, {
    id: crypto.randomUUID(),
    type: 'income.create',
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

export async function updateIncome(userId, id, fields) {
  if (isOnline()) {
    return online.updateIncome(userId, id, fields)
  }
  await enqueueWrite(userId, {
    id: crypto.randomUUID(),
    type: 'income.update',
    payload: { userId, id, fields },
    createdAt: Date.now(),
    retries: 0,
  })
  return { data: null, error: null, queued: true }
}

export async function deleteIncome(userId, id) {
  if (isOnline()) {
    return online.deleteIncome(userId, id)
  }
  await enqueueWrite(userId, {
    id: crypto.randomUUID(),
    type: 'income.delete',
    payload: { userId, id },
    createdAt: Date.now(),
    retries: 0,
  })
  return { data: null, error: null, queued: true }
}

export { online }
