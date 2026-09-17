import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase, checkIsAdmin } from '../lib/supabase'

const NAV_LINKS = [
  { to: '/dergiler',   label: 'Dergiler'     },
  { to: '/hakkimizda', label: 'Hakkımızda'   },
  { to: '/ekibimiz',   label: 'Ekibimiz'     },
  { to: '/iletisim',   label: 'Yazı Gönderin'},
]

export default function Navbar({ user, isAdmin: propIsAdmin }) {
  const location = useLocation()
  const navigate  = useNavigate()
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isAdminState, setIsAdminState] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`} role="banner">
      <div className="header-inner">
        {/* Logo: Çilek */}
        <div className="logo">
          <Link to="/" aria-label="Çilek Dergi Ana Sayfa">
            <span className="brand-logo-text">Çilek</span>
            <span className="brand-logo-sub">DERGİ</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="navbar desktop-nav" aria-label="Ana Menü">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              id={`nav-${to.replace('/', '')}`}
              className={location.pathname === to ? 'active' : ''}
            >
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              id="nav-admin"
              className={`nav-admin-badge-link ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              <span className="admin-badge-dot">●</span> Admin Paneli
            </Link>
          )}
        </nav>

        {/* Sağ: Giriş Yap / Profil */}
        <div className="header-right desktop-user">
          {user ? (
            <div className="user-logged-wrap">
              <span className="header-user-email" title={user.email}>
                {user.email?.split('@')[0]}
              </span>
              <button
                type="button"
                className="btn-logout"
                onClick={handleLogout}
                id="btn-navbar-logout"
                aria-label="Çıkış yap"
              >
                Çıkış
              </button>
            </div>
          ) : (
            <Link to="/auth" className="login-link" id="btn-navbar-login">
              Giriş Yap
            </Link>
          )}
        </div>

        {/* Mobil Hamburger Butonu */}
        <button
          type="button"
          className="hamburger-button"
          id="hamburgerButton"
          onClick={() => setMobileOpen(v => !v)}
          aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          aria-expanded={mobileOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobil Menü Çekmecesi & Karartma */}
      {mobileOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-menu-top">
          <span className="brand-logo-text" style={{ fontSize: '1.8rem' }}>Çilek</span>
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
              className={location.pathname === to ? 'active' : ''}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className={`nav-admin-mobile-link ${location.pathname === '/admin' ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              ★ Admin Paneli
            </Link>
          )}
        </nav>

        <div className="mobile-menu-bottom">
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
              className="mobile-login"
              onClick={() => setMobileOpen(false)}
            >
              Giriş Yap
            </Link>
          )}
        </div>
      </aside>
    </header>
  )
}
