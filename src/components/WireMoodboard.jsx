import React from 'react'
import { Link } from 'react-router-dom'

export default function WireMoodboard({ onOpenWelcomeLetter }) {
  return (
    <section className="wire-board-section" aria-label="Editoryal Telli Asma Panosu">
      <div className="container">
        
        {/* Üst Başlık & Açıklama */}
        <div className="wire-board-header">
          <span className="wire-board-pill">Aylık İlham & Editoryal Masa</span>
          <h2 className="wire-board-title">Çilek Moodboard</h2>
          <p className="wire-board-desc">
            Bu ay sayfalarımızda ne var? Masamıza iliştirilmiş notlar, polaroid kareler ve ilham veren satırlar.
          </p>
        </div>

        {/* Telli Asma Aparatı Çerçevesi */}
        <div className="wire-grid-apparatus">
          {/* Duvara Asma Askı / Kancaları */}
          <div className="wire-mount-hangers" aria-hidden="true">
            <div className="wire-hanger wire-hanger-left">
              <span className="hanger-ring" />
              <span className="hanger-bracket" />
            </div>
            <div className="wire-hanger wire-hanger-right">
              <span className="hanger-ring" />
              <span className="hanger-bracket" />
            </div>
          </div>

          {/* Metalik Izgara Kafes (Rose-Gold Wire Mesh) */}
          <div className="wire-mesh-surface">
            
            {/* 1. ÖĞE: Çilek Çıkartmaları (Sol Üst) */}
            <div className="board-pin-item item-stickers" style={{ top: '8%', left: '4%' }}>
              <div className="mini-binder-clip" aria-hidden="true" />
              <div className="stickers-cluster">
                <img src="/icons/cilek-vintage.png" alt="Çilek Çıkartması" className="sticker-strawberry-img" />
                <span className="sticker-lucky-clover" title="Şans">🍀</span>
              </div>
            </div>

            {/* 2. ÖĞE: Bu Ayın Teması Sarı Not (Sol Orta) */}
            <div className="board-pin-item item-sticky-theme" style={{ top: '22%', left: '16%' }}>
              <div className="washi-tape-strip tape-pink" aria-hidden="true" />
              <div className="sticky-note-card note-pastel-yellow">
                <span className="note-pin-badge">Sayı #01</span>
                <h4 className="note-title">Başlangıç &amp; Özgürlük</h4>
                <p className="note-text">
                  Kendi sesini bulmak, belki de en büyük macera. Gençlerin bağımsız üretimi için ilk kıvılcım.
                </p>
                <span className="note-heart-doodle">♥ Çilek Notu</span>
              </div>
            </div>

            {/* 3. ÖĞE: Polaroid Dergi Önizleme (Merkez) */}
            <div className="board-pin-item item-polaroid-cover" style={{ top: '12%', left: '44%' }}>
              <div className="mini-rose-clip" aria-hidden="true" />
              <div className="polaroid-frame">
                <div className="polaroid-photo-box">
                  <img
                    src="/icons/icon1.png"
                    alt="Dergi Kapağı Önizleme"
                    className="polaroid-img"
                  />
                  <span className="polaroid-date-stamp">11 OCAK</span>
                </div>
                <div className="polaroid-caption">
                  <span>Sayı 01 Kapağı</span>
                </div>
              </div>
            </div>

            {/* 4. ÖĞE: "Genç Kalemler" Çağrı Kartı (Sağ Orta) */}
            <div className="board-pin-item item-sticky-manifesto" style={{ top: '24%', right: '14%' }}>
              <div className="washi-tape-strip tape-mint" aria-hidden="true" />
              <div className="sticky-note-card note-pastel-mint">
                <span className="note-pin-badge badge-green">Yazı Gönder</span>
                <h4 className="note-title">Senin de Sesin Var</h4>
                <p className="note-text">
                  15-25 yaşındaysan; şiirini, denemeni veya çizimini sonraki sayımıza gönderebilirsin.
                </p>
                <Link to="/iletisim" className="note-cta-link">
                  Bize Yaz Gönder →
                </Link>
              </div>
            </div>

            {/* 5. ÖĞE: İkinci Polaroid / Editoryal Kare (Sağ Üst) */}
            <div className="board-pin-item item-polaroid-team" style={{ top: '8%', right: '2%' }}>
              <div className="mini-binder-clip" aria-hidden="true" />
              <div className="polaroid-frame frame-tilted">
                <div className="polaroid-photo-box">
                  <img
                    src="/icons/icon4.png"
                    alt="Editoryal Kadraj"
                    className="polaroid-img"
                  />
                </div>
                <div className="polaroid-caption">
                  <span>Editoryal Günlük</span>
                </div>
              </div>
            </div>

            {/* 6. ÖĞE: Hoş Geldin Mektubu Minyatürü (Sol Alt) */}
            <div className="board-pin-item item-mini-postcard" style={{ bottom: '10%', left: '8%' }}>
              <div className="mini-rose-clip" aria-hidden="true" />
              <button
                type="button"
                className="mini-postcard-card"
                onClick={onOpenWelcomeLetter}
                title="Hoş Geldin Mektubunu Aç"
              >
                <div className="mini-mail-tag">💌 ÖZEL MEKTUP</div>
                <span className="mini-postcard-title">Sevgili Okura Mektup</span>
                <span className="mini-postcard-hint">Tıkla ve Aç ✂️</span>
              </button>
            </div>

            {/* 7. ÖĞE: Sevimli Karaca / Maskot (Sağ Alt - Referanstaki Ceylan Gibi) */}
            <div className="board-pin-item item-fawn-mascot" style={{ bottom: '8%', right: '6%' }}>
              <div className="mascot-badge" title="Çilek Dostu">
                <span className="mascot-emoji">🦌</span>
                <span className="mascot-label">Bağımsız Kültür</span>
              </div>
            </div>

          </div>
        </div>

        {/* Pano Altı Hızlı Butonlar (Button 09 Kapsül Tasarımı) */}
        <div className="wire-board-footer-actions">
          <Link to="/dergiler" className="btn-capsule-glossy btn-capsule-green">
            <span>Tüm Sayıları Keşfet</span>
            <span className="capsule-arrow" aria-hidden="true">›</span>
          </Link>
          
          <button
            type="button"
            className="btn-capsule-glossy btn-capsule-red"
            onClick={onOpenWelcomeLetter}
          >
            <span>Hoş Geldin Mektubunu Oku 💌</span>
            <span className="capsule-arrow" aria-hidden="true">›</span>
          </button>
        </div>

      </div>
    </section>
  )
}
