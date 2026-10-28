import React, { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getSafeMediaUrl } from '../lib/r2'
import MagazineReader from './MagazineReader'

const ALL_MAGAZINES_FALLBACK = [
  {
    id: 'f-1',
    issue_number: 1,
    title: 'Sayı 01 — Başlangıç',
    published_date: '2024-01-11',
    description: 'Her şeyin bir başlangıcı var. Yeni başlangıçların, ilk adımların ve sıfırdan kurmanın hikâyeleri.',
    toc: ['İlk Sayfanın Heyecanı', 'Çilek Dergisi Doğuyor', 'Bağımsız Yayıncılık Yolu', 'Korkulara Rağmen Yola Çıkmak'],
    cover_image_url: null,
    month_name: 'Ocak',
    year: '2024',
    theme: 'cream'
  },
  {
    id: 'f-2',
    issue_number: 2,
    title: 'Sayı 02 — Kök & Bahar',
    published_date: '2024-02-11',
    description: 'Nereden geldiğimiz, bizi kim yaptığımızı şekillendirir. Nakışlar, çiçekler ve bellek.',
    toc: ['Geçmişin Ayak İzleri', 'Büyüdüğümüz Evler ve Odalar', 'Kuşaklararası Sohbet'],
    cover_image_url: '/icons/icon2.png',
    month_name: 'Şubat',
    year: '2024',
    theme: 'forest'
  },
  {
    id: 'f-3',
    issue_number: 3,
    title: 'Sayı 03 — Dönüşüm',
    published_date: '2024-03-11',
    description: 'Değişim kaçınılmazdır ama her dönüşüm bir seçim taşır. Stüdyo notları ve tasarım dili.',
    toc: ['Eski Alışkanlıklara Veda', 'Yeniden Başlama Cesareti', 'İçsel Dönüşüm'],
    cover_image_url: '/icons/icon4.png',
    month_name: 'Mart',
    year: '2024',
    theme: 'bordo'
  },
  {
    id: 'f-4',
    issue_number: 4,
    title: 'Sayı 04 — Özgürlük',
    published_date: '2024-04-11',
    description: 'Özgürlük; hem bir his, hem de gündelik bir eylem. Sokak çekimleri ve manifestolar.',
    toc: ['Sınırların Ötesinde Yaşamak', 'Kendi Alanını İnşa Etmek', 'Özgür Kelimeler'],
    cover_image_url: '/icons/icon1.png',
    month_name: 'Nisan',
    year: '2024',
    theme: 'leaf'
  },
  {
    id: 'f-5',
    issue_number: 5,
    title: 'Sayı 05 — Sessizlik',
    published_date: '2024-05-11',
    description: 'Bazen en güçlü ses, içten gelendir. Şiirler, duygu haritaları ve kişisel itiraflar.',
    toc: ['Sessizliğin Gücü', 'Kendi Kelimelerini Bulmak', 'Yalnızlıkta Üretmek'],
    cover_image_url: null,
    month_name: 'Mayıs',
    year: '2024',
    theme: 'murdum'
  },
  {
    id: 'f-6',
    issue_number: 6,
    title: 'Sayı 06 — Yaz Dönemi',
    published_date: '2024-06-11',
    description: 'Yaz mevsiminin hafifliği ve sonsuzluk hissi. Uzak yollar, sıcak sokaklar, yeni başlangıçlar.',
    toc: ['Yaz Günlüğü', 'Sonsuz Bir Tatilde Olsaydık', 'Güneşin Rengi', 'Deniz Kokulu Şiirler'],
    cover_image_url: null,
    month_name: 'Haziran',
    year: '2024',
    theme: 'pink'
  },
]

