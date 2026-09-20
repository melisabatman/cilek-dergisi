import React, { useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import WelcomePostcardModal from './WelcomePostcardModal'
import WireMoodboard from './WireMoodboard'

export default function Layout({ user, isAdmin, children }) {
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false)
  const [showMoodboard, setShowMoodboard] = useState(false)

  return (
    <div className="page-wrapper" style={{ position: 'relative' }}>

      <Navbar
        user={user}
        isAdmin={isAdmin}
        onOpenWelcomeLetter={() => setIsWelcomeModalOpen(true)}
        onToggleMoodboard={() => setShowMoodboard(v => !v)}
      />

      {/* İsteğe Bağlı Açılan Telli Pano */}
      {showMoodboard && (
        <aside className="wire-board-collapsible-wrapper" aria-label="Telli İlham Panosu">
          <WireMoodboard onOpenWelcomeLetter={() => setIsWelcomeModalOpen(true)} />
        </aside>
      )}

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

