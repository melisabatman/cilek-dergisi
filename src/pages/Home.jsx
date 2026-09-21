import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MagazineModal from '../components/MagazineModal'
import WelcomePostcardModal from '../components/WelcomePostcardModal'
import { supabase } from '../lib/supabase'
import { useSiteContent } from '../lib/siteContent'

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
  { id: 't-1', name: 'Genel Yayın Yönetmeni', role: 'Kreatif Direktör & Kurucu', photo_url: null, order_index: 1 },
  { id: 't-2', name: 'Art Director', role: 'Tasarım & Görsel Dil', photo_url: null, order_index: 2 },
  { id: 't-3', name: 'İçerik Editörü', role: 'Edebiyat & Yazı İşleri', photo_url: null, order_index: 3 },
  { id: 't-4', name: 'Görsel Sanat Editörü', role: 'Fotoğraf & Sanat', photo_url: null, order_index: 4 },
  { id: 't-5', name: 'Dijital Koordinatör', role: 'Sosyal Medya & Web', photo_url: null, order_index: 5 },
  { id: 't-6', name: 'Yazar Koordinatörü', role: 'Topluluk & Başvurular', photo_url: null, order_index: 6 },
]

// ─── Kayan marquee metni ──────────────────────────────────────────────────────
const MARQUEE_TEXT = '✦ Sayı 06 yayında · Şimdi oku ✦ Her ay yeni bir sayı ✦ Bağımsız Gençlik ✦ Çilek Dergisi ✦ '

// ─── "Her Sayıda Seni Bekleyenler" retro takvim içeriği ─────────────────────
const CONTENT_PICKS = [
  { num: '01', tag: 'YAZI', icon: '🖊', label: 'Bir Yazı', desc: 'Duyguların en yalın haliyle kaleme alınmış, özgün bir deneme ya da kısa kurgu.', time: 'Her Sayıda · Deneme' },
  { num: '02', tag: 'SÖYLEŞİ', icon: '🎤', label: 'Bir Röportaj', desc: 'İlham veren genç bir yaratıcıyla dürüst ve derinlikli bir söyleşi.', time: 'Özel Seri · Söyleşi' },
  { num: '03', tag: 'GÖRSEL', icon: '🎨', label: 'Bir Görsel', desc: 'Fotoğraf serisi, illüstrasyon veya kolaj; sayfayı aydınlatan özgün bir eser.', time: 'Sanat & Tasarım' },
  { num: '04', tag: 'ÖNERİ', icon: '💡', label: 'Bir Öneri', desc: 'Bir kitap, müzik, film ya da küçük bir günlük ritual önerisi.', time: 'Kültür & Yaşam' },
  { num: '05', tag: 'FİKİR', icon: '💭', label: 'Bir Düşünce', desc: 'Kafana takılan bir soru, bir kavram veya bir hayat notu.', time: 'Serbest Alan' },
]

// ─── TOC kart açıklamaları (varsa kullan, yoksa genel) ───────────────────────
const TOC_DESC_MAP = {
  default: 'Bu sayının seçkin içeriklerinden biri sizi bekliyor.',
}

