import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import MagazineModal from '../components/MagazineModal'
import { supabase } from '../lib/supabase'

const PDF_REQUIRE_LOGIN = import.meta.env.VITE_PDF_REQUIRE_LOGIN !== 'false'

const FEATURED_FALLBACKS = [
  {
    id: 'f-6',
    issue_number: 6,
    title: 'Sayı 06 — Yaz',
    cover_image_url: null,
    published_date: '2024-06-11',
    description: 'Uzun günler, sıcak esintiler ve yeni anlatılar. Yaz mevsimine dair bağımsız perspektifler.',
    toc: [
      'Güneşin Gölgesinde Kalanlar',
      'Bir Yaz Öğledensonrası Notları',
      'Deniz Kenarında Bağımsız Edebiyat',
      'Mevsim Değişirken İç Dünyamız'
    ],
    pdf_url: null
  },
  {
    id: 'f-5',
    issue_number: 5,
    title: 'Sayı 05 — Sesler',
    cover_image_url: null,
    published_date: '2024-05-11',
    description: 'Kendi sesini bulmak, belki de en büyük macera. Farklı seslerin peşine düştük.',
    toc: ['Sessizliği Bozma Rehberi', 'Şehrin Fısıltıları', 'Kadın Sesleri ve Bellek'],
    pdf_url: null
  },
  {
    id: 'f-4',
    issue_number: 4,
    title: 'Sayı 04 — Özgürlük',
    cover_image_url: null,
    published_date: '2024-04-11',
    description: 'Özgürlük; hem bir his, hem de gündelik bir eylem.',
    toc: ['Sınırların Ötesinde Yaşamak', 'Kendi Alanını İnşa Etmek'],
    pdf_url: null
  },
]

