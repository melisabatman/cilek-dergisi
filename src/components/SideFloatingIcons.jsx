import React from 'react'

export default function SideFloatingIcons() {
  return (
    <div className="page-side-floating-container" aria-hidden="true">
      {/* Sol Kenardaki Süzülen İkonlar */}
      <div className="side-float-item float-left-1" title="Aşk ve İlham">
        <img
          src="/icons/icon1.png"
          alt="Cupid Meleği Çıkartması"
          className="side-float-img img-bunny-cupid"
        />
      </div>

      <div className="side-float-item float-left-2" title="Bağlılık ve Kalpler">
        <img
          src="/icons/icon3.png"
          alt="Kalp Kilitler Çıkartması"
          className="side-float-img img-heart-locks"
        />
      </div>

      <div className="side-float-item float-left-3" title="Taze Çilek">
        <img
          src="/icons/cilek-vintage.png"
          alt="Çilek İllüstrasyonu"
          className="side-float-img img-side-strawberry"
        />
      </div>

      <div className="side-float-item float-left-4" title="Nostaljik Çağrı">
        <img
          src="/icons/icon5.png"
          alt="Retro Telefon Çıkartması"
          className="side-float-img img-vintage-phone"
        />
      </div>

      {/* Sağ Kenardaki Süzülen İkonlar */}
      <div className="side-float-item float-right-1" title="Zarafet ve Koku">
        <img
          src="/icons/icon2.png"
          alt="Parfüm Şişesi Çıkartması"
          className="side-float-img img-perfume"
        />
      </div>

      <div className="side-float-item float-right-2" title="Fotoğraflar & Günlük">
        <img
          src="/icons/icon4.png"
          alt="Kamera ve Günlük Çıkartması"
          className="side-float-img img-camera-journal"
        />
      </div>

      <div className="side-float-item float-right-3" title="Taze Çilek">
        <img
          src="/icons/cilek-vintage.png"
          alt="Çilek İllüstrasyonu"
          className="side-float-img img-side-strawberry"
        />
      </div>

      <div className="side-float-item float-right-4" title="Tatlı Öpücük">
        <img
          src="/icons/icon6.png"
          alt="Dudak Çıkartması"
          className="side-float-img img-cherry-lips"
        />
      </div>
    </div>
  )
}

