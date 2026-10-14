import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSiteContent, DEFAULT_SITE_CONTENT } from '../lib/siteContent'

export default function WelcomePostcardModal({ isOpen, onClose, user }) {
  // 'sealed' (ip sarılı kartpostal) veya 'opened' (içinden çıkan mektup)
  const [stage, setStage] = useState('sealed')
  const [isUntying, setIsUntying] = useState(false)
  const navigate = useNavigate()
  const { content } = useSiteContent()
  const letterData = content?.letter || DEFAULT_SITE_CONTENT.letter

  useEffect(() => {
    if (isOpen) {
      setStage('sealed')
      setIsUntying(false)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Escape tuşu ile kapatma desteği
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleOpenLetter = () => {
    setIsUntying(true)
    setTimeout(() => {
      setStage('opened')
      setIsUntying(false)
    }, 700)
  }

  const handleStartExploring = () => {
    onClose()
    const showcaseElem = document.getElementById('cilek-journey-showcase')
    if (showcaseElem) {
      showcaseElem.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/dergiler')
    }
  }

  const recipientName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Sevgili Okur'
  const formattedSubtitle = (letterData.subtitle || 'Çilek Ailesine Aramıza Hoş Geldin Sevgili {name} 🍓').replace('{name}', recipientName)

  return (
    <div
      className="postcard-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Hoş Geldin Kartpostalı"
    >
      <div className="postcard-modal-container">
        
        {stage === 'sealed' ? (
          /* ==========================================================
             AŞAMA 1: İPLİ, MÜHÜRLÜ NOSTALJİK KARTPOSTAL / ZARF
             ========================================================== */
          <div className={`postcard-envelope-card ${isUntying ? 'is-untying' : ''}`}>
            
            {/* Hava Postası Kenar Deseni (Airmail Stripe) */}
            <div className="postcard-airmail-border" aria-hidden="true" />

            <div className="postcard-inner-layout">
              {/* Sol Üst: Kırılgan / Özenli Damgası */}
              <div className="postcard-stamp-fragile">
                <span className="fragile-icon">🏷️</span>
                <div className="fragile-text">
                  <strong>I'M FRAGILE!</strong>
                  <span>HANDLE WITH CARE</span>
                </div>
              </div>

              {/* Sağ Üst: Nostaljik Çilek Posta Pulları & Mühür */}
              <div className="postcard-postage-stamps">
                <div className="vintage-post-seal">
                  <div className="seal-round">
                    <span>ÇİLEK POST</span>
                    <small>★ 2026 ★</small>
                  </div>
                </div>
                <div className="postage-stamp-item stamp-berry">
                  <img src="/icons/cilek-vintage.png" alt="" className="stamp-icon" />
                  <span className="stamp-val">50 krş</span>
                </div>
              </div>

              {/* Orta İp & Fiyonk Detayı */}
              <div className="postcard-twine-ribbon" aria-hidden="true">
                <div className="twine-horizontal" />
                <div className="twine-vertical" />
                <div className="twine-center-bow">
                  <span className="bow-knot">🎀</span>
                </div>
              </div>

              {/* Sol Alt: Marka & Kalpli Etiket */}
              <div className="postcard-brand-block">
                <span className="ribbon-tag-pink">♥ WITH LOVE</span>
                <h3 className="postcard-brand-title">Çilek Dergisi</h3>
                <span className="postcard-brand-sub">{letterData.envelope_sub || 'Bağımsız Dijital Gençlik Yayını'}</span>
              </div>

              {/* Sağ Alt: Alıcı & Gönderici Adres Kartı */}
              <div className="postcard-address-label">
                <div className="address-row">
                  <span className="addr-badge">FROM:</span>
                  <span className="addr-val">{letterData.envelope_sender || 'Çilek Dergisi Editoryal Masası'}</span>
                </div>
                <div className="address-divider" />
                <div className="address-row">
                  <span className="addr-badge">TO:</span>
                  <span className="addr-val addr-recipient">{recipientName}</span>
                </div>
              </div>
            </div>

            {/* Zarfı Açma Eylemi & Kapatma Butonu */}
            <div className="postcard-action-footer">
              <button
                type="button"
                className="btn-capsule-glossy btn-capsule-green"
                onClick={handleOpenLetter}
                id="btn-open-welcome-letter"
              >
                <span>{letterData.button_open || 'Mektubu Aç ve Oku ✂️'}</span>
                <span className="capsule-arrow" aria-hidden="true">›</span>
              </button>
              <button
                type="button"
                className="postcard-dismiss-link"
                onClick={onClose}
                aria-label="Pencereyi Kapat"
              >
                Pencereyi Kapat
              </button>
            </div>

          </div>
        ) : (
          /* ==========================================================
             AŞAMA 2: ZARFTAN ÇIKAN ÖZEL HOŞ GELDİN MEKTUBU
             ========================================================== */
          <div className="postcard-letter-paper">
            
            {/* Çift Çerçeveli Vintage Kenarlık */}
            <div className="letter-decor-border" aria-hidden="true" />

            <div className="letter-header">
              <div className="letter-stamp-pill">
                <span className="letter-sparkle">✨</span>
                <span>{letterData.badge || 'ÖZEL ÇİLEK MEKTUBU'}</span>
              </div>
              <h2 className="letter-main-title">{letterData.title || 'THANK YOU SO MUCH!'}</h2>
              <p className="letter-subtitle">{formattedSubtitle}</p>
            </div>

            <div className="letter-body-content">
              {letterData.lead_quote && (
                <p className="letter-handwritten-lead">
                  {letterData.lead_quote}
                </p>
              )}
              
              <p className="letter-p">
                {letterData.body_paragraph}
              </p>

              {Array.isArray(letterData.perks) && letterData.perks.length > 0 && (
                <div className="letter-perks-box">
                  <h4 className="perks-title">{letterData.perks_title || 'Aramıza Katılarak Neler Kazandın?'}</h4>
                  <ul className="perks-list">
                    {letterData.perks.map((perk, pIdx) => (
                      <li key={pIdx}>
                        {perk.startsWith('📖') || perk.startsWith('💬') || perk.startsWith('✍️') || perk.startsWith('🔒') ? (
                          <span dangerouslySetInnerHTML={{
                            __html: perk
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          }} />
                        ) : (
                          <>🍓 {perk}</>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="letter-signoff">
                <p className="signoff-quote">{letterData.signoff_quote}</p>
                <span className="signoff-signature">{letterData.signoff_signature}</span>
              </div>
            </div>

            {/* Mektup Butonları */}
            <div className="letter-action-footer">
              <button
                type="button"
                className="btn-capsule-glossy btn-capsule-green"
                onClick={handleStartExploring}
                id="btn-explore-after-letter"
              >
                <span>{letterData.button_explore || 'Dergileri Keşfetmeye Başla'}</span>
                <span className="capsule-arrow" aria-hidden="true">›</span>
              </button>
              <button
                type="button"
                className="postcard-dismiss-link"
                onClick={onClose}
                aria-label="Pencereyi Kapat"
              >
                Pencereyi Kapat
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
