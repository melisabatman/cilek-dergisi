import React from 'react'
import { Link } from 'react-router-dom'
import { useSiteContent } from '../lib/siteContent'

export default function MagazineSpreadSection({ photoUrl = null }) {
  const { settings } = useSiteContent()
  const photo = photoUrl || settings.editorial_photo_url

  return (
    <section className="magazine-spread-section" aria-label="Editoryal Dergi Sayfası">
      <div className="mag-spread-container">
        
        {/* 2 Sayfalık Açık Dergi Cildi */}
        <div className="mag-spread-book">
          
          {/* =========================================================
              SOL SAYFA: KREM EDİTORYAL METİN ALANI
              ========================================================= */}
          <article className="spread-page spread-page-left">
            {/* Üst Editoryal Başlık Çubuğu */}
            <div className="spread-top-meta">
              <span className="spread-meta-tag">{settings.editorial_tag || 'EDITORIAL FEATURE | ÇİLEK DERGİSİ'}</span>
              <span className="spread-meta-sub">{settings.editorial_sub || 'EDEBİYAT • SANAT • GENÇLİK & ÇOK SESLİ ANLATILAR'}</span>
            </div>

            {/* Büyük Manşet */}
            <h2 className="spread-main-headline">
              {settings.editorial_headline || 'Senin sesin çağırdı.'}<br />
              <span className="headline-italic">{settings.editorial_headline_italic || 'Çilek sayfalarını istiyor!'}</span>
            </h2>

            {/* Editoryal Açıklama Paragrafı */}
            <p className="spread-lead-desc">
              {settings.editorial_lead || '15-25 yaş bağımsız yaratıcılar için özenle kürate edilmiş editoryal alan; her sayıda keşfedilmeyi bekleyen yeni anlatılar, şiirler, görsel seriler ve koleksiyonluk bir dergi deneyimi.'}
            </p>

            {/* 3 Adet Şekilli Rozet / Pul Kartları */}
            <div className="spread-scalloped-badges" role="region" aria-label="Sayı Özellikleri">
              {/* 1. Şeftali/Sarı Dalgalı Pul */}
              <div className="scallop-badge-item badge-peach">
                <svg viewBox="0 0 100 100" className="scallop-shape-svg" aria-hidden="true">
                  <path d="M 15 5 C 22 5, 22 0, 30 0 C 38 0, 38 5, 45 5 C 52 5, 52 0, 60 0 C 68 0, 68 5, 75 5 C 82 5, 82 0, 90 0 C 98 0, 95 10, 95 18 C 95 25, 100 25, 100 32 C 100 40, 95 40, 95 48 C 95 55, 100 55, 100 62 C 100 70, 95 70, 95 78 C 95 85, 100 88, 92 92 C 85 95, 82 100, 75 100 C 68 100, 68 95, 60 95 C 52 95, 52 100, 45 100 C 38 100, 38 95, 30 95 C 22 95, 22 100, 15 100 C 8 100, 5 95, 5 88 C 5 80, 0 80, 0 72 C 0 65, 5 65, 5 58 C 5 50, 0 50, 0 42 C 0 35, 5 35, 5 28 C 5 20, 0 15, 8 8 Z" fill="var(--color-seed)" />
                </svg>
                <div className="scallop-text-content">
                  <span className="badge-big-val">{settings.editorial_badge_1_val || 'Sayı 06'}</span>
                  <span className="badge-sub-label">{settings.editorial_badge_1_label || 'GÜNCEL SAYI'}</span>
                  <span className="badge-price-sub">{settings.editorial_badge_1_sub || '(YAZ 2024)'}</span>
                </div>
              </div>

              {/* 2. Bordo Çiçek / Rozet Şekli */}
              <div className="scallop-badge-item badge-burgundy-flower">
                <svg viewBox="0 0 100 100" className="scallop-shape-svg" aria-hidden="true">
                  <path d="M50 0 C58 0 62 10 70 6 C78 2 85 10 88 18 C92 26 100 32 98 40 C96 48 100 58 96 66 C92 74 88 82 80 86 C72 90 68 100 60 100 C52 100 48 90 40 92 C32 94 24 88 18 82 C12 76 2 72 2 64 C2 56 8 48 8 40 C8 32 0 24 4 16 C8 8 18 6 26 8 C34 10 42 0 50 0 Z" fill="var(--color-primary)" />
                </svg>
                <div className="scallop-text-content light-text">
                  <span className="badge-big-val">{settings.editorial_badge_2_val || '15-25'}</span>
                  <span className="badge-sub-label">{settings.editorial_badge_2_label || 'YAŞ ALANI'}</span>
                  <span className="badge-price-sub">{settings.editorial_badge_2_sub || 'ÖZGÜN SES'}</span>
                </div>
              </div>

              {/* 3. Çilek Yaprağı Yeşili Dalgalı Pul */}
              <div className="scallop-badge-item badge-leaf-green">
                <svg viewBox="0 0 100 100" className="scallop-shape-svg" aria-hidden="true">
                  <path d="M 15 5 C 22 5, 22 0, 30 0 C 38 0, 38 5, 45 5 C 52 5, 52 0, 60 0 C 68 0, 68 5, 75 5 C 82 5, 82 0, 90 0 C 98 0, 95 10, 95 18 C 95 25, 100 25, 100 32 C 100 40, 95 40, 95 48 C 95 55, 100 55, 100 62 C 100 70, 95 70, 95 78 C 95 85, 100 88, 92 92 C 85 95, 82 100, 75 100 C 68 100, 68 95, 60 95 C 52 95, 52 100, 45 100 C 38 100, 38 95, 30 95 C 22 95, 22 100, 15 100 C 8 100, 5 95, 5 88 C 5 80, 0 80, 0 72 C 0 65, 5 65, 5 58 C 5 50, 0 50, 0 42 C 0 35, 5 35, 5 28 C 5 20, 0 15, 8 8 Z" fill="var(--color-leaf)" />
                </svg>
                <div className="scallop-text-content light-text">
                  <span className="badge-big-val">{settings.editorial_badge_3_val || '%100'}</span>
                  <span className="badge-sub-label">{settings.editorial_badge_3_label || 'BAĞIMSIZ'}</span>
                  <span className="badge-price-sub">{settings.editorial_badge_3_sub || 'DİJİTAL YAYIN'}</span>
                </div>
              </div>
            </div>

            {/* Kırmızı/Bordo Aksiyon Butonu */}
            <div className="spread-action-wrap">
              <Link to="/dergiler" className="btn-spread-action" id="btn-spread-discover">
                {settings.editorial_button_text || 'DERGİYİ KEŞFET'}
              </Link>
            </div>

            {/* Sol Sayfa Numarası */}
            <div className="spread-folio-left">
              <span className="folio-script">Page 45</span>
            </div>
          </article>

          {/* Orta Cilt Çizgisi (Spine Shadow) */}
          <div className="mag-spread-spine" aria-hidden="true" />

          {/* =========================================================
              SAĞ SAYFA: PEMBE ÇİZGİLİ EDİTORYAL FOTOĞRAF & STİCKER ALANI
              ========================================================= */}
          <article className="spread-page spread-page-right">
            
            {/* Fotoğraf Çerçevesi (Hafif Açılı, Beyaz Paspartu & Washi Bantlar) */}
            <div className="spread-photo-container">
              
              {/* Çapraz Kırmızı Washi Bant: Sağ Üst */}
              <div className="washi-tape tape-top-right" aria-hidden="true" />

              {/* Çapraz Kırmızı Washi Bant: Sol Alt */}
              <div className="washi-tape tape-bottom-left" aria-hidden="true" />

              {/* Çıkartma 1: Üstteki Oval "designed to delight!" Çıkartması */}
              <div className="sticker-designed-delight" aria-hidden="true">
                <span>designed<br />to delight! ✨</span>
              </div>

              {/* Çıkartma 2: Yuvarlak Çilek Çıkartması */}
              <div className="sticker-nectar-strawberry" aria-hidden="true">
                <img src="/icons/cilek-vintage.png" alt="" className="sticker-strawberry-icon" />
                <span className="sticker-brand-text">çilek</span>
              </div>

              {/* Fotoğraf Alanı / Kullanıcının Sonradan Ekleyeceği Alan */}
              <div className="spread-photo-inner">
                {photo ? (
                  <img
                    src={photo}
                    alt="Çilek Dergisi Editoryal Görseli"
                    className="spread-user-photo"
                  />
                ) : (
                  <div className="spread-photo-placeholder" role="region" aria-label="Görsel Alanı">
                    <div className="placeholder-icon-wrap">
                      <span style={{ fontSize: '3rem' }}>📷</span>
                    </div>
                    <h3 className="placeholder-title">Görsel Alanı</h3>
                    <p className="placeholder-text">
                      Admin panelden istediğin görseli buraya yükleyebilirsin.<br />
                      <code style={{ fontSize: '0.82rem', background: 'var(--color-accent)', border: '1px solid var(--color-accent)', padding: '3px 8px', borderRadius: '4px', color: 'var(--color-primary)' }}>
                        site_settings / editorial_photo_url
                      </code>
                    </p>
                  </div>
                )}
              </div>

              {/* Çıkartma 3: Sağ Alttaki Fiyonklu İmzalı Hediye Kartı Etiketi */}
              <div className="sticker-curated-tag" aria-hidden="true">
                <div className="tag-ribbon-bow">🎀</div>
                <div className="tag-text-wrap">
                  <span className="tag-lead">Curated with love by:</span>
                  <span className="tag-curator-name">Çilek Editorial Desk</span>
                </div>
              </div>
            </div>

            {/* Sağ Sayfa Numarası / Dergi İmzası */}
            <div className="spread-folio-right">
              <span className="folio-brand-script">Çilek Life Magazine</span>
            </div>
          </article>

        </div>

        {/* En Alttaki Bordo-Krem Çizgili Editoryal Kenar Şeridi */}
        <div className="spread-bottom-stripes-trim" aria-hidden="true" />

      </div>
    </section>
  )
}
