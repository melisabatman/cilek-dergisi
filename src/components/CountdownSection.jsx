import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function calculateTimeLeft(targetDateStr) {
  if (!targetDateStr) {
    targetDateStr = '2026-12-01T12:00:00'
  }
  const target = new Date(targetDateStr).getTime()
  const now = Date.now()
  const diff = target - now

  if (isNaN(target) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isCompleted: true }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { days, hours, minutes, seconds, isCompleted: false }
}

export default function CountdownSection({ settings }) {
  const isActive = settings?.countdown_is_active !== false
  const targetDate = settings?.countdown_target_date || '2026-12-01T12:00:00'
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate))

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(targetDate))
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (!isActive) return null

  const badgeText = settings?.countdown_badge || 'BİR SONRAKİ SAYI GELİYOR'
  const titleText = settings?.countdown_title || 'Sayı 02 — Kök & Bahar İçin Geri Sayım!'
  const subtitleText = settings?.countdown_subtitle || 'Yeni sayımız matbaada hazırlanıyor; taptaze röportajlar, cesur denemeler ve nakış nakış işlenmiş sayfalarla çok yakında dijital raflarda!'
  const completedText = settings?.countdown_completed_text || 'Yeni sayımız hazır! Çok yakında dijital raflarda yerini alacak.'
  const btnText = settings?.countdown_btn_text || 'Bize Katıl / İçerik Gönder →'
  const btnLink = settings?.countdown_btn_link || '/iletisim'

  const timeUnits = [
    { label: 'GÜN', value: String(timeLeft.days).padStart(2, '0') },
    { label: 'SAAT', value: String(timeLeft.hours).padStart(2, '0') },
    { label: 'DAKİKA', value: String(timeLeft.minutes).padStart(2, '0') },
    { label: 'SANİYE', value: String(timeLeft.seconds).padStart(2, '0') },
  ]

  return (
    <section className="home-countdown-section" aria-label="Gelecek Sayı Geri Sayım Sayacı">
      <div className="container">
        <div className="home-countdown-inner">
          {/* Üst Rozet / Eyebrow */}
          <div className="countdown-eyebrow-wrap">
            <span className="countdown-eyebrow-badge">
              <span className="countdown-badge-icon" aria-hidden="true">🍓</span>
              {badgeText}
            </span>
          </div>

          {/* Başlık ve Açıklama */}
          <h2 className="countdown-main-title">{titleText}</h2>
          <p className="countdown-subtitle">{subtitleText}</p>

          {/* Geri Sayım Kutucukları veya Tamamlandı Mesajı */}
          {!timeLeft.isCompleted ? (
            <div className="countdown-timer-grid" role="timer" aria-live="polite">
              {timeUnits.map((unit, index) => (
                <div key={unit.label} className="countdown-digit-tile">
                  <div className="countdown-digit-card">
                    <span className="countdown-digit-number">{unit.value}</span>
                    <div className="countdown-card-fold" aria-hidden="true" />
                  </div>
                  <span className="countdown-unit-label">{unit.label}</span>
                  {index < timeUnits.length - 1 && (
                    <span className="countdown-colon-divider" aria-hidden="true">:</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="countdown-completed-banner">
              <span className="countdown-completed-icon">🎉</span>
              <p className="countdown-completed-msg">{completedText}</p>
            </div>
          )}

          {/* Aksiyon Çağrısı */}
          <div className="countdown-cta-wrap">
            <Link to={btnLink} className="countdown-action-btn">
              {btnText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
