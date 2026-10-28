import { Tag, Trash2, Pencil } from 'lucide-react'
import { parseExpenseDate } from '../utils/dates'

export default function ExpenseRow({ expense, onEdit, onDelete }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 flex justify-between items-center group hover:shadow-lg transition-all">
      <div className="flex items-center gap-4 min-w-0">
        <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${expense.categories?.color || 'bg-gray-100'}`}>
          <Tag className="w-5 h-5 opacity-70" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-gray-800 truncate">{expense.categories?.name}</p>
          <p className="text-xs text-gray-500 truncate">{expense.description || 'Sin detalle'}</p>
          <p className="text-xs text-gray-400 mt-0.5">{parseExpenseDate(expense)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <p className="font-bold text-red-500 whitespace-nowrap">
          - ${Number(expense.amount).toLocaleString('es-AR')}
        </p>
        {(onEdit || onDelete) && (
          <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(expense)}
                className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg"
                aria-label="Editar gasto"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(expense)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                aria-label="Borrar gasto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
