import React, { useRef, useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'

const TEAM_FALLBACK = [
  {
    id: 't-1',
    emoji: '🍓',
    name: 'Genel Yayın Yönetmeni',
    role: 'Editör',
    bio: 'Derginin ruhunu ve editoryal kimliğini şekillendiriyor. Her sayıda sesi ve tonu belirleyen kişi.',
    photo_url: null,
    order_index: 1,
  },
  {
    id: 't-2',
    emoji: '🎨',
    name: 'Art Director',
    role: 'Tasarım & Görsel',
    bio: 'Her sayfanın görsel dilini tasarlıyor. Kapaktan mizanpaja estetik kararların sahibi.',
    photo_url: null,
    order_index: 2,
  },
  {
    id: 't-3',
    emoji: '✒️',
    name: 'İçerik Editörü',
    role: 'Yazı İşleri',
    bio: 'Yazarlarla çalışıyor, metinleri besliyor ve yayın sürecini koordine ediyor.',
    photo_url: null,
    order_index: 3,
  },
  {
    id: 't-4',
    emoji: '📸',
    name: 'Görsel Editör',
    role: 'Fotoğraf & Sanat',
    bio: 'Derginin görsel repertuarını oluşturuyor. Fotoğraf seçimlerinden illüstrasyonlara kadar.',
    photo_url: null,
    order_index: 4,
  },
  {
    id: 't-5',
    emoji: '🌿',
    name: 'Dijital Koordinatör',
    role: 'Sosyal Medya & Web',
    bio: 'Derginin dijital varlığını yönetiyor. Platform içerikleri ve okuyucu etkileşimi.',
    photo_url: null,
    order_index: 5,
  },
  {
    id: 't-6',
    emoji: '🌸',
    name: 'Yazar Koordinatörü',
    role: 'Yazar İlişkileri',
    bio: 'Yazar başvurularını değerlendiriyor, yeni sesleri keşfediyor, topluluk kuruyor.',
    photo_url: null,
    order_index: 6,
  },
]

export default function Ekibimiz({ user, isAdmin }) {
  const [team, setTeam] = useState(TEAM_FALLBACK)
  const sliderRef = useRef(null)

  useEffect(() => {
    supabase
      .from('team_members')
      .select('*')
      .order('order_index', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setTeam(data)
        }
      })
  }, [])

  const handleScroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <Layout user={user} isAdmin={isAdmin}>
      {/* Sayfa Başlığı */}
      <div className="page-banner" role="banner">
        <p className="page-banner-pre">Sahne Arkası</p>
        <h1 className="page-banner-title">Ekibimiz</h1>
        <p className="page-banner-sub">
          Çilek Dergisi'ni hayata geçiren yaratıcı kadro ve bağımsız üreticilerle tanış.
        </p>
      </div>

      {/* Ekip Bölümü: Yan yana kaydırmalı (Horizontal Slider) */}
      <section className="section-team" aria-labelledby="team-heading">
        <div className="container">
          <header className="team-slider-header">
            <div>
              <span className="team-badge">Yaratıcı Kadro ({team.length})</span>
              <h2 id="team-heading" className="team-slider-title">
                Arkasındakiler
              </h2>
            </div>

            {/* Kaydırma Butonları */}
            <div className="slider-controls" aria-label="Ekip kaydırma butonları">
              <button
                type="button"
                className="btn-slider"
                onClick={() => handleScroll('left')}
                aria-label="Önceki ekip üyesi"
                id="btn-team-prev"
              >
                ←
              </button>
              <button
                type="button"
                className="btn-slider"
                onClick={() => handleScroll('right')}
                aria-label="Sonraki ekip üyesi"
                id="btn-team-next"
              >
                →
              </button>
            </div>
          </header>

          {/* Yan Yana Kaydırmalı Kart Şeridi */}
          <div
            className="team-slider-track"
            ref={sliderRef}
            role="region"
            aria-label="Ekip Üyeleri Listesi"
            tabIndex={0}
          >
            {team.map((member, idx) => (
              <article className="team-slide-card" key={member.id || idx}>
                <div className="team-avatar-box" aria-hidden="true">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="team-member-img"
                    />
                  ) : (
                    <span className="team-avatar-emoji">{member.emoji || '🍓'}</span>
                  )}
                </div>
                <h3 className="team-name">{member.name}</h3>
                <span className="team-role-tag">{member.role}</span>
                {member.bio && <p className="team-bio">{member.bio}</p>}
              </article>
            ))}
          </div>

          <div className="slider-drag-hint">
            <span>← Sağa sola kaydırarak ekibi keşfedebilirsiniz →</span>
          </div>
        </div>
      </section>

      {/* Aramıza Katıl Çağrısı */}
      <section className="section-join-cta">
        <div className="container" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <span className="join-pre">Aramıza Katıl</span>
          <h2 className="join-title">Sen de Ekibin Parçası Ol</h2>
          <p className="join-desc">
            Yazar, illüstratör veya editör olarak Çilek Dergisi'ne katkı sağlamak istiyorsan kapımız her zaman açık.
          </p>
          <a href="mailto:ekip@cilekdergisi.com" className="btn-join-action" id="btn-join-team">
            Başvuruda Bulun →
          </a>
        </div>
      </section>
    </Layout>
  )
}
