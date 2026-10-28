import { useState } from 'react'
import { Trash2, Plus, Tag } from 'lucide-react'
import { CATEGORY_COLORS } from '../constants/categories'
import { useCategories } from '../hooks/useCategories'
import { useToast } from '../context/ToastContext'
import { createCategory, deleteCategoryAndExpenses } from '../services/categories'
import Modal from './Modal'

export default function Categories({ session }) {
  const userId = session.user.id
  const { categories, reload } = useCategories(userId)
  const { showToast } = useToast()

  const [newCatName, setNewCatName] = useState('')
  const [selectedColor, setSelectedColor] = useState('blue')
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

    const colorClass = CATEGORY_COLORS.find((c) => c.id === selectedColor)?.class
    const result = await createCategory(userId, name, colorClass)

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
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Gestión de Categorías</h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" /> Nueva Categoría
          </h3>

          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Nombre</label>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ej: Gimnasio"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-2 block">Color</label>
              <div className="flex gap-3">
                {CATEGORY_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.id)}
                    className={`w-8 h-8 rounded-full ${c.bg} transition-transform ${selectedColor === c.id ? 'scale-125 ring-2 ring-offset-2 ring-gray-300' : 'opacity-70 hover:opacity-100'}`}
                    aria-label={`Color ${c.id}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold mt-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Crear Categoría'}
            </button>
          </form>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-gray-700 mb-2">Categorías Existentes</h3>
          {categories.length === 0 && (
            <p className="text-gray-500 text-sm bg-white rounded-xl p-4 border border-gray-100">
              Todavía no tenés categorías. Los usuarios nuevos reciben cuatro por defecto al registrarse.
            </p>
          )}
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group">
              <div className={`px-4 py-2 rounded-lg font-medium ${cat.color} flex items-center gap-2`}>
                <Tag className="w-4 h-4" />
                {cat.name}
              </div>

              <button
                type="button"
                onClick={() => setPendingDeleteId(cat.id)}
                className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                title="Borrar categoría"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
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
