import { useCallback, useEffect, useState } from 'react'
import { Loader2, PiggyBank, Plus, Trash2 } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { useOfflineSync } from '../context/OfflineSyncContext'
import {
  contributeToGoal,
  createSavingsGoal,
  deleteSavingsGoal,
  fetchSavingsGoals,
} from '../services/goals'
import Modal from './Modal'

function money(n) {
  return `$ ${Number(n).toLocaleString('es-AR')}`
}

export default function SavingsGoals({ session }) {
  const userId = session.user.id
  const { showToast } = useToast()
  const { online } = useOfflineSync()

  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [contributeId, setContributeId] = useState(null)
  const [contributeAmount, setContributeAmount] = useState('')

  const load = useCallback(async () => {
    if (!online) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await fetchSavingsGoals(userId)
    if (error) showToast(error.message, 'error')
    else setGoals(data || [])
    setLoading(false)
  }, [userId, online, showToast])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!online) {
      showToast('Las metas requieren conexión', 'error')
      return
    }
    const t = parseFloat(target)
    if (!name.trim() || !Number.isFinite(t) || t <= 0) {
      showToast('Completá nombre y meta válida', 'error')
      return
    }
    setSaving(true)
    const { error } = await createSavingsGoal({
      user_id: userId,
      name: name.trim(),
      target_amount: t,
      saved_amount: 0,
      deadline: deadline || null,
    })
    setSaving(false)
    if (error) showToast(error.message, 'error')
    else {
      showToast('Meta creada', 'success')
      setName('')
      setTarget('')
      setDeadline('')
      load()
    }
  }

  const handleContribute = async () => {
    if (!contributeId || !online) return
    const amt = parseFloat(contributeAmount)
    if (!Number.isFinite(amt) || amt <= 0) {
      showToast('Monto inválido', 'error')
      return
    }
    const { error } = await contributeToGoal(userId, contributeId, amt)
    if (error) showToast(error.message, 'error')
    else {
      showToast('Aporte registrado', 'success')
      setContributeId(null)
      setContributeAmount('')
      load()
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete || !online) return
    const { error } = await deleteSavingsGoal(userId, pendingDelete)
    setPendingDelete(null)
    if (error) showToast(error.message, 'error')
    else {
      showToast('Meta eliminada', 'success')
      load()
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <PiggyBank className="w-8 h-8 text-indigo-600" />
        Metas de ahorro
      </h2>

      <form
        onSubmit={handleCreate}
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 space-y-3"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la meta"
          className="w-full px-4 py-2 border dark:border-slate-600 rounded-xl dark:bg-slate-900 dark:text-white"
        />
        <input
          type="number"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Objetivo ($)"
          className="w-full px-4 py-2 border dark:border-slate-600 rounded-xl dark:bg-slate-900 dark:text-white"
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full px-4 py-2 border dark:border-slate-600 rounded-xl dark:bg-slate-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={saving || !online}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          Crear meta
        </button>
      </form>

      {loading ? (
        <p className="text-center text-gray-500">Cargando…</p>
      ) : (
        <ul className="space-y-4">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((Number(g.saved_amount) / Number(g.target_amount)) * 100))
            return (
              <li
                key={g.id}
                className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl p-5"
              >
                <div className="flex justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{g.name}</h3>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(g.id)}
                    className="text-red-500 p-1"
                    aria-label="Eliminar meta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {money(g.saved_amount)} de {money(g.target_amount)} ({pct}%)
                </p>
                <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-indigo-600" style={{ width: `${pct}%` }} />
                </div>
                <button
                  type="button"
                  onClick={() => setContributeId(g.id)}
                  disabled={!online}
                  className="text-sm font-semibold text-indigo-600 hover:underline disabled:opacity-50"
                >
                  Registrar aporte
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <Modal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar meta"
        message="Esta acción no se puede deshacer."
        confirmText="Eliminar"
        isDanger
      />

      {contributeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-lg mb-3 dark:text-white">Aporte a la meta</h3>
            <input
              type="number"
              value={contributeAmount}
              onChange={(e) => setContributeAmount(e.target.value)}
              placeholder="Monto"
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setContributeId(null)
                  setContributeAmount('')
                }}
                className="px-4 py-2 rounded-lg text-gray-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleContribute}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
