import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSiteContent } from '../lib/siteContent'
import MagazineModal from './MagazineModal'

const ALL_MAGAZINES_FALLBACK = [
  { id: 'mag-6', issue_number: 6, title: 'Sayı 06 — Yaz', published_date: '2024-06-11', description: 'Uzun günler, sıcak esintiler ve yeni anlatılar. Yaz mevsimine dair bağımsız perspektifler.', toc: ['Güneşin Gölgesinde Kalanlar', 'Bir Yaz Öğledensonrası Notları', 'Deniz Kenarında Bağımsız Edebiyat', 'Mevsim Değişirken İç Dünyamız'], cover_image_url: null, month_name: 'Haziran', badge: 'Son Sayı' },
  { id: 'mag-5', issue_number: 5, title: 'Sayı 05 — Sesler', published_date: '2024-05-11', description: 'Kendi sesini bulmak, belki de en büyük macera. Farklı seslerin ve anlatıların peşine düştük.', toc: ['Sessizliği Bozma Rehberi', 'Şehrin Fısıltıları', 'Kadın Sesleri ve Bellek', 'Sözcüklerin Gücü Üzerine'], cover_image_url: null, month_name: 'Mayıs', badge: 'Mayıs 2024' },
  { id: 'mag-4', issue_number: 4, title: 'Sayı 04 — Özgürlük', published_date: '2024-04-11', description: 'Özgürlük; hem bir his, hem de gündelik bir eylem. Bağımsız üretimler ve kişisel alanlar üzerine.', toc: ['Sınırların Ötesinde Yaşamak', 'Kendi Alanını İnşa Etmek', 'Yaratıcı Bağımsızlık Manifestosu', 'Küçük Adımlarla Büyük Özgürlükler'], cover_image_url: null, month_name: 'Nisan', badge: 'Nisan 2024' },
  { id: 'mag-3', issue_number: 3, title: 'Sayı 03 — Dönüşüm', published_date: '2024-03-11', description: 'Değişim kaçınılmazdır ama her dönüşüm bir seçim taşır. Şehirde ve iç dünyamızda yenilenme adımları.', toc: ['Eski Alışkanlıklara Veda', 'Yeniden Başlama Cesareti', 'Kentsel Dönüşüm ve Hafıza', 'Ruhun Bahar Temizliği'], cover_image_url: null, month_name: 'Mart', badge: 'Mart 2024' },
  { id: 'mag-2', issue_number: 2, title: 'Sayı 02 — Kök', published_date: '2024-02-11', description: 'Nereden geldiğimiz, bizi kim yaptığımızı şekillendirir. Kökler, hafıza ve kimlik üzerine yazılar.', toc: ['Geçmişin Ayak İzleri', 'Büyüdüğümüz Evler ve Odalar', 'Kök Salmak mı, Kanatlanmak mı?', 'Kuşaktan Kuşağa Kalan Masallar'], cover_image_url: null, month_name: 'Şubat', badge: 'Şubat 2024' },
  { id: 'mag-1', issue_number: 1, title: 'Sayı 01 — Başlangıç', published_date: '2024-01-11', description: 'Her şeyin bir başlangıcı var. Yeni başlangıçların, ilk adımların ve sıfırdan kurmanın hikâyeleri.', toc: ['İlk Sayfanın Heyecanı', 'Çilek Dergisi Doğuyor', 'Bağımsız Yayıncılık Yolu', 'Korkulara Rağmen Yola Çıkmak'], cover_image_url: null, month_name: 'Ocak', badge: 'Ocak 2024' },
]

// Kapak görsel yoksa fallback için arka plan renkleri (çilek meyvesi paletinde)
const COVER_BG = [
  'linear-gradient(145deg, var(--color-primary) 0%, var(--color-text) 100%)',
  'linear-gradient(145deg, var(--color-primary) 0%, #1A0A0E 100%)',
  'linear-gradient(145deg, var(--color-text) 0%, var(--color-primary) 100%)',
  'linear-gradient(145deg, var(--color-primary) 0%, var(--color-accent) 100%)',
  'linear-gradient(145deg, var(--color-primary) 0%, var(--color-seed) 100%)',
  'linear-gradient(145deg, var(--color-primary) 0%, var(--color-leaf) 100%)',
]

