import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { User, Mail, Calendar, Trash2, ShieldAlert } from 'lucide-react'

export default function Profile({ session }) {
    const [stats, setStats] = useState({ expenses: 0, categories: 0 })
    const [loading, setLoading] = useState(false)
    const [userName, setUserName] = useState('Usuario')

    const joinDate = new Date(session.user.created_at).toLocaleDateString('es-AR', {
        year: 'numeric', month: 'long', day: 'numeric'
    })

    useEffect(() => {
        getStats()
        getUserName()
    }, [])

    const getUserName = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single()

        if (data && data.full_name) {
            setUserName(data.full_name)
        }
    }

    const getStats = async () => {
        const { count: expCount } = await supabase.from('expenses').select('*', { count: 'exact' }).eq('user_id', session.user.id)
        const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact' }).eq('user_id', session.user.id)

        setStats({ expenses: expCount || 0, categories: catCount || 0 })
    }

    const handleResetAccount = async () => {
        const confirmText = prompt(" ZONA DE PELIGRO \nEsto borrará TODOS tus gastos y categorías.\nEscribe 'BORRAR' para confirmar:")

        if (confirmText === 'BORRAR') {
            setLoading(true)
            await supabase.from('expenses').delete().eq('user_id', session.user.id)
            await supabase.from('categories').delete().eq('user_id', session.user.id)

            alert("Cuenta reseteada correctamente.")
            window.location.reload()
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Mi Perfil</h2>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-white/50">
                <div className="bg-indigo-600 h-32 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                            <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                                <User className="w-10 h-10" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-8 px-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{userName}</h3>
                    <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-3 text-gray-600">
                            <Mail className="w-5 h-5 text-indigo-500" />
                            <span>{session.user.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <Calendar className="w-5 h-5 text-indigo-500" />
                            <span>Miembro desde el {joinDate}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resumen y Acciones */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Estadísticas */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-white/50">
                    <h4 className="font-bold text-gray-800 mb-4">Resumen</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-500">Total Gastos Cargados</span>
                            <span className="font-bold text-indigo-600 text-xl">{stats.expenses}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-500">Categorías Activas</span>
                            <span className="font-bold text-indigo-600 text-xl">{stats.categories}</span>
                        </div>
                    </div>
                </div>

                {/* Zona de Peligro */}
                <div className="bg-red-50 p-6 rounded-3xl shadow-lg border border-red-100">
                    <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5" /> Zona de Peligro
                    </h4>
                    <p className="text-sm text-red-600 mb-6">
                        Si deseas comenzar de cero, puedes borrar todos los datos de tu cuenta aquí.
                    </p>
                    <button
                        onClick={handleResetAccount}
                        disabled={loading}
                        className="w-full bg-white border-2 border-red-200 text-red-600 font-bold py-3 rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-5 h-5" />
                        {loading ? 'Borrando...' : 'Resetear Cuenta'}
                    </button>
                </div>
            </div>
        </div>
    )
}