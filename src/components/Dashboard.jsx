import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { PlusCircle, Wallet, Tag, Trash2, Pencil, X } from 'lucide-react' 

export default function Dashboard({ session }) {
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [categories, setCategories] = useState([])
    const [expenses, setExpenses] = useState([])
    const [loading, setLoading] = useState(false)
    const [editingId, setEditingId] = useState(null)

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        const user = session.user
        let { data: cats } = await supabase.from('categories').select('*').eq('user_id', user.id)
        setCategories(cats || [])

        
        const { data: exp } = await supabase
            .from('expenses')
            .select('*, categories(*)')
            .order('created_at', { ascending: false })
            .limit(10) 
        setExpenses(exp || [])
    }


    const handleDelete = async (id) => {
        if (!confirm('¿Borrar este gasto?')) return

        const { error } = await supabase.from('expenses').delete().eq('id', id)
        if (!error) fetchData()
    }


    const handleEditClick = (expense) => {
        setEditingId(expense.id)
        setAmount(expense.amount)
        setDescription(expense.description || '')
        setCategoryId(expense.category_id)
    }


    const cancelEdit = () => {
        setEditingId(null)
        setAmount('')
        setDescription('')
        setCategoryId('')
    }


    const handleSaveExpense = async (e) => {
        e.preventDefault()
        setLoading(true)

        if (!amount || !categoryId) {
            alert("Faltan datos")
            setLoading(false)
            return
        }

        const expenseData = {
            amount: parseFloat(amount),
            description,
            category_id: categoryId,
            user_id: session.user.id
        }

        let error
        if (editingId) {
            const { error: err } = await supabase
                .from('expenses')
                .update(expenseData)
                .eq('id', editingId)
            error = err
        } else {
            const { error: err } = await supabase
                .from('expenses')
                .insert(expenseData)
            error = err
        }

        if (error) {
            alert('Error: ' + error.message)
        } else {
            cancelEdit()
            fetchData()
        }
        setLoading(false)
    }

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-white/50 h-fit relative transition-all">

                {editingId && (
                    <div className="absolute top-4 right-4 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                        Modo Edición
                        <button onClick={cancelEdit}><X className="w-4 h-4 hover:text-red-600" /></button>
                    </div>
                )}

                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    {editingId ? <Pencil className="w-6 h-6 text-orange-500" /> : <PlusCircle className="w-6 h-6 text-indigo-600" />}
                    {editingId ? 'Editar Gasto' : 'Nuevo Gasto'}
                </h2>

                <form onSubmit={handleSaveExpense} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-500 mb-1 block">Monto</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-400 font-bold">$</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-lg font-semibold text-gray-800"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500 mb-1 block">Categoría</label>
                        <div className="grid grid-cols-2 gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategoryId(cat.id)}
                                    className={`p-3 rounded-xl text-sm font-medium transition-all border-2 ${categoryId === cat.id
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-transparent bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500 mb-1 block">Descripción</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            placeholder="Ej: Cena"
                        />
                    </div>

                    <button
                        disabled={loading}
                        className={`w-full text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 ${editingId
                            ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                            }`}
                    >
                        {loading ? 'Guardando...' : (editingId ? 'Actualizar Gasto' : 'Agregar Gasto')}
                    </button>
                </form>
            </div>

            
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-3xl shadow-lg">
                    <p className="text-slate-400 text-sm mb-1">Total gastado </p>
                    <h3 className="text-4xl font-bold">$ {expenses.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</h3>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-gray-500" />
                        Últimos movimientos
                    </h3>

                    <div className="space-y-3">
                        {expenses.map((expense) => (
                            <div key={expense.id} className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 flex justify-between items-center group hover:shadow-lg transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${expense.categories?.color || 'bg-gray-100'}`}>
                                        <Tag className="w-5 h-5 opacity-70" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{expense.categories?.name}</p>
                                        <p className="text-xs text-gray-500">{expense.description || 'Sin detalle'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <p className="font-bold text-red-500">
                                        - ${expense.amount.toLocaleString()}
                                    </p>

                                    
                                    <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditClick(expense)}
                                            className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(expense.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}