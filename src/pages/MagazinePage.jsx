import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MagazineReader from '../components/MagazineReader'
import MagazineComments from '../components/MagazineComments'
import { supabase } from '../lib/supabase'
import { getSafeMediaUrl } from '../lib/r2'

const FALLBACK_MAGAZINES = [
  {
    id: 'f-1',
    issue_number: 1,
    title: 'Sayı 01 — Başlangıç',
    published_date: '2024-01-11',
    description: 'Her şeyin bir başlangıcı var. Yeni başlangıçların, ilk adımların ve sıfırdan kurmanın hikâyeleri.',
    toc: [
      'İlk Sayfanın Heyecanı',
      'Çilek Dergisi Doğuyor',
      'Bağımsız Yayıncılık Yolu',
      'Korkulara Rağmen Yola Çıkmak'
    ],
    cover_image_url: null,
    pdf_url: null
  },
  {
    id: 'f-2',
    issue_number: 2,
    title: 'Sayı 02 — Kök & Bahar',
    published_date: '2024-02-11',
    description: 'Nereden geldiğimiz, bizi kim yaptığımızı şekillendirir. Nakışlar, çiçekler ve bellek.',
    toc: [
      'Geçmişin Ayak İzleri',
      'Büyüdüğümüz Evler ve Odalar',
      'Kuşaklararası Sohbet'
    ],
    cover_image_url: '/icons/icon2.png',
    pdf_url: null
  },
  {
    id: 'f-3',
    issue_number: 3,
    title: 'Sayı 03 — Dönüşüm',
    published_date: '2024-03-11',
    description: 'Değişim kaçınılmazdır ama her dönüşüm bir seçim taşır. Stüdyo notları ve tasarım dili.',
    toc: [
      'Eski Alışkanlıklara Veda',
      'Yeniden Başlama Cesareti',
      'İçsel Dönüşüm'
    ],
    cover_image_url: '/icons/icon4.png',
    pdf_url: null
  },
  {
    id: 'f-4',
    issue_number: 4,
    title: 'Sayı 04 — Özgürlük',
    published_date: '2024-04-11',
    description: 'Özgürlük; hem bir his, hem de gündelik bir eylem. Sokak çekimleri ve manifestolar.',
    toc: [
      'Sınırların Ötesinde Yaşamak',
      'Kendi Alanını İnşa Etmek',
      'Özgür Kelimeler'
    ],
    cover_image_url: '/icons/icon1.png',
    pdf_url: null
  },
  {
    id: 'f-5',
    issue_number: 5,
    title: 'Sayı 05 — Sessizlik',
    published_date: '2024-05-11',
    description: 'Bazen en güçlü ses, içten gelendir. Şiirler, duygu haritaları ve kişisel itiraflar.',
    toc: [
      'Sessizliğin Gücü',
      'Kendi Kelimelerini Bulmak',
      'Yalnızlıkta Üretmek'
    ],
    cover_image_url: null,
    pdf_url: null
  },
  {
    id: 'f-6',
    issue_number: 6,
    title: 'Sayı 06 — Yaz Dönemi',
    published_date: '2024-06-11',
    description: 'Yaz mevsiminin hafifliği ve sonsuzluk hissi. Uzak yollar, sıcak sokaklar, yeni başlangıçlar.',
    toc: [
      'Yaz Günlüğü',
      'Sonsuz Bir Tatilde Olsaydık',
      'Güneşin Rengi',
      'Deniz Kokulu Şiirler'
    ],
    cover_image_url: null,
    pdf_url: null
  }
]

