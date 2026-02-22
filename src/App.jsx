import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Sidebar from './components/Sidebar'

const Dashboard = lazy(() => import('./components/Dashboard'))
const Analytics = lazy(() => import('./components/Analytics'))
const Categories = lazy(() => import('./components/Categories'))
const Profile = lazy(() => import('./components/Profile'))

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  if (!session) return <Auth />

  return (
    <BrowserRouter>
      <div className="min-h-screen overflow-x-hidden bg-slate-300 ">

        <Sidebar />
        <main className="md:ml-64 px-4 md:px-8 pb-8 pt-24 md:pt-8 transition-all">
          <Suspense fallback={<div className="flex justify-center items-center mt-20 text-gray-500 font-medium animate-pulse">Cargando pantalla...</div>}>
            <Routes>
              <Route path="/" element={<Dashboard session={session} />} />
              <Route path="/stats" element={<Analytics session={session} />} />
              <Route path="/categories" element={<Categories session={session} />} />
              <Route path="/profile" element={<Profile session={session} />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App