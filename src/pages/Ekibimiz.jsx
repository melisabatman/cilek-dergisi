import React, { useState, useEffect, useRef, useCallback } from 'react'
import Layout from '../components/Layout'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSiteContent } from '../lib/siteContent'

const TEAM_FALLBACK = [
  { id: 't-1', name: 'Genel Yayın Yönetmeni', role: 'Kreatif Direktör & Kurucu Ortak', bio: 'Derginin editoryal kimliğini, bağımsız tonunu ve ilham veren vizyonunu şekillendiriyor. Her sayıda gençliğin enerjisini sayfalara taşıyor.', photo_url: null, order_index: 1 },
  { id: 't-2', name: 'Art Director', role: 'Görsel Tasarım & Kurucu Ortak', bio: 'Çilek Dergisi’nin kendine has görsel dilini, kapağından mizanpajına estetik ruhunu ve sanatsal ritmini tasarlıyor.', photo_url: null, order_index: 2 },
  { id: 't-3', name: 'İçerik Editörü', role: 'Edebiyat & Yazı İşleri', bio: 'Yazarlarla el ele çalışıyor, taze fikirleri ve güçlü metinleri titizlikle yayına hazırlıyor.', photo_url: null, order_index: 3 },
  { id: 't-4', name: 'Görsel Sanat Editörü', role: 'Fotoğraf & Sanat', bio: 'Derginin görsel arşivini oluşturuyor. Fotoğraf serilerinden özgün illüstrasyonlara uzanan sanatsal köprüyü kuruyor.', photo_url: null, order_index: 4 },
  { id: 't-5', name: 'Dijital Koordinatör', role: 'Sosyal Medya & Web', bio: 'Derginin dinamik dijital dünyasını ve topluluk etkileşimini yönetiyor. Okurlarla her an iletişimde kalıyor.', photo_url: null, order_index: 5 },
  { id: 't-6', name: 'Yazar Koordinatörü', role: 'Topluluk & Başvurular', bio: '15-25 yaş genç yazar ve sanatçı başvurularını karşılıyor, yeni yeteneklerin sesini cesaretlendiriyor.', photo_url: null, order_index: 6 },
]

// Fallback için avatar gradient paleti (çilek meyvesi paletinde)
const AVATAR_GRADIENTS = [
  'linear-gradient(160deg, var(--color-primary) 0%, var(--color-text) 100%)',
  'linear-gradient(160deg, var(--color-text) 0%, var(--color-primary) 100%)',
  'linear-gradient(160deg, var(--color-primary) 0%, #1A0A0E 100%)',
  'linear-gradient(160deg, var(--color-primary) 0%, var(--color-seed) 100%)',
  'linear-gradient(160deg, var(--color-primary) 0%, var(--color-leaf) 100%)',
  'linear-gradient(160deg, var(--color-primary) 0%, var(--color-accent) 100%)',
]

// Avatar baş harfi
function initials(name) {
  return name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'
}

export default function Ekibimiz({ user, isAdmin }) {
  const { settings } = useSiteContent()
  const [team, setTeam] = useState(TEAM_FALLBACK)
  const [activeIdx, setActiveIdx] = useState(null)
  const sliderRef = useRef(null)
  const isDragging = useRef(false)
  const dragStart = useRef(0)
  const scrollStart = useRef(0)

  useEffect(() => {
    supabase
      .from('team_members')
      .select('*')
      .order('order_index', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) setTeam(data)
      })
  }, [])

  // ── Slider ok butonları ─────────────────────────────────────
  const scroll = useCallback((dir) => {
    const el = sliderRef.current
    if (!el) return
    const amount = el.clientWidth * 0.72
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' })
  }, [])

  // ── Mouse sürükleme ile kaydırma ────────────────────────────
  const handleMouseDown = (e) => {
    isDragging.current = true
    dragStart.current = e.pageX
    scrollStart.current = sliderRef.current?.scrollLeft || 0
    sliderRef.current?.classList.add('is-dragging')
  }
  const handleMouseMove = (e) => {
    if (!isDragging.current) return
    const dx = e.pageX - dragStart.current
    if (sliderRef.current) sliderRef.current.scrollLeft = scrollStart.current - dx
  }
  const handleMouseUp = () => {
    isDragging.current = false
    sliderRef.current?.classList.remove('is-dragging')
  }

  // ── Klavye erişilebilirliği ─────────────────────────────────
  const handleCardKey = (e, idx) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setActiveIdx(idx === activeIdx ? null : idx)
    }
    if (e.key === 'Escape') setActiveIdx(null)
  }

  // Dışarı tıklayınca aktif kartı kapat
  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest('.stv-card')) setActiveIdx(null)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  return (
    <Layout user={user} isAdmin={isAdmin}>
      <div className="stv-page">

        {/* ── Sayfa Başlığı ─────────────────────────────────── */}
        <header className="stv-header">
          <div className="container">
            <span className="stv-eyebrow">
              {settings.team_page_eyebrow || 'Sahne Arkasındakiler'}
            </span>
            <h1 className="stv-page-title">{settings.team_page_title || 'Ekibimiz'}</h1>
            <p className="stv-page-sub">
              {settings.team_page_description || "Çilek Dergisi'ni sevgiyle, titizlikle ve bağımsız bir heyecanla hayata geçiren yaratıcı kadro."}
            </p>
          </div>
        </header>

        {/* ── Slider Alanı ──────────────────────────────────── */}
        <section className="stv-slider-section" aria-label="Ekip üyeleri">
          <div className="stv-slider-outer">

            {/* Sol ok */}
            <button
              type="button"
              className="stv-arrow stv-arrow--left"
              onClick={() => scroll('left')}
              aria-label="Sola kaydır"
              id="btn-team-prev"
            >
              ‹
            </button>

            {/* Kaydırılabilir ray */}
            <div
              className="stv-rail"
              ref={sliderRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {team.map((member, idx) => {
                const isFounder = idx < 2 || member.role?.toLowerCase().includes('kurucu') || member.role?.toLowerCase().includes('founder')
                const isActive = activeIdx === idx
                const gradBg = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]

                return (
                  <div
                    key={member.id || idx}
                    className={[
                      'stv-card',
                      isFounder ? 'stv-card--hero' : '',
                      isActive   ? 'stv-card--active' : '',
                      activeIdx !== null && !isActive ? 'stv-card--dimmed' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => setActiveIdx(idx === activeIdx ? null : idx)}
                    onKeyDown={(e) => handleCardKey(e, idx)}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isActive}
                    aria-label={`${member.name} — ${member.role}`}
                    id={`stv-card-${member.id || idx}`}
                  >
                    {/* ── Poster / Fotoğraf ───────────────── */}
                    <div className="stv-poster">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="stv-poster-img"
                          draggable="false"
                        />
                      ) : (
                        <div
                          className="stv-poster-fallback"
                          style={{ background: gradBg }}
                        >
                          <img
                            src="/icons/cilek-vintage.png"
                            alt=""
                            className="stv-fallback-logo"
                            draggable="false"
                          />
                          <span className="stv-fallback-initials">
                            {initials(member.name)}
                          </span>
                        </div>
                      )}

                      {/* Daima görünen alt gradient + isim/rol */}
                      <div className="stv-poster-base-overlay">
                        <span className="stv-base-role">{member.role}</span>
                        <h2 className="stv-base-name">{member.name}</h2>
                      </div>

                      {/* Hover / Active: Bio kartı ──────────── */}
                      <div className="stv-hover-info" aria-hidden={!isActive}>
                        <span className="stv-hover-role">{member.role}</span>
                        <h2 className="stv-hover-name">{member.name}</h2>
                        {member.bio && (
                          <p className="stv-hover-bio">{member.bio}</p>
                        )}
                        {isFounder && (
                          <blockquote className="stv-hover-quote">
                            "Her sayı, bir topluluk çabası ve ortak tutku."
                          </blockquote>
                        )}
                      </div>

                      {/* Kurucu rozeti */}
                      {isFounder && (
                        <div className="stv-founder-badge" aria-label="Kurucu Ortak">
                          Kurucu Ortak
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Sağ ok */}
            <button
              type="button"
              className="stv-arrow stv-arrow--right"
              onClick={() => scroll('right')}
              aria-label="Sağa kaydır"
              id="btn-team-next"
            >
              ›
            </button>
          </div>

          {/* Dot navigasyon (mobil için görünür) */}
          <div className="stv-dots" aria-hidden="true">
            {team.map((_, i) => (
              <span
                key={i}
                className={`stv-dot ${activeIdx === i ? 'stv-dot--active' : ''}`}
              />
            ))}
          </div>
        </section>

        {/* ── Katılım CTA ───────────────────────────────────── */}
        <section className="stv-join-section" aria-label="Ekibe Katıl">
          <div className="container">
            <div className="stv-join-card">
              <span className="stv-join-icon">🍓</span>
              <h2 className="stv-join-title">Sen de Ekibin Bir Parçası Ol</h2>
              <p className="stv-join-desc">
                Editör, yazar, illüstratör veya sosyal medya koordinatörü olarak
                Çilek Dergisi'ne katkı sunmak istiyorsan bize ulaş.
              </p>
              <Link to="/yazi-gonderi" className="btn-cilek-primary" id="btn-team-join">
                Bize Yaz
              </Link>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  )
}
