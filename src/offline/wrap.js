import { isOnline } from './idb.js'
import { getReadCache, setReadCache } from './store.js'

export async function withOfflineRead(key, fetchOnline, { offlineMessage } = {}) {
  if (isOnline()) {
    const result = await fetchOnline()
    const hasError = result?.error != null
    if (!hasError) {
      await setReadCache(key, result)
    }
    return { ...result, fromCache: false, offlineMessage: null }
  }

  const cached = await getReadCache(key)
  if (cached) {
    return {
      ...cached,
      fromCache: true,
      offlineMessage: offlineMessage || 'Datos guardados — puede estar desactualizado',
    }
  }

  return {
    data: null,
    error: { message: 'Sin conexión y sin datos guardados' },
    fromCache: false,
    offlineMessage: null,
  }
}

export function tempId() {
  return `temp_${crypto.randomUUID()}`
}
