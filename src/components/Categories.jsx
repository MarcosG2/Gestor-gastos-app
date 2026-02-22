import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Trash2, Plus, Tag } from 'lucide-react'

export default function Categories() {
    const [categories, setCategories] = useState([])
    const [newCatName, setNewCatName] = useState('')
    const [selectedColor, setSelectedColor] = useState('blue')
    const [loading, setLoading] = useState(false)


    const colors = [
        { id: 'red', class: 'bg-red-100 text-red-600', bg: 'bg-red-500' },
        { id: 'blue', class: 'bg-blue-100 text-blue-600', bg: 'bg-blue-500' },
        { id: 'green', class: 'bg-green-100 text-green-600', bg: 'bg-green-500' },
        { id: 'yellow', class: 'bg-yellow-100 text-yellow-600', bg: 'bg-yellow-500' },
        { id: 'purple', class: 'bg-purple-100 text-purple-600', bg: 'bg-purple-500' },
        { id: 'pink', class: 'bg-pink-100 text-pink-600', bg: 'bg-pink-500' },
    ]

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        const { data } = await supabase.from('categories').select('*').eq('user_id', user.id)
        setCategories(data || [])
    }

    const handleAddCategory = async (e) => {
        e.preventDefault()
        if (!newCatName) return
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        const colorClass = colors.find(c => c.id === selectedColor).class

        const { error } = await supabase.from('categories').insert({
            name: newCatName,
            color: colorClass,
            user_id: user.id
        })

        if (!error) {
            setNewCatName('')
            fetchCategories()
        }
        setLoading(false)
    }

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro? Se borrarán todos los gastos de esta categoría.')) return;


        await supabase.from('expenses').delete().eq('category_id', id)

        await supabase.from('categories').delete().eq('id', id)
        fetchCategories()
    }

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
                                onChange={e => setNewCatName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Ej: Gimnasio"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-500 mb-2 block">Color</label>
                            <div className="flex gap-3">
                                {colors.map((c) => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => setSelectedColor(c.id)}
                                        className={`w-8 h-8 rounded-full ${c.bg} transition-transform ${selectedColor === c.id ? 'scale-125 ring-2 ring-offset-2 ring-gray-300' : 'opacity-70 hover:opacity-100'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold mt-2 hover:bg-indigo-700 transition-colors"
                        >
                            {loading ? 'Guardando...' : 'Crear Categoría'}
                        </button>
                    </form>
                </div>

                <div className="space-y-3">
                    <h3 className="font-bold text-gray-700 mb-2">Categorías Existentes</h3>
                    {categories.map((cat) => (
                        <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group">
                            <div className={`px-4 py-2 rounded-lg font-medium ${cat.color} flex items-center gap-2`}>
                                <Tag className="w-4 h-4" />
                                {cat.name}
                            </div>

                            <button
                                onClick={() => handleDelete(cat.id)}
                                className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                title="Borrar categoría"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}