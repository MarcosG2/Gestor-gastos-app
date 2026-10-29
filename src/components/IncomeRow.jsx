import { ArrowDownCircle, Trash2, Pencil } from 'lucide-react'
import { parseExpenseDate } from '../utils/dates'

export default function IncomeRow({ income, onEdit, onDelete }) {
  return (
    <div className="ledger-row group">
      <div className="flex items-center gap-3 min-w-0">
        <ArrowDownCircle className="w-4 h-4 shrink-0 text-income" />
        <div className="min-w-0">
          <p className="font-bold text-ink truncate">Ingreso</p>
          <p className="text-sm text-muted truncate">{income.description || 'Sin detalle'} · {parseExpenseDate(income)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <p className="font-bold text-income whitespace-nowrap">
          + ${Number(income.amount).toLocaleString('es-AR')}
        </p>
        {(onEdit || onDelete) && (
          <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(income)}
                className="p-2 text-muted hover:text-warn rounded-md"
                aria-label="Editar ingreso"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(income)}
                className="p-2 text-muted hover:text-danger rounded-md"
                aria-label="Borrar ingreso"
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