// Her rafa kaç kapak sığsın
const PER_SHELF = 4

export default function MagazineGrid({ user, onFirstLoaded }) {
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

  // Dergileri raflara böl (PER_SHELF'er adet)
  const shelves = []
  for (let i = 0; i < magazines.length; i += PER_SHELF) {
    shelves.push(magazines.slice(i, i + PER_SHELF))
  }

  return (
    <div className="draf-wrapper">

      {/* ── Sayfa Başlığı ────────────────────────────────────── */}
      <div className="draf-page-header">
        <div className="draf-header-inner">
          <span className="draf-eyebrow">{settings.magazines_eyebrow || '✦ Çilek Dergisi'}</span>
          <h1 className="draf-heading">{settings.magazines_title || 'Dijital Rafımız'}</h1>
          <p className="draf-subheading">
            {settings.magazines_subtitle || 'Her sayı, bir düşüncenin izinde. Raftan bir dergi seç, sayfaları çevir.'}
          </p>
        </div>
      </div>

      {/* ── Dijital Raf (Kapak Görünümü) ─────────────────────── */}
      <div className="draf-bookcase" role="region" aria-label="Çilek Dergisi Dijital Rafı">

        {shelves.map((shelfMags, sIdx) => (
          <div key={sIdx} className="draf-shelf">

            {/* Raf üstü boşluk + dergiler */}
            <div className="draf-shelf-books">
              {shelfMags.map((mag, mIdx) => {
                const globalIdx = sIdx * PER_SHELF + mIdx
                const isNewest = globalIdx === 0
                const coverBg = COVER_BG[globalIdx % COVER_BG.length]

                return (
                  <button
                    key={mag.id || globalIdx}
                    type="button"
                    className={`draf-cover-slot ${isNewest ? 'draf-cover-slot--newest' : ''}`}
                    onClick={() => setSelectedMag(mag)}
                    aria-label={`${mag.title} — detayları gör`}
                    id={`draf-cover-${mag.issue_number || globalIdx}`}
                  >
                    {/* Dergi Kapağı */}
                    <div className="draf-cover" style={!mag.cover_image_url ? { background: coverBg } : {}}>
                      {mag.cover_image_url ? (
                        <img
                          src={mag.cover_image_url}
                          alt={mag.title}
                          loading="lazy"
                          className="draf-cover-img"
                        />
                      ) : (
                        /* Kapak görseli yoksa planlı fallback tasarımı */
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
                            Sayı {String(mag.issue_number || globalIdx + 1).padStart(2, '0')}
                          </span>
                          {mag.month_name && (
                            <span className="draf-fallback-month">{mag.month_name}</span>
                          )}
                          <div className="draf-fallback-sheen" />
                        </div>
                      )}

                      {/* Kuşe kağıt parlaması */}
                      <div className="draf-cover-gloss" aria-hidden="true" />

                      {/* En yeni sayı rozeti */}
                      {isNewest && (
                        <div className="draf-badge-new" aria-label="En yeni sayı">
                          YENİ
                        </div>
                      )}

                      {/* Hover üstü "İncele" yer paylaşımı */}
                      <div className="draf-cover-overlay" aria-hidden="true">
                        <span className="draf-overlay-label">İNCELE ✦</span>
                      </div>
                    </div>

                    {/* Kapak altı başlık etiketi */}
                    <div className="draf-cover-label">
                      <span className="draf-label-num">
                        Sayı {String(mag.issue_number || globalIdx + 1).padStart(2, '0')}
                      </span>
                      <span className="draf-label-title">
                        {mag.title?.split('—')[1]?.trim() || mag.title}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Raf Çizgisi */}
            <div className="draf-shelf-ledge" aria-hidden="true">
              <div className="draf-ledge-top" />
              <div className="draf-ledge-face" />
              <div className="draf-ledge-shadow" />
            </div>

          </div>
        ))}

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
