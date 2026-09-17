import React from 'react'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="hero-intro" id="hero-intro" aria-label="Çilek Dergi Giriş Alanı">
      <div className="hero-frame">
        {/* İPSİZ SÜZÜLEN (FLOATING) VE ARKASI PARLAYAN 6 ADET ÇİLEK OBJESİ */}
        <div className="hero-floating-objects" aria-hidden="true">
          <img
            src="/icons/icon1.png"
            alt="Çilek Obje 1"
            className="hero-object hero-obj-1"
          />

          <img
            src="/icons/icon2.png"
            alt="Çilek Obje 2"
            className="hero-object hero-obj-2"
          />

          <img
            src="/icons/icon3.png"
            alt="Çilek Obje 3"
            className="hero-object hero-obj-3"
          />

          <img
            src="/icons/icon4.png"
            alt="Çilek Obje 4"
            className="hero-object hero-obj-4"
          />

          <img
            src="/icons/icon5.png"
            alt="Çilek Obje 5"
            className="hero-object hero-obj-5"
          />

          <img
            src="/icons/icon6.png"
            alt="Çilek Obje 6"
            className="hero-object hero-obj-6"
          />
        </div>

        {/* Merkez: Çilek Logosu ve Butonlar Arası Sayfa Geçişleri */}
        <div className="hero-center">
          <div className="hero-logo-box">
            <h1 className="hero-brand-name">Çilek</h1>
            <span className="hero-brand-badge">DERGİ</span>
          </div>

          <div className="hero-actions-container">
            {/* Ana CTA Sarı/Kırmızı Canlandırıcı Buton */}
            <Link to="/dergiler" className="hero-button" id="enter-site-btn">
              Dergileri Keşfet <span aria-hidden="true">→</span>
            </Link>

            {/* Sayfalar Arası Hızlı Buton Geçişleri */}
            <div className="hero-page-links" role="navigation" aria-label="Sayfa Geçişleri">
              <Link to="/hakkimizda" className="hero-pill-btn" id="btn-quick-hakkimizda">
                Hakkımızda
              </Link>
              <Link to="/ekibimiz" className="hero-pill-btn" id="btn-quick-ekibimiz">
                Ekibimiz
              </Link>
              <Link to="/iletisim" className="hero-pill-btn" id="btn-quick-iletisim">
                Yazı Gönderin
              </Link>
            </div>
          </div>
        </div>

        {/* Alt Bölüm: Çilek Ayrım Çizgisi + Açıklama Metni (Asla üst üste binmez) */}
        <div className="hero-bottom-container">
          <div className="hero-bottom-divider" aria-hidden="true">
            <span className="hero-bottom-line" />
            <img
              src="/icons/cilek-vintage.png"
              alt="Çilek İllüstrasyonu"
              className="hero-bottom-strawberry-img"
            />
            <span className="hero-bottom-line" />
          </div>

          <div className="hero-description">
            <h2>Çilek Dergi,</h2>
            <p>Kendi sesini özgürce duyurduğun, seninle büyüyen ve parıldayan bir alandır.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
