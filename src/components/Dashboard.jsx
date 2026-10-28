import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Wallet, Pencil, X, TrendingUp, TrendingDown, Scale } from 'lucide-react'
import { formatDateInput, monthDateBounds, parseExpenseDate } from '../utils/dates'
import { useCategories } from '../hooks/useCategories'
import { useToast } from '../context/ToastContext'
import {
  createExpense,
  deleteExpense,
  fetchRecentExpenses,
  sumExpensesInRange,
  updateExpense,
} from '../services/expenses'
import {
  createIncome,
  deleteIncome,
  fetchRecentIncomes,
  sumIncomesInRange,
  updateIncome,
} from '../services/incomes'
import ExpenseRow from './ExpenseRow'
import IncomeRow from './IncomeRow'
import Modal from './Modal'
import { monthlyBalance } from '../utils/finance'

function money(n) {
  return `$ ${Number(n).toLocaleString('es-AR')}`
}

export default function Dashboard({ session }) {
  const userId = session.user.id
  const { categories } = useCategories(userId)
  const { showToast } = useToast()

  const [entryMode, setEntryMode] = useState('expense')

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [expenseDate, setExpenseDate] = useState(() => formatDateInput())
  const [categoryId, setCategoryId] = useState('')
  const [expenses, setExpenses] = useState([])
  const [incomes, setIncomes] = useState([])
  const [totalMes, setTotalMes] = useState(0)
  const [totalIngresosMes, setTotalIngresosMes] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editingIncomeId, setEditingIncomeId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [pendingDeleteIncome, setPendingDeleteIncome] = useState(null)

  const now = new Date()
  const { start: mesInicio, end: mesFin } = monthDateBounds(now.getFullYear(), now.getMonth())
  const balanceMes = monthlyBalance(totalIngresosMes, totalMes)

  const fetchData = useCallback(async () => {
    setIsLoadingData(true)

    const [
      { data: exp },
      { data: inc },
      { total: gastos, error: sumExpError },
      { total: ingresos, error: sumIncError },
    ] = await Promise.all([
      fetchRecentExpenses(userId, 10),
      fetchRecentIncomes(userId, 5),
      sumExpensesInRange(userId, mesInicio, mesFin),
      sumIncomesInRange(userId, mesInicio, mesFin),
    ])

    if (sumExpError) showToast(sumExpError.message, 'error')
    if (sumIncError) showToast(sumIncError.message, 'error')

    setExpenses(exp || [])
    setIncomes(inc || [])
    setTotalMes(gastos)
    setTotalIngresosMes(ingresos)
    setIsLoadingData(false)
  }, [userId, mesInicio, mesFin, showToast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleEditClick = (expense) => {
    setEntryMode('expense')
    setEditingIncomeId(null)
    setEditingId(expense.id)
    setAmount(String(expense.amount))
    setDescription(expense.description || '')
    setCategoryId(expense.category_id)
    setExpenseDate(parseExpenseDate(expense))
  }

  const handleEditIncomeClick = (income) => {
    setEntryMode('income')
    cancelEdit()
    setEditingIncomeId(income.id)
    setAmount(String(income.amount))
    setDescription(income.description || '')
    setExpenseDate(parseExpenseDate(income))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingIncomeId(null)
    setAmount('')
    setDescription('')
    setCategoryId('')
    setExpenseDate(formatDateInput())
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
    fetchData()
  }

  const confirmDeleteIncome = async () => {
    if (!pendingDeleteIncome) return
    const { error } = await deleteIncome(userId, pendingDeleteIncome.id)
    setPendingDeleteIncome(null)
    if (error) {
      showToast(error.message, 'error')
      return
    }
    showToast('Ingreso eliminado', 'success')
    fetchData()
  }

  const handleSaveExpense = async (e) => {
    e.preventDefault()
    setLoading(true)

    const parsedAmount = parseFloat(amount)
    if (!categoryId) {
      showToast('Elegí una categoría', 'error')
      setLoading(false)
      return
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      showToast('Ingresá un monto válido mayor a 0', 'error')
      setLoading(false)
      return
    }

    const expenseData = {
      amount: parsedAmount,
      description: description.trim() || null,
      category_id: categoryId,
      date: expenseDate,
      user_id: userId,
    }

    const { error } = editingId
      ? await updateExpense(userId, editingId, expenseData)
      : await createExpense(expenseData)

    if (error) {
      showToast(error.message, 'error')
    } else {
      showToast(editingId ? 'Gasto actualizado' : 'Gasto registrado', 'success')
      cancelEdit()
      fetchData()
    }
    setLoading(false)
  }

  const handleSaveIncome = async (e) => {
    e.preventDefault()
    setLoading(true)

    const parsedAmount = parseFloat(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      showToast('Ingresá un monto válido mayor a 0', 'error')
      setLoading(false)
      return
    }

    const incomeData = {
      amount: parsedAmount,
      description: description.trim() || null,
      date: expenseDate,
      user_id: userId,
    }

    const { error } = editingIncomeId
      ? await updateIncome(userId, editingIncomeId, incomeData)
      : await createIncome(incomeData)

    if (error) {
      showToast(error.message, 'error')
    } else {
      showToast(editingIncomeId ? 'Ingreso actualizado' : 'Ingreso registrado', 'success')
      cancelEdit()
      fetchData()
    }
    setLoading(false)
  }

  const mesLabel = now.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  const isExpenseForm = entryMode === 'expense'

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-white/50 h-fit relative transition-all">
        {(editingId || editingIncomeId) && (
          <div className="absolute top-4 right-4 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
            Modo Edición
            <button type="button" onClick={cancelEdit} aria-label="Cancelar edición">
              <X className="w-4 h-4 hover:text-red-600" />
            </button>
          </div>
        )}

        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              if (!editingIncomeId) setEntryMode('expense')
            }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${isExpenseForm ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => {
              if (!editingId) setEntryMode('income')
            }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${!isExpenseForm ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
          >
            Ingreso
          </button>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          {isExpenseForm ? (
            <>
              {editingId ? <Pencil className="w-6 h-6 text-orange-500" /> : <PlusCircle className="w-6 h-6 text-indigo-600" />}
              {editingId ? 'Editar Gasto' : 'Nuevo Gasto'}
            </>
          ) : (
            <>
              {editingIncomeId ? <Pencil className="w-6 h-6 text-orange-500" /> : <TrendingUp className="w-6 h-6 text-emerald-600" />}
              {editingIncomeId ? 'Editar Ingreso' : 'Nuevo Ingreso'}
            </>
          )}
        </h2>

        <form onSubmit={isExpenseForm ? handleSaveExpense : handleSaveIncome} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500 mb-1 block">Monto</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400 font-bold">$</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-lg font-semibold text-gray-800"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 mb-1 block">Fecha</label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              required
            />
          </div>

          {isExpenseForm && (
            <div>
              <label className="text-sm font-medium text-gray-500 mb-1 block">Categoría</label>
              {categories.length === 0 ? (
                <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3">
                  Creá al menos una categoría en el menú Categorías antes de registrar gastos.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      aria-pressed={categoryId === cat.id}
                      className={`p-3 rounded-xl text-sm font-medium transition-all border-2 ${categoryId === cat.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-transparent bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-500 mb-1 block">Descripción</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              placeholder={isExpenseForm ? 'Ej: Cena' : 'Ej: Sueldo'}
            />
          </div>

          <button
            type="submit"
            disabled={loading || (isExpenseForm && categories.length === 0)}
            className={`w-full text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${editingId || editingIncomeId
              ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
              : isExpenseForm
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              }`}
          >
            {loading ? 'Guardando...' : (editingId || editingIncomeId ? 'Actualizar' : isExpenseForm ? 'Agregar Gasto' : 'Agregar Ingreso')}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-5 rounded-2xl shadow-lg">
            <p className="text-emerald-100 text-xs flex items-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5" /> Ingresos
            </p>
            <p className="text-2xl font-bold">{isLoadingData ? '…' : money(totalIngresosMes)}</p>
          </div>
          <div className="bg-gradient-to-br from-rose-600 to-rose-800 text-white p-5 rounded-2xl shadow-lg">
            <p className="text-rose-100 text-xs flex items-center gap-1 mb-1">
              <TrendingDown className="w-3.5 h-3.5" /> Gastos
            </p>
            <p className="text-2xl font-bold">{isLoadingData ? '…' : money(totalMes)}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white p-5 rounded-2xl shadow-lg sm:col-span-1">
            <p className="text-slate-300 text-xs flex items-center gap-1 mb-1 capitalize">
              <Scale className="w-3.5 h-3.5" /> Balance — {mesLabel}
            </p>
            <p className={`text-2xl font-bold ${balanceMes < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
              {isLoadingData ? '…' : money(balanceMes)}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-gray-500" />
              Últimos gastos
            </h3>
            <Link to="/history" className="text-sm font-medium text-indigo-600 hover:underline">
              Ver historial
            </Link>
          </div>

          <div className="space-y-3">
            {isLoadingData ? (
              <div className="animate-pulse space-y-4 w-full">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-20 bg-white border border-gray-100 rounded-2xl w-full" />
                ))}
              </div>
            ) : expenses.length === 0 ? (
              <p className="text-gray-500 text-center py-4 font-medium">No hay gastos registrados aún.</p>
            ) : (
              expenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  onEdit={handleEditClick}
                  onDelete={() => setPendingDelete(expense)}
                />
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Últimos ingresos
          </h3>
          <div className="space-y-3">
            {isLoadingData ? (
              <div className="animate-pulse h-20 bg-white rounded-2xl border border-gray-100" />
            ) : incomes.length === 0 ? (
              <p className="text-gray-500 text-center py-4 font-medium">No hay ingresos registrados aún.</p>
            ) : (
              incomes.map((income) => (
                <IncomeRow
                  key={income.id}
                  income={income}
                  onEdit={handleEditIncomeClick}
                  onDelete={() => setPendingDeleteIncome(income)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar gasto"
        message={
          pendingDelete
            ? `¿Borrar este gasto de $${Number(pendingDelete.amount).toLocaleString('es-AR')}?`
            : ''
        }
        confirmText="Eliminar"
        isDanger
      />

      <Modal
        isOpen={!!pendingDeleteIncome}
        onClose={() => setPendingDeleteIncome(null)}
        onConfirm={confirmDeleteIncome}
        title="Eliminar ingreso"
        message={
          pendingDeleteIncome
            ? `¿Borrar este ingreso de $${Number(pendingDeleteIncome.amount).toLocaleString('es-AR')}?`
            : ''
        }
        confirmText="Eliminar"
        isDanger
      />
    </div>
  )
}
