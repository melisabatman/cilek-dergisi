import React from 'react'
import { Link } from 'react-router-dom'

const TICKER_TEXT = '✦ Sayı 06 yayında · Şimdi oku ✦ Her ay yeni bir sayı ✦ Bağımsız Gençlik ✦ Çilek Dergisi ✦ Sayı 06 yayında · Şimdi oku ✦ Her ay yeni bir sayı ✦ Bağımsız Gençlik ✦ Çilek Dergisi ✦ '

export default function Footer({ showTicker = false }) {
  return (
    <footer className="site-footer-v2" role="contentinfo">

      {/* ── Kayan Şerit (Footer Üstü) ────────────────────────────────── */}
      <div className="footer-ticker-band" aria-hidden="true">
        <div className="footer-ticker-track">
          <span className="footer-ticker-text">{TICKER_TEXT}</span>
          <span className="footer-ticker-text">{TICKER_TEXT}</span>
        </div>
      </div>

      {/* ── Footer Ana İçerik ────────────────────────────────────────── */}
      <div className="footer-v2-inner">

        {/* Sol: Marka + Açıklama + Sosyal */}
        <div className="footer-v2-brand">
          <Link to="/" className="footer-v2-logo" aria-label="Çilek Dergi Ana Sayfa">
            <span className="footer-v2-logo-title">Çilek</span>
            <span className="footer-v2-logo-sub">DERGİ</span>
          </Link>

          <p className="footer-v2-desc">
            Kendi sesini özgürce duyurduğun,<br />
            seninle büyüyen ve parıldayan bir alan.
          </p>

          {/* Sosyal Medya İkonları */}
          <div className="footer-v2-socials" aria-label="Sosyal Medya Bağlantıları">
            {/* Instagram */}
            <a
              href="https://instagram.com/cilekdergisi"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-v2-social-link"
              aria-label="Instagram"
              id="footer-instagram"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com/@cilekdergisi"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-v2-social-link"
              aria-label="TikTok"
              id="footer-tiktok"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
              </svg>
            </a>

            {/* E-posta */}
            <a
              href="mailto:hello@cilekdergisi.com"
              className="footer-v2-social-link"
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

        {/* Orta: Sayfa Linkleri */}
        <div className="footer-v2-links-group">
          <span className="footer-v2-group-title">Sayfalar</span>
          <nav className="footer-v2-nav" aria-label="Alt menü">
            <Link to="/dergiler">Dergiler</Link>
            <Link to="/hakkimizda">Hakkımızda</Link>
            <Link to="/ekibimiz">Ekibimiz</Link>
            <Link to="/iletisim">Yazı Gönderin</Link>
            <Link to="/auth">Giriş Yap</Link>
          </nav>
        </div>

        {/* Sağ: Copyright + Manifesto */}
        <div className="footer-v2-right">
          <p className="footer-v2-manifesto">
            "Her gencin anlatacak sahici,<br />kırılgan ve özgün bir hikâyesi vardır."
          </p>
          <p className="footer-v2-copy">© 2026 Çilek Dergi</p>
          <p className="footer-v2-copy">Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}
