import { useEffect, useState } from 'react'
import { LayoutDashboard, PieChart, Layers, User, LogOut, Menu, X, Download, ScrollText, Target, Repeat, PiggyBank } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { fetchProfileName } from '../services/profiles'
import { clearAppLock } from '../utils/appLock'

export default function Sidebar() {
    const location = useLocation()
    const [userName, setUserName] = useState('Usuario')
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [isInstallable, setIsInstallable] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState(null)

    useEffect(() => {
        const getUserName = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await fetchProfileName(user.id)
                if (data?.full_name) {
                    setUserName(data.full_name)
                }
            }
        }
        getUserName()
    }, [])

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setIsInstallable(true)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        // Mostramos la ventanita nativa del celular para instalar
        deferredPrompt.prompt()

        // Esperamos a ver si el usuario aceptó o canceló
        const { outcome } = await deferredPrompt.userChoice

        // Si aceptó, escondemos el botón para siempre
        if (outcome === 'accepted') {
            setIsInstallable(false)
        }

        // Limpiamos la variable
        setDeferredPrompt(null)
    }

    const menuItems = [
        { icon: LayoutDashboard, text: 'Panel', path: '/' },
        { icon: ScrollText, text: 'Historial', path: '/history' },
        { icon: Target, text: 'Presupuestos', path: '/budgets' },
        { icon: Repeat, text: 'Recurrentes', path: '/recurring' },
        { icon: PiggyBank, text: 'Metas', path: '/goals' },
        { icon: PieChart, text: 'Visualizador', path: '/stats' },
        { icon: Layers, text: 'Categorías', path: '/categories' },
        { icon: User, text: 'Mi Perfil', path: '/profile' },
    ]

    return (
        <>

            <div className="md:hidden fixed top-0 left-0 w-full bg-band text-on-band z-20 px-4 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">
                    Gestor
                </h1>
                <button
                    type="button"
                    onClick={() => setIsMobileOpen(true)}
                    className="text-on-band"
                    aria-label="Abrir menú"
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

            <div className={`w-60 bg-band text-on-band h-screen fixed left-0 top-0 flex flex-col z-40 transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}>

                <div className="px-6 pt-8 pb-6 relative">
                    <button
                        type="button"
                        className="md:hidden absolute top-4 right-4 text-on-band"
                        onClick={() => setIsMobileOpen(false)}
                        aria-label="Cerrar menú"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <h1 className="text-2xl font-bold mb-1">
                        Gestor
                    </h1>
                    <p className="text-sm text-on-band/80">Hola, {userName}</p>
                </div>

                <nav className="flex-1 px-3 flex flex-col gap-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium ${isActive
                                    ? 'bg-on-band text-band'
                                    : 'text-on-band/85 hover:bg-on-band/10'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.text}
                            </Link>
                        )
                    })}
                </nav>


                <div className="p-3 flex flex-col gap-1 border-t border-on-band/15">
                    {isInstallable && (
                        <button
                            onClick={handleInstallClick}
                            className="flex items-center justify-center gap-3 px-3 py-2.5 bg-on-band text-band w-full rounded-md font-bold"
                        >
                            <Download className="w-5 h-5" />
                            Instalar App
                        </button>
                    )}
                    <button
                        onClick={() => {
                          clearAppLock()
                          supabase.auth.signOut()
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 text-on-band hover:bg-on-band/10 w-full rounded-md font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </>
    )
}