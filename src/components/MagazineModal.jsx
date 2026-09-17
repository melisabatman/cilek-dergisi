import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// PDF indirmek için kullanıcı girişi zorunludur (varsayılan: true)
const PDF_REQUIRE_LOGIN = import.meta.env.VITE_PDF_REQUIRE_LOGIN !== 'false'

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function MagazineModal({ magazine, user, onClose }) {
  const navigate  = useNavigate()
  const closeRef  = useRef(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleDownloadClick = (e) => {
    if (PDF_REQUIRE_LOGIN && !user) {
      e.preventDefault()
      onClose()
      navigate(`/auth?mode=register&reason=pdf&redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    if (!magazine.pdf_url) {
      e.preventDefault()
      alert('Bu sayının PDF dosyası henüz yüklenmemiş veya hazırlanıyor.')
    }
  }

  const fileName = magazine.pdf_url
    ? (magazine.title ? `${magazine.title.replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ]/g, '_')}.pdf` : 'cilek_dergisi.pdf')
    : undefined

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-box">
        {/* Sol Kolon: Kapak Görseli */}
        <div className="modal-cover-col">
          <button
            ref={closeRef}
            className="modal-close"
            onClick={onClose}
            aria-label="Kapat"
            id="btn-modal-close"
          >
            ✕
          </button>
          {magazine.cover_image_url ? (
            <img
              src={magazine.cover_image_url}
              alt={`${magazine.title} kapağı`}
              className="modal-cover-image"
            />
          ) : (
            <div className="modal-cover-ph" aria-hidden="true">
              <span className="ph-e">🍓</span>
              <span className="ph-t">Çilek Dergisi</span>
              {magazine.issue_number && (
                <span className="ph-issue">Sayı #{magazine.issue_number}</span>
              )}
            </div>
          )}
        </div>

        {/* Sağ Kolon: Detaylar & İçindekiler */}
        <div className="modal-content-col">
          <div>
            <div className="modal-tag-row">
              <span className="modal-eyebrow">Bağımsız Dijital Yayın</span>
              {magazine.issue_number && (
                <span className="modal-issue-badge">Sayı #{magazine.issue_number}</span>
              )}
            </div>
            <h2 className="modal-title" id="modal-title">{magazine.title}</h2>
            <div className="modal-div" aria-hidden="true" />
          </div>

          {magazine.description && (
            <p className="modal-desc">{magazine.description}</p>
          )}

          {magazine.published_date && (
            <p className="modal-date">
              <span>📅</span> Yayın Tarihi: {formatDate(magazine.published_date)}
            </p>
          )}

          {/* Dinamik İçindekiler (TOC) Bölümü */}
          {Array.isArray(magazine.toc) && magazine.toc.length > 0 && (
            <div className="modal-toc-section">
              <h4 className="modal-toc-heading">Bu Sayıda Neler Var? (İçindekiler)</h4>
              <ul className="modal-toc-list">
                {magazine.toc.map((item, idx) => (
                  <li key={idx} className="modal-toc-item">
                    <span className="toc-bullet" aria-hidden="true">🍓</span>
                    <span className="toc-text">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Giriş Zorunluluğu Bilgilendirmesi */}
          {PDF_REQUIRE_LOGIN && !user && (
            <div className="modal-login-required-notice" role="note">
              <span className="notice-lock-icon" aria-hidden="true">🔒</span>
              <p>
                Bu sayıyı PDF olarak indirmek ve tam erişim sağlamak için <strong>ücretsiz kayıt olmanız veya giriş yapmanız</strong> gerekmektedir.
              </p>
            </div>
          )}

          {/* Alt Butonlar */}
          <div className="modal-actions mt-auto">
            {/* 1. Sitede Kitap Olarak Oku (Birincil Deneyim) */}
            <button
              type="button"
              className="btn btn-primary btn-modal-read-book"
              onClick={() => {
                onClose()
                navigate(`/oku/${magazine.id || magazine.issue_number || 1}`)
              }}
              id="btn-modal-open-reader"
            >
              <span aria-hidden="true">📖</span> Sitede Kitap Olarak Oku (Sayfaları Çevir) →
            </button>

            {/* 2. PDF İndir (İkincil İndirme Bağlantısı) */}
            <div className="modal-sub-actions">
              {magazine.pdf_url ? (
                <a
                  href={magazine.pdf_url}
                  download={fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-modal-pdf-download"
                  onClick={handleDownloadClick}
                  id="btn-modal-read-download"
                >
                  {PDF_REQUIRE_LOGIN && !user ? (
                    <><span aria-hidden="true">🔒</span> Giriş Yap &amp; PDF İndir</>
                  ) : (
                    <><span aria-hidden="true">⬇</span> PDF Olarak İndir</>
                  )}
                </a>
              ) : (
                <span className="modal-pdf-notice">📑 PDF Yayına Hazırlanıyor</span>
              )}

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onClose}
                id="btn-modal-cancel"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
