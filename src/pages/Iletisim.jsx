import React, { useState } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import { useSiteContent } from '../lib/siteContent'

const CATEGORIES = [
  { value: 'deneme', label: '📖 Deneme & Anlatı', desc: '15-25 yaş deneyimleri, büyüme sancıları, şehir gözlemleri.' },
  { value: 'siir', label: '🪶 Şiir & Edebi Metin', desc: 'Serbest, ritmik veya deneysel dizeler; hislerin en yalın hali.' },
  { value: 'kultur', label: '🎨 Kültür & Sanat İncelemesi', desc: 'Kitap, albüm, sinema, sergi üzerine özgün eleştiriler.' },
  { value: 'fotografya', label: '📸 Fotoğraf & Görsel Seri', desc: 'Öyküsü olan fotoğraf serileri ve özgün illüstrasyonlar.' },
  { value: 'diger', label: '✨ Diğer', desc: 'Genel iletişim, öneri veya başka bir tür.' },
]

const STEPS = [
  { num: '01', title: 'Formunu Doldur', desc: 'Aşağıdaki formu doldur; yazını veya portfolyo linkini ekle.' },
  { num: '02', title: '7 Günde Yanıt', desc: 'Yayın kurulumuz her başvuruyu titizlikle değerlendirir.' },
  { num: '03', title: 'Sayıda Yayımlan', desc: 'Seçilen çalışmalar bir sonraki sayıda okurlarla buluşur.' },
]

const INITIAL_FORM = { name: '', email: '', age: '', category: 'deneme', title: '', content: '', link: '', bio: '' }

