import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Analytics from './components/Analytics'
import Categories from './components/Categories'
import Profile from './components/Profile'


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
      <div className="min-h-screen bg-slate-300 flex">

        <Sidebar />
        <main className="flex-1 md:ml-64 p-8 pt-24 md:pt-8 transition-all">
          <Routes>
            <Route path="/" element={<Dashboard session={session} />} />
            <Route path="/stats" element={<Analytics session={session} />} />
            <Route path="/categories" element={<Categories session={session} />} />
            <Route path="/profile" element={<Profile session={session} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App