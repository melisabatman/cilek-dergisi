import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer-inner">
        <div className="footer-left">
          <Link to="/" className="footer-brand" aria-label="Çilek Dergi Ana Sayfa">
            <span className="footer-brand-title">Çilek</span>
            <span className="footer-brand-sub">DERGİ</span>
          </Link>

          <p className="footer-description">
            Kendi sesini özgürce duyurduğun, seninle büyüyen ve parıldayan bir alan.
          </p>

          <div className="footer-socials" aria-label="Sosyal Medya Bağlantıları">
            <a
              href="https://instagram.com/cilekdergisi"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="Instagram"
              id="footer-instagram"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>

            <a
              href="https://tiktok.com/@cilekdergisi"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="TikTok"
              id="footer-tiktok"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
              </svg>
            </a>

            <a
              href="mailto:hello@cilekdergisi.com"
              className="footer-social-link"
              aria-label="E-posta"
              id="footer-mail"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-links-group">
          <span className="flg-title">Sayfalar</span>
          <nav className="flg-nav">
            <Link to="/dergiler">Dergiler</Link>
            <Link to="/hakkimizda">Hakkımızda</Link>
            <Link to="/ekibimiz">Ekibimiz</Link>
            <Link to="/iletisim">Yazı Gönderin</Link>
          </nav>
        </div>

        <div className="footer-right">
          <p>© 2026 Çilek Dergi</p>
          <p>Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}
