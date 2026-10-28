import React, { useState } from 'react'
import Layout from '../components/Layout'
import { useSiteContent } from '../lib/siteContent'

const CATEGORIES = [
  { value: 'deneme', label: '📖 Deneme & Anlatı', desc: '15-25 yaş deneyimleri, büyüme sancıları, şehir gözlemleri.' },
  { value: 'siir', label: '🪶 Şiir & Edebi Metin', desc: 'Serbest, ritmik veya deneysel dizeler; hislerin en yalın hali.' },
  { value: 'kultur', label: '🎨 Kültür & Sanat İncelemesi', desc: 'Kitap, albüm, sinema, sergi üzerine özgün eleştiriler.' },
  { value: 'fotografya', label: '📸 Fotoğraf & Görsel Seri', desc: 'Öyküsü olan fotoğraf serileri ve özgün illüstrasyonlar.' },
  { value: 'diger', label: '✨ Diğer', desc: 'Genel iletişim, öneri veya başka bir tür.' },
]

const STEPS = [
  { num: '01', title: 'E-postanı Hazırla', desc: 'Eserini, bilgilerini ve varsa dosya bağlantını rehbere göre derle.' },
  { num: '02', title: 'Doğrudan İlet', desc: 'Başvurunu resmi e-posta adresimize bir tıkla gönder.' },
  { num: '03', title: '7 Günde Yanıt', desc: 'Yayın kurulumuz her başvuruyu özenle inceler ve dönüş yapar.' },
]

