import React, { useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import WelcomePostcardModal from './WelcomePostcardModal'
export default function Layout({ user, isAdmin, children }) {
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false)

  return (
    <div className="page-wrapper" style={{ position: 'relative' }}>

      <Navbar
        user={user}
        isAdmin={isAdmin}
        onOpenWelcomeLetter={() => setIsWelcomeModalOpen(true)}
      />

      <main className="page-main">
        {children}
      </main>
      <Footer />

      <WelcomePostcardModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        user={user}
      />
    </div>
  )
}