export default function MagazinePage({ user, isAdmin }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [magazine, setMagazine] = useState(null)
  const [allMagazines, setAllMagazines] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Sayıyı ve tüm sayıları çek
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const cleanId = String(id || '').trim()
        const isNumeric = /^\d+$/.test(cleanId)

        // 1. Tüm sayıları çek (Önceki/Sonraki navigasyonu için)
        const { data: allData } = await supabase
          .from('magazines')
          .select('id, issue_number, title, cover_image_url')
          .order('issue_number', { ascending: true })

        const list = allData && allData.length > 0 ? allData : FALLBACK_MAGAZINES
        setAllMagazines(list)

        // 2. Aktif sayıyı bul
        let query = supabase.from('magazines').select('*')
        if (isNumeric) {
          query = query.eq('issue_number', parseInt(cleanId, 10))
        } else {
          query = query.eq('id', cleanId)
        }

        const { data, error } = await query.maybeSingle()

        if (!error && data) {
          setMagazine({
            ...data,
            cover_image_url: getSafeMediaUrl(data.cover_image_url),
            pdf_url: getSafeMediaUrl(data.pdf_url)
          })
        } else {
          const found = list.find(
            m => m.id === cleanId ||
                 String(m.issue_number) === cleanId ||
                 m.id === `f-${cleanId}` ||
                 `f-${m.issue_number}` === cleanId
          ) || list[0]
          setMagazine(found)
        }
      } catch (err) {
        console.warn('Magazine load error:', err)
        setMagazine(FALLBACK_MAGAZINES[0])
      } finally {
        setLoading(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    loadData()
  }, [id])

  // TOC Ayrıştırma
  const parseToc = (toc) => {
    if (!toc) return []
    if (Array.isArray(toc)) return toc
    try {
      return JSON.parse(toc)
    } catch {
      return []
    }
  }

  // Önceki ve Sonraki Sayı tespiti
  const currentIndex = allMagazines.findIndex(
    m => String(m.id) === String(magazine?.id) || Number(m.issue_number) === Number(magazine?.issue_number)
  )
  const prevMag = currentIndex > 0 ? allMagazines[currentIndex - 1] : null
  const nextMag = currentIndex >= 0 && currentIndex < allMagazines.length - 1 ? allMagazines[currentIndex + 1] : null

  if (loading) {
    return (
      <div className="magazine-page-wrapper">
        <Navbar user={user} isAdmin={isAdmin} />
        <div className="mag-page-loader-screen">
          <div className="reader-spinner" style={{ width: 44, height: 44 }} />
          <h2 className="mag-loader-title">Çilek Dergisi Hazırlanıyor…</h2>
          <p className="mag-loader-sub">Sayfalar ve editoryal içerik düzenleniyor.</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!magazine) {
    return (
      <div className="magazine-page-wrapper">
        <Navbar user={user} isAdmin={isAdmin} />
        <div className="mag-page-loader-screen">
          <span style={{ fontSize: '3rem' }}>🍓</span>
          <h2 className="mag-loader-title">Sayı Bulunamadı</h2>
          <p className="mag-loader-sub">Aradığınız dergi sayısı mevcut değil veya yayından kaldırılmış olabilir.</p>
          <Link to="/dergiler" className="btn-magazine-download-pdf" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
            ← Tüm Sayılara Dön
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="magazine-page-wrapper">
      <Navbar user={user} isAdmin={isAdmin} />

      <main className="magazine-page-main" id="main-content">
        {/* ── 1. ÜST BİLGİ VE GERİ DÖNÜŞ ŞERİDİ ── */}
        <div className="magazine-page-top-bar">
          <div className="container magazine-top-bar-flex">
            <Link to="/dergiler" className="btn-back-to-shelf" id="btn-back-to-magazines">
              ← Tüm Dergiler
            </Link>

            <div className="magazine-top-meta">
              <span className="magazine-issue-badge">
                🍓 Sayı {String(magazine.issue_number || 1).padStart(2, '0')}
              </span>
              <span className="magazine-top-date">
                Kapak: Aralık 2026 · Dijital: 18 Kasım 2026
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. SAYFAYA GÖMÜLÜ OKUYUCU BÖLÜMÜ (YAKLAŞIK %75 EKRAN YÜKSEKLİĞİNDE) ── */}
        <section className="magazine-embedded-reader-section" aria-label="Dergi Okuyucu">
          <div className="container magazine-reader-container">
            <div className="magazine-reader-frame">
              <MagazineReader
                magazine={magazine}
                user={user}
                isAdmin={isAdmin}
                embedded={true}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          </div>
        </section>

        {/* ── 3. DETAY ALANI: BAŞLIK, AÇIKLAMA, İÇİNDEKİLER & PDF İNDİR BUTONU ── */}
        <section className="magazine-info-section" aria-label="Sayı Detayları">
          <div className="container magazine-info-container">

            {/* Başlık ve Aksiyon Butonları */}
            <div className="magazine-info-header">
              <div className="magazine-info-titles">
                <span className="magazine-info-eyebrow">
                  ÇİLEK DERGİSİ · SAYI #{magazine.issue_number}
                </span>
                <h1 className="magazine-info-main-title">
                  {magazine.title}
                </h1>
                <div className="magazine-info-pubdate-wrap">
                  <p className="magazine-info-pubdate">
                    <span className="pubdate-badge">Kapak Dönemi: <strong>Aralık 2026</strong></span>
                    <span className="pubdate-sep">·</span>
                    <span className="pubdate-badge pubdate-digital">Dijital Yayın: <strong>{new Date(magazine.published_date || '2026-11-18').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                  </p>
                  <p className="magazine-pubdate-explainer">
                    ℹ️ <em>Kapakta yer alan "Aralık 2026", derginin resmi yayın dönemini; 18 Kasım 2026 ise internette okurlarla ilk buluştuğu dijital yayın tarihini ifade eder.</em>
                  </p>
                </div>
              </div>

              {/* Aksiyon Butonları (PDF İndir + Yorumlara Kaydır) */}
              <div className="magazine-info-actions">
                {magazine.pdf_url && (
                  <a
                    href={getSafeMediaUrl(magazine.pdf_url)}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-magazine-download-pdf"
                    id="btn-download-pdf"
                  >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>PDF İndir</span>
                  </a>
                )}

                <a href="#issue-comments-section" className="btn-magazine-scroll-comments" id="btn-scroll-comments">
                  💬 Yorumlar
                </a>
              </div>
            </div>

            {/* Editör Notu / Açıklama */}
            {magazine.description && (
              <div className="magazine-description-card">
                <span className="magazine-desc-tag">EDİTÖR NOTU</span>
                <p className="magazine-description-text">{magazine.description}</p>
              </div>
            )}

            {/* "Bu Sayıda" İçindekiler Listesi */}
            {parseToc(magazine.toc).length > 0 && (
              <div className="magazine-toc-block">
                <div className="magazine-toc-header">
                  <span className="magazine-toc-badge">BU SAYIDA NELER VAR?</span>
                  <h2 className="magazine-toc-title">Öne Çıkan Başlıklar</h2>
                </div>

                <div className="magazine-toc-grid">
                  {parseToc(magazine.toc).map((item, idx) => (
                    <div key={idx} className="magazine-toc-item">
                      <span className="magazine-toc-num">{String(idx + 1).padStart(2, '0')}</span>
                      <div className="magazine-toc-content">
                        <strong className="magazine-toc-item-title">{item}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sayılar Arası Hızlı Geçiş (Önceki Sayı / Sonraki Sayı) */}
            {(prevMag || nextMag) && (
              <nav className="magazine-sibling-nav" aria-label="Sayılar Arası Gezinme">
                {prevMag ? (
                  <Link to={`/dergi/${prevMag.id || prevMag.issue_number}`} className="sibling-link sibling-prev">
                    <span className="sibling-dir">← Önceki Sayı</span>
                    <strong className="sibling-title">{prevMag.title}</strong>
                  </Link>
                ) : <div />}

                {nextMag && (
                  <Link to={`/dergi/${nextMag.id || nextMag.issue_number}`} className="sibling-link sibling-next">
                    <span className="sibling-dir">Sonraki Sayı →</span>
                    <strong className="sibling-title">{nextMag.title}</strong>
                  </Link>
                )}
              </nav>
            )}

            {/* ── 4. SAYFA ALTI İNLİNE YORUMLAR BÖLÜMÜ ── */}
            <MagazineComments
              magazineId={magazine.id}
              issueTitle={magazine.title}
              user={user}
              isAdmin={isAdmin}
              currentPage={currentPage}
            />

          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
