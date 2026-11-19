import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WelcomePostcardModal from '../components/WelcomePostcardModal'
import { supabase } from '../lib/supabase'
import { useSiteContent } from '../lib/siteContent'
import { getSafeMediaUrl } from '../lib/r2'
import CountdownSection from '../components/CountdownSection'
import { QUIZZES, getEffectiveQuizzes, resolveQuizImage } from '../data/quizzesData'

// ─── Fallback dergi verisi ────────────────────────────────────────────────────
const FEATURED_FALLBACKS = [
  { id: 'f-1', issue_number: 1, title: 'Sayı 01 — Başlangıç', cover_image_url: null, published_date: '2024-01-11', description: 'Bağımsız bir alanın ilk soluğu; 15-25 yaş kuşağı için kaleme alınan ilk sayı.', toc: ['İlk Sayfanın Heyecanı', 'Çilek Dergisi Doğuyor', 'Bağımsız Genç Anlatılar'], month_name: 'Ocak' },
  { id: 'f-2', issue_number: 2, title: 'Sayı 02 — Kök & Bahar', cover_image_url: '/icons/icon2.png', published_date: '2024-02-11', description: 'Nereden geldiğimiz, bizi kim yaptığımızı şekillendirir. Nakışlar, çiçekler ve bellek.', toc: ['Geçmişin Ayak İzleri', 'Büyüdüğümüz Evler ve Odalar'], month_name: 'Şubat' },
  { id: 'f-3', issue_number: 3, title: 'Sayı 03 — Dönüşüm', cover_image_url: '/icons/icon4.png', published_date: '2024-03-11', description: 'Değişim kaçınılmazdır ama her dönüşüm bir seçim taşır. Stüdyo notları ve tasarım dili.', toc: ['Eski Alışkanlıklara Veda', 'Yeniden Başlama Cesareti'], month_name: 'Mart' },
  { id: 'f-4', issue_number: 4, title: 'Sayı 04 — Özgürlük', cover_image_url: '/icons/icon1.png', published_date: '2024-04-11', description: 'Özgürlük; hem bir his, hem de gündelik bir eylem. Sokak çekimleri ve manifestolar.', toc: ['Sınırların Ötesinde Yaşamak', 'Kendi Alanını İnşa Etmek'], month_name: 'Nisan' },
  { id: 'f-5', issue_number: 5, title: 'Sayı 05 — Sessizlik', cover_image_url: null, published_date: '2024-05-11', description: 'Bazen en güçlü ses, içten gelendir. Şiirler, duygu haritaları ve kişisel itiraflar.', toc: ['Sessizliğin Gücü', 'Kendi Kelimelerini Bulmak'], month_name: 'Mayıs' },
  { id: 'f-6', issue_number: 6, title: 'Sayı 06 — Yaz Dönemi', cover_image_url: null, published_date: '2024-06-11', description: 'Yaz mevsiminin hafifliği ve sonsuzluk hissi. Uzak yollar, sıcak sokaklar, yeni başlangıçlar.', toc: ['Yaz Günlüğü', 'Sonsuz Bir Tatilde Olsaydık', 'Güneşin Rengi', 'Deniz Kokulu Şiirler'], month_name: 'Haziran' },
]

// ─── Fallback ekip verisi ──────────────────────────────────────────────────────
const TEAM_FALLBACK = [
  { id: 't-1', name: 'Genel Yayın Yönetmeni', role: 'Kreatif Direktör & Kurucu Ortak', photo_url: null, order_index: 1 },
  { id: 't-2', name: 'Art Director', role: 'Görsel Tasarım & Kurucu Ortak', photo_url: null, order_index: 2 },
  { id: 't-3', name: 'İçerik Editörü', role: 'Edebiyat & Yazı İşleri', photo_url: null, order_index: 3 },
  { id: 't-4', name: 'Görsel Sanat Editörü', role: 'Fotoğraf & Sanat', photo_url: null, order_index: 4 },
  { id: 't-5', name: 'Dijital Koordinatör', role: 'Sosyal Medya & Web', photo_url: null, order_index: 5 },
  { id: 't-6', name: 'Yazar Koordinatörü', role: 'Topluluk & Başvurular', photo_url: null, order_index: 6 },
]

