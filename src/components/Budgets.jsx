import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'
import { useToast } from '../context/ToastContext'
import { deleteBudget, fetchBudgetsForMonth, upsertBudget } from '../services/budgets'

export default function Budgets({ session }) {
  const userId = session.user.id
  const { categories } = useCategories(userId)
  const { showToast } = useToast()

  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [budgets, setBudgets] = useState([])
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)

  const loadBudgets = useCallback(async () => {
    setLoading(true)
    const { data, error } = await fetchBudgetsForMonth(userId, year, month)
    if (error) {
      showToast(error.message, 'error')
      setBudgets([])
      setDrafts({})
    } else {
      setBudgets(data || [])
      const next = {}
      for (const cat of categories) {
        const row = (data || []).find((b) => b.category_id === cat.id)
        next[cat.id] = row ? String(row.amount_limit) : ''
      }
      setDrafts(next)
    }
    setLoading(false)
  }, [userId, year, month, categories, showToast])

  useEffect(() => {
    if (categories.length === 0) {
      setLoading(false)
      return
    }
    loadBudgets()
  }, [categories.length, loadBudgets])

  const shiftMonth = (delta) => {
    let m = month + delta
    let y = year
    if (m < 1) {
      m = 12
      y -= 1
    } else if (m > 12) {
      m = 1
      y += 1
    }
    setMonth(m)
    setYear(y)
  }

  const saveLimit = async (categoryId) => {
    const raw = drafts[categoryId]?.trim()
    if (!raw) {
      const existing = budgets.find((b) => b.category_id === categoryId)
      if (existing) {
        setSavingId(categoryId)
        const { error } = await deleteBudget(userId, existing.id)
        setSavingId(null)
        if (error) showToast(error.message, 'error')
        else {
          showToast('Presupuesto quitado', 'success')
          loadBudgets()
        }
      }
      return
    }

    const parsed = parseFloat(raw)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      showToast('Ingresá un límite mayor a 0', 'error')
      return
    }

    setSavingId(categoryId)
    const { error } = await upsertBudget(userId, {
      categoryId,
      year,
      month,
      amountLimit: parsed,
    })
    setSavingId(null)
    if (error) showToast(error.message, 'error')
    else {
      showToast('Presupuesto guardado', 'success')
      loadBudgets()
    }
  }

  const monthLabel = new Date(year, month - 1).toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Target className="w-8 h-8 text-indigo-600" />
          Presupuestos
        </h2>
        <Link to="/stats" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
          Ver progreso en análisis →
        </Link>
      </div>

      <p className="text-gray-600">
        Definí un tope mensual por categoría. En el visualizador verás cuánto llevás gastado respecto al límite.
      </p>

      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="p-2 rounded-xl hover:bg-gray-50 text-gray-600"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="font-bold text-gray-800 capitalize">{monthLabel}</span>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="p-2 rounded-xl hover:bg-gray-50 text-gray-600"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-white rounded-2xl border border-gray-100" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-center text-gray-500 py-12 bg-white rounded-2xl border border-gray-100">
          Creá categorías antes de definir presupuestos.
        </p>
      ) : (
        <ul className="space-y-3">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${cat.color || 'bg-gray-100'}`}>
                {cat.name}
              </span>
              <div className="flex-1 flex items-center gap-2">
                <span className="text-gray-400 font-bold">$</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Sin límite"
                  value={drafts[cat.id] ?? ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [cat.id]: e.target.value }))}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="button"
                disabled={savingId === cat.id}
                onClick={() => saveLimit(cat.id)}
                className="px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50"
              >
                {savingId === cat.id ? '…' : 'Guardar'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
