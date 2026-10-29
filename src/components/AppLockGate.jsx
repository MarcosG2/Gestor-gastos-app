import { useCallback, useEffect, useState } from 'react'
import { Fingerprint, Loader2 } from 'lucide-react'
import { isAppLockEnabled, verifyAppLock } from '../utils/appLock'

export default function AppLockGate({ children }) {
  const [locked, setLocked] = useState(() => isAppLockEnabled())
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState(null)

  const tryUnlock = useCallback(async () => {
    if (!isAppLockEnabled()) {
      setLocked(false)
      return
    }
    setChecking(true)
    setError(null)
    try {
      const ok = await verifyAppLock()
      setLocked(!ok)
      if (!ok) setError('No se pudo verificar. Intentá de nuevo.')
    } catch {
      setError('Verificación cancelada o no disponible.')
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    if (isAppLockEnabled()) tryUnlock()
    else setLocked(false)
  }, [tryUnlock])

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && isAppLockEnabled()) {
        setLocked(true)
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  if (!locked) return children

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-band text-on-band px-6">
      <Fingerprint className="w-16 h-16 text-on-band mb-4" />
      <h1 className="text-xl font-bold mb-2">App protegida</h1>
      <p className="text-on-band/80 text-sm text-center mb-6 max-w-sm">
        Usá biometría o PIN del dispositivo para continuar.
      </p>
      {error && <p className="text-[#f3d7a1] text-sm mb-4">{error}</p>}
      <button
        type="button"
        onClick={tryUnlock}
        disabled={checking}
        className="inline-flex items-center gap-2 bg-on-band text-band px-6 py-3 rounded-md font-bold disabled:opacity-50"
      >
        {checking ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
        Desbloquear
      </button>
    </div>
  )
}
