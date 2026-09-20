import React from 'react'
import Layout from '../components/Layout'
import { Link } from 'react-router-dom'
import { useSiteContent, DEFAULT_SITE_CONTENT } from '../lib/siteContent'

const MISSION_ITEMS = [
  {
    icon: '✍️',
    title: 'Özgün Sesler',
    desc: 'Kalıpların dışına çıkma cesaretini bulanların, ilk kelimelerini güvenle yazabileceği bir alan.'
  },
  {
    icon: '🌿',
    title: 'Özenli Editoryal',
    desc: 'Her metin titizlikle okunur, her görsel özenle seçilir. Hız değil, derinlik önce gelir.'
  },
  {
    icon: '🍓',
    title: 'Topluluk & Dayanışma',
    desc: '15–25 yaş okurların ve yazarların birbirini büyüttüğü, sıcak ve kapsayıcı bir ekosistem.'
  },
  {
    icon: '📖',
    title: 'Basılı Dergi Hissi',
    desc: 'Her sayfada elle tutulabilir bir duygu; saklanan, not düşülen, tekrar tekrar okunan içerikler.'
  }
]

export default function Hakkimizda({ user, isAdmin }) {
  const { content } = useSiteContent()
  const siteData = content?.site || DEFAULT_SITE_CONTENT.site
  const mediaData = content?.media || DEFAULT_SITE_CONTENT.media

  return (
    <Layout user={user} isAdmin={isAdmin}>
      <div className="about-v2-page">

        {/* ── 1. Açılış Bölümü ──────────────────────────────────────── */}
        <section className="about-v2-hero" aria-label="Giriş">
          <div className="about-v2-hero-inner container">
            {/* Dekoratif sol ikon */}
            <div className="about-v2-deco-left" aria-hidden="true">
              <img src="/icons/cilek-vintage.png" alt="" />
            </div>

            <div className="about-v2-hero-text">
              <span className="eyebrow-cilek"><span className="eyebrow-star">✦</span> Biz Kimiz?</span>
              <h1 className="about-v2-opening">
                {siteData.about_opening_quote || 'Her gencin anlatacak sahici, kırılgan ve özgün bir hikâyesi vardır.'}
              </h1>
            </div>

            {/* Dekoratif sağ ikon */}
            <div className="about-v2-deco-right" aria-hidden="true">
              <img src="/icons/icon2.png" alt="" />
            </div>
          </div>
        </section>

        {/* ── 2. Marka Hikâyesi ─────────────────────────────────────── */}
        <section className="about-v2-story" aria-label="Hikâyemiz">
          <div className="container about-v2-story-inner">

            {/* Sol: metin */}
            <div className="about-v2-story-text">
              <span className="eyebrow-cilek"><span className="eyebrow-star">✦</span> Hikâyemiz</span>
              <h2 className="heading-cilek">
                {siteData.about_story_title || "Çilek Dergisi'nin Doğuşu"}
              </h2>

              <p className="about-v2-para">
                {siteData.about_story_p1}
              </p>

              <p className="about-v2-para">
                {siteData.about_story_p2}
              </p>

              <p className="about-v2-para">
                {siteData.about_story_p3}
              </p>

              {siteData.about_manifesto_quote && (
                <blockquote className="about-v2-quote">
                  {siteData.about_manifesto_quote}
                </blockquote>
              )}
            </div>

            {/* Sağ: Görsel süsleme */}
            <div className="about-v2-story-visual" aria-hidden="true">
              <div className="about-v2-polaroid about-v2-polaroid-1">
                <div className="about-v2-polaroid-img">
                  <img src={mediaData.about_photo_1 || '/icons/icon4.png'} alt="" style={{ width: '60%' }} />
                </div>
                <span className="about-v2-polaroid-caption">Her sayı bir macera ✦</span>
              </div>
              <div className="about-v2-polaroid about-v2-polaroid-2">
                <div className="about-v2-polaroid-img">
                  <img src={mediaData.about_photo_2 || '/icons/icon1.png'} alt="" style={{ width: '55%' }} />
                </div>
                <span className="about-v2-polaroid-caption">Bağımsız sesler 🍓</span>
              </div>
              <div className="about-v2-polaroid about-v2-polaroid-3">
                <div className="about-v2-polaroid-img">
                  <img src="/icons/cilek-vintage.png" alt="" style={{ width: '65%' }} />
                </div>
                <span className="about-v2-polaroid-caption">EST. 2024</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Kurucu / Editör Bölümü ──────────────────────────────── */}
        <section className="about-v2-founder" aria-label="Kurucu ile Tanışın">
          <div className="container about-v2-founder-inner">

            {/* Polaroid kart */}
            <div className="about-v2-founder-photo-wrap">
              <div className="about-v2-founder-polaroid">
                <div className="about-v2-founder-photo">
                  <img
                    src={mediaData.founder_photo || '/icons/cilek-vintage.png'}
                    alt="Kurucu"
                    style={{ width: '60%' }}
                  />
                </div>
                <span className="about-v2-founder-photo-caption">Genel Yayın Yönetmeni ✦</span>
              </div>
            </div>

            {/* Metin */}
            <div className="about-v2-founder-text">
              <span className="eyebrow-cilek"><span className="eyebrow-star">✦</span> Kurucuyla Tanışın</span>
              <h2 className="heading-cilek">
                Neden<span className="italic"> Çilek'i kurdum?</span>
              </h2>

              <blockquote className="about-v2-founder-quote">
                {siteData.about_founder_quote || '"Yazmak isteyip nereye göndereceğini bilemeyen bir genci düşündüm. Tam da onun için bu alanı açtım — çünkü ben de bir zamanlar o gençtim."'}
              </blockquote>

              <p className="about-v2-para">
                {siteData.about_founder_bio || 'Çilek Dergisi, bir gece ansızın gelen bir fikrin, incelikle örülmüş bir planın ve ekibin inanılmaz emeğinin ürünü. Her sayıda bu sevgi hissediliyor.'}
              </p>

              <Link to="/ekibimiz" className="btn-cilek-link" id="btn-about-meet-team">
                Ekibin Tamamıyla Tanışın →
              </Link>
            </div>
          </div>
        </section>

        {/* ── 4. Misyon / Değerler ───────────────────────────────────── */}
        <section className="about-v2-mission" aria-label="Değerlerimiz">
          <div className="container">
            <div className="about-v2-mission-header">
              <span className="eyebrow-cilek"><span className="eyebrow-star">✦</span> Ne için buradayız?</span>
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
                Seninle sayfalar doldurmak için sabırsızlanıyoruz.
              </p>
              <Link to="/yazi-gonderi" className="btn-cilek-primary" id="btn-about-submit">
                Yazını Bize Gönder
              </Link>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  )
}
