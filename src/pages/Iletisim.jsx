import React, { useState } from 'react'
import Layout from '../components/Layout'

const CONTACT_INFO = [
  { emoji:'📧', label:'E-posta',   value:<a href="mailto:hello@cilekdergisi.com">hello@cilekdergisi.com</a> },
  { emoji:'✍️', label:'Yazı Gönder', value:<a href="mailto:yazi@cilekdergisi.com">yazi@cilekdergisi.com</a> },
  { emoji:'📸', label:'Instagram', value:<a href="https://instagram.com/cilekdergisi" target="_blank" rel="noopener noreferrer">@cilekdergisi</a> },
  { emoji:'🎵', label:'TikTok',    value:<a href="https://tiktok.com/@cilekdergisi" target="_blank" rel="noopener noreferrer">@cilekdergisi</a> },
]

export default function Iletisim({ user, isAdmin }) {
  const [form, setForm]     = useState({ name:'', email:'', subject:'', message:'' })
  const [sent, setSent]     = useState(false)
  const [sending, setSending] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSending(true)
    // Simulate send (no backend yet — shows success state)
    await new Promise(r => setTimeout(r, 800))
    setSent(true)
    setSending(false)
    setForm({ name:'', email:'', subject:'', message:'' })
  }

  return (
    <Layout user={user} isAdmin={isAdmin}>
      {/* Banner */}
      <div className="page-banner">
        <p className="page-banner-pre">Bağlantı</p>
        <h1 className="page-banner-title">İletişim</h1>
        <p className="page-banner-sub">
          Seni dinliyoruz — yaz, sor, katıl.
        </p>
      </div>

      <section className="contact-section" aria-labelledby="contact-title">
        <div className="container" style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <header className="contact-header">
            <span className="contact-badge">Bağlantı Kur</span>
            <h2 className="contact-section-title" id="contact-title">Bize Ulaşın</h2>
            <p className="contact-section-sub">Soruların, önerilerin veya paylaşmak istediğin fikirler için buradayız.</p>
          </header>

          <div className="contact-split">
            {/* Info cards */}
            <div className="contact-info" role="list">
              {CONTACT_INFO.map(c => (
                <div className="contact-info-card" key={c.label} role="listitem">
                  <div className="ci-icon" aria-hidden="true">{c.emoji}</div>
                  <div>
                    <p className="ci-label">{c.label}</p>
                    <p className="ci-value">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact form */}
            <div className="contact-form-card">
              <h3 className="contact-form-title">Mesaj Gönder</h3>

              {sent ? (
                <div className="form-success" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.4rem', marginBottom: '0.8rem' }}>💌</div>
                  <h4 style={{ fontFamily: 'var(--font-luxury)', fontSize: '1.4rem', color: 'var(--burgundy)', marginBottom: '0.4rem' }}>
                    Mesajın Başarıyla İletildi!
                  </h4>
                  <p style={{ fontSize: '1rem', color: 'var(--text-dark)' }}>En kısa sürede seninle iletişime geçeceğiz.</p>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit} id="form-contact" noValidate>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label htmlFor="c-name" className="luxury-label">İsim *</label>
                      <input
                        id="c-name" name="name" className="form-input" type="text"
                        value={form.name} onChange={handleChange}
                        placeholder="Adın" required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="c-email" className="luxury-label">E-posta *</label>
                      <input
                        id="c-email" name="email" className="form-input" type="email"
                        value={form.email} onChange={handleChange}
                        placeholder="ornek@mail.com" required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label htmlFor="c-subject" className="luxury-label">Konu</label>
                    <input
                      id="c-subject" name="subject" className="form-input" type="text"
                      value={form.subject} onChange={handleChange}
                      placeholder="Ne hakkında yazıyorsun?"
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label htmlFor="c-message" className="luxury-label">Mesajın *</label>
                    <textarea
                      id="c-message" name="message" className="form-input"
                      rows={5} value={form.message} onChange={handleChange}
                      placeholder="Merhaba, derginizle ilgili…" required
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-luxury-submit"
                    disabled={sending}
                    id="btn-contact-submit"
                    style={{ marginTop: '1.2rem' }}
                  >
                    {sending ? 'Gönderiliyor…' : 'Mesajı Gönder →'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