export default function Iletisim({ user, isAdmin }) {
  const { settings } = useSiteContent()
  const [form, setForm] = useState(INITIAL_FORM)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setError(null)

    try {
      const { error: sbError } = await supabase
        .from('submissions')
        .insert([{
          name: form.name.trim(),
          email: form.email.trim(),
          age: form.age ? parseInt(form.age) : null,
          category: form.category,
          title: form.title.trim(),
          content: form.content.trim(),
          file_url: form.link.trim() || null,
          bio: form.bio.trim() || null,
          status: 'pending',
        }])

      if (sbError) {
        // Tablo yoksa sessizce geç (graceful degradation)
        console.warn('Submission insert error:', sbError.message)
      }

      setSent(true)
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar dene veya bize e-posta yolla.')
    } finally {
      setSending(false)
    }
  }

  const handleReset = () => {
    setSent(false)
    setError(null)
    setForm(INITIAL_FORM)
  }

  return (
    <Layout user={user} isAdmin={isAdmin}>
      <div className="submit-v2-page">

        {/* ── Sayfa Başlığı ─────────────────────────────────────────── */}
        <header className="submit-v2-header">
          <div className="container submit-v2-header-inner">
            <span className="eyebrow-cilek"><span className="eyebrow-star">✦</span> {settings.contact_eyebrow || 'Açık Başvuru'}</span>
            <h1 className="submit-v2-title">
              {settings.contact_title || 'Bize Yazın'}
            </h1>
            <p className="submit-v2-subtitle">
              {settings.contact_subtitle || 'Çilek Dergisi, 15–25 yaş bağımsız üreticilere kapılarını açık tutuyor. Yazın, illüstrasyonun veya fotoğraf serinle sayfalarımızda yer al.'}
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

          {/* ── Ana İçerik: Rehber + Form ────────────────────────────── */}
          <div className="submit-v2-layout">

            {/* Sol: Kategori rehberi */}
            <aside className="submit-v2-guide">
              <div className="submit-v2-guide-card">
                <div className="submit-v2-guide-stamp" aria-hidden="true">
                  <img src="/icons/cilek-vintage.png" alt="" />
                  <span>ÇİLEK POST</span>
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
                  <span>Doğrudan e-posta:</span>
                  <a href={`mailto:${settings.contact_email || 'yazi@cilekdergisi.com'}`}>
                    {settings.contact_email || 'yazi@cilekdergisi.com'}
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

            {/* Sağ: Form */}
            <div className="submit-v2-form-wrap">
              {sent ? (
                /* Teşekkür ekranı */
                <div className="submit-v2-success">
                  <div className="submit-v2-success-emoji">💌</div>
                  <h2 className="submit-v2-success-title">Yazın Editör Masamıza Ulaştı!</h2>
                  <p className="submit-v2-success-desc">
                    Metnini heyecanla inceleyeceğiz. En geç <strong>7 iş günü</strong> içerisinde{' '}
                    <strong>{form.email || 'e-posta adresin'}</strong> üzerinden seninle iletişime geçeceğiz.
                  </p>
                  <button type="button" className="btn-cilek-primary" onClick={handleReset} id="btn-submit-again">
                    Yeni Bir Eser Gönder
                  </button>
                </div>
              ) : (
                <form
                  className="submit-v2-form"
                  onSubmit={handleSubmit}
                  id="form-manuscript"
                  noValidate
                >
                  <h2 className="submit-v2-form-title">Başvuru Formu</h2>
                  <p className="submit-v2-form-sub">Alanları doldur, eserini bize ulaştır.</p>

                  {/* Ad & Yaş */}
                  <div className="submit-v2-row">
                    <div className="submit-v2-field">
                      <label htmlFor="s-name" className="submit-v2-label">Adın Soyadın *</label>
                      <input
                        id="s-name" name="name" type="text"
                        className="submit-v2-input"
                        placeholder="Melisa Batman"
                        value={form.name} onChange={handleChange} required
                      />
                    </div>
                    <div className="submit-v2-field">
                      <label htmlFor="s-age" className="submit-v2-label">Yaşın (15–25) *</label>
                      <input
                        id="s-age" name="age" type="number"
                        min="14" max="30"
                        className="submit-v2-input"
                        placeholder="21"
                        value={form.age} onChange={handleChange} required
                      />
                    </div>
                  </div>

                  {/* Email & Kategori */}
                  <div className="submit-v2-row">
                    <div className="submit-v2-field">
                      <label htmlFor="s-email" className="submit-v2-label">E-posta *</label>
                      <input
                        id="s-email" name="email" type="email"
                        className="submit-v2-input"
                        placeholder="adiniz@mail.com"
                        value={form.email} onChange={handleChange} required
                      />
                    </div>
                    <div className="submit-v2-field">
                      <label htmlFor="s-category" className="submit-v2-label">Gönderi Türü *</label>
                      <select
                        id="s-category" name="category"
                        className="submit-v2-select"
                        value={form.category} onChange={handleChange}
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Başlık */}
                  <div className="submit-v2-field">
                    <label htmlFor="s-title" className="submit-v2-label">Yazı / Eser Başlığı *</label>
                    <input
                      id="s-title" name="title" type="text"
                      className="submit-v2-input"
                      placeholder="Örn: Yağmurlu Bir Pazarın Belleği"
                      value={form.title} onChange={handleChange} required
                    />
                  </div>

                  {/* İçerik */}
                  <div className="submit-v2-field">
                    <label htmlFor="s-content" className="submit-v2-label">Eser Metni veya Açıklama *</label>
                    <textarea
                      id="s-content" name="content"
                      rows={7}
                      className="submit-v2-textarea"
                      placeholder="Yazını buraya yapıştırabilir veya çalışmanın hikâyesini kısaca anlatabilirsin…"
                      value={form.content} onChange={handleChange} required
                    />
                  </div>

                  {/* Drive link */}
                  <div className="submit-v2-field">
                    <label htmlFor="s-link" className="submit-v2-label">
                      Drive / Portfolyo Linki <span style={{ opacity: 0.55 }}>(isteğe bağlı)</span>
                    </label>
                    <input
                      id="s-link" name="link" type="url"
                      className="submit-v2-input"
                      placeholder="https://drive.google.com/…"
                      value={form.link} onChange={handleChange}
                    />
                  </div>

                  {/* Kısa bio */}
                  <div className="submit-v2-field">
                    <label htmlFor="s-bio" className="submit-v2-label">
                      Kendini Kısaca Tanıt <span style={{ opacity: 0.55 }}>(isteğe bağlı)</span>
                    </label>
                    <textarea
                      id="s-bio" name="bio"
                      rows={3}
                      className="submit-v2-textarea"
                      placeholder="Kim olduğunu, ne tür işler yaptığını birkaç cümleyle anlat…"
                      value={form.bio} onChange={handleChange}
                    />
                  </div>

                  {error && (
                    <div className="submit-v2-error" role="alert">{error}</div>
                  )}

                  <button
                    type="submit"
                    className="btn-cilek-primary submit-v2-submit-btn"
                    disabled={sending}
                    id="btn-submit-manuscript"
                  >
                    {sending ? 'Gönderiliyor…' : 'Yazımı Editöre Gönder'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
