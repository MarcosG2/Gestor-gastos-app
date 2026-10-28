const DB_NAME = 'gestor-gastos-offline'
const DB_VERSION = 1

let dbPromise = null

function openDb() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('readCache')) {
        db.createObjectStore('readCache')
      }
      if (!db.objectStoreNames.contains('writeQueue')) {
        const store = db.createObjectStore('writeQueue', { keyPath: 'id' })
        store.createIndex('userId', 'userId', { unique: false })
      }
    }
  })
  return dbPromise
}

export async function idbGet(storeName, key) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).get(key)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result ?? null)
  })
}

export async function idbSet(storeName, key, value) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function idbDelete(storeName, key) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function idbGetAllByIndex(storeName, indexName, value) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const index = tx.objectStore(storeName).index(indexName)
    const req = index.getAll(value)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result || [])
  })
}

export async function idbPut(storeName, value) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).put(value)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function idbDeleteRecord(storeName, key) {
  return idbDelete(storeName, key)
}

export function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}