// ─── Kayan marquee metni ──────────────────────────────────────────────────────
const MARQUEE_TEXT = 'Sayı 06 Yayında · Şimdi Oku · Her Ay Yepyeni Bir Macera · Genç, Özgür, Bağımsız! · Çilek Dergisi · '

// ─── Yardımcı: ✦ ve benzeri yıldız sembollerini temizleme ─────────────────────
const cleanSparkles = (str) => {
  if (!str) return ''
  return String(str).replace(/[✦✧★]/g, '').trim()
}

// ─── TOC kart açıklamaları (varsa kullan, yoksa genel) ───────────────────────
const TOC_DESC_MAP = {
  default: 'Bu sayının seçkin içeriklerinden biri sizi bekliyor.',
}

export default function Home({ user, isAdmin }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [allMagazines, setAllMagazines] = useState(FEATURED_FALLBACKS)
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false)
  const [latestMag, setLatestMag] = useState(null)
  const [teamMembers, setTeamMembers] = useState(TEAM_FALLBACK)
  const [founders, setFounders] = useState(TEAM_FALLBACK.slice(0, 2))
  const [founder, setFounder] = useState(TEAM_FALLBACK[0])

  const { settings } = useSiteContent()
  const siteData = settings
  const mediaData = {
    founder_photo: settings.about_founder_photo_url,
    founder_2_photo: settings.about_founder_2_photo_url,
  }

  useEffect(() => {
    if (searchParams.get('welcome') === 'true') setIsWelcomeModalOpen(true)
  }, [searchParams])

  // Dergileri çek
  useEffect(() => {
    const TR_MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    supabase.from('magazines').select('*').order('issue_number', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped = data.map(m => ({
            ...m,
            cover_image_url: getSafeMediaUrl(m.cover_image_url),
            pdf_url: getSafeMediaUrl(m.pdf_url),
            month_name: m.published_date ? TR_MONTHS[new Date(m.published_date).getMonth()] : ''
          }))
          setAllMagazines(mapped)
          setLatestMag(mapped[mapped.length - 1])
        } else {
          setLatestMag(FEATURED_FALLBACKS[FEATURED_FALLBACKS.length - 1])
        }
      })
  }, [])

  // Ekip üyelerini çek
  useEffect(() => {
    supabase.from('team_members').select('*').order('order_index', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped = data.map(m => ({
            ...m,
            photo_url: getSafeMediaUrl(m.photo_url)
          }))
          setTeamMembers(mapped)
          const kurucular = mapped.filter(m =>
            m.role?.toLowerCase().includes('kurucu') ||
            m.role?.toLowerCase().includes('founder')
          )
          const fList = kurucular.length > 0 ? kurucular : mapped
          setFounders(fList)
          setFounder(fList[0] || mapped[0])
        } else {
          setFounders(TEAM_FALLBACK.slice(0, 1))
          setFounder(TEAM_FALLBACK[0])
        }
      })
  }, [])

  const featuredMag = latestMag || allMagazines[allMagazines.length - 1]

  const handleReadIssue = () => {
    if (featuredMag) {
      navigate(`/dergi/${featuredMag.id || featuredMag.issue_number}`)
    }
  }

  // TOC parse yardımcı
  const parseToc = (toc) => {
    if (!toc) return []
    if (Array.isArray(toc)) return toc
    try { return JSON.parse(toc) } catch { return [] }
  }

  const founderPhoto = getSafeMediaUrl(
    mediaData.founder_photo ||
    founders[0]?.photo_url ||
    founder?.photo_url ||
    'https://pub-f78a1a3cdd5a4aefae2d5638cdb54f87.r2.dev/covers/team_Melisa_Batman_1795021428975_whatsapp_image_2026_11_18_at_15.20.49.jpeg'
  )
  const founderName = settings.about_founder_name || founders[0]?.name || founder?.name || 'Melisa Batman'
  const founderRole = settings.about_founder_role || founders[0]?.role || founder?.role || 'Kurucu & Genel Yayın Yönetmeni'

  const currentIssueNum = featuredMag?.issue_number ? String(featuredMag.issue_number).padStart(2, '0') : '01'
  const dynamicMarquee = `Sayı ${currentIssueNum} Yayında · Şimdi Oku · Her Ay Yepyeni Bir Macera · Genç, Özgür, Bağımsız! · Çilek Dergisi · `

  return (
    <div className="home-v2-wrapper">

      {/* ── 1. KAYAN MARQUEE ŞERİDİ ─────────────────────────────────────── */}
      <div className="home-topbar-marquee" aria-label="Duyuru şeridi" role="marquee">
        <div className="home-topbar-track">
          <span className="home-topbar-text">
            {cleanSparkles(siteData.hero_marquee || dynamicMarquee)} · {cleanSparkles(siteData.hero_marquee || dynamicMarquee)} · 
          </span>
          <span className="home-topbar-text" aria-hidden="true">
            {cleanSparkles(siteData.hero_marquee || dynamicMarquee)} · {cleanSparkles(siteData.hero_marquee || dynamicMarquee)} · 
          </span>
        </div>
      </div>

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <Navbar user={user} isAdmin={isAdmin} onOpenWelcomeLetter={() => setIsWelcomeModalOpen(true)} hideTopBar={true} />

      <main>

        {/* ── 2. HERO BÖLÜMÜ ─────────────────────────────────────────── */}
        <section className="home-hero-section" aria-label="Hero">
          <div className="home-hero-grid-bg" aria-hidden="true" />
          <div className="home-hero-shell">
            {/* Sol: Metin */}
            <div className="home-hero-text">
              <div className="home-hero-eyebrow">
                {cleanSparkles(siteData.hero_eyebrow || 'Çilek Dergisi')}
              </div>
              <h1 className="home-hero-title">
                {siteData.hero_title_line1 || 'Kendi sesini'}<br />
                <span className="home-hero-title-italic">{siteData.hero_title_italic || 'özgürce'} </span>
                <span className="home-hero-title-script">{siteData.hero_title_script || 'haykırdığın alan!'}</span>
              </h1>
              <p className="home-hero-copy">
                {settings.hero_subtitle || siteData.hero_copy}
              </p>
              <div className="home-hero-actions">
                <button type="button" className="home-btn-primary" onClick={handleReadIssue} id="btn-hero-read-issue">
                  {cleanSparkles(settings.hero_cta_text) || 'SAYIYI OKU →'}
                </button>
                <Link to="/dergiler" className="home-btn-secondary" id="btn-hero-all-issues">
                  {cleanSparkles(settings.hero_cta_archive) || 'Tüm Sayılar'}
                </Link>
              </div>
              <p className="home-hero-note">
                <strong className="home-hero-note-strong">
                  Sayı {currentIssueNum} yayında!
                </strong>
                {' '}· Hemen keşfet, sayfaları çevir ve ilhamı yakala!
              </p>
            </div>

            {/* Sağ: Kapak görseli */}
            <div className="home-hero-visual">
              <div
                className="home-cover-stage"
                onClick={handleReadIssue}
                style={{ cursor: 'pointer' }}
                title="Sayıyı Oku"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleReadIssue()}
              >
                <div className="home-cover-shadow" />
                <div className="home-cover-frame">
                  {featuredMag?.cover_image_url ? (
                    <img src={featuredMag.cover_image_url} alt={`${featuredMag.title} kapak görseli`} className="home-cover-img" />
                  ) : (
                    <div className="home-cover-placeholder">
                      <img src="/icons/cilek-vintage.png" alt="Çilek Dergisi" className="home-cover-placeholder-icon" />
                      <span className="home-cover-placeholder-label">Çilek Dergisi</span>
                    </div>
                  )}
                </div>
                <div className="home-cover-sticker home-sticker-1">Yayında!</div>
                <div className="home-cover-sticker home-sticker-2">Son Sayı</div>
              </div>
            </div>
          </div>
          <div className="home-hero-wave" aria-hidden="true" />
        </section>

        {/* ── 3. KURUCUMUZUN MESAJI (HERO BÖLÜMÜNDEN HEMEN SONRA) ───── */}
        <section className="home-founder-section" aria-label="Kurucumuzla Tanış">
          <div className="container">
            <div className="home-founder-layout">
              {/* Sol: Kurucu Görsel Kartı */}
              <div className="home-founder-photo-wrap" aria-hidden="true">
                <div className="home-founder-polaroid polaroid-single">
                  <img
                    src={founderPhoto}
                    alt={founderName}
                    className="home-founder-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = '/icons/cilek-vintage.png'
                    }}
                  />
                  <div className="home-founder-polaroid-meta">
                    <strong className="home-founder-polaroid-name">
                      {founderName}
                    </strong>
                    <span className="home-founder-polaroid-sub">
                      {founderRole}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sağ: Metin */}
              <div className="home-founder-content">
                <span className="home-sec-eyebrow">Kurucumuzla Tanış</span>
                <h2 className="home-sec-title">
                  Kurucumuzun <span className="home-sec-title-italic">Mesajı</span>
                </h2>
                <blockquote className="home-founder-quote">
                  {siteData.about_founder_quote || '“Gençliğin enerjisi, tutkusu ve anlatacak cesur hikâyeleri kalıplara sığmaz! Çilek Dergisi bu bağımsız kıvılcımı birlikte parlatmak için var!”'}
                </blockquote>
                <p className="home-founder-bio">
                  {siteData.about_founder_bio?.replace(/İki kurucu ortak olarak/gi, 'Bağımsız bir gençlik yayını olarak') || 'Bağımsız bir gençlik yayını olarak derginin editoryal kimliğini, dinamik görsel ruhunu ve bağımsız vizyonunu her sayıda büyütüyoruz. Gençliğin coşkusunu ve özgür sesini sayfalarımıza taşımaktan büyük heyecan duyuyoruz!'}
                </p>
                <Link to="/hakkimizda" className="btn-cilek-link" id="btn-founder-more">
                  Hakkımızda Daha Fazlası →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. YENİ SAYI GERİ SAYIM SAYACI ─────────────────────────── */}
        <CountdownSection settings={settings} />

        {/* ── 5. BU SAYIDA SENİ NELER BEKLİYOR (TELLİ PANO FORMAT) ─────── */}
        {parseToc(featuredMag?.toc).length > 0 && (
          <section className="home-toc-section" aria-label="Bu Sayıda Neler Var">
            <div className="container">
              <div className="home-toc-header">
                <span className="home-sec-eyebrow">İçindekiler</span>
                <h2 className="home-sec-title">
                  Bu Sayıda Seni<span className="home-sec-title-italic"> Neler Bekliyor?</span>
                </h2>
                <p className="home-sec-sub">
                  Sayı {featuredMag.issue_number}'nın özenle seçilmiş içerikleri.
                </p>
              </div>

              {/* Telli Pano (Wire Mesh Moodboard) */}
              <div className="home-wireboard">
                {/* Duvar Askı Vidaları */}
                <div className="home-wireboard-mount home-mount-left" aria-hidden="true">
                  <span className="home-mount-screw" />
                </div>
                <div className="home-wireboard-mount home-mount-right" aria-hidden="true">
                  <span className="home-mount-screw" />
                </div>

                {/* Pano Üzerindeki Dekoratif Not Rozeti */}
                <div className="home-wireboard-tag" aria-hidden="true">
                  <span className="home-wireboard-tag-icon">📌</span>
                  <span className="home-wireboard-tag-text">{settings.home_toc_tag || `Sayı ${featuredMag.issue_number || '06'} Seçkisi`}</span>
                </div>

                <div className="home-toc-grid">
                  {parseToc(featuredMag.toc).map((item, idx) => (
                    <div key={idx} className="home-toc-card">
                      {/* Telli Panoya Tutturulan Mandal / Klips */}
                      <div className="home-wire-clip" aria-hidden="true">
                        <svg width="32" height="34" viewBox="0 0 32 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 14V8C11 5.2 13.2 3 16 3C18.8 3 21 5.2 21 8V14" stroke="var(--color-primary)" strokeWidth="2.4" strokeLinecap="round" />
                          <path d="M12 14V8C12 5.8 13.8 4 16 4C18.2 4 20 5.8 20 8V14" stroke="var(--color-accent)" strokeWidth="1" strokeLinecap="round" />
                          <rect x="6" y="13" width="20" height="11" rx="2.5" fill="var(--color-primary)" stroke="var(--color-text)" strokeWidth="1.2" />
                          <rect x="8" y="15" width="16" height="2" rx="1" fill="var(--color-accent)" opacity="0.8" />
                          <rect x="7" y="21" width="18" height="3" rx="1" fill="var(--color-text)" />
                        </svg>
                      </div>

                      <div className="home-toc-card-num-wrap">
                        <span className="home-toc-card-num">{String(idx + 1).padStart(2, '0')}</span>
                      </div>
                      <div className="home-toc-card-body">
                        <p className="home-toc-card-title">{settings[`home_toc_card_${idx + 1}_title`] || item}</p>
                        <p className="home-toc-card-desc">{settings[`home_toc_card_${idx + 1}_desc`] || TOC_DESC_MAP[item] || TOC_DESC_MAP.default}</p>
                      </div>
                      <div className="home-toc-card-footer">
                        <span>Çilek Dergi</span>
                        <span>Sayfa #{idx + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 8. HAKKIMIZDA ÖZET + DEĞERLER ──────────────────────────── */}
        <section className="home-about-teaser" aria-label="Hakkımızda Özeti">
          <div className="container">
            <div className="home-about-inner">
              <div className="home-about-content">
                <span className="home-sec-eyebrow">Biz Kimiz?</span>
                <h2 className="home-sec-title">
                  Çilek Dergisi<span className="home-sec-title-italic">'nin Hikâyesi</span>
                </h2>
                <p className="home-about-text">
                  <strong>Çilek Dergisi</strong>, gençliğin sınır tanımayan hayal gücünü, dinamik ritmini ve cesur sesini tek bir çatı altında buluşturmak için doğdu! Basılı bir fanzinin tutkusunu dijitalin sınırsız enerjisiyle harmanlıyoruz.
                </p>
                <p className="home-about-text">
                  Edebiyat, sanat, özgün denemeler, cesur şiirler ve bağımsız görsel kültür… Burası kalıplara sığmayan, üretmekten ve kendini ifade etmekten heyecan duyan tüm gençlerin ilham dolu üretim sahnesi!
                </p>
                <Link to="/hakkimizda" className="home-about-link" id="btn-about-teaser-more">
                  Hikâyemizi Keşfet →
                </Link>
              </div>
              <div className="home-values-grid">
                {[
                  { icon: '✍️', label: 'Craftsmanship', desc: 'Özgür kalemler ve titiz, ilham verici editoryal dokunuşlar!' },
                  { icon: '⚡', label: 'Energy & Soul', desc: 'Her satırında gençliğin dinamizmini ve tutkusunu hissettiren anlatılar!' },
                  { icon: '🎨', label: 'Playfulness', desc: 'Kalıpları yıkan, sınır tanımayan deneysel sanat ve edebiyat!' },
                  { icon: '🍓', label: 'Community', desc: '15–25 yaş üreticilerin ve meraklı okurların güçlü dayanışması!' },
                ].map((v) => (
                  <div key={v.label} className="home-value-card">
                    <span className="home-value-icon">{v.icon}</span>
                    <strong className="home-value-label">{v.label}</strong>
                    <p className="home-value-desc">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 8.5. ÇİLEK QUIZ CLUB (TESTLER & KEŞİF KULÜBÜ) ────────── */}
        <section className="home-quiz-teaser-section" aria-label="Çilek Quiz Club">
          <div className="container">
            <div className="home-quiz-teaser-header">
              <span className="home-quiz-teaser-eyebrow">✦ ÇİLEK DERGİSİ ÖZEL KULÜBÜ ✦</span>
              <h2 className="home-quiz-teaser-title">
                ÇİLEK <span className="serif-italic">QUIZ CLUB</span>
              </h2>
              <p className="home-quiz-teaser-sub">
                Kendini ne kadar tanıyorsun? Hadi birlikte keşfedelim!
              </p>
            </div>

            <div className="quiz-cards-grid">
              {getEffectiveQuizzes(settings?.quizzes_custom).slice(0, 3).map((quiz, idx) => (
                <article key={quiz.id} className="quiz-card-item">
                  <div className="quiz-card-cover-wrap">
                    <img
                      src={resolveQuizImage(quiz.coverImage)}
                      alt={quiz.title}
                      className="quiz-card-cover-img"
                      loading="lazy"
                      onError={(e) => {
                        if (!e.target.dataset.triedFallback) {
                          e.target.dataset.triedFallback = 'true'
                          e.target.src = '/gossip-girl.jpg'
                        }
                      }}
                    />
                    <div className="quiz-card-cover-overlay" />
                    <span className="quiz-card-badge">{quiz.badge}</span>
                    <span className="quiz-card-time">{quiz.readingTime}</span>
                  </div>

                  <div className="quiz-card-body">
                    <span className="quiz-card-number">TEST #{String(idx + 1).padStart(2, '0')}</span>
                    <h3 className="quiz-card-title">{quiz.title}</h3>
                    <p className="quiz-card-desc">{quiz.subtitle || quiz.description}</p>

                    <div className="quiz-card-footer">
                      <span className="quiz-card-qcount">
                        🍓 {quiz.questionsCount} Özel Soru
                      </span>
                      <Link
                        to={`/testler/${quiz.slug}`}
                        className="btn-cilek-quiz-start"
                        id={`btn-home-start-${quiz.slug}`}
                      >
                        Testi Çöz →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="home-quiz-teaser-cta-wrap">
              <Link to="/testler" className="btn-home-quiz-explore-all" id="btn-home-explore-quiz-club">
                <span>✨</span> Tüm Testleri & Quiz Club'ı Keşfet →
              </Link>
            </div>
          </div>
        </section>

        {/* ── 9. ARŞİV BÖLÜMÜ (DÜZ DERGİLER SERGİSİ - RAFSIZ) ─────────────────── */}
        <section className="home-archive-section" aria-label="Dergiler Arşivi" id="cilek-arsiv">
          <div className="container">
            <div className="home-archive-header">
              <div>
                <span className="home-sec-eyebrow">The Çilek Journey</span>
                <h2 className="home-sec-title">
                  Tüm<span className="home-sec-title-italic"> Sayılar</span>
                </h2>
              </div>
              <Link to="/dergiler" className="home-btn-secondary" id="btn-archive-all">
                Kitaplığın Tamamı ({allMagazines.length}+) →
              </Link>
            </div>

            {/* Düz Dergiler Izgarası (Raf Yok, Temiz Modern Editoryal Kartlar) */}
            <div className="home-flat-magazines-grid">
              {allMagazines
                .slice()
                .sort((a, b) => (b.issue_number || 0) - (a.issue_number || 0))
                .slice(0, 4)
                .map((mag) => (
                  <article
                    key={mag.id}
                    className="home-flat-mag-card"
                    onClick={() => navigate(`/dergi/${mag.id || mag.issue_number}`)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/dergi/${mag.id || mag.issue_number}`)}
                    aria-label={`${mag.title} oku`}
                  >
                    <div className="home-flat-mag-cover-wrap">
                      {mag.cover_image_url ? (
                        <img
                          src={mag.cover_image_url}
                          alt={mag.title}
                          className="home-flat-mag-img"
                          loading="lazy"
                        />
                      ) : (
                        <div className="home-flat-mag-fallback">
                          <img
                            src="/logo2.png"
                            alt="Çilek Dergisi"
                            className="home-flat-mag-logo"
                          />
                          {mag.issue_number && (
                            <span className="home-flat-mag-badge">Sayı #{mag.issue_number}</span>
                          )}
                        </div>
                      )}
                      <div className="home-flat-mag-overlay">
                        <span className="home-flat-mag-btn">OKU →</span>
                      </div>
                    </div>
                    <div className="home-flat-mag-info">
                      <h3 className="home-flat-mag-title">{mag.title}</h3>
                      {mag.description && (
                        <p className="home-flat-mag-desc">{mag.description}</p>
                      )}
                    </div>
                  </article>
                ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />

      <WelcomePostcardModal isOpen={isWelcomeModalOpen} onClose={() => setIsWelcomeModalOpen(false)} user={user} />
    </div>
  )
}
