import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Filter, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'
import { useToast } from '../context/ToastContext'
import { deleteExpense, fetchExpensesPage, fetchExpensesForExport } from '../services/expenses'
import { monthDateBounds } from '../utils/dates'
import { downloadExpensesCsv } from '../utils/csv'
import ExpenseRow from './ExpenseRow'
import Modal from './Modal'

const PAGE_SIZE = 15

function defaultFilters() {
  const now = new Date()
  const { start, end } = monthDateBounds(now.getFullYear(), now.getMonth())
  return { categoryId: '', dateFrom: start, dateTo: end }
}

export default function History({ session }) {
  const userId = session.user.id
  const { categories } = useCategories(userId)
  const { showToast } = useToast()

  const [filters, setFilters] = useState(defaultFilters)
  const [draft, setDraft] = useState(defaultFilters)
  const [expenses, setExpenses] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [exporting, setExporting] = useState(false)

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const loadPage = useCallback(async () => {
    setLoading(true)
    const { data, count, error } = await fetchExpensesPage(userId, {
      page,
      pageSize: PAGE_SIZE,
      categoryId: filters.categoryId || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    })

    if (error) {
      showToast(error.message, 'error')
      setExpenses([])
      setTotalCount(0)
    } else {
      setExpenses(data || [])
      setTotalCount(count ?? 0)
    }
    setLoading(false)
  }, [userId, page, filters, showToast])

  useEffect(() => {
    loadPage()
  }, [loadPage])

  const applyFilters = (e) => {
    e.preventDefault()
    setFilters({ ...draft })
    setPage(0)
  }

  const resetFilters = () => {
    const next = defaultFilters()
    setDraft(next)
    setFilters(next)
    setPage(0)
  }

  const handleExportCsv = async () => {
    setExporting(true)
    const { data, error } = await fetchExpensesForExport(userId, {
      categoryId: filters.categoryId || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    })
    setExporting(false)
    if (error) {
      showToast(error.message, 'error')
      return
    }
    if (!data?.length) {
      showToast('No hay datos para exportar con estos filtros', 'info')
      return
    }
    const suffix = filters.dateFrom && filters.dateTo ? `${filters.dateFrom}_${filters.dateTo}` : 'export'
    downloadExpensesCsv(data, `gastos_${suffix}.csv`)
    showToast(`${data.length} filas exportadas`, 'success')
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    const { error } = await deleteExpense(userId, pendingDelete.id)
    setPendingDelete(null)
    if (error) {
      showToast(error.message, 'error')
      return
    }
    showToast('Gasto eliminado', 'success')
    if (expenses.length === 1 && page > 0) {
      setPage((p) => p - 1)
    } else {
      loadPage()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Historial de gastos</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={exporting || loading}
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exportando…' : 'Exportar CSV'}
          </button>
          <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            ← Volver al panel
          </Link>
        </div>
      </div>

      <form
        onSubmit={applyFilters}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4"
      >
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Filter className="w-5 h-5 text-indigo-600" />
          Filtros
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-500 block mb-1">Categoría</label>
            <select
              value={draft.categoryId}
              onChange={(e) => setDraft((d) => ({ ...d, categoryId: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todas</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">Desde</label>
            <input
              type="date"
              value={draft.dateFrom}
              onChange={(e) => setDraft((d) => ({ ...d, dateFrom: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">Hasta</label>
            <input
              type="date"
              value={draft.dateTo}
              onChange={(e) => setDraft((d) => ({ ...d, dateTo: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Aplicar
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            Mes actual
          </button>
        </div>
      </form>

      <p className="text-sm text-gray-500">
        {totalCount} {totalCount === 1 ? 'resultado' : 'resultados'}
      </p>

      <div className="space-y-3">
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 bg-white rounded-2xl border border-gray-100" />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <p className="text-center text-gray-500 py-12 bg-white rounded-2xl border border-gray-100">
            No hay gastos con estos filtros.
          </p>
        ) : (
          expenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              onDelete={() => setPendingDelete(expense)}
            />
          ))
        )}
      </div>

      {totalCount > PAGE_SIZE && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100">
          <button
            type="button"
            disabled={page === 0 || loading}
            onClick={() => setPage((p) => p - 1)}
            className="flex items-center gap-1 px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {page + 1} de {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Siguiente
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      <Modal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar gasto"
        message={
          pendingDelete
            ? `¿Borrar "${pendingDelete.description || pendingDelete.categories?.name}" por $${Number(pendingDelete.amount).toLocaleString('es-AR')}?`
            : ''
        }
        confirmText="Eliminar"
        isDanger
      />
    </div>
  )
}
