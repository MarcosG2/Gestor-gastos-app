import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { User, Mail, Calendar, Trash2, ShieldAlert, Edit2, Save, X, Loader2 } from 'lucide-react'
import Modal from './Modal'

export default function Profile({ session }) {
    const [stats, setStats] = useState({ expenses: 0, categories: 0 })
    const [loading, setLoading] = useState(false)
    const [userName, setUserName] = useState('Usuario')
    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isResetModalOpen, setIsResetModalOpen] = useState(false)
    const [isSuccssModalOpen, setIsSuccssModalOpen] = useState(false)

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

    const handleSaveName = async () => {
        if (!editName.trim()) return

        setIsSaving(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: editName })
                .eq('id', session.user.id)

            if (error) throw error

            setUserName(editName)
            setIsEditing(false)

        } catch (error) {
            alert('Error al actualizar el nombre: ' + error.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleResetAccount = async () => {
        setLoading(true)
        setIsResetModalOpen(false) 

        try {
            await supabase.from('expenses').delete().eq('user_id', session.user.id)
            await supabase.from('categories').delete().eq('user_id', session.user.id)

            setIsSuccssModalOpen(true) 
        } catch (error) {
            console.log("Error al resetear:", error);
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 relative">
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
                    <div className="flex items-center gap-3 mb-2 mt-2">
                        {isEditing ? (
                            <div className="flex items-center gap-2 animate-fade-in">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="px-3 py-1.5 text-xl font-bold border-2 border-indigo-500 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 bg-white"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                />
                                <button
                                    onClick={handleSaveName}
                                    disabled={isSaving}
                                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 shadow-sm"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    disabled={isSaving}
                                    className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-2xl font-bold text-gray-900">{userName}</h3>
                                <button
                                    onClick={() => {
                                        setEditName(userName)
                                        setIsEditing(true)
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Editar nombre"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
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

            <div className="grid md:grid-cols-2 gap-6">
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

                <div className="bg-red-50 p-6 rounded-3xl shadow-lg border border-red-100">
                    <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5" /> Zona de Peligro
                    </h4>
                    <p className="text-sm text-red-600 mb-6">
                        Si deseas comenzar de cero, puedes borrar todos los datos de tu cuenta aquí.
                    </p>
                    <button
                        onClick={() => setIsResetModalOpen(true)}
                        disabled={loading}
                        className="w-full bg-white border-2 border-red-200 text-red-600 font-bold py-3 rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-5 h-5" />
                        {loading ? 'Borrando...' : 'Resetear Cuenta'}
                    </button>
                </div>
            </div>


            <Modal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={handleResetAccount}
                title=" ZONA DE PELIGRO"
                message="Esta acción es irreversible. Se borrarán todos tus gastos y categorías de forma permanente."
                confirmText="Sí, borrar todo"
                isDanger={true}
                requireInput={true}
                expectedWord="BORRAR"
            />


            <Modal
                isOpen={isSuccssModalOpen}
                onClose={() => {
                    setIsSuccssModalOpen(false)
                    window.location.reload()
                }}
                onConfirm={() => {
                    setIsSuccssModalOpen(false)
                    window.location.reload()
                }}
                title="¡Cuenta Reseteada!"
                message="Todos tus datos han sido eliminados correctamente. Tu cuenta está como nueva."
                confirmText="Entendido"
                cancelText="Cerrar"
            />

        </div>
    )
}