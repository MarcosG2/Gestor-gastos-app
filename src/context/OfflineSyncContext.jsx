import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { flushQueue } from '../offline/sync.js'
import { countQueueForUser } from '../offline/store.js'
import { useOnlineStatus } from '../hooks/useOnlineStatus.js'

const OfflineSyncContext = createContext(null)

export function OfflineSyncProvider({ children, session }) {
  const online = useOnlineStatus()
  const [pendingCount, setPendingCount] = useState(0)
  const [syncing, setSyncing] = useState(false)

  const refreshCount = useCallback(async () => {
    if (!session?.user?.id) {
      setPendingCount(0)
      return
    }
    setPendingCount(await countQueueForUser(session.user.id))
  }, [session?.user?.id])

  useEffect(() => {
    refreshCount()
  }, [refreshCount, online])

  useEffect(() => {
    if (!online || !session?.user?.id) return

    let cancelled = false
    ;(async () => {
      setSyncing(true)
      await flushQueue(session.user.id)
      if (!cancelled) {
        await refreshCount()
        setSyncing(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [online, session?.user?.id, refreshCount])

  useEffect(() => {
    if (!session?.user?.id) return
    const interval = setInterval(refreshCount, 5000)
    return () => clearInterval(interval)
  }, [session?.user?.id, refreshCount])

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => refreshCount())
    return () => sub.subscription.unsubscribe()
  }, [refreshCount])

  return (
    <OfflineSyncContext.Provider value={{ online, pendingCount, syncing, refreshCount }}>
      {children}
    </OfflineSyncContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook compartido con el provider
export function useOfflineSync() {
  const ctx = useContext(OfflineSyncContext)
  if (!ctx) {
    throw new Error('useOfflineSync debe usarse dentro de OfflineSyncProvider')
  }
  return ctx
}