export default function Home({ user, isAdmin }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [allMagazines, setAllMagazines] = useState(FEATURED_FALLBACKS)
  const [selectedMag, setSelectedMag] = useState(null)
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false)
  const [latestMag, setLatestMag] = useState(null)
  const [teamMembers, setTeamMembers] = useState(TEAM_FALLBACK)
  const [founder, setFounder] = useState(null)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterDone, setNewsletterDone] = useState(false)

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (newsletterEmail.trim()) {
      setNewsletterDone(true)
      setNewsletterEmail('')
      setTimeout(() => setNewsletterDone(false), 4000)
    }
  }

  const { settings } = useSiteContent()
  const siteData = settings
  const mediaData = { founder_photo: settings.about_founder_photo_url }

  useEffect(() => {
    if (searchParams.get('welcome') === 'true') setIsWelcomeModalOpen(true)
  }, [searchParams])

  // Dergileri çek
  useEffect(() => {
    const TR_MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    supabase.from('magazines').select('*').order('issue_number', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped = data.map(m => ({ ...m, month_name: m.published_date ? TR_MONTHS[new Date(m.published_date).getMonth()] : '' }))
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
          setTeamMembers(data)
          // Kurucu: role içinde 'kurucu' veya 'founder' geçen ya da order_index = 1
          const found = data.find(m =>
            m.role?.toLowerCase().includes('kurucu') ||
            m.role?.toLowerCase().includes('founder') ||
            m.order_index === 1
          )
          setFounder(found || data[0])
        }
      })
  }, [])

  const featuredMag = latestMag || allMagazines[allMagazines.length - 1]

  const handleReadIssue = () => {
    if (user) {
      if (featuredMag?.id && !featuredMag.id.startsWith('f-')) navigate(`/oku/${featuredMag.id}`)
      else navigate('/dergiler')
    } else {
      navigate('/auth')
    }
  }

  // TOC parse yardımcı
  const parseToc = (toc) => {
    if (!toc) return []
    if (Array.isArray(toc)) return toc
    try { return JSON.parse(toc) } catch { return [] }
  }

  // Ekip şeridi için sonsuz döngü verisi
  const teamLoop = [...teamMembers, ...teamMembers, ...teamMembers]

  return (
    <div className="home-v2-wrapper">

      {/* ── 1. KAYAN MARQUEE ŞERİDİ ─────────────────────────────────────── */}
      <div className="home-topbar-marquee" aria-label="Duyuru şeridi" role="marquee">
        <div className="home-topbar-track">
          <span className="home-topbar-text">{siteData.hero_marquee || MARQUEE_TEXT}{siteData.hero_marquee || MARQUEE_TEXT}</span>
          <span className="home-topbar-text" aria-hidden="true">{siteData.hero_marquee || MARQUEE_TEXT}{siteData.hero_marquee || MARQUEE_TEXT}</span>
        </div>
      </div>

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <Navbar user={user} isAdmin={isAdmin} onOpenWelcomeLetter={() => setIsWelcomeModalOpen(true)} hideTopBar={true} />

      <main>

        {/* ── 2. HERO BÖLÜMİ ─────────────────────────────────────────── */}
        <section className="home-hero-section" aria-label="Hero">
          <div className="home-hero-grid-bg" aria-hidden="true" />
          <div className="home-hero-shell">
            {/* Sol: Metin */}
            <div className="home-hero-text">
              <div className="home-hero-eyebrow">
                <span className="home-hero-eyebrow-star">✦</span>
                {siteData.hero_eyebrow || 'Çilek Dergisi'}
              </div>
              <h1 className="home-hero-title">
                {siteData.hero_title_line1 || 'Kendi sesini'}<br />
                <span className="home-hero-title-italic">{siteData.hero_title_italic || 'özgürce'} </span>
                <span className="home-hero-title-script">{siteData.hero_title_script || 'duyurduğun alan.'}</span>
              </h1>
              <p className="home-hero-copy">
                {settings.hero_subtitle || siteData.hero_copy}
              </p>
              <div className="home-hero-actions">
                <button type="button" className="home-btn-primary" onClick={handleReadIssue} id="btn-hero-read-issue">
                  {settings.hero_cta_text || 'SAYIYI OKU'}
                </button>
                <Link to="/dergiler" className="home-btn-secondary" id="btn-hero-all-issues">
                  {settings.hero_cta_archive || 'Tüm Sayılar'}
                </Link>
              </div>
              <p className="home-hero-note">
                <strong className="home-hero-note-strong">
                  Sayı {featuredMag?.issue_number || '06'} yayında
                </strong>
                {' '}· PDF indirmek için giriş yapmanız gerekmektedir.
              </p>
            </div>

            {/* Sağ: Kapak görseli */}
            <div className="home-hero-visual" aria-hidden="true">
              <div className="home-cover-stage">
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
                <div className="home-cover-sticker home-sticker-1">Yayında ✦</div>
                <div className="home-cover-sticker home-sticker-2">Son Sayı</div>
              </div>
            </div>
          </div>
          <div className="home-hero-wave" aria-hidden="true" />
        </section>

        {/* ── 3. SON SAYI DETAY BLOĞU ─────────────────────────────────── */}
        <section className="home-issue-band" aria-label="Son Sayı Detayı">
          <div className="container">
            <div className="home-issue-layout">
              <div className="home-issue-cover-wrap">
                <div className="home-issue-cover-mini">
                  {featuredMag?.cover_image_url ? (
                    <img src={featuredMag.cover_image_url} alt={featuredMag.title} style={{ width: '100%', borderRadius: '10px', display: 'block' }} />
                  ) : (
                    <div className="home-issue-cover-fallback">
                      <img src="/icons/cilek-vintage.png" alt="" style={{ width: '60%' }} />
                    </div>
                  )}
                </div>
              </div>
              <div className="home-issue-info">
                <span className="home-sec-eyebrow"><span className="eyebrow-star">✦</span> Son Sayı</span>
                <h2 className="home-issue-title">{featuredMag?.title || 'Sayı 06 — Yaz Dönemi'}</h2>
                <p className="home-issue-date">
                  {featuredMag?.published_date
                    ? new Date(featuredMag.published_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })
                    : 'Haziran 2024'}
                </p>
                <p className="home-issue-desc">
                  {featuredMag?.description || 'Yaz mevsiminin hafifliği ve sonsuzluk hissi. Uzak yollar, sıcak sokaklar, yeni başlangıçlar.'}
                </p>
                <button type="button" className="home-btn-primary" onClick={handleReadIssue} id="btn-issue-band-read">
                  SAYIYI OKU
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. BU SAYIDA SENİ NELER BEKLİYOR (TELLİ PANO FORMAT) ─────── */}
        {parseToc(featuredMag?.toc).length > 0 && (
          <section className="home-toc-section" aria-label="Bu Sayıda Neler Var">
            <div className="container">
              <div className="home-toc-header">
                <span className="home-sec-eyebrow"><span className="eyebrow-star">✦</span> İçindekiler</span>
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
                        <span className="home-toc-card-star">✦</span>
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

        {/* ── 5. HER SAYIDA SENİ BEKLEYENLER (RETRO SPIRAL TAKVİM / BLOKNOT FORMATI) ── */}
        <section className="home-calendar-section" aria-label="Her Sayıda Seni Bekleyenler">
          <div className="container">
            {/* Spiral Delikli Takvim Yaprağı (Calendar / Tear-off Notepad Sheet) */}
            <div className="home-calendar-sheet">
              {/* Spiral Cilt Halkaları (Spiral Perforated Edge) */}
              <div className="calendar-spiral-binding" aria-hidden="true">
                {Array.from({ length: 22 }).map((_, i) => (
                  <div key={i} className="calendar-spiral-hole">
                    <span className="calendar-spiral-loop" />
                  </div>
                ))}
              </div>

              {/* Takvim Üst Başlık */}
              <div className="home-calendar-header">
                <span className="home-calendar-eyebrow">ÇİLEK DERGİSİ ✦ HER SAYIDA</span>
                <h2 className="home-calendar-title">{settings.features_title || 'HER SAYIDA SENİ BEKLEYENLER'}</h2>
                <p className="home-calendar-sub">
                  {settings.features_subtitle || "Çilek Dergisi'nin her sayısında bulacağın beş temel içerik türü:"}
                </p>
              </div>

              {/* 5 Sütunlu Takvim Çizelgesi (Calendar Grid) */}
              <div className="home-calendar-grid">
                {CONTENT_PICKS.map((pick, idx) => {
                  const num = idx + 1
                  const title = settings[`feature_${num}_title`] || pick.label
                  const desc = settings[`feature_${num}_desc`] || pick.desc
                  return (
                    <div
                      key={idx}
                      className="calendar-col"
                      tabIndex={0}
                      role="article"
                      aria-label={`${pick.num} ${title}`}
                    >
                      <div className="calendar-col-header">
                        <span className="calendar-col-num">{pick.num}</span>
                        <span className="calendar-col-tag">({pick.tag})</span>
                      </div>
                      <div className="calendar-col-body">
                        <div className="calendar-col-icon-wrap">
                          <span className="calendar-col-icon">{pick.icon}</span>
                        </div>
                        <h3 className="calendar-col-title">{title}</h3>
                        <p className="calendar-col-desc">{desc}</p>
                        <span className="calendar-col-time">{pick.time}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Takvim İçi Aksiyon Butonu (FIND US TODAY tarzı) */}
              <div className="home-calendar-actions">
                <Link to="/dergiler" className="calendar-sheet-btn" id="btn-calendar-discover">
                  SAYILARI KEŞFET ✦
                </Link>
              </div>
            </div>

            {/* Alt Mor / Lavanta Bülten Şeridi (Periwinkle Newsletter Pill Bar) */}
            <div className="home-calendar-banner">
              <span className="calendar-banner-text">
                {newsletterDone
                  ? '✦ KAYDINIZ ALINDI! ÇİLEK DÜNYASINA HOŞ GELDİNİZ 🍓'
                  : 'PSST! YENİ SAYILARI VE EDİTORYAL SEÇKİLERİ KAÇIRMA!'}
              </span>
              <form className="calendar-banner-form" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  className="calendar-banner-input"
                  placeholder="E-posta adresin..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  aria-label="E-posta ile bültene kaydol"
                />
                <button type="submit" className="calendar-banner-btn" id="btn-calendar-newsletter">
                  KAYIT OL
                </button>
              </form>
            </div>
          </div>

          {/* Alt Kısım: Pembe ve Bordo Çizgili Tente / Şerit (Awning Bar) */}
          <div className="home-calendar-awning" aria-hidden="true" />
        </section>

        {/* ── 6. KAYAN EKİP ŞERİDİ ────────────────────────────────────── */}
        <section className="home-team-marquee-section" aria-label="Ekibimizle Tanışın">
          <div className="home-team-marquee-header container">
            <div>
              <span className="home-sec-eyebrow"><span className="eyebrow-star">✦</span> {settings.home_team_eyebrow || 'Ekip'}</span>
              <h2 className="home-sec-title">
                {settings.home_team_title || 'Ekibimizle Tanışın'}
              </h2>
            </div>
            <Link to="/ekibimiz" className="home-btn-secondary" id="btn-team-marquee-all">
              {settings.home_team_cta || 'Tümünü Gör →'}
            </Link>
          </div>

          {/* Sonsuz Kayan Şerit */}
          <div className="home-team-track-wrapper" aria-hidden="true">
            <div className="home-team-track">
              {teamLoop.map((member, idx) => (
                <div key={`${member.id}-${idx}`} className="home-team-card">
                  <div className="home-team-avatar">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src={`/icons/icon${(member.order_index % 6) + 1}.png`} alt="" style={{ width: '60%', height: 'auto' }} />
                    )}
                  </div>
                  <strong className="home-team-name">{member.name}</strong>
                  <span className="home-team-role">{member.role}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. KURUCUYLA TANIŞ ──────────────────────────────────────── */}
        <section className="home-founder-section" aria-label="Kurucuyla Tanış">
          <div className="container">
            <div className="home-founder-layout">
              {/* Sol: Polaroid foto */}
              <div className="home-founder-photo-wrap" aria-hidden="true">
                <div className="home-founder-polaroid">
                  {(mediaData.founder_photo || founder?.photo_url) ? (
                    <img src={mediaData.founder_photo || founder?.photo_url} alt={founder?.name || 'Kurucu'} className="home-founder-img" />
                  ) : (
                    <div className="home-founder-img-fallback">
                      <img src="/icons/cilek-vintage.png" alt="" style={{ width: '55%' }} />
                    </div>
                  )}
                  <span className="home-founder-polaroid-label">
                    {founder?.name || 'Çilek Ekibi'} ✦
                  </span>
                </div>
              </div>

              {/* Sağ: Metin */}
              <div className="home-founder-content">
                <span className="home-sec-eyebrow"><span className="eyebrow-star">✦</span> Kurucuyla Tanış</span>
                <h2 className="home-sec-title">
                  {settings.about_founder_name || founder?.name || 'Merhaba,'}
                  <span className="home-sec-title-italic"> — {founder?.role || 'Kurucu & Editör'}</span>
                </h2>
                <blockquote className="home-founder-quote">
                  {siteData.about_founder_quote || '"Her gencin anlatacak sahici, kırılgan ve özgün bir hikâyesi vardır. Çilek Dergisi bunun için burada."'}
                </blockquote>
                <p className="home-founder-bio">
                  {siteData.about_founder_bio || founder?.bio || 'Derginin editoryal kimliğini, bağımsız tonunu ve görsel ruhunu şekillendiriyor. Her sayıda okurlarıyla buluşmak için özenle çalışıyor.'}
                </p>
                <Link to="/hakkimizda" className="btn-cilek-link" id="btn-founder-more">
                  Hakkımızda →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. HAKKIMIZDA ÖZET + DEĞERLER ──────────────────────────── */}
        <section className="home-about-teaser" aria-label="Hakkımızda Özeti">
          <div className="container">
            <div className="home-about-inner">
              <div className="home-about-deco" aria-hidden="true">
                <img src="/icons/cilek-vintage.png" alt="" className="home-about-deco-img" />
              </div>
              <div className="home-about-content">
                <span className="home-sec-eyebrow"><span className="eyebrow-star">✦</span> Biz Kimiz?</span>
                <h2 className="home-sec-title">
                  Çilek Dergisi<span className="home-sec-title-italic">'nin Hikâyesi</span>
                </h2>
                <p className="home-about-text">
                  <strong>Çilek Dergisi</strong>, "her gencin anlatacak sahici, kırılgan ve özgün bir hikâyesi vardır"
                  inancıyla doğdu. Dijital çağın aceleci ve yüzeysel tüketimine inat; basılı bir derginin sevgisiyle,
                  her sayfasında özenle işlenmiş kelimeler, dikiş izleri ve özgür düşler barındırır.
                </p>
                <p className="home-about-text">
                  Sanat, edebiyat, kişisel deneyimler, şiir ve bağımsız görsel kültür… Burası kalıplara sığmak
                  zorunda hissetmeyenlerin ilk dizelerini korkmadan paylaşabileceği sıcak bir sığınaktır.
                </p>
                <Link to="/hakkimizda" className="home-about-link" id="btn-about-teaser-more">
                  Devamını Oku →
                </Link>
              </div>
              <div className="home-values-grid">
                {[
                  { icon: '✍️', label: 'Craftsmanship', desc: 'Bağımsız yazarlar ve özenli editoryal süreç.' },
                  { icon: '🌿', label: 'Slowness', desc: 'Hissederek okunan, saklanan, sevilen sayfalar.' },
                  { icon: '🎨', label: 'Playfulness', desc: 'Kuralları yıkan deneysel denemeler ve şiirler.' },
                  { icon: '🍓', label: 'Community', desc: '15–25 yaş okurlar ve yazarların sıcak dayanışması.' },
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

        {/* ── 9. ARŞİV BÖLÜMÜ (DİJİTAL RAF KONSEPTİ) ─────────────────── */}
        <section className="home-archive-section" aria-label="Dergiler Arşivi" id="cilek-arsiv">
          <div className="container">
            <div className="home-archive-header">
              <div>
                <span className="home-sec-eyebrow"><span className="eyebrow-star">✦</span> The Çilek Journey</span>
                <h2 className="home-sec-title">
                  Tüm<span className="home-sec-title-italic"> Sayılar</span>
                </h2>
              </div>
              <Link to="/dergiler" className="home-btn-secondary" id="btn-archive-all">
                Kitaplığın Tamamı ({allMagazines.length}+) →
              </Link>
            </div>

            {/* Dijital Ahşap Raf (Showcase Digital Shelf) */}
            <div className="home-digital-shelf-wrap">
              <div className="home-shelf-wood">
                {/* Raftaki Dergiler */}
                <div className="home-shelf-books">
                  {allMagazines.slice(0, 4).map((mag, idx) => {
                    const tilt = [-1.4, 1.2, -0.8, 1.5][idx % 4]
                    return (
                      <div
                        key={mag.id}
                        className="home-shelf-slot"
                        style={{ '--book-tilt': `${tilt}deg` }}
                      >
                        <div
                          className="shelf-book-stand"
                          onClick={() => setSelectedMag(mag)}
                          tabIndex={0}
                          role="button"
                          onKeyDown={(e) => e.key === 'Enter' && setSelectedMag(mag)}
                          aria-label={`${mag.title} incele`}
                        >
                          <div className="shelf-book-floor-shadow" />
                          <div className="shelf-book">
                            <div className="shelf-book-spine" />
                            <div className="shelf-book-cover">
                              {mag.cover_image_url ? (
                                <img src={mag.cover_image_url} alt={mag.title} className="shelf-cover-img" />
                              ) : (
                                <div className="shelf-cover-fallback">
                                  <img src="/icons/cilek-vintage.png" alt="" className="shelf-fallback-icon" />
                                  <strong className="shelf-fallback-brand">ÇİLEK</strong>
                                  <span className="shelf-fallback-issue">Sayı #{mag.issue_number}</span>
                                </div>
                              )}
                              <div className="shelf-book-sheen" />
                              {idx === 0 && (
                                <div className="shelf-book-ribbon">
                                  <span>YENİ</span>
                                </div>
                              )}
                            </div>
                            <div className="shelf-hover-actions">
                              <span className="shelf-btn-read">İNCELE ✦</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Ahşap Raf Ön Pervazı ve Pirinç Etiketlikler */}
                <div className="bookcase-ledge">
                  <div className="bookcase-ledge-top" />
                  <div className="bookcase-ledge-front home-shelf-front">
                    {allMagazines.slice(0, 4).map((mag, idx) => (
                      <div key={idx} className="bookcase-brass-plate" aria-hidden="true">
                        <span className="brass-rivet rivet-left" />
                        <div className="brass-plate-inner">
                          <span className="brass-plate-text">
                            SAYI {String(mag.issue_number || idx + 1).padStart(2, '0')} · {mag.month_name || 'ÇİLEK'}
                          </span>
                        </div>
                        <span className="brass-rivet rivet-right" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      {selectedMag && (
        <MagazineModal magazine={selectedMag} user={user} onClose={() => setSelectedMag(null)} />
      )}
      <WelcomePostcardModal isOpen={isWelcomeModalOpen} onClose={() => setIsWelcomeModalOpen(false)} user={user} />
    </div>
  )
}
