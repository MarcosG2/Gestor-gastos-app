import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { Loader2 } from 'lucide-react'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import { OfflineSyncProvider } from './context/OfflineSyncContext'
import Auth from './Auth'
import Sidebar from './components/Sidebar'
import PwaUpdatePrompt from './components/PwaUpdatePrompt'
import OfflineBanner from './components/OfflineBanner'
import AppLockGate from './components/AppLockGate'
import { runRecurringForUser } from './utils/recurringRunner'

const Dashboard = lazy(() => import('./components/Dashboard'))
const Analytics = lazy(() => import('./components/Analytics'))
const Categories = lazy(() => import('./components/Categories'))
const Profile = lazy(() => import('./components/Profile'))
const History = lazy(() => import('./components/History'))
const Budgets = lazy(() => import('./components/Budgets'))
const Recurring = lazy(() => import('./components/Recurring'))
const SavingsGoals = lazy(() => import('./components/SavingsGoals'))

function App() {
  const [session, setSession] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsInitializing(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setIsInitializing(false)
      if (session?.user?.id && navigator.onLine) {
        runRecurringForUser(session.user.id).catch(() => {})
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session?.user?.id && navigator.onLine) {
      runRecurringForUser(session.user.id).catch(() => {})
    }
  }, [session?.user?.id])

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-300 dark:bg-slate-900">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-300 font-medium animate-pulse">
          Cargado tu información...
        </p>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <PwaUpdatePrompt />
        {!session ? (
          <Auth />
        ) : (
          <OfflineSyncProvider session={session}>
            <AppLockGate session={session}>
              <BrowserRouter>
                <OfflineBanner />
                <div className="min-h-screen overflow-x-clip bg-slate-300 dark:bg-slate-900">
                  <Sidebar />
                  <main className="min-w-0 md:ml-64 px-3 sm:px-4 md:px-8 pb-8 pt-24 md:pt-8 transition-all">
                    <Suspense
                      fallback={
                        <div className="flex justify-center items-center mt-20 text-gray-500 dark:text-gray-400 font-medium animate-pulse">
                          Cargando pantalla...
                        </div>
                      }
                    >
                      <Routes>
                        <Route path="/" element={<Dashboard session={session} />} />
                        <Route path="/history" element={<History session={session} />} />
                        <Route path="/budgets" element={<Budgets session={session} />} />
                        <Route path="/stats" element={<Analytics session={session} />} />
                        <Route path="/categories" element={<Categories session={session} />} />
                        <Route path="/recurring" element={<Recurring session={session} />} />
                        <Route path="/goals" element={<SavingsGoals session={session} />} />
                        <Route path="/profile" element={<Profile session={session} />} />
                      </Routes>
                    </Suspense>
                  </main>
                </div>
              </BrowserRouter>
            </AppLockGate>
          </OfflineSyncProvider>
        )}
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
