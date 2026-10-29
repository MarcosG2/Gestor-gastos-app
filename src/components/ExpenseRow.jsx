import { Trash2, Pencil } from 'lucide-react'
import { parseExpenseDate } from '../utils/dates'
import { categoryDotProps } from '../utils/categoryColor'

export default function ExpenseRow({ expense, onEdit, onDelete }) {
  const dot = categoryDotProps(expense.categories?.color)
  return (
    <div className="ledger-row group">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`w-2.5 h-2.5 shrink-0 rounded-full ${dot.className}`} style={dot.style} />
        <div className="min-w-0">
          <p className="font-bold text-ink truncate">{expense.categories?.name}</p>
          <p className="text-sm text-muted truncate">{expense.description || 'Sin detalle'} · {parseExpenseDate(expense)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <p className="font-bold text-ink whitespace-nowrap">
          - ${Number(expense.amount).toLocaleString('es-AR')}
        </p>
        {(onEdit || onDelete) && (
          <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(expense)}
                className="p-2 text-muted hover:text-warn rounded-md"
                aria-label="Editar gasto"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(expense)}
                className="p-2 text-muted hover:text-danger rounded-md"
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
