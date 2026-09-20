import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const TEAM_FALLBACK = [
  { id: 't-1', name: 'Genel Yayın Yönetmeni', role: 'Kreatif Direktör & Kurucu', bio: 'Derginin editoryal kimliğini, bağımsız tonunu ve görsel ruhunu şekillendiriyor. Her sayıda okurlarıyla buluşmak için özenle çalışıyor.', photo_url: null, order_index: 1 },
  { id: 't-2', name: 'Art Director', role: 'Tasarım & Görsel Dil', bio: 'Her sayfanın görsel dilini tasarlıyor. Kapaktan mizanpaja estetik kararların sahibi.', photo_url: null, order_index: 2 },
  { id: 't-3', name: 'İçerik Editörü', role: 'Edebiyat & Yazı İşleri', bio: 'Yazarlarla çalışıyor, metinleri besliyor ve yayın sürecini titizlikle koordine ediyor.', photo_url: null, order_index: 3 },
  { id: 't-4', name: 'Görsel Sanat Editörü', role: 'Fotoğraf & Sanat', bio: 'Derginin görsel arşivini oluşturuyor. Fotoğraf serilerinden illüstrasyonlara kadar.', photo_url: null, order_index: 4 },
  { id: 't-5', name: 'Dijital Koordinatör', role: 'Sosyal Medya & Web', bio: 'Derginin dijital varlığını yönetiyor. Platform etkileşimi ve topluluk iletişimi.', photo_url: null, order_index: 5 },
  { id: 't-6', name: 'Yazar Koordinatörü', role: 'Topluluk & Başvurular', bio: '15-25 yaş genç yazar başvurularını karşılıyor, yeni yetenekleri keşfedip cesaretlendiriyor.', photo_url: null, order_index: 6 },
]

export default function Ekibimiz({ user, isAdmin }) {
  const [team, setTeam] = useState(TEAM_FALLBACK)

  useEffect(() => {
    supabase
      .from('team_members')
      .select('*')
      .order('order_index', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) setTeam(data)
      })
  }, [])

  const founder = team[0]
  const restOfTeam = team.slice(1)

  return (
    <Layout user={user} isAdmin={isAdmin}>
      <div className="team-v2-page">

        {/* ── Sayfa Başlığı ─────────────────────────────────────────── */}
        <header className="team-v2-header">
          <div className="container team-v2-header-inner">
            <span className="eyebrow-cilek"><span className="eyebrow-star">✦</span> Sahne Arkasındakiler</span>
            <h1 className="team-v2-page-title">
              Ekibimiz
            </h1>
            <p className="team-v2-page-sub">
              Çilek Dergisi'ni sevgiyle, titizlikle ve bağımsız bir heyecanla
              hayata geçiren yaratıcı kadro.
            </p>
          </div>
        </header>

        {/* ── Kurucu / Featured Kart ────────────────────────────────── */}
        {founder && (
          <section className="team-v2-founder-section" aria-label="Kurucu">
            <div className="container">
              <div className="team-v2-founder-card">
                {/* Fotoğraf */}
                <div className="team-v2-founder-photo">
                  {founder.photo_url ? (
                    <img src={founder.photo_url} alt={founder.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="team-v2-founder-photo-fallback">
                      <img src="/icons/cilek-vintage.png" alt="" style={{ width: '55%' }} />
                    </div>
                  )}
                </div>

                {/* Metin */}
                <div className="team-v2-founder-info">
                  <span className="eyebrow-cilek"><span className="eyebrow-star">✦</span> Kurucu & Genel Yayın Yönetmeni</span>
                  <h2 className="team-v2-founder-name">{founder.name}</h2>
                  <span className="team-v2-founder-role">{founder.role}</span>
                  {founder.bio && <p className="team-v2-founder-bio">{founder.bio}</p>}

                  <blockquote className="team-v2-founder-quote">
                    "Her sayı, bir topluluk çabası — ve ben bu topluluğun parçası olmaktan
                    her geçen gün daha fazla gurur duyuyorum."
                  </blockquote>

                  <Link to="/yazi-gonderi" className="btn-cilek-primary" id="btn-team-founder-cta">
                    Sen de Katkı Sun
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Ekip Kartları Izgarası ────────────────────────────────── */}
        {restOfTeam.length > 0 && (
          <section className="team-v2-grid-section" aria-label="Ekip Üyeleri">
            <div className="container">
              <div className="team-v2-section-head">
                <span className="eyebrow-cilek"><span className="eyebrow-star">✦</span> Ekibimiz</span>
                <h2 className="heading-cilek">
                  Masanın<span className="italic"> Arkasındakiler</span>
                </h2>
              </div>

              <div className="team-v2-grid">
                {restOfTeam.map((member, idx) => (
                  <article key={member.id || idx} className="team-v2-card">
                    {/* Avatar */}
                    <div className="team-v2-avatar">
                      {member.photo_url ? (
                        <img src={member.photo_url} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      ) : (
                        <img
                          src={`/icons/icon${((member.order_index || idx + 2) % 6) + 1}.png`}
                          alt=""
                          style={{ width: '55%', height: 'auto' }}
                        />
                      )}
                    </div>

                    {/* İçerik */}
                    <h3 className="team-v2-name">{member.name}</h3>
                    <span className="team-v2-role">{member.role}</span>
                    {member.bio && <p className="team-v2-bio">{member.bio}</p>}

                    {/* Dekoratif alt çizgi */}
                    <div className="team-v2-card-bar" />
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Katılım CTA ───────────────────────────────────────────── */}
        <section className="team-v2-join" aria-label="Ekibe Katıl">
          <div className="container">
            <div className="team-v2-join-card">
              <div className="team-v2-join-icon">🍓</div>
              <h2 className="team-v2-join-title">
                Sen de Ekibin Bir Parçası Ol
              </h2>
              <p className="team-v2-join-desc">
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
