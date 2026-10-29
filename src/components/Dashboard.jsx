import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Wallet, Pencil, X, TrendingUp, TrendingDown } from 'lucide-react'
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
import { useBudgetAlerts } from '../hooks/useBudgetAlerts'

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
  useBudgetAlerts(userId, categories, mesInicio, mesFin, now.getFullYear(), now.getMonth() + 1)

  const fetchData = useCallback(async () => {
    setIsLoadingData(true)

    const [
      { data: exp, offlineMessage: expOff },
      { data: inc, offlineMessage: incOff },
      { total: gastos, error: sumExpError, offlineMessage: sumExpOff },
      { total: ingresos, error: sumIncError, offlineMessage: sumIncOff },
    ] = await Promise.all([
      fetchRecentExpenses(userId, 10),
      fetchRecentIncomes(userId, 5),
      sumExpensesInRange(userId, mesInicio, mesFin),
      sumIncomesInRange(userId, mesInicio, mesFin),
    ])

    if (expOff) showToast(expOff, 'info')
    if (incOff) showToast(incOff, 'info')
    if (sumExpOff) showToast(sumExpOff, 'info')
    if (sumIncOff) showToast(sumIncOff, 'info')
    if (sumExpError?.message && sumExpError.message !== 'Sin conexión') showToast(sumExpError.message, 'error')
    if (sumIncError?.message && sumIncError.message !== 'Sin conexión') showToast(sumIncError.message, 'error')

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

    const result = editingId
      ? await updateExpense(userId, editingId, expenseData)
      : await createExpense(expenseData)

    if (result.error) {
      showToast(result.error.message, 'error')
    } else {
      showToast(
        result.queued
          ? 'Guardado localmente — se sincronizará al reconectar'
          : editingId
            ? 'Gasto actualizado'
            : 'Gasto registrado',
        result.queued ? 'info' : 'success',
      )
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

    const result = editingIncomeId
      ? await updateIncome(userId, editingIncomeId, incomeData)
      : await createIncome(incomeData)

    if (result.error) {
      showToast(result.error.message, 'error')
    } else {
      showToast(
        result.queued
          ? 'Guardado localmente — se sincronizará al reconectar'
          : editingIncomeId
            ? 'Ingreso actualizado'
            : 'Ingreso registrado',
        result.queued ? 'info' : 'success',
      )
      cancelEdit()
      fetchData()
    }
    setLoading(false)
  }

  const mesLabel = now.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  const isExpenseForm = entryMode === 'expense'

  const submitLabel = loading
    ? 'Guardando...'
    : (editingId || editingIncomeId ? 'Actualizar' : isExpenseForm ? 'Agregar Gasto' : 'Agregar Ingreso')

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl flex flex-col gap-8">
      <section className="band">
        <div>
          <p className="band-kicker">{mesLabel}</p>
          <p className="band-figure" data-negative={balanceMes < 0 ? 'true' : undefined}>
            {isLoadingData ? '…' : money(balanceMes)}
          </p>
        </div>
        <div className="band-side">
          <p>
            <span className="inline-flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Ingresos</span>
            <strong>{isLoadingData ? '…' : money(totalIngresosMes)}</strong>
          </p>
          <p>
            <span className="inline-flex items-center gap-1"><TrendingDown className="w-3.5 h-3.5" /> Gastos</span>
            <strong>{isLoadingData ? '…' : money(totalMes)}</strong>
          </p>
        </div>
        <button
          type="submit"
          form="entry-form"
          disabled={loading || (isExpenseForm && categories.length === 0)}
          className="band-action"
        >
          {submitLabel}
        </button>
      </section>

      <form id="entry-form" onSubmit={isExpenseForm ? handleSaveExpense : handleSaveIncome} className="flex flex-col gap-4 max-w-xl">
        {(editingId || editingIncomeId) && (
          <div className="flex items-center gap-2 text-warn text-sm font-bold">
            <Pencil className="w-4 h-4" />
            Modo Edición
            <button type="button" onClick={cancelEdit} aria-label="Cancelar edición" className="text-danger">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              if (!editingIncomeId) setEntryMode('expense')
            }}
            className={`flex-1 py-2.5 rounded-md text-sm font-bold ${isExpenseForm ? 'bg-band text-on-band' : 'bg-paper text-muted border border-line'}`}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => {
              if (!editingId) setEntryMode('income')
            }}
            className={`flex-1 py-2.5 rounded-md text-sm font-bold ${!isExpenseForm ? 'bg-band text-on-band' : 'bg-paper text-muted border border-line'}`}
          >
            Ingreso
          </button>
        </div>

        <h2 className="text-xl font-bold text-ink flex items-center gap-2">
          {isExpenseForm ? (
            <>
              {editingId ? <Pencil className="w-5 h-5 text-warn" /> : <PlusCircle className="w-5 h-5 text-band" />}
              {editingId ? 'Editar Gasto' : 'Nuevo Gasto'}
            </>
          ) : (
            <>
              {editingIncomeId ? <Pencil className="w-5 h-5 text-warn" /> : <TrendingUp className="w-5 h-5 text-income" />}
              {editingIncomeId ? 'Editar Ingreso' : 'Nuevo Ingreso'}
            </>
          )}
        </h2>

        <div>
          <label className="text-sm font-medium text-muted mb-1 block" htmlFor="entry-amount">Monto</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-muted font-bold">$</span>
            <input
              id="entry-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3 rounded-md bg-paper border border-line text-lg font-semibold text-ink"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted mb-1 block" htmlFor="entry-date">Fecha</label>
          <input
            id="entry-date"
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-paper border border-line text-ink"
            required
          />
        </div>

        {isExpenseForm && (
          <div>
            <label className="text-sm font-medium text-muted mb-1 block">Categoría</label>
            {categories.length === 0 ? (
              <p className="text-sm text-warn bg-warnbg px-4 py-3">
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
                    className={`p-3 rounded-md text-sm font-medium border ${categoryId === cat.id
                      ? 'border-band bg-band/10 text-link'
                      : 'border-line bg-paper text-muted'
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
          <label className="text-sm font-medium text-muted mb-1 block" htmlFor="entry-desc">Descripción</label>
          <input
            id="entry-desc"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-paper border border-line text-ink"
            placeholder={isExpenseForm ? 'Ej: Cena' : 'Ej: Sueldo'}
          />
        </div>
      </form>

      <div className="min-w-0 flex flex-col gap-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2 min-w-0">
              <Wallet className="w-5 h-5 shrink-0 text-muted" />
              Últimos gastos
            </h3>
            <Link to="/history" className="text-sm font-medium text-link shrink-0">
              Ver historial
            </Link>
          </div>

          <div className="ledger">
            {isLoadingData ? (
              <div className="animate-pulse flex flex-col gap-3 py-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-12 bg-paper border border-line w-full" />
                ))}
              </div>
            ) : expenses.length === 0 ? (
              <p className="text-muted py-4 font-medium">No hay gastos registrados aún.</p>
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
          <h3 className="text-lg font-bold text-ink mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-income" />
            Últimos ingresos
          </h3>
          <div className="ledger">
            {isLoadingData ? (
              <div className="animate-pulse h-12 bg-paper border border-line" />
            ) : incomes.length === 0 ? (
              <p className="text-muted py-4 font-medium">No hay ingresos registrados aún.</p>
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
