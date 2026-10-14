import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSiteContent } from '../lib/siteContent'
import MagazineModal from './MagazineModal'

const ALL_MAGAZINES_FALLBACK = [
  {
    id: 'mag-1',
    issue_number: 1,
    title: 'Sayı 01 — Başlangıç',
    published_date: '2024-01-11',
    description: 'Her şeyin bir başlangıcı var. Yeni başlangıçların, ilk adımların ve sıfırdan kurmanın hikâyeleri.',
    toc: ['İlk Sayfanın Heyecanı', 'Çilek Dergisi Doğuyor', 'Bağımsız Yayıncılık Yolu', 'Korkulara Rağmen Yola Çıkmak'],
    cover_image_url: null,
    month_name: 'Ocak',
    badge: 'Yeni Sayı'
  },
]

// Kapak görseli yoksa fallback için arka plan rengi
const COVER_BG = 'linear-gradient(145deg, var(--color-primary) 0%, #1A0A0E 100%)'

export default function MagazineGrid({ user, onFirstLoaded }) {
  const navigate = useNavigate()
  const { settings } = useSiteContent()
  const [magazines, setMagazines] = useState(ALL_MAGAZINES_FALLBACK)
  const [selectedMag, setSelectedMag] = useState(null)

  const fetchMagazines = useCallback(async () => {
    try {
      const TR_MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
      const { data, error } = await supabase
        .from('magazines')
        .select('*')
        .order('issue_number', { ascending: false })
      if (!error && data?.length) {
        const mapped = data.map(m => ({
          ...m,
          month_name: m.published_date
            ? TR_MONTHS[new Date(m.published_date).getMonth()]
            : (m.month_name || '')
        }))
        setMagazines(mapped)
        onFirstLoaded?.(mapped[0])
      }
    } catch (err) {
      console.warn('Could not fetch magazines:', err)
    }
  }, [onFirstLoaded])

  useEffect(() => { fetchMagazines() }, [fetchMagazines])

  // Tek bir dergi örneği (en güncel sayı)
  const singleMag = magazines[0] || ALL_MAGAZINES_FALLBACK[0]

  return (
    <div className="draf-wrapper">
      {/* ── Şeffaf & Işıltılı Cam Raf Vitrini ───────────────────── */}
      <div className="draf-bookcase draf-glass-showcase" role="region" aria-label="Çilek Dergisi Cam Raf Vitrini">
        <div className="draf-shelf draf-glass-shelf">

          {/* Kapaklar Alanı (Merkezde Tek Dergi Örneği, Rafta Yazı Yok) */}
          <div className="draf-shelf-books draf-glass-shelf-books">
            {singleMag && (
              <button
                type="button"
                className="draf-cover-slot draf-cover-slot--single draf-cover-slot--newest"
                onClick={() => setSelectedMag(singleMag)}
                aria-label={`${singleMag.title} — detayları gör`}
                id={`draf-cover-${singleMag.issue_number || 1}`}
              >
                {/* Cam Raf Üzerindeki Yansıma / Zemin Işık İzi */}
                <div className="draf-glass-book-reflection" aria-hidden="true" />

                {/* Dergi Kapağı */}
                <div className="draf-cover" style={!singleMag.cover_image_url ? { background: COVER_BG } : {}}>
                  {singleMag.cover_image_url ? (
                    <img
                      src={singleMag.cover_image_url}
                      alt={singleMag.title}
                      loading="lazy"
                      className="draf-cover-img"
                    />
                  ) : (
                    <div className="draf-cover-fallback">
                      <img
                        src="/icons/cilek-vintage.png"
                        alt=""
                        className="draf-fallback-logo"
                      />
                      <div className="draf-fallback-meta">
                        <span className="draf-fallback-brand">ÇİLEK</span>
                        <span className="draf-fallback-brand">DERGİSİ</span>
                      </div>
                      <div className="draf-fallback-divider" />
                      <span className="draf-fallback-issue">
                        Sayı {String(singleMag.issue_number || 1).padStart(2, '0')}
                      </span>
                      {singleMag.month_name && (
                        <span className="draf-fallback-month">{singleMag.month_name}</span>
                      )}
                      <div className="draf-fallback-sheen" />
                    </div>
                  )}

                  {/* Kuşe kağıt parlaması */}
                  <div className="draf-cover-gloss" aria-hidden="true" />

                  {/* En yeni sayı rozeti */}
                  <div className="draf-badge-new" aria-label="En yeni sayı">
                    YENİ
                  </div>

                  {/* Hover üstü "İncele" yer paylaşımı */}
                  <div className="draf-cover-overlay" aria-hidden="true">
                    <span className="draf-overlay-label">İNCELE →</span>
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Kristal Cam Raf Çizgisi (Glass Ledge) */}
          <div className="draf-shelf-ledge draf-glass-ledge" aria-hidden="true">
            <div className="draf-glass-shine" />
            <div className="draf-ledge-top draf-glass-ledge-top" />
            <div className="draf-ledge-face draf-glass-ledge-face" />
            <div className="draf-ledge-shadow draf-glass-ledge-shadow" />
          </div>

        </div>
      </div>

      {/* Sayı Detay Modalı */}
      {selectedMag && (
        <MagazineModal
          magazine={selectedMag}
          user={user}
          onClose={() => setSelectedMag(null)}
        />
      )}
    </div>
  )
}
