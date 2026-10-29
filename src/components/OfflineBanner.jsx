import { WifiOff } from 'lucide-react'
import { useOfflineSync } from '../context/OfflineSyncContext.jsx'

export default function OfflineBanner() {
  const { online, pendingCount, syncing } = useOfflineSync()

  if (online && pendingCount === 0 && !syncing) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[90] bg-amber-600 text-white text-sm font-medium px-4 py-2 flex flex-wrap items-center justify-center gap-2 md:pl-64"
      role="status"
    >
      {!online && (
        <>
          <WifiOff className="w-4 h-4 shrink-0" aria-hidden />
          <span>Sin conexión — podés consultar datos guardados y encolar cambios.</span>
        </>
      )}
      {online && syncing && <span>Sincronizando cambios…</span>}
      {pendingCount > 0 && (
        <span className="rounded-full bg-paper/20 px-2 py-0.5 text-xs">
          {pendingCount} pendiente{pendingCount === 1 ? '' : 's'}
        </span>
      )}
    </div>
  )
}
