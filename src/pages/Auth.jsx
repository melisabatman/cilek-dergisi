import React, { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { supabase, translateAuthError, checkIsAdmin } from '../lib/supabase'

export default function Auth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTarget = searchParams.get('redirect')
  const reason = searchParams.get('reason')

  // 'register' (varsayılan) veya 'login' veya 'forgot'
  const [mode, setMode] = useState(searchParams.get('mode') === 'login' ? 'login' : 'register')

  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [passConfirm, setPassConfirm] = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    clearMessages()
    if (!email.trim() || !password) {
      setError('Lütfen e-posta adresinizi ve şifrenizi girin.')
      return
    }
    setLoading(true)
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      setLoading(false)
      if (err) {
        setError(translateAuthError(err.message))
        return
      }
      // Başarılı giriş sonrası yönlendirme
      if (redirectTarget) {
        navigate(redirectTarget)
        return
      }
      const isUserAdmin = await checkIsAdmin(data?.user)
      if (isUserAdmin) {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      setLoading(false)
      setError(translateAuthError(err?.message || ''))
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    clearMessages()
    if (!email.trim()) {
      setError('Lütfen geçerli bir e-posta adresi girin.')
      return
    }
    if (password !== passConfirm) {
      setError('Şifreler birbiriyle eşleşmiyor.')
      return
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.')
      return
    }
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.signUp({ email: email.trim(), password })
      setLoading(false)
      if (err) {
        setError(translateAuthError(err.message))
        return
      }
      setSuccess('Kayıt başarıyla oluşturuldu! Aramıza hoş geldin mektubuna yönlendiriliyorsun… 💌')
      setTimeout(() => {
        navigate('/?welcome=true')
      }, 1000)
    } catch (err) {
      setLoading(false)
      setError(translateAuthError(err?.message || ''))
    }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    clearMessages()
    if (!email) {
      setError('Lütfen e-posta adresini gir.')
      return
    }
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    })
    setLoading(false)
    if (err) {
      setError(translateAuthError(err.message))
      return
    }
    setSuccess('Şifre sıfırlama bağlantısı e-posta adresine gönderildi.')
  }

  return (
    <div className="auth-luxury-page" role="main">
      {/* Üstte Ana Sayfaya Dönüş */}
      <Link to="/" className="auth-back-link" id="auth-back-home">
        ← Çilek Dergisi Ana Sayfası
      </Link>

      {/* Oval Köşeli, İkiye Bölünmüş Luxury Kart */}
      <div className={`auth-luxury-card ${mode === 'login' ? 'is-login-mode' : 'is-register-mode'}`}>
        
        {/* BİRİNCİ YARI: FORM ALANI (KAYIT OL veya GİRİŞ YAP) */}
        <div className="auth-form-side">
          <div className="auth-form-inner">
            
            {/* Mobilde Üstte Kompakt ve Şık Marka Başlığı & Sekmeler */}
            <div className="auth-mobile-header" aria-hidden="true">
              <div className="auth-mobile-brand">
                <img
                  src="/icons/cilek-vintage.png"
                  alt="Çilek Dergisi"
                  className="auth-mobile-logo"
                />
                <span className="auth-mobile-brand-title">Çilek Dergisi</span>
              </div>
            </div>

            {/* Giriş Yap / Kayıt Ol Hızlı Sekme Geçişi */}
            {mode !== 'forgot' && (
              <div className="auth-segmented-switch" role="tablist" aria-label="Giriş veya Kayıt Seçimi">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'login'}
                  className={`auth-segment-btn ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => { setMode('login'); clearMessages(); }}
                  id="tab-mode-login"
                >
                  Giriş Yap
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'register'}
                  className={`auth-segment-btn ${mode === 'register' ? 'active' : ''}`}
                  onClick={() => { setMode('register'); clearMessages(); }}
                  id="tab-mode-register"
                >
                  Kayıt Ol
                </button>
              </div>
            )}
            
            {reason === 'pdf' && (
              <div className="auth-reason-banner">
                <span className="reason-icon">🔒</span>
                <div>
                  <strong>PDF İndirmek İçin Giriş / Kayıt</strong>
                  <p>Çilek Dergisi sayılarını indirmek ve okumak için lütfen giriş yapın veya ücretsiz kayıt olun.</p>
                </div>
              </div>
            )}

            {mode === 'forgot' ? (
              <>
                <div className="auth-header-block">
                  <span className="auth-tag-pill">Hesap Kurtarma</span>
                  <h2 className="auth-luxury-title">Şifremi Unuttum</h2>
                  <p className="auth-luxury-subtitle">
                    E-posta adresini gir, sana şifre yenileme bağlantısı gönderelim.
                  </p>
                </div>

                <form className="luxury-form" onSubmit={handleForgot} noValidate>
                  <div className="luxury-input-group">
                    <label htmlFor="f-email" className="luxury-label">E-posta Adresi</label>
                    <input
                      id="f-email"
                      type="email"
                      className="luxury-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@cilekdergisi.com"
                      required
                    />
                  </div>

                  {error && <p className="auth-msg error" role="alert">{error}</p>}
                  {success && <p className="auth-msg success" role="status">{success}</p>}

                  <button
                    type="submit"
                    className="btn-luxury-submit"
                    disabled={loading}
                    id="btn-forgot-submit"
                  >
                    {loading ? 'Gönderiliyor…' : 'Sıfırlama Linki Gönder'}
                  </button>

                  <button
                    type="button"
                    className="btn-text-action"
                    onClick={() => { setMode('login'); clearMessages(); }}
                  >
                    ← Giriş Ekranına Dön
                  </button>
                </form>
              </>
            ) : mode === 'register' ? (
              /* KAYIT OLMA YERİ */
              <>
                <div className="auth-header-block">
                  <span className="auth-tag-pill">Aramıza Katıl</span>
                  <h2 className="auth-luxury-title">Hesap Oluştur</h2>
                  <p className="auth-luxury-subtitle">
                    Çilek Dergisi'nin bağımsız sayfalarında sen de yerini al.
                  </p>
                </div>

                <form className="luxury-form" onSubmit={handleRegister} id="form-register" noValidate>
                  <div className="luxury-input-group">
                    <label htmlFor="r-email" className="luxury-label">E-posta Adresin</label>
                    <input
                      id="r-email"
                      type="email"
                      className="luxury-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@cilekdergisi.com"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="luxury-input-group">
                    <label htmlFor="r-pass" className="luxury-label">Şifre</label>
                    <input
                      id="r-pass"
                      type="password"
                      className="luxury-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="En az 6 karakter"
                      required
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="luxury-input-group">
                    <label htmlFor="r-pass2" className="luxury-label">Şifre Tekrar</label>
                    <input
                      id="r-pass2"
                      type="password"
                      className="luxury-input"
                      value={passConfirm}
                      onChange={(e) => setPassConfirm(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                    />
                  </div>

                  {error && <p className="auth-msg error" role="alert">{error}</p>}
                  {success && <p className="auth-msg success" role="status">{success}</p>}

                  <button
                    type="submit"
                    className="btn-luxury-submit"
                    disabled={loading}
                    id="btn-register-submit"
                  >
                    {loading ? 'Kayıt Yapılıyor…' : 'Kayıt Ol'}
                  </button>

                  <div className="mobile-toggle-hint">
                    <span>Zaten bir hesabın var mı?</span>
                    <button
                      type="button"
                      className="btn-inline-link"
                      onClick={() => { setMode('login'); clearMessages(); }}
                    >
                      Giriş Yap
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* GİRİŞ YAPMA YERİ */
              <>
                <div className="auth-header-block">
                  <span className="auth-tag-pill">Okuyucu Girişi</span>
                  <h2 className="auth-luxury-title">Giriş Yap</h2>
                  <p className="auth-luxury-subtitle">
                    Hesabına giriş yap ve tüm sayılara hemen eriş.
                  </p>
                </div>

                <form className="luxury-form" onSubmit={handleLogin} id="form-login" noValidate>
                  <div className="luxury-input-group">
                    <label htmlFor="l-email" className="luxury-label">E-posta Adresin</label>
                    <input
                      id="l-email"
                      type="email"
                      className="luxury-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@cilekdergisi.com"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="luxury-input-group">
                    <div className="label-row-between">
                      <label htmlFor="l-pass" className="luxury-label">Şifre</label>
                      <button
                        type="button"
                        className="auth-forgot-link"
                        onClick={() => { setMode('forgot'); clearMessages(); }}
                        id="btn-forgot"
                      >
                        Şifremi unuttum
                      </button>
                    </div>
                    <input
                      id="l-pass"
                      type="password"
                      className="luxury-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  {error && <p className="auth-msg error" role="alert">{error}</p>}

                  <button
                    type="submit"
                    className="btn-luxury-submit"
                    disabled={loading}
                    id="btn-login-submit"
                  >
                    {loading ? 'Giriş Yapılıyor…' : 'Giriş Yap'}
                  </button>

                  <div className="mobile-toggle-hint">
                    <span>Henüz hesabın yok mu?</span>
                    <button
                      type="button"
                      className="btn-inline-link"
                      onClick={() => { setMode('register'); clearMessages(); }}
                    >
                      Kayıt Ol
                    </button>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>

        {/* İKİNCİ YARI: DÜZ RENKTE ÇİLEK DERGİSİNE YENİDEN HOŞ GELDİN ALANI */}
        <div className="auth-banner-side">
          <div className="auth-banner-content">
            <div className="auth-strawberry-badge" aria-hidden="true">
              <img
                src="/icons/cilek-vintage.png"
                alt="Çilek Dergisi İllüstrasyonu"
                className="auth-strawberry-img"
              />
            </div>
            
            {mode === 'register' ? (
              <>
                <h2 className="auth-banner-title">
                  Çilek dergisine<br />yeniden hoş geldin
                </h2>
                <p className="auth-banner-desc">
                  Zaten bir hesabın var mı? Sayfaların, notların ve okuma listelerin seni bekliyor.
                </p>
                <button
                  type="button"
                  className="btn-banner-action"
                  onClick={() => { setMode('login'); clearMessages(); }}
                  id="btn-switch-to-login"
                >
                  Giriş Yap <span>→</span>
                </button>
              </>
            ) : (
              <>
                <h2 className="auth-banner-title">
                  Çilek dergisine<br />hoş geldin
                </h2>
                <p className="auth-banner-desc">
                  Henüz aramızda değil misin? Bağımsız, özgür ve samimi bir topluluğa katılmak için hemen kayıt ol.
                </p>
                <button
                  type="button"
                  className="btn-banner-action"
                  onClick={() => { setMode('register'); clearMessages(); }}
                  id="btn-switch-to-register"
                >
                  Kayıt Ol <span>→</span>
                </button>
              </>
            )}

            <div className="auth-banner-footer">
              <span>Bağımsız Dijital Yayıncılık</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
