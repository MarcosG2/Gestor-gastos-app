import { useEffect, useState } from 'react'
import { LayoutDashboard, PieChart, Layers, User, LogOut, Menu, X } from 'lucide-react' 
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Sidebar() {
    const location = useLocation()
    const [userName, setUserName] = useState('Usuario')
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    useEffect(() => {
        const getUserName = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
                if (data && data.full_name) {
                    setUserName(data.full_name)
                }
            }
        }
        getUserName()
    }, [])

    const menuItems = [
        { icon: LayoutDashboard, text: 'Panel', path: '/' },
        { icon: PieChart, text: 'Visualizador', path: '/stats' },
        { icon: Layers, text: 'Categorías', path: '/categories' },
        { icon: User, text: 'Mi Perfil', path: '/profile' },
    ]

    return (
        <>

            <div className="md:hidden fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-20 px-4 py-4 flex justify-between items-center shadow-sm">
                <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                    <span>🪙</span> Gestor
                </h1>
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="text-gray-500 hover:text-indigo-600 focus:outline-none"
                >
                    <Menu className="w-7 h-7" />
                </button>
            </div>


            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/30 z-30 transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <div className={`w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-200 flex flex-col z-40 transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}>

                <div className="p-8 border-b border-gray-50 relative">
                    <button
                        className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                        onClick={() => setIsMobileOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2 mb-1">
                        <span className="text-3xl">🪙</span>Gestor
                    </h1>
                    <p className="text-xs text-gray-400 font-medium pl-1">Hola, {userName}</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 py-6">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileOpen(false)} 
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                    ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.text}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-50">
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 w-full rounded-xl transition-colors font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </>
    )
}