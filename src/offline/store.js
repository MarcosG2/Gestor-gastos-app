import { idbGet, idbSet, idbGetAllByIndex, idbPut, idbDeleteRecord } from './idb.js'

export async function getReadCache(key) {
  const entry = await idbGet('readCache', key)
  if (!entry) return null
  return entry.value
}

export async function setReadCache(key, value) {
  await idbSet('readCache', key, { value, updatedAt: Date.now() })
}

export async function enqueueWrite(userId, item) {
  await idbPut('writeQueue', { ...item, userId })
}

export async function listQueueForUser(userId) {
  const items = await idbGetAllByIndex('writeQueue', 'userId', userId)
  return items.sort((a, b) => a.createdAt - b.createdAt)
}

export async function removeQueueItem(id) {
  await idbDeleteRecord('writeQueue', id)
}

export async function updateQueueItem(item) {
  await idbPut('writeQueue', item)
}

export async function countQueueForUser(userId) {
  const items = await listQueueForUser(userId)
  return items.length
}
