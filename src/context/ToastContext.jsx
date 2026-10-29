import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const styles = {
  success: 'bg-band text-on-band',
  error: 'bg-[#9f2d2d] text-[#f4f6f5]',
  info: 'bg-ink text-on-band',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-4 left-4 right-4 z-[100] mx-auto flex max-w-sm flex-col gap-2 pointer-events-none md:left-auto md:right-4 md:mx-0"
        aria-live="polite"
      >
        {toasts.map(({ id, message, type }) => {
          const Icon = icons[type] || Info
          return (
            <div
              key={id}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in ${styles[type] || styles.info}`}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook compartido con el provider
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de ToastProvider')
  }
  return ctx
}
