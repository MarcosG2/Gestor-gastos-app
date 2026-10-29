import { useState } from 'react'
import { Trash2, Plus, Tag, Palette } from 'lucide-react'
import { CATEGORY_COLORS } from '../constants/categories'
import { useCategories } from '../hooks/useCategories'
import { useToast } from '../context/ToastContext'
import { createCategory, deleteCategoryAndExpenses } from '../services/categories'
import { categoryChipProps, isHexColor } from '../utils/categoryColor'
import Modal from './Modal'

export default function Categories({ session }) {
  const userId = session.user.id
  const { categories, reload } = useCategories(userId)
  const { showToast } = useToast()

  const [newCatName, setNewCatName] = useState('')
  const [selectedColor, setSelectedColor] = useState('blue')
  const customActive = isHexColor(selectedColor)
  const pickerValue = customActive ? selectedColor : '#3b82f6'
  const [loading, setLoading] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  const handleAddCategory = async (e) => {
    e.preventDefault()
    const name = newCatName.trim()
    if (!name) {
      showToast('Ingresá un nombre', 'error')
      return
    }
    setLoading(true)

    const preset = CATEGORY_COLORS.find((c) => c.id === selectedColor)
    const colorValue = preset ? preset.class : selectedColor
    const result = await createCategory(userId, name, colorValue)

    if (result.error) {
      showToast(result.error.message, 'error')
    } else if (result?.queued) {
      showToast('Categoría en cola — se sincronizará al reconectar', 'info')
      setNewCatName('')
      reload()
    } else {
      showToast('Categoría creada', 'success')
      setNewCatName('')
      reload()
    }
    setLoading(false)
  }

  const confirmDelete = async () => {
    if (!pendingDeleteId) return
    const { error } = await deleteCategoryAndExpenses(userId, pendingDeleteId)
    setPendingDeleteId(null)
    if (error) {
      showToast(error.message, 'error')
      return
    }
    showToast('Categoría y gastos asociados eliminados', 'success')
    reload()
  }

  const pendingCat = categories.find((c) => c.id === pendingDeleteId)

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-ink mb-8">Gestión de Categorías</h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-paper p-6 rounded-2xl shadow-sm border border-line h-fit">
          <h3 className="font-bold text-ink mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-link" /> Nueva Categoría
          </h3>

          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="text-sm text-muted mb-1 block">Nombre</label>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-link outline-none"
                placeholder="Ej: Gimnasio"
              />
            </div>

            <div>
              <label className="text-sm text-muted mb-2 block">Color</label>
              <div className="flex flex-wrap gap-2.5">
                {CATEGORY_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.id)}
                    className={`w-7 h-7 rounded-full ${c.bg} transition-transform ${selectedColor === c.id ? 'scale-110 ring-2 ring-offset-2 ring-gray-300' : 'opacity-70 hover:opacity-100'}`}
                    aria-label={`Color ${c.id}`}
                  />
                ))}
              </div>
              <label
                className={`mt-3 flex items-center gap-3 rounded-xl border border-line px-3 py-2 cursor-pointer transition-colors hover:bg-ground ${customActive ? 'ring-2 ring-link ring-offset-2' : ''}`}
              >
                <span
                  className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-line"
                  style={{
                    background: customActive
                      ? selectedColor
                      : 'conic-gradient(from 0deg, #ef4444, #f59e0b, #84cc16, #14b8a6, #3b82f6, #a855f7, #ec4899, #ef4444)',
                  }}
                >
                  <input
                    type="color"
                    value={pickerValue}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-label="Elegir un color personalizado"
                  />
                </span>
                <span className="flex min-w-0 flex-1 items-center gap-2 text-sm text-ink">
                  <Palette className="h-4 w-4 shrink-0 text-muted" />
                  <span>
                    {customActive ? (
                      <>
                        Personalizado{' '}
                        <span className="font-mono text-xs text-muted">{selectedColor}</span>
                      </>
                    ) : (
                      'Elegir otro color…'
                    )}
                  </span>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-band text-white py-3 rounded-xl font-bold mt-2 hover:bg-band transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Crear Categoría'}
            </button>
          </form>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-ink mb-2">Categorías Existentes</h3>
          {categories.length === 0 && (
            <p className="text-muted text-sm bg-paper rounded-xl p-4 border border-line">
              Todavía no tenés categorías. Los usuarios nuevos reciben cuatro por defecto al registrarse.
            </p>
          )}
          {categories.map((cat) => {
            const chip = categoryChipProps(cat.color)
            return (
            <div key={cat.id} className="bg-paper p-4 rounded-xl shadow-sm border border-line flex justify-between items-center group">
              <div className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${chip.className}`} style={chip.style}>
                <Tag className="w-4 h-4" />
                {cat.name}
              </div>

              <button
                type="button"
                onClick={() => setPendingDeleteId(cat.id)}
                className="text-muted hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                title="Borrar categoría"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            )
          })}
        </div>
      </div>

      <Modal
        isOpen={!!pendingDeleteId}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={confirmDelete}
        title="Eliminar categoría"
        message={
          pendingCat
            ? `Se borrarán todos los gastos de "${pendingCat.name}". Esta acción no se puede deshacer.`
            : ''
        }
        confirmText="Eliminar todo"
        isDanger
      />
    </div>
  )
}
