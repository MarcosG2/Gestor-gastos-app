import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Mail,
  Calendar,
  Trash2,
  ShieldAlert,
  Edit2,
  Save,
  X,
  Loader2,
  RefreshCw,
  Smartphone,
  Moon,
  Fingerprint,
} from 'lucide-react'
import Modal from './Modal'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'
import {
  disableAppLock,
  enableAppLock,
  isAppLockEnabled,
  isAppLockSupported,
} from '../utils/appLock'
import {
  fetchAccountStats,
  fetchProfileName,
  resetUserFinancialData,
  updateProfileName,
} from '../services/profiles'

function initialsFromName(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function isIosBrowser() {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

function isStandaloneDisplay() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches
}

function StatRow({ label, value, loading }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 dark:border-slate-700 last:border-0">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      {loading ? (
        <span className="inline-block h-6 w-10 rounded-md bg-gray-100 animate-pulse" aria-hidden />
      ) : (
        <span className="text-lg font-semibold tabular-nums text-gray-900 dark:text-gray-100">{value}</span>
      )}
    </div>
  )
}

export default function Profile({ session }) {
  const userId = session.user.id
  const { showToast } = useToast()
  const { mode, setMode } = useTheme()
  const [appLockOn, setAppLockOn] = useState(() => isAppLockEnabled())
  const [lockBusy, setLockBusy] = useState(false)
  const showIosInstall = isIosBrowser() && !isStandaloneDisplay()

  const [stats, setStats] = useState({ expenses: 0, categories: 0, incomes: 0, budgets: 0 })
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState(null)
  const [resetLoading, setResetLoading] = useState(false)

  const [userName, setUserName] = useState('Usuario')
  const [nameLoading, setNameLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const joinDate = useMemo(
    () =>
      new Date(session.user.created_at).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [session.user.created_at],
  )

  const avatarLabel = useMemo(() => initialsFromName(userName), [userName])

  const loadProfile = useCallback(async () => {
    setNameLoading(true)
    const { data, error } = await fetchProfileName(userId)
    if (error && error.code !== 'PGRST116') {
      showToast(error.message, 'error')
    } else if (data?.full_name?.trim()) {
      setUserName(data.full_name.trim())
    }
    setNameLoading(false)
  }, [userId, showToast])

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    setStatsError(null)
    const { data, error } = await fetchAccountStats(userId)
    if (error) {
      setStatsError(error.message)
      showToast('No se pudo cargar el resumen: ' + error.message, 'error')
    } else {
      setStats(data)
    }
    setStatsLoading(false)
  }, [userId, showToast])

  useEffect(() => {
    loadProfile()
    loadStats()
  }, [loadProfile, loadStats])

  const startEditName = () => {
    setEditName(userName === 'Usuario' ? '' : userName)
    setIsEditing(true)
  }

  const cancelEditName = () => {
    setIsEditing(false)
    setEditName('')
  }

  const handleSaveName = async () => {
    const trimmed = editName.trim()
    if (!trimmed) {
      showToast('Escribí un nombre para guardar', 'error')
      return
    }

    setIsSaving(true)
    const { error } = await updateProfileName(userId, trimmed)
    setIsSaving(false)

    if (error) {
      showToast('Error al actualizar el nombre: ' + error.message, 'error')
      return
    }

    setUserName(trimmed)
    setIsEditing(false)
    showToast('Nombre actualizado', 'success')
  }

  const handleToggleAppLock = async () => {
    if (!isAppLockSupported()) {
      showToast('WebAuthn no está disponible en este dispositivo', 'error')
      return
    }
    setLockBusy(true)
    try {
      if (appLockOn) {
        disableAppLock()
        setAppLockOn(false)
        showToast('Bloqueo desactivado', 'info')
      } else {
        await enableAppLock(userId)
        setAppLockOn(true)
        showToast('Bloqueo activado — se pedirá al volver a la app', 'success')
      }
    } catch (e) {
      showToast(e.message || 'No se pudo configurar el bloqueo', 'error')
    } finally {
      setLockBusy(false)
    }
  }

  const handleResetAccount = async () => {
    setResetLoading(true)
    setIsResetModalOpen(false)

    const { error } = await resetUserFinancialData(userId)
    setResetLoading(false)

    if (error) {
      showToast('Error al resetear los datos: ' + error.message, 'error')
      return
    }

    await loadStats()
    setIsSuccessModalOpen(true)
  }

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false)
    window.location.reload()
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-lg space-y-6">
      <header className="min-w-0">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mi perfil</h1>
        <p className="mt-1 text-sm text-gray-600">
          Datos de la cuenta y resumen de tu actividad en el gestor.
        </p>
      </header>

      <section
        className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden min-w-0"
        aria-labelledby="profile-account-heading"
      >
        <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
          <h2 id="profile-account-heading" className="text-sm font-semibold text-gray-800">
            Cuenta
          </h2>
        </div>

        <div className="p-4 sm:p-5 space-y-5 min-w-0">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-800"
              aria-hidden
            >
              {nameLoading ? '…' : avatarLabel}
            </div>

            <div className="min-w-0 flex-1">
              {isEditing ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label className="sr-only" htmlFor="profile-name-input">
                    Nombre visible
                  </label>
                  <input
                    id="profile-name-input"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={80}
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-base font-semibold text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName()
                      if (e.key === 'Escape') cancelEditName()
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveName}
                      disabled={isSaving}
                      aria-label="Guardar nombre"
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                    >
                      {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditName}
                      disabled={isSaving}
                      aria-label="Cancelar edición"
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-lg font-semibold text-gray-900 truncate">{userName}</p>
                  <button
                    type="button"
                    onClick={startEditName}
                    aria-label="Editar nombre"
                    className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex gap-3 min-w-0">
              <dt className="flex shrink-0 items-center gap-2 text-gray-500">
                <Mail className="h-4 w-4 text-indigo-600" aria-hidden />
                Email
              </dt>
              <dd className="min-w-0 break-all text-gray-800">{session.user.email}</dd>
            </div>
            <div className="flex gap-3 min-w-0">
              <dt className="flex shrink-0 items-center gap-2 text-gray-500">
                <Calendar className="h-4 w-4 text-indigo-600" aria-hidden />
                Alta
              </dt>
              <dd className="text-gray-800 capitalize">{joinDate}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section
        className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden min-w-0"
        aria-labelledby="profile-activity-heading"
      >
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 sm:px-5">
          <h2 id="profile-activity-heading" className="text-sm font-semibold text-gray-800">
            Actividad registrada
          </h2>
          <button
            type="button"
            onClick={loadStats}
            disabled={statsLoading}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} aria-hidden />
            Actualizar
          </button>
        </div>

        <div className="px-4 sm:px-5 py-2">
          {statsError && !statsLoading ? (
            <p className="py-4 text-sm text-rose-700" role="alert">
              No pudimos cargar los totales. Probá de nuevo con Actualizar.
            </p>
          ) : (
            <>
              <StatRow label="Gastos" value={stats.expenses} loading={statsLoading} />
              <StatRow label="Ingresos" value={stats.incomes} loading={statsLoading} />
              <StatRow label="Categorías" value={stats.categories} loading={statsLoading} />
              <StatRow label="Presupuestos" value={stats.budgets} loading={statsLoading} />
            </>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden min-w-0">
        <div className="border-b border-gray-100 dark:border-slate-700 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Moon className="h-4 w-4 text-indigo-600" aria-hidden />
            Apariencia y app
          </h2>
        </div>
        <div className="p-4 sm:p-5 space-y-4">
          <label className="block text-sm text-gray-600 dark:text-gray-400">
            Tema
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white px-3 py-2"
            >
              <option value="system">Sistema</option>
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </label>

          {isAppLockSupported() ? (
            <button
              type="button"
              onClick={handleToggleAppLock}
              disabled={lockBusy}
              className="w-full flex items-center justify-center gap-2 min-h-11 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/40 disabled:opacity-50"
            >
              {lockBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Fingerprint className="h-4 w-4" />
              )}
              {appLockOn ? 'Desactivar bloqueo al abrir' : 'Activar bloqueo al abrir'}
            </button>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              El bloqueo con biometría no está disponible en este navegador.
            </p>
          )}

          {showIosInstall && (
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-4 text-sm text-indigo-900 dark:text-indigo-100 flex gap-3">
              <Smartphone className="h-5 w-5 shrink-0" aria-hidden />
              <p>
                En iPhone/iPad: tocá <strong>Compartir</strong> en Safari y elegí{' '}
                <strong>Agregar a pantalla de inicio</strong> para instalar la app.
              </p>
            </div>
          )}
        </div>
      </section>

      <section
        className="rounded-2xl border border-rose-200 bg-white dark:bg-slate-800 dark:border-rose-900 shadow-sm overflow-hidden min-w-0"
        aria-labelledby="profile-danger-heading"
      >
        <div className="border-b border-rose-100 bg-rose-50/80 px-4 py-3 sm:px-5">
          <h2
            id="profile-danger-heading"
            className="text-sm font-semibold text-rose-900 flex items-center gap-2"
          >
            <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden />
            Borrar datos financieros
          </h2>
        </div>
        <div className="p-4 sm:p-5 space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            Eliminá gastos, ingresos, presupuestos y categorías. Tu usuario y el inicio de sesión
            no se borran. Las categorías por defecto no se recrean solas: tendrás que crearlas de
            nuevo.
          </p>
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            disabled={resetLoading}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-300 bg-white px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-600 hover:text-white disabled:opacity-50 cursor-pointer transition-colors"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            {resetLoading ? 'Borrando…' : 'Borrar todos mis datos'}
          </button>
        </div>
      </section>

      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetAccount}
        title="Confirmar borrado"
        message="Esta acción no se puede deshacer. Se eliminarán gastos, ingresos, presupuestos y categorías."
        confirmText="Sí, borrar todo"
        isDanger
        requireInput
        expectedWord="BORRAR"
      />

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={closeSuccessModal}
        onConfirm={closeSuccessModal}
        title="Datos eliminados"
        message="Tus movimientos y categorías se borraron. La app se recargará para sincronizar el resto de pantallas."
        confirmText="Entendido"
        cancelText="Cerrar"
      />
    </div>
  )
}