export default function Iletisim({ user, isAdmin }) {
  const { settings } = useSiteContent()
  const [copied, setCopied] = useState(false)

  const targetEmail = settings.contact_email || 'hello@cilekdergisi.com'

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(targetEmail)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent('Çilek Dergisi Başvurusu — [Adınız / Eser Başlığı]')}&body=${encodeURIComponent(
`Merhaba Çilek Dergisi Ekibi,

Çilek Dergisi'ne göndermek istediğim çalışmamın detayları aşağıdadır:

1. Adım ve Soyadım: 
2. Yaşım: 
3. Eserimin Başlığı: 
4. Eserimin Türü (Deneme, Şiir, İnceleme, Görsel vb.): 

Eser Metnim / Google Drive ya da Portfolyo Linkim:
[Lütfen metninizi buraya yapıştırın veya dosya linkinizi ekleyin]

Kısa Biyografim:
[Kendinizden kısaca bahsedin]

İyi çalışmalar dilerim!`
  )}`

  return (
    <Layout user={user} isAdmin={isAdmin}>
      <div className="submit-v2-page">

        {/* ── Sayfa Başlığı ─────────────────────────────────────────── */}
        <header className="submit-v2-header">
          <div className="container submit-v2-header-inner">
            <span className="eyebrow-cilek">{settings.contact_eyebrow || 'Açık Başvuru'}</span>
            <h1 className="submit-v2-title">
              {settings.contact_title || 'Bize Yazın!'}
            </h1>
            <p className="submit-v2-subtitle">
              {settings.contact_subtitle || 'Çilek Dergisi, 15–25 yaş arası tüm bağımsız üreticilere kapılarını sonuna kadar açıyor! Kaleme aldığın yazınla, illüstrasyonunla veya fotoğraflarınla aramıza katıl!'}
            </p>
          </div>
        </header>

        <div className="container submit-v2-body">

          {/* ── Süreç Adımları ────────────────────────────────────────── */}
          <section className="submit-v2-steps" aria-label="Başvuru Süreci">
            {STEPS.map((step) => (
              <div key={step.num} className="submit-v2-step">
                <span className="submit-v2-step-num">{step.num}</span>
                <strong className="submit-v2-step-title">{step.title}</strong>
                <p className="submit-v2-step-desc">{step.desc}</p>
              </div>
            ))}
          </section>

          {/* ── Ana İçerik: Rehber + E-posta Başvuru Alanı ─────────────── */}
          <div className="submit-v2-layout">

            {/* Sol: Kategori rehberi */}
            <aside className="submit-v2-guide">
              <div className="submit-v2-guide-card">
                <div className="submit-v2-guide-badge">
                  <span>🍓 AÇIK BAŞVURU REHBERİ</span>
                </div>

                <h2 className="submit-v2-guide-title">Neler Gönderebilirsin?</h2>
                <p className="submit-v2-guide-intro">
                  15–25 yaş aralığındaki tüm bağımsız üreticilere alan açıyoruz:
                </p>

                <div className="submit-v2-categories">
                  {CATEGORIES.map((cat) => (
                    <div key={cat.value} className="submit-v2-cat-item">
                      <span className="submit-v2-cat-label">{cat.label}</span>
                      <p className="submit-v2-cat-desc">{cat.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="submit-v2-guide-mail">
                  <span>Resmi E-posta Adresi:</span>
                  <a href={`mailto:${targetEmail}`}>
                    {targetEmail}
                  </a>
                  {settings.contact_phone && (
                    <div style={{ marginTop: '0.4rem', fontSize: '0.85rem' }}>
                      <span>Telefon: </span><strong>{settings.contact_phone}</strong>
                    </div>
                  )}
                  {settings.contact_address && (
                    <div style={{ marginTop: '0.3rem', fontSize: '0.85rem' }}>
                      <span>Adres: </span><span>{settings.contact_address}</span>
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Sağ: E-posta Yönlendirme ve Bilgilendirme Kutusu */}
            <div className="submit-v2-form-wrap">
              <div className="submit-v2-email-box">
                <div className="submit-v2-email-header">
                  <span className="submit-v2-email-tag">✉️ EDİTÖR MASASI</span>
                  <h2 className="submit-v2-form-title">Eserini E-posta ile Gönder</h2>
                  <p className="submit-v2-form-sub">
                    Yayın kurulumuz başvuruları doğrudan editöryal e-posta kutumuz üzerinden kabul etmektedir.
                  </p>
                </div>

                {/* E-posta Adresi Kartı & Kopyalama */}
                <div className="submit-email-display-card">
                  <div className="submit-email-addr-text">
                    <span className="submit-email-label">Başvuru E-posta Adresimiz</span>
                    <strong className="submit-email-value">{targetEmail}</strong>
                  </div>
                  <div className="submit-email-buttons">
                    <button
                      type="button"
                      className="submit-email-copy-btn"
                      onClick={handleCopyEmail}
                      id="btn-copy-submission-email"
                      aria-label="E-posta adresini panoya kopyala"
                    >
                      {copied ? 'Kopyalandı! ✓' : 'Adresi Kopyala 📋'}
                    </button>
                    <a
                      href={mailtoUrl}
                      className="submit-email-mailto-btn"
                      id="btn-open-mailto"
                      title="E-posta uygulamasını aç"
                    >
                      E-posta Uygulamasında Aç ↗
                    </a>
                  </div>
                </div>

                {/* E-postada Yer Alması Gereken Bilgiler Rehberi */}
                <div className="submit-checklist-card">
                  <h3 className="submit-checklist-title">
                    📋 E-postana Neleri Eklemelisin?
                  </h3>
                  <ul className="submit-checklist-list">
                    <li>
                      <span className="chk-num">1</span>
                      <div>
                        <strong>Adın, Soyadın ve Yaşın:</strong>
                        <p>15–25 yaş aralığındaki üreticilere alan açtığımız için yaşını belirtmeni rica ediyoruz.</p>
                      </div>
                    </li>
                    <li>
                      <span className="chk-num">2</span>
                      <div>
                        <strong>Eserinin Başlığı ve Türü:</strong>
                        <p>Örn: Deneme, Şiir, Kültür/Sanat İncelemesi, Fotoğraf Serisi ya da İllüstrasyon.</p>
                      </div>
                    </li>
                    <li>
                      <span className="chk-num">3</span>
                      <div>
                        <strong>Eser Metni veya İndirme/Drive Bağlantısı:</strong>
                        <p>Yazını doğrudan e-posta gövdesine yapıştırabilir; yüksek çözünürlüklü görseller veya geniş metinler için Google Drive / WeTransfer bağlantısı ekleyebilirsin.</p>
                      </div>
                    </li>
                    <li>
                      <span className="chk-num">4</span>
                      <div>
                        <strong>Kısa Yazar / Sanatçı Biyografisi:</strong>
                        <p>Seni daha yakından tanımamız ve dergide yer verebilmemiz için 2–3 cümlelik samimi bir tanıtım.</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Bilgilendirme Notu */}
                <div className="submit-notice-banner">
                  <span className="submit-notice-icon">⏳</span>
                  <div className="submit-notice-text">
                    <strong>Değerlendirme Süreci:</strong>
                    <p>
                      Gönderdiğin her başvuru yayın kurulumuzca titizlikle değerlendirilir. En geç <strong>7 iş günü</strong> içinde e-posta adresine mutlaka geri dönüş yapılır.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  )
}
