import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { AlertTriangle } from 'lucide-react'
import { monthDateBounds } from '../utils/dates'
import { fetchExpensesInRange } from '../services/expenses'
import { fetchBudgetsForMonth } from '../services/budgets'
import { budgetUsagePercent, isBudgetOver } from '../utils/finance'
import { useToast } from '../context/ToastContext'

export default function Analytics({ session }) {
  const { showToast } = useToast()
  const [chartData, setChartData] = useState([])
  const [budgetRows, setBudgetRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth())
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear())

  const getStats = useCallback(async () => {
    setLoading(true)
    const { start, end } = monthDateBounds(anioSeleccionado, mesSeleccionado)
    const monthNumber = mesSeleccionado + 1

    const [{ data, error }, { data: budgets, error: budgetError }] = await Promise.all([
      fetchExpensesInRange(session.user.id, start, end),
      fetchBudgetsForMonth(session.user.id, anioSeleccionado, monthNumber),
    ])

    if (error) {
      showToast(error.message, 'error')
      setChartData([])
    } else {
      const grouped = (data || []).reduce((acc, curr) => {
        const catName = curr.categories?.name || 'Otros'
        const key = String(curr.category_id ?? catName)
        if (!acc[key]) {
          acc[key] = {
            name: catName,
            categoryId: curr.category_id ?? null,
            value: 0,
            color: '#6366f1',
          }
        }
        acc[key].value += Number(curr.amount)
        return acc
      }, {})

      const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff6b6b']

      const formattedData = Object.values(grouped).map((item, index) => ({
        ...item,
        fill: COLORS[index % COLORS.length],
      }))

      setChartData(formattedData)
    }

    if (budgetError) {
      showToast(budgetError.message, 'error')
      setBudgetRows([])
    } else {
      setBudgetRows(budgets || [])
    }

    setLoading(false)
  }, [mesSeleccionado, anioSeleccionado, session.user.id, showToast])

  useEffect(() => {
    getStats()
  }, [getStats])

  const spentByCategoryId = useMemo(() => {
    const map = {}
    for (const row of chartData) {
      if (row.categoryId) map[row.categoryId] = row.value
    }
    return map
  }, [chartData])

  const budgetProgress = useMemo(() => {
    return budgetRows.map((b) => {
      const spent = spentByCategoryId[b.category_id] || 0
      const limit = Number(b.amount_limit)
      const pct = budgetUsagePercent(spent, limit)
      return {
        id: b.id,
        name: b.categories?.name || 'Categoría',
        spent,
        limit,
        pct,
        over: isBudgetOver(spent, limit),
      }
    })
  }, [budgetRows, spentByCategoryId])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Análisis de Gastos</h2>
        <Link to="/budgets" className="text-sm font-medium text-indigo-600 hover:underline">
          Configurar presupuestos →
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-8">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">Distribución Visual</h3>
          {loading ? (
            <div className="animate-pulse h-[400px] md:h-[500px] bg-gray-100 rounded-2xl" />
          ) : chartData.length === 0 ? (
            <p className="text-gray-500 text-center py-16">No hay gastos en este mes.</p>
          ) : (
            <div className="w-full h-[400px] md:h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString('es-AR')}`} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 bg-gray-50 p-4 rounded-lg">
            <button
              type="button"
              onClick={() => {
                if (mesSeleccionado === 0) {
                  setMesSeleccionado(11)
                  setAnioSeleccionado(anioSeleccionado - 1)
                } else {
                  setMesSeleccionado(mesSeleccionado - 1)
                }
              }}
              className="px-4 py-2 bg-slate-300 text-gray-700 rounded-md hover:bg-slate-400 font-medium transition-colors"
            >
              &larr; Mes Anterior
            </button>

            <span className="font-bold text-gray-700">
              Mes: {mesSeleccionado + 1} / {anioSeleccionado}
            </span>

            <button
              type="button"
              onClick={() => {
                if (mesSeleccionado === 11) {
                  setMesSeleccionado(0)
                  setAnioSeleccionado(anioSeleccionado + 1)
                } else {
                  setMesSeleccionado(mesSeleccionado + 1)
                }
              }}
              className="px-4 py-2 bg-slate-300 text-gray-700 rounded-md hover:bg-slate-400 font-medium transition-colors"
            >
              Mes Siguiente &rarr;
            </button>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white p-4 md:p-8 rounded-3xl shadow-xl h-fit">
            <h3 className="font-bold text-gray-800 mb-6 text-lg">Top Gastos</h3>
            <div className="space-y-4">
              {!loading && chartData.length === 0 && <p className="text-gray-400">No hay datos aún.</p>}
              {[...chartData].sort((a, b) => b.value - a.value).map((item) => (
                <div key={item.name} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: item.fill }} />
                    <span className="font-medium text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">${item.value.toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 md:p-8 rounded-3xl shadow-xl h-fit">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">Presupuestos del mes</h3>
            {loading ? (
              <div className="animate-pulse h-24 bg-gray-100 rounded-xl" />
            ) : budgetProgress.length === 0 ? (
              <p className="text-sm text-gray-500">
                Sin límites definidos.{' '}
                <Link to="/budgets" className="text-indigo-600 font-medium hover:underline">
                  Agregar presupuestos
                </Link>
              </p>
            ) : (
              <ul className="space-y-4">
                {budgetProgress.map((row) => (
                  <li key={row.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 flex items-center gap-1">
                        {row.name}
                        {row.over && <AlertTriangle className="w-4 h-4 text-amber-500" aria-label="Superado" />}
                      </span>
                      <span className={row.over ? 'text-rose-600 font-bold' : 'text-gray-600'}>
                        ${row.spent.toLocaleString('es-AR')} / ${row.limit.toLocaleString('es-AR')}
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${row.over ? 'bg-rose-500' : row.pct >= 80 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{Math.round(row.pct)}% usado</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