export default function Home({ user, isAdmin }) {
  const navigate = useNavigate()
  const [latestMagazine, setLatestMagazine] = useState(FEATURED_FALLBACKS[0])
  const [featuredMagazines, setFeaturedMagazines] = useState(FEATURED_FALLBACKS)
  const [selectedMag, setSelectedMag] = useState(null)

  useEffect(() => {
    // 1. En son yayımlanan sayıyı çek (Son Sayı)
    supabase
      .from('magazines')
      .select('*')
      .order('issue_number', { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setLatestMagazine(data[0])
        }
      })

    // 2. Seçme sayıları çek
    supabase
      .from('magazines')
      .select('*')
      .order('published_date', { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setFeaturedMagazines(data)
        }
      })
  }, [])

  return (
    <div className="home-page-container">
      {/* Üst Navigasyon */}
      <Navbar user={user} isAdmin={isAdmin} />

      <main className="home-main-content">
        {/* 1. KIZGIBIDERGI REFERANSLI İPSİZ VE PARLAK OBJELİ HERO */}
        <Hero />

        {/* 2. EN YENİ ÇIKAN SAYI (SON SAYI BÖLÜMÜ) */}
        {latestMagazine && (
          <section className="latest-issue-section" aria-labelledby="latest-issue-title">
            <div className="container">
              <div className="latest-issue-card">
                {/* Sol / Üst Kapak Görseli */}
                <div
                  className="latest-cover-wrap"
                  onClick={() => setSelectedMag(latestMagazine)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedMag(latestMagazine)}
                  title={`${latestMagazine.title} — Sayıyı İncele`}
                >
                  {latestMagazine.cover_image_url ? (
                    <img
                      src={latestMagazine.cover_image_url}
                      alt={`${latestMagazine.title} kapağı`}
                      className="latest-cover-img"
                    />
                  ) : (
                    <div className="latest-cover-placeholder">
                      <span className="lcp-strawberry">🍓</span>
                      <span className="lcp-brand">ÇİLEK DERGİ</span>
                      <span className="lcp-issue">
                        {latestMagazine.issue_number ? `Sayı #${latestMagazine.issue_number}` : 'Son Sayı'}
                      </span>
                    </div>
                  )}
                  <div className="cover-hover-hint">
                    <span>Sayıyı İncele ↗</span>
                  </div>
                </div>

                {/* Sağ / İçerik Bilgileri */}
                <div className="latest-info-wrap">
                  <div className="latest-badge-row">
                    <span className="latest-pill">★ Son Yayımlanan Sayı</span>
                    {latestMagazine.issue_number && (
                      <span className="latest-issue-num">Sayı #{latestMagazine.issue_number}</span>
                    )}
                  </div>

                  <h2 id="latest-issue-title" className="latest-issue-heading">
                    {latestMagazine.title}
                  </h2>

                  {latestMagazine.published_date && (
                    <p className="latest-issue-date">
                      📅 {new Date(latestMagazine.published_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
                    </p>
                  )}

                  <p className="latest-issue-description">
                    {latestMagazine.description || 'Çilek Dergisi\'nin en yeni sayısı yayında. Bağımsız bakış açıları, editoryal yazılar ve çok sesli anlatılar seni bekliyor.'}
                  </p>

                  {/* İçindekilerden Öne Çıkanlar (TOC) */}
                  {Array.isArray(latestMagazine.toc) && latestMagazine.toc.length > 0 && (
                    <div className="latest-toc-preview">
                      <span className="latest-toc-title">Bu Sayıda Öne Çıkanlar:</span>
                      <ul className="latest-toc-list">
                        {latestMagazine.toc.slice(0, 4).map((topic, i) => (
                          <li key={i} className="latest-toc-item">
                            <span className="toc-dot">🍓</span>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Aksiyon Butonları */}
                  <div className="latest-actions-row">
                    <button
                      type="button"
                      className="btn-latest-read"
                      onClick={() => navigate(`/oku/${latestMagazine.id || latestMagazine.issue_number || 1}`)}
                      id="btn-latest-read"
                    >
                      <span aria-hidden="true">📖</span> Sayfaları Çevirerek Oku <span>→</span>
                    </button>

                    <button
                      type="button"
                      className="btn-latest-detail"
                      onClick={() => setSelectedMag(latestMagazine)}
                      id="btn-latest-detail"
                    >
                      İçindekiler &amp; Detay
                    </button>

                    {latestMagazine.pdf_url && (
                      PDF_REQUIRE_LOGIN && !user ? (
                        <button
                          type="button"
                          className="btn-latest-pdf login-required"
                          onClick={() => navigate('/auth?mode=register&reason=pdf&redirect=/')}
                          id="btn-latest-download-pdf"
                          title="PDF indirmek için lütfen giriş yapın"
                        >
                          🔒 Giriş Yap &amp; PDF İndir
                        </button>
                      ) : (
                        <a
                          href={latestMagazine.pdf_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-latest-pdf"
                          id="btn-latest-download-pdf"
                        >
                          ⬇ PDF İndir
                        </a>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. SEÇME SAYILARIMIZ ARŞİV ŞERİDİ */}
        <section className="featured-magazines" id="home-featured">
          <div className="featured-title">
            <span className="featured-pre-title">Arşivden Seçkiler</span>
            <h2>Seçme Sayılarımız</h2>
            <p>Geçmiş sayılarımızda saklı kalan anlatıları ve bağımsız sesleri keşfedin.</p>
          </div>

          <div className="featured-grid">
            {featuredMagazines.map((mag) => (
              <div
                key={mag.id}
                className="featured-card"
                onClick={() => setSelectedMag(mag)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedMag(mag)}
              >
                <div className="featured-card-cover-wrap">
                  {mag.cover_image_url ? (
                    <img src={mag.cover_image_url} alt={mag.title} />
                  ) : (
                    <div className="featured-card-placeholder">
                      <span className="fc-icon">🍓</span>
                      <span className="fc-brand">ÇİLEK</span>
                      <span className="fc-name">{mag.title}</span>
                    </div>
                  )}
                </div>
                <div className="featured-card-info">
                  <span className="fc-card-title">{mag.title}</span>
                  {mag.issue_number && <span className="fc-card-sub">Sayı #{mag.issue_number}</span>}
                </div>
              </div>
            ))}
          </div>

          <Link to="/dergiler" className="archive-button" id="btn-all-issues">
            Tüm Sayıları Gör ({featuredMagazines.length}+) →
          </Link>
        </section>

        {/* 4. SANATSAL DOKULU EDİTORYAL BANNER */}
        <section className="home-banner" aria-hidden="true">
          <div className="home-banner-inner">
            <span className="hb-quote">"Her ay yeni bir sayfa, seninle büyüyen ve parıldayan bir ses."</span>
            <span className="hb-author">— Çilek Dergi</span>
          </div>
        </section>
      </main>

      {/* Alt Bilgi */}
      <Footer />

      {/* Sayı İnceleme Modalı */}
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