// Fallback renk stilleri: YALNIZCA BELİRTİLEN 9 MARKA RENGİ
const THEME_STYLES = {
  cream: {
    bg: '#FFF9F8',
    text: '#3D2730',
    border: 'rgba(190, 38, 37, 0.22)',
    brand: '#BE2625',
    accent: '#6B9B7C',
  },
  forest: {
    bg: '#1B4D3E',
    text: '#FFF9F8',
    border: 'rgba(107, 155, 124, 0.35)',
    brand: '#FFFFFF',
    accent: '#E8B54D',
  },
  bordo: {
    bg: '#BE2625',
    text: '#FFF9F8',
    border: 'rgba(243, 216, 220, 0.30)',
    brand: '#FFFFFF',
    accent: '#F3D8DC',
  },
  leaf: {
    bg: '#6B9B7C',
    text: '#FFF9F8',
    border: 'rgba(255, 255, 255, 0.30)',
    brand: '#FFFFFF',
    accent: '#E8B54D',
  },
  murdum: {
    bg: '#3D2730',
    text: '#FFF9F8',
    border: 'rgba(232, 181, 77, 0.25)',
    brand: '#E8B54D',
    accent: '#FFF9F8',
  },
  pink: {
    bg: '#F3D8DC',
    text: '#3D2730',
    border: 'rgba(190, 38, 37, 0.22)',
    brand: '#BE2625',
    accent: '#BE2625',
  },
}

const THEME_KEYS = ['cream', 'forest', 'bordo', 'leaf', 'murdum', 'pink']

