import * as online from './online/categories.js'
import { isOnline } from '../offline/idb.js'
import { withOfflineRead } from '../offline/wrap.js'
import { cacheKeyCategories } from '../offline/keys.js'
import { enqueueWrite } from '../offline/store.js'

export async function fetchCategories(userId) {
  const key = cacheKeyCategories(userId)
  const wrapped = await withOfflineRead(key, () => online.fetchCategories(userId))
  return {
    data: wrapped.data,
    error: wrapped.error,
    offlineMessage: wrapped.offlineMessage,
  }
}

export async function createCategory(userId, name, color) {
  if (isOnline()) {
    return online.createCategory(userId, name, color)
  }
  await enqueueWrite(userId, {
    id: crypto.randomUUID(),
    type: 'category.create',
    payload: { userId, name, color },
    createdAt: Date.now(),
    retries: 0,
  })
  return { data: null, error: null, queued: true }
}

export async function deleteCategoryAndExpenses(userId, categoryId) {
  if (!isOnline()) {
    return { error: { message: 'Borrar categorías requiere conexión' } }
  }
  return online.deleteCategoryAndExpenses(userId, categoryId)
}

export { online }
