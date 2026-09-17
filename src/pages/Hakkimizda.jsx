import React from 'react'
import Layout from '../components/Layout'
import { Link } from 'react-router-dom'

const VALUES = [
  { emoji: '🍓', title: 'Özgün Sesler',   desc: 'Her yazar kendi sesiyle gelir. Tekdüzeliğe yer yok.' },
  { emoji: '💌', title: 'Okuyucu Odaklı', desc: 'Her sayı, okuyucuyla birlikte şekillenir.' },
  { emoji: '✨', title: 'Estetik Özen',    desc: 'İçerik kadar görsel de önemli. Her sayfa bir tasarım ürünü.' },
  { emoji: '📖', title: 'Derinlik',        desc: 'Yüzeysel geçmeyiz. Her konuya gereken önemi veririz.' },
]

export default function Hakkimizda({ user, isAdmin }) {
  return (
    <Layout user={user} isAdmin={isAdmin}>
      {/* Banner */}
      <div className="page-banner">
        <p className="page-banner-pre">Biz Kimiz?</p>
        <h1 className="page-banner-title">Hakkımızda</h1>
        <p className="page-banner-sub">
          Bağımsız, tutkulu ve ses vermeye kararlı bir ekibin hikâyesi.
        </p>
      </div>

      {/* 1. HİKÂYEMİZ — Ferah, Geniş ve Lüks Editoryal Okuma Alanı */}
      <section className="about-story-section" aria-labelledby="about-story">
        <div className="container" style={{ maxWidth: '880px', margin: '0 auto' }}>
          <article className="about-story-card">
            <div className="about-story-header">
              <span className="about-story-badge">Bağımsız Yayıncılık</span>
              <h2 id="about-story" className="about-story-title">Çilek Dergisi'nin Hikâyesi</h2>
              <div className="about-story-divider" aria-hidden="true">
                <span className="about-divider-line" />
                <img src="/icons/cilek-vintage.png" alt="" className="about-divider-strawberry" />
                <span className="about-divider-line" />
              </div>
            </div>

            <div className="about-story-content">
              <p className="about-story-lead">
                Çilek Dergisi, her ay yayımlanan bağımsız bir dijital kültür, sanat ve yaşam dergisidir. Sanat, edebiyat, toplumsal meseleler ve kişisel deneyimler üzerine yazılar, söyleşiler ve özel görsel içeriklerle okuyucularına taze ve samimi bir perspektif sunuyoruz.
              </p>

              <p>
                Dergimiz, "iyi içerik bir mekândan ve kalıplardan bağımsızdır" inancıyla doğdu. Dijital formatta yayın yapıyor olsak da her sayımıza basılı ve fiziksel bir derginin titizliğiyle yaklaşıyoruz: editöryal süreç, tasarım kararları, tipografi özeni ve yazar seçimi derin bir hassasiyetle yapılıyor.
              </p>

              <blockquote className="about-pullquote">
                "İyi bir dergi, sadece yazanların değil — birlikte düşünen, hisseden, sorgulayan ve okuyan herkesin ortak eseridir."
              </blockquote>

              <p>
                Dergiyi seven, kendi sesini duyurmak ve katkı sağlamak isteyen herkese kapımız açık. Çünkü seslerin çoğaldığı ve birbirini beslediği yerde gerçek bir edebiyat ve kültür yeşerir.
              </p>

              <div className="about-story-actions">
                <Link to="/iletisim" className="btn-story-contact" id="btn-about-contact">
                  Bize Ulaşın →
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* 2. DEĞERLERİMİZ */}
      <section className="about-values-section" aria-labelledby="values-title">
        <div className="container">
          <header className="about-values-header">
            <span className="about-story-badge">İlkelerimiz</span>
            <h2 className="about-section-title" id="values-title">Neye İnanıyoruz?</h2>
            <p className="about-section-sub">Her sayımızda rehber edindiğimiz temel değerler</p>
          </header>

          <div className="values-grid">
            {VALUES.map(v => (
              <div className="value-card" key={v.title}>
                <div className="value-icon" aria-hidden="true">{v.emoji}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. KATKIDA BULUN / SEN DE YAZABİLİRSİN (Sayfayla Genel Uyumlu Editoryal Tasarım) */}
      <section className="about-cta-section" aria-labelledby="cta-title">
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="about-cta-card">
            <div className="about-cta-badge-icon" aria-hidden="true">
              <img src="/icons/cilek-vintage.png" alt="" className="about-cta-strawberry-img" />
            </div>
            <span className="about-cta-badge">Katkıda Bulun</span>
            <h2 id="cta-title" className="about-cta-title">
              Sen de Yazabilirsin
            </h2>
            <p className="about-cta-desc">
              Yazı, şiir, söyleşi, deneme veya sanatsal perspektifler... Kendi sesini duyurmak ve Çilek Dergisi'nin bağımsız sayfalarında yer almak için bize yazını gönderebilirsin.
            </p>
            <Link to="/iletisim" className="about-cta-button" id="btn-about-yazi">
              Yazı Gönder <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}

