import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

  // Boydan boya 4 raf oluştur
  const shelfConfig = [
    {
      id: 'shelf-1',
      title: 'I. RAF · GÜNCEL SAYILAR',
      mags: magazines.slice(0, 2),
    },
    {
      id: 'shelf-2',
      title: 'II. RAF · BAHAR KOLEKSİYONU',
      mags: magazines.slice(2, 4),
    },
    {
      id: 'shelf-3',
      title: 'III. RAF · ARŞİV & İLK SAYILAR',
      mags: magazines.slice(4, 6),
    },
    {
      id: 'shelf-4',
      title: 'IV. RAF · GELECEK SAYILAR & ATÖLYE',
      mags: magazines.slice(6, 8),
      isSpecialShelf: magazines.length <= 6
    },
  ]

  return (
    <div className="draf-wrapper">

      {/* ── Boydan Boya 4 Katlı Dijital Kitaplık ───────────────────── */}
      <div className="draf-bookcase" role="region" aria-label="Çilek Dergisi Dijital Kitaplığı">
        
        {/* Kitaplık Üst Taç Başlığı */}
        <div className="draf-bookcase-crown">
          <span className="draf-crown-line" />
          <span className="draf-crown-title">✦ ÇİLEK DERGİSİ DİJİTAL KİTAPLIĞI ✦</span>
          <span className="draf-crown-line" />
        </div>

        {shelfConfig.map((shelf, sIdx) => (
          <div key={shelf.id} className="draf-shelf">

            {/* Raf Pirinç İsim Levhası */}
            <div className="draf-shelf-header">
              <div className="draf-brass-plaque">
                <span className="draf-plaque-rivet left" />
                <span className="draf-plaque-text">{shelf.title}</span>
                <span className="draf-plaque-rivet right" />
              </div>
            </div>

            {/* Kapaklar */}
            <div className="draf-shelf-books">
              {shelf.mags.map((mag, mIdx) => {
                const globalIdx = sIdx * 2 + mIdx
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
                      <strong className="draf-label-title">
                        {mag.title?.split('—')[1]?.trim() || mag.title}
                      </strong>
                    </div>
                  </button>
                )
              })}

              {/* 4. Raf Özel Kartları (Henüz 7-8. sayılar eklenmemişse görünür) */}
              {shelf.isSpecialShelf && shelf.mags.length === 0 && (
                <>
                  {/* Gelecek Sayı Teaserı */}
                  <div className="draf-cover-slot draf-slot-upcoming">
                    <div className="draf-cover draf-cover-upcoming">
                      <div className="draf-cover-fallback">
                        <span style={{ fontSize: '2.4rem' }}>🍓</span>
                        <div className="draf-fallback-meta">
                          <span className="draf-fallback-brand">ÇİLEK</span>
                          <span className="draf-fallback-brand">DERGİSİ</span>
                        </div>
                        <div className="draf-fallback-divider" />
                        <span className="draf-fallback-issue">Sayı 07</span>
                        <span className="draf-fallback-month">Güz 2024 · Hazırlanıyor</span>
                      </div>
                      <div className="draf-badge-upcoming">
                        PEK YAKINDA
                      </div>
                    </div>
                    <div className="draf-cover-label">
                      <span className="draf-label-num">Sayı 07</span>
                      <strong className="draf-label-title">Baskı Hazırlığında</strong>
                    </div>
                  </div>

                  {/* Açık Başvuru Kartı */}
                  <button
                    type="button"
                    className="draf-cover-slot draf-slot-submission"
                    onClick={() => navigate('/yazi-gonderi')}
                    aria-label="Yazını bize gönder"
                  >
                    <div className="draf-cover draf-cover-submission">
                      <div className="draf-cover-fallback">
                        <span style={{ fontSize: '2.4rem' }}>✍️</span>
                        <div className="draf-fallback-meta">
                          <span className="draf-fallback-brand">SEN DE KATIL</span>
                          <span className="draf-fallback-brand">ÇİLEK YAZARI OL</span>
                        </div>
                        <div className="draf-fallback-divider" />
                        <span className="draf-fallback-issue">Açık Çağrı</span>
                        <span className="draf-fallback-month">15-25 Yaş Bağımsız Sesler</span>
                      </div>
                      <div className="draf-cover-overlay" aria-hidden="true">
                        <span className="draf-overlay-label">BAŞVUR ↗</span>
                      </div>
                    </div>
                    <div className="draf-cover-label">
                      <span className="draf-label-num">Eserini Gönder</span>
                      <strong className="draf-label-title">Sayfada Yer Al</strong>
                    </div>
                  </button>
                </>
              )}
            </div>

            {/* Ahşap Raf Çizgisi */}
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
