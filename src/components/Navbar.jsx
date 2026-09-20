import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase, checkIsAdmin } from '../lib/supabase'

const NAV_LINKS = [
  { to: '/dergiler',     label: 'DERGİLER'     },
  { to: '/hakkimizda',   label: 'HAKKIMIZDA'   },
  { to: '/ekibimiz',     label: 'EKİBİMİZ'     },
  { to: '/yazi-gonderi', label: 'YAZI GÖNDERİ' },
]

export default function Navbar({ user, isAdmin: propIsAdmin, onOpenWelcomeLetter, onToggleMoodboard, hideTopBar = false }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isAdminState, setIsAdminState] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (propIsAdmin !== undefined) {
      setIsAdminState(propIsAdmin)
    } else if (user) {
      checkIsAdmin(user).then(setIsAdminState)
    } else {
      setIsAdminState(false)
    }
  }, [user, propIsAdmin])

  const isAdmin = propIsAdmin ?? isAdminState

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const isLinkActive = (to) => {
    if (location.pathname === to) return true
    if (to === '/yazi-gonderi' && location.pathname === '/iletisim') return true
    return false
  }

  return (
    <div className="site-header-wrapper">
      {/* 1. EN ÜST KOYU BORDO DUYURU BARI (Home kendi marquee'sini gösterince gizlenir) */}
      {!hideTopBar && (
        <div className="top-announcement-bar" role="region" aria-label="Duyuru Çubuğu">
          <div className="announcement-socials">
            <a
              href="https://instagram.com/cilekdergisi"
              target="_blank"
              rel="noopener noreferrer"
              className="announcement-social-link"
              aria-label="Instagram"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a
              href="https://tiktok.com/@cilekdergisi"
              target="_blank"
              rel="noopener noreferrer"
              className="announcement-social-link"
              aria-label="TikTok"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
              </svg>
            </a>
          </div>

          <p className="announcement-center-text">
            Hey Chaps! Welcome to Çilek Dergisi 🍓
          </p>

          {onToggleMoodboard && (
            <button
              type="button"
              className="announcement-moodboard-btn"
              onClick={onToggleMoodboard}
              title="Telli İlham Panosunu Aç / Kapat"
              id="btn-nav-moodboard-toggle"
            >
              <span>📌</span> Telli Pano
            </button>
          )}
        </div>
      )}


      {/* 2. PEMBE EDİTORYAL NAVBAR */}
      <header className="cassius-navbar" role="banner">
        {/* Sol Navigasyon Bağlantıları (Türkçe) */}
        <nav className="cassius-nav-links" aria-label="Ana Menü">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`cassius-nav-link ${isLinkActive(to) ? 'active' : ''}`}
              id={`nav-${to.replace('/', '')}`}
            >
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className={`cassius-nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
              style={{ color: 'var(--c-red)' }}
            >
              ★ ADMİN
            </Link>
          )}
        </nav>


        {/* Merkez: Fiyonklu Monogram Logo */}
        <div className="cassius-nav-center">
          <Link to="/" className="cassius-logo-wrap" aria-label="Çilek Dergi Ana Sayfa">
            <img
              src="/icons/ribbon-monogram-logo.svg"
              alt="Çilek Monogram Logo"
              className="cassius-monogram-img"
            />
            <span className="cassius-logo-title">Çilek</span>
          </Link>
        </div>

        {/* Sağ Eylemler: Kalp/Mektup, Çanta ve "Your Space" Butonu */}
        <div className="cassius-nav-right">
          {onOpenWelcomeLetter && (
            <button
              type="button"
              className="btn-cassius-icon"
              onClick={onOpenWelcomeLetter}
              title="Aramıza Hoş Geldin Mektubunu Oku"
              id="btn-nav-letter"
              aria-label="Hoş geldin mektubu"
            >
              <span style={{ fontSize: '1.4rem' }}>💌</span>
            </button>
          )}

          {/* Çift Çerçeveli El Yazısı "Your Space" Butonu */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link
                to={isAdmin ? "/admin" : "/dergiler"}
                className="btn-your-space"
                id="btn-your-space"
                title={user.email}
              >
                {isAdmin ? 'Admin' : (user.email?.split('@')[0] || 'Your Space')}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-cassius-icon"
                title="Çıkış Yap"
                id="btn-nav-logout"
                style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--c-bordo)' }}
              >
                Çıkış
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="btn-your-space"
              id="btn-your-space"
            >
              Your Space
            </Link>
          )}

          {/* Mobil Hamburger Butonu */}
          <button
            type="button"
            className="hamburger-button mobile-only"
            id="hamburgerButton"
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={mobileOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Mobil Menü Çekmecesi */}
      {mobileOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className={`mobile-menu ${mobileOpen ? 'open' : ''}`} style={{ background: 'var(--c-cream)', borderLeft: '2px solid var(--c-bordo)' }}>
        <div className="mobile-menu-top">
          <span className="cassius-logo-title" style={{ fontSize: '2.2rem' }}>Çilek</span>
          <button
            type="button"
            className="mobile-menu-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Kapat"
          >
            ×
          </button>
        </div>

        <nav className="mobile-nav">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={isLinkActive(to) ? 'active' : ''}
              onClick={() => setMobileOpen(false)}
              style={{ color: 'var(--c-bordo)', fontWeight: 800, letterSpacing: '0.1em' }}
            >
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              style={{ color: 'var(--c-red)', fontWeight: 800 }}
            >
              ★ ADMİN PANELİ
            </Link>
          )}
        </nav>

        <div className="mobile-menu-bottom">
          {onOpenWelcomeLetter && (
            <button
              type="button"
              className="mobile-postcard-btn"
              onClick={() => {
                setMobileOpen(false)
                onOpenWelcomeLetter()
              }}
              style={{ background: 'var(--c-cream)', border: '1.5px solid var(--c-bordo)', color: 'var(--c-bordo)' }}
            >
              <span>💌</span> Hoş Geldin Mektubu
            </button>
          )}

          {user ? (
            <button
              type="button"
              className="btn-logout"
              onClick={handleLogout}
            >
              Çıkış ({user.email?.split('@')[0]})
            </button>
          ) : (
            <Link
              to="/auth"
              className="mobile-login btn-your-space"
              onClick={() => setMobileOpen(false)}
              style={{ display: 'block', textAlign: 'center' }}
            >
              Your Space (Giriş Yap)
            </Link>
          )}
        </div>
      </aside>
    </div>
  )
}
