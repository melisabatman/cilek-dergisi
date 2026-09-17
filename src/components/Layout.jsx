import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ user, isAdmin, children }) {
  return (
    <div className="page-wrapper">
      <Navbar user={user} isAdmin={isAdmin} />
      <main className="page-main">
        {children}
      </main>
      <Footer />
    </div>
  )
}