function CoverCard({ mag, index, isCenter }) {
  const themeKey = THEME_KEYS[index % THEME_KEYS.length]
  const theme = THEME_STYLES[mag.theme || themeKey] || THEME_STYLES.cream
  const issueNumStr = String(mag.issue_number || (index + 1)).padStart(2, '0')
  const dateStr = mag.month_name
    ? `${mag.month_name} ${mag.year || '2024'}`
    : (mag.published_date
        ? new Date(mag.published_date).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
        : '2024')

  return (
    <div className={`draf-cover ${isCenter ? 'draf-cover--center' : ''}`}>
      {/* Sol Cilt Sırtı Kıvrımı (Realistic Magazine Spine) */}
      <div className="draf-spine" aria-hidden="true" />

      {/* Kapak Görseli veya Editoryal Fallback Kapak */}
      {mag.cover_image_url ? (
        <div className="draf-cover-real">
          <img
            src={mag.cover_image_url}
            alt={mag.title}
            loading="lazy"
            className="draf-cover-img"
          />
          <div className="draf-real-badge" aria-hidden="true">
            Sayı #{issueNumStr}
          </div>
        </div>
      ) : (
        <div
          className="draf-fallback"
          style={{
            backgroundColor: theme.bg,
            color: theme.text,
            borderColor: theme.border,
          }}
        >
          {/* İç Çerçeve Çizgisi */}
          <div className="draf-fallback-frame" style={{ borderColor: theme.border }}>
            {/* Üst Bilgi Satırı */}
            <div className="draf-fb-top">
              <span className="draf-fb-issue" style={{ color: theme.accent }}>
                SAYI {issueNumStr}
              </span>
              <span className="draf-fb-date" style={{ color: theme.accent }}>
                {dateStr.toUpperCase()}
              </span>
            </div>

            {/* Logo & Masthead */}
            <div className="draf-fb-masthead">
              <h2 className="draf-fb-brand" style={{ color: theme.brand }}>
                Çilek
              </h2>
              <span className="draf-fb-subbrand" style={{ color: theme.accent }}>
                DERGİSİ
              </span>
            </div>

            {/* İkon / Çilek Motifi */}
            <div className="draf-fb-icon-wrap" aria-hidden="true">
              <img
                src="/icons/cilek-vintage.png"
                alt=""
                className="draf-fb-icon"
              />
            </div>

            {/* Sayı Başlığı */}
            <div className="draf-fb-title-wrap">
              <h3 className="draf-fb-title" style={{ color: theme.brand }}>
                {mag.title?.replace(/^Sayı\s*\d+\s*[—–-]\s*/i, '') || mag.title}
              </h3>
              {mag.description && (
                <p className="draf-fb-desc">
                  {mag.description}
                </p>
              )}
            </div>

            {/* Alt Etiket Satırı */}
            <div className="draf-fb-footer">
              <span className="draf-fb-stamp" style={{ borderColor: theme.border, color: theme.accent }}>
                BAĞIMSIZ GENÇLİK YAYINI
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Kuşe Kağıt İnce Işık Sheen */}
      <div className="draf-cover-sheen" aria-hidden="true" />

      {/* Merkez Dergi Hover İncele Rozeti */}
      {isCenter && (
        <div className="draf-center-hover-overlay" aria-hidden="true">
          <span className="draf-hover-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            Sayıyı Oku →
          </span>
        </div>
      )}
    </div>
  )
}

export default function MagazineGrid({ user, isAdmin }) {
  const [magazines, setMagazines] = useState(ALL_MAGAZINES_FALLBACK)
  const [activeIdx, setActiveIdx] = useState(0)
  const [openMag, setOpenMag] = useState(null)   // seçilen dergi — null ise kapalı
  const [isClosing, setIsClosing] = useState(false) // kapanma animasyonu
  const dragStart = useRef(null)
  const isDragging = useRef(false)

  // Kapanma animasyonlu kapat
  const handleCloseReader = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setOpenMag(null)
      setIsClosing(false)
    }, 270)
  }, [])

  const fetchMagazines = useCallback(async () => {
    try {
      const TR_MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
      const { data, error } = await supabase
        .from('magazines')
        .select('*')
        .order('issue_number', { ascending: false })
      if (!error && data?.length) {
        const mapped = data.map((m, idx) => ({
          ...m,
          cover_image_url: getSafeMediaUrl(m.cover_image_url),
          pdf_url: getSafeMediaUrl(m.pdf_url),
          month_name: m.published_date
            ? TR_MONTHS[new Date(m.published_date).getMonth()]
            : (m.month_name || ''),
          year: m.published_date
            ? new Date(m.published_date).getFullYear()
            : '2024',
          theme: THEME_KEYS[idx % THEME_KEYS.length]
        }))
        setMagazines(mapped)
      }
    } catch (err) {
      console.warn('Could not fetch magazines:', err)
    }
  }, [])

  useEffect(() => { fetchMagazines() }, [fetchMagazines])

  // Modal açıkken body scroll'unu kilitle
  useEffect(() => {
    if (openMag) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [openMag])

  const total = magazines.length

  const prev = useCallback(() => {
    setActiveIdx(i => (i - 1 + total) % total)
  }, [total])

  const next = useCallback(() => {
    setActiveIdx(i => (i + 1) % total)
  }, [total])

  // Klavye ok tuşları ile gezinme + Escape ile modalı kapat
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { handleCloseReader(); return }
      if (openMag) return   // modal açıkken raf navigasyonunu durdur
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next, openMag, handleCloseReader])

  // Fareyle sürükleme ve mobilde dokunarak kaydırma
  const onPointerDown = (e) => {
    dragStart.current = e.clientX ?? e.touches?.[0]?.clientX
    isDragging.current = false
  }
  const onPointerMove = (e) => {
    if (dragStart.current == null) return
    const x = e.clientX ?? e.touches?.[0]?.clientX
    if (Math.abs(x - dragStart.current) > 10) isDragging.current = true
  }
  const onPointerUp = (e) => {
    if (dragStart.current == null) return
    const x = e.clientX ?? e.changedTouches?.[0]?.clientX
    const diff = x - dragStart.current
    if (Math.abs(diff) > 35) {
      if (diff < 0) next()
      else prev()
    }
    dragStart.current = null
  }

  // 3 Dergi görünümü hesaplaması: merkez, sol, sağ
  const getSlot = (i) => {
    const diff = ((i - activeIdx) % total + total) % total
    if (diff === 0) return 'center'
    if (diff === 1 || (diff === total - 1 && total === 2)) return 'right'
    if (diff === total - 1) return 'left'
    return 'hidden'
  }

  const activeMag = magazines[activeIdx] || ALL_MAGAZINES_FALLBACK[0]

  return (
    <div className="draf-shelf-section">
      {/* ── Dergi Rafı Sahnesi ────────────────────────────────────────── */}
      <div className="draf-shelf-container">

        {/* Sol Ok Butonu: Küçük, Sade, Yuvarlak, Bordo Simge & Açık Pembe Kenarlık */}
        <button
          className="draf-arrow-btn draf-arrow-btn--left"
          onClick={prev}
          aria-label="Önceki dergi"
          id="btn-draf-prev"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BE2625" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Sağ Ok Butonu */}
        <button
          className="draf-arrow-btn draf-arrow-btn--right"
          onClick={next}
          aria-label="Sonraki dergi"
          id="btn-draf-next"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BE2625" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Raf Sahnesi (3 Kapak: Ortada Büyük, Yanlarda Kısmi & Hafif Açılı) */}
        <div
          className="draf-shelf-stage"
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onMouseLeave={() => { dragStart.current = null }}
          onTouchStart={onPointerDown}
          onTouchMove={onPointerMove}
          onTouchEnd={onPointerUp}
          role="region"
          aria-label="Dijital Dergi Rafı"
        >
          {magazines.map((mag, i) => {
            const slot = getSlot(i)
            if (slot === 'hidden') return null

            return (
              <div
                key={mag.id || i}
                className={`draf-shelf-item draf-shelf-item--${slot}`}
              >
                {/* Zemin Doğal Temas Gölgesi */}
                <div className="draf-floor-shadow" aria-hidden="true" />

                <button
                  type="button"
                  className="draf-item-btn"
                  onClick={() => {
                    if (isDragging.current) return
                    if (slot === 'center') {
                      setOpenMag(mag)
                    } else if (slot === 'left') {
                      prev()
                    } else if (slot === 'right') {
                      next()
                    }
                  }}
                  aria-label={
                    slot === 'center'
                      ? `${mag.title} — Dergiyi aç ve oku`
                      : slot === 'left'
                      ? `Önceki sayı: ${mag.title}`
                      : `Sonraki sayı: ${mag.title}`
                  }
                  id={`draf-cover-${mag.issue_number || i}`}
                >
                  <CoverCard mag={mag} index={i} isCenter={slot === 'center'} />
                </button>
              </div>
            )
          })}
        </div>

        {/* İnce Doğal Raf Taban Çizgisi */}
        <div className="draf-shelf-base" aria-hidden="true">
          <div className="draf-shelf-wood-line" />
        </div>
      </div>

      {/* ── Alt Sayfa Göstergeleri (Küçük Dots / Pills) ───────────────── */}
      <div className="draf-dots" role="tablist" aria-label="Dergi sayıları seçimi">
        {magazines.map((mag, i) => (
          <button
            key={mag.id || i}
            type="button"
            role="tab"
            aria-selected={i === activeIdx}
            aria-label={`Sayı ${mag.issue_number || (i + 1)}`}
            className={`draf-dot ${i === activeIdx ? 'draf-dot--active' : ''}`}
            onClick={() => setActiveIdx(i)}
            id={`draf-dot-${i}`}
          />
        ))}
      </div>

      {/* ── Aktif Dergi Bilgi & Aksiyon Kartı ─────────────────────────── */}
      {activeMag && (
        <div className="draf-active-card">
          <div className="draf-active-meta">
            <span className="draf-active-badge">
              🍓 Sayı {String(activeMag.issue_number || 1).padStart(2, '0')}
              {activeMag.month_name ? ` · ${activeMag.month_name} ${activeMag.year || '2024'}` : ''}
            </span>
          </div>

          <h2 className="draf-active-title">
            {activeMag.title}
          </h2>

          {activeMag.description && (
            <p className="draf-active-desc">
              {activeMag.description}
            </p>
          )}

          <div className="draf-active-actions">
            <button
              type="button"
              className="draf-btn-read"
              onClick={() => {
                setOpenMag(activeMag)
              }}
              id="btn-draf-read-now"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              <span>Sayıyı Oku (Sayfaları Çevir) →</span>
            </button>
          </div>
        </div>
      )}

      {/* ── İnline Flipbook Okuyucu Modal ───────────────────────────── */}
      {openMag && (
        <div
          className="draf-reader-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`${openMag.title} — Flipbook Okuyucu`}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseReader() }}
        >
          <div className={`draf-reader-modal-inner${isClosing ? ' is-closing' : ''}`}>
            <MagazineReader
              magazine={openMag}
              user={user}
              isAdmin={isAdmin}
              onClose={handleCloseReader}
            />
          </div>
        </div>
      )}
    </div>
  )
}