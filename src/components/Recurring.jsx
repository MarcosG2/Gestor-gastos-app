import { useCallback, useEffect, useState } from 'react'
import { Loader2, Plus, Repeat, Trash2 } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { useToast } from '../context/ToastContext'
import { useOfflineSync } from '../context/OfflineSyncContext'
import {
  createRecurringItem,
  deleteRecurringItem,
  fetchRecurringItems,
  updateRecurringItem,
} from '../services/recurring'
import Modal from './Modal'

export default function Recurring({ session }) {
  const userId = session.user.id
  const { categories } = useCategories(userId)
  const { showToast } = useToast()
  const { online } = useOfflineSync()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const [kind, setKind] = useState('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState('1')

  const load = useCallback(async () => {
    if (!online) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await fetchRecurringItems(userId)
    if (error) showToast(error.message, 'error')
    else setItems(data || [])
    setLoading(false)
  }, [userId, online, showToast])

  useEffect(() => {
    load()
  }, [load])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!online) {
      showToast('Los recurrentes requieren conexión', 'error')
      return
    }
    const parsed = parseFloat(amount)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      showToast('Monto inválido', 'error')
      return
    }
    if (kind === 'expense' && !categoryId) {
      showToast('Elegí categoría', 'error')
      return
    }

    setSaving(true)
    const { error } = await createRecurringItem({
      user_id: userId,
      kind,
      amount: parsed,
      description: description.trim() || null,
      category_id: kind === 'expense' ? Number(categoryId) : null,
      day_of_month: Number(dayOfMonth),
      active: true,
    })
    setSaving(false)

    if (error) showToast(error.message, 'error')
    else {
      showToast('Recurrente creado', 'success')
      setAmount('')
      setDescription('')
      load()
    }
  }

  const toggleActive = async (item) => {
    if (!online) return
    const { error } = await updateRecurringItem(userId, item.id, { active: !item.active })
    if (error) showToast(error.message, 'error')
    else load()
  }

  const confirmDelete = async () => {
    if (!pendingDelete || !online) return
    const { error } = await deleteRecurringItem(userId, pendingDelete)
    setPendingDelete(null)
    if (error) showToast(error.message, 'error')
    else {
      showToast('Recurrente eliminado', 'success')
      load()
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <Repeat className="w-8 h-8 text-indigo-600" />
        Movimientos recurrentes
      </h2>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            {['expense', 'income'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={`flex-1 py-2 rounded-xl font-semibold text-sm ${kind === k ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}
              >
                {k === 'expense' ? 'Gasto' : 'Ingreso'}
              </button>
            ))}
          </div>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Monto"
            className="w-full px-4 py-2 border dark:border-slate-600 rounded-xl dark:bg-slate-900 dark:text-white"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción"
            className="w-full px-4 py-2 border dark:border-slate-600 rounded-xl dark:bg-slate-900 dark:text-white"
          />
          {kind === 'expense' && (
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2 border dark:border-slate-600 rounded-xl dark:bg-slate-900 dark:text-white"
            >
              <option value="">Categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          <label className="block text-sm text-gray-500 dark:text-gray-400">
            Día del mes (1–28)
            <input
              type="number"
              min={1}
              max={28}
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
              className="mt-1 w-full px-4 py-2 border dark:border-slate-600 rounded-xl dark:bg-slate-900 dark:text-white"
            />
          </label>
          <button
            type="submit"
            disabled={saving || !online}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Agregar recurrente
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 animate-pulse">Cargando…</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {item.kind === 'expense' ? 'Gasto' : 'Ingreso'} — ${Number(item.amount).toLocaleString('es-AR')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Día {item.day_of_month} · {item.description || 'Sin descripción'}
                  {item.categories?.name ? ` · ${item.categories.name}` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleActive(item)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${item.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}
                >
                  {item.active ? 'Activo' : 'Pausado'}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar recurrente"
        message="No borra movimientos ya generados."
        confirmText="Eliminar"
        isDanger
      />
    </div>
  )
}
