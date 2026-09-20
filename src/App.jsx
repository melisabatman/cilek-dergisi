import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase, checkIsAdmin } from './lib/supabase'

import Home       from './pages/Home'
import Dergiler   from './pages/Dergiler'
import Hakkimizda from './pages/Hakkimizda'
import Ekibimiz   from './pages/Ekibimiz'
import Iletisim   from './pages/Iletisim'
import Auth       from './pages/Auth'
import Admin      from './pages/Admin'
import ReaderPage from './pages/ReaderPage'

export default function App() {
  const [user, setUser] = useState(undefined) // undefined = loading, null = unauthenticated
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // 1. Mevcut oturumu al
    supabase.auth.getSession().then(async ({ data }) => {
      const currentUser = data.session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const isUserAdmin = await checkIsAdmin(currentUser)
        setIsAdmin(isUserAdmin)
      } else {
        setIsAdmin(false)
      }
    })

    // 2. Auth durumu değiştikçe dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const isUserAdmin = await checkIsAdmin(currentUser)
        setIsAdmin(isUserAdmin)
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<Home       user={user} isAdmin={isAdmin} />} />
        <Route path="/dergiler"   element={<Dergiler   user={user} isAdmin={isAdmin} />} />
        <Route path="/hakkimizda" element={<Hakkimizda user={user} isAdmin={isAdmin} />} />
        <Route path="/ekibimiz"     element={<Ekibimiz   user={user} isAdmin={isAdmin} />} />
        <Route path="/yazi-gonderi" element={<Iletisim   user={user} isAdmin={isAdmin} />} />
        <Route path="/iletisim"     element={<Iletisim   user={user} isAdmin={isAdmin} />} />
        <Route path="/auth"         element={<Auth       user={user} isAdmin={isAdmin} />} />
        <Route path="/admin"      element={<Admin      user={user} isAdmin={isAdmin} />} />
        <Route path="/oku/:id"    element={<ReaderPage user={user} isAdmin={isAdmin} />} />
      </Routes>
    </BrowserRouter>
  )
}
