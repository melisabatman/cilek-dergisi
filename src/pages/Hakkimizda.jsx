import React from 'react'
import Layout from '../components/Layout'
import { Link } from 'react-router-dom'
import { useSiteContent, DEFAULT_SITE_CONTENT } from '../lib/siteContent'

const MISSION_ITEMS = [
  {
    title: 'Özgür Sesler',
    desc: 'Kalıpların dışına çıkma cesaretini bulanların, kendi sesini özgürce ve gururla duyurabileceği dinamik bir alan!'
  },
  {
    title: 'İlham Veren Editoryal',
    desc: 'Her kelimeye özen, her görsele tutku! Gençliğin hızını ve ritmini yakalayan heyecan verici editoryal dokunuşlar.'
  },
  {
    title: 'Topluluk & Dayanışma',
    desc: '15–25 yaş arası yaratıcı zihinlerin birbirine güç verdiği, birlikte parıldayan sıcacık bir ekosistem!'
  },
  {
    title: 'Koleksiyonluk Dergi Hissi',
    desc: 'Her sayfasında elle tutulur bir duygu; saklanan, paylaşılan ve kalpleri ısıtan bir dergi deneyimi!'
  }
]

export default function Hakkimizda({ user, isAdmin }) {
  const { settings } = useSiteContent()

  return (
    <Layout user={user} isAdmin={isAdmin}>
      <div className="about-v2-page">

        {/* ── 1. Açılış Bölümü ──────────────────────────────────────── */}
        <section className="about-v2-hero" aria-label="Giriş">
          <div className="about-v2-hero-inner container">
            <div className="about-v2-hero-text">
              <span className="eyebrow-cilek">{settings.about_title || 'Biz Kimiz?'}</span>
              <h1 className="about-v2-opening">
                {settings.about_opening_quote || 'Gençliğin hayalleri, cesareti ve üretme tutkusu dünyayı değiştirecek güçte!'}
              </h1>
            </div>
          </div>
        </section>

        {/* ── 2. Marka Hikâyesi ─────────────────────────────────────── */}
        <section className="about-v2-story" aria-label="Hikâyemiz">
          <div className="container about-v2-story-inner">

            {/* Sol: metin */}
            <div className="about-v2-story-text">
              <span className="eyebrow-cilek">Hikâyemiz</span>
              <h2 className="heading-cilek">
                {settings.about_story_title || "Çilek Dergisi'nin Doğuşu"}
              </h2>

              <p className="about-v2-para">
                {settings.about_paragraph_1}
              </p>

              <p className="about-v2-para">
                {settings.about_paragraph_2}
              </p>

              <p className="about-v2-para">
                {settings.about_paragraph_3}
              </p>

              {settings.about_manifesto_quote && (
                <blockquote className="about-v2-quote">
                  {settings.about_manifesto_quote}
                </blockquote>
              )}
            </div>
          </div>
        </section>

        {/* ── 3. Kurucumuz Bölümü ──────────────────── */}
        <section className="about-v2-founder" aria-label="Kurucumuz ile Tanışın">
          <div className="container about-v2-founder-inner">

            {/* Polaroid kart - Kurucu */}
            <div className="about-v2-founder-photo-wrap">
              <div className="about-v2-founder-polaroid polaroid-founder-single">
                <div className="about-v2-founder-photo">
                  <img
                    src={settings.about_founder_photo_url || settings.home_founder_photo_url || '/icons/cilek-vintage.png'}
                    alt="Kurucumuz"
                    className="about-v2-founder-full-img"
                  />
                </div>
                <span className="about-v2-founder-photo-caption">Genel Yayın Yönetmeni</span>
              </div>
            </div>

            {/* Metin */}
            <div className="about-v2-founder-text">
              <span className="eyebrow-cilek">Kurucumuzla Tanışın</span>
              <h2 className="heading-cilek">
                Neden<span className="italic"> Çilek'i kurduk?</span>
              </h2>

              <blockquote className="about-v2-founder-quote">
                {settings.about_founder_quote || '“Gençliğin enerjisi, tutkusu ve anlatacak cesur hikâyeleri kalıplara sığmaz! Çilek Dergisi bu bağımsız kıvılcımı birlikte parlatmak için var!”'}
              </blockquote>

              <p className="about-v2-para">
                {settings.about_founder_bio || 'Çilek Dergisi; gençlerin bağımsız kültürünü cesurca yansıtma arzusundan doğdu. Her sayıda bu ortak tutkuyu ve gençliğin saf enerjisini hissettirmek için üretiyoruz.'}
              </p>

              <Link to="/dergiler" className="btn-cilek-link" id="btn-about-meet-team">
                Dergileri Keşfedin →
              </Link>
            </div>
          </div>
        </section>

        {/* ── 4. Misyon / Değerler ───────────────────────────────────── */}
        <section className="about-v2-mission" aria-label="Değerlerimiz">
          <div className="container">
            <div className="about-v2-mission-header">
              <span className="eyebrow-cilek">Ne için buradayız?</span>
              <h2 className="heading-cilek">
                Dergimizin<span className="italic"> Değerleri</span>
              </h2>
            </div>

            <div className="about-v2-values-grid">
              {MISSION_ITEMS.map((item) => (
                <div key={item.title} className="about-v2-value-card">
                  <span className="about-v2-value-icon">{item.icon}</span>
                  <h3 className="about-v2-value-title">{item.title}</h3>
                  <p className="about-v2-value-desc">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="about-v2-cta">
              <p className="about-v2-cta-text">
                Senin de enerjinle sayfalarımızı doldurmak için sabırsızlanıyoruz! Aramıza katıl, sesini duyur!
              </p>
              <Link to="/yazi-gonderi" className="btn-cilek-primary" id="btn-about-submit">
                Yazını Hemen Gönder →
              </Link>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  )
}
