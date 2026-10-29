import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { applyPwaUpdate, onPwaNeedRefresh } from '../pwa/registerPwa'

export default function PwaUpdatePrompt() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    return onPwaNeedRefresh(() => setVisible(true))
  }, [])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[110] bg-band text-white px-4 py-3 shadow-lg flex flex-wrap items-center justify-center gap-3 text-sm font-medium">
      <span>Hay una nueva versión de la app.</span>
      <button
        type="button"
        onClick={() => applyPwaUpdate()}
        className="inline-flex items-center gap-2 rounded-lg bg-paper text-link px-3 py-1.5 font-bold hover:bg-band/10"
      >
        <RefreshCw className="w-4 h-4" />
        Recargar
      </button>
    </div>
  )
}
