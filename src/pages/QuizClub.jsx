import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { QUIZZES, UPCOMING_QUIZZES, getEffectiveQuizzes, getEffectiveUpcomingQuizzes, resolveQuizImage, QUIZ_CHARACTER_MAP } from '../data/quizzesData'
import { useSiteContent } from '../lib/siteContent'

export default function QuizClub({ user, isAdmin }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { settings } = useSiteContent()

  // Admin panelinden kaydedilen özel testler varsa onları kullan, yoksa varsayılanları
  const allQuizzes = useMemo(() => getEffectiveQuizzes(settings?.quizzes_custom), [settings?.quizzes_custom])
  const upcomingList = useMemo(() => getEffectiveUpcomingQuizzes(settings?.upcoming_quizzes_custom), [settings?.upcoming_quizzes_custom])

  // Seçili test
  const activeQuiz = useMemo(() => {
    if (!slug) return null
    return allQuizzes.find(q => q.slug === slug || q.id === slug) || null
  }, [slug, allQuizzes])

  // Test içi durumlar
  const [currentStep, setCurrentStep] = useState('intro') // 'intro' | 'question' | 'result'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState([]) // Array of selected option objects
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null)
  const [finalResult, setFinalResult] = useState(null)
  const [copied, setCopied] = useState(false)

  // Sayfa veya slug değiştiğinde sıfırla
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (activeQuiz) {
      setCurrentStep('intro')
      setCurrentQuestionIndex(0)
      setUserAnswers([])
      setSelectedOptionIndex(null)
      setFinalResult(null)
    } else {
      setCurrentStep('list')
    }
  }, [slug, activeQuiz])

  // Teste başla
  const handleStartQuiz = () => {
    setCurrentStep('question')
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setSelectedOptionIndex(null)
    setFinalResult(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Seçenek seçildiğinde
  const handleSelectOption = (option, optIdx) => {
    if (selectedOptionIndex !== null) return // Çift tıklamayı önle
    setSelectedOptionIndex(optIdx)

    const updatedAnswers = [...userAnswers]
    updatedAnswers[currentQuestionIndex] = option

    setTimeout(() => {
      setUserAnswers(updatedAnswers)
      setSelectedOptionIndex(null)

      if (currentQuestionIndex + 1 < activeQuiz.questions.length) {
        setCurrentQuestionIndex(prev => prev + 1)
        window.scrollTo({ top: 200, behavior: 'smooth' })
      } else {
        // Test bitti -> Sonucu hesapla
        calculateResult(updatedAnswers)
      }
    }, 280)
  }

  // Önceki soruya dön
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setSelectedOptionIndex(null)
    }
  }

  // Sonuç Hesaplama (En yüksek puanlı karakteri/estetiği bul)
  const calculateResult = (answers) => {
    const scores = {}
    Object.keys(activeQuiz.results).forEach(key => {
      scores[key] = 0
    })

    answers.forEach(ans => {
      if (ans && ans.scores) {
        Object.entries(ans.scores).forEach(([key, val]) => {
          scores[key] = (scores[key] || 0) + val
        })
      }
    })

    // En yüksek puanlı sonucu bul
    let topResultKey = Object.keys(activeQuiz.results)[0]
    let maxScore = -1

    Object.entries(scores).forEach(([key, score]) => {
      if (score > maxScore) {
        maxScore = score
        topResultKey = key
      }
    })

    const resultObj = activeQuiz.results[topResultKey] || Object.values(activeQuiz.results)[0]
    setFinalResult(resultObj)
    setCurrentStep('result')
    window.scrollTo({ top: 120, behavior: 'smooth' })
  }

  // Testi yeniden çöz
  const handleRetakeQuiz = () => {
    handleStartQuiz()
  }

  // Paylaşım fonksiyonları
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.cilekdergi.com/testler'
  const shareText = finalResult && activeQuiz
    ? `Çilek Dergisi Quiz Club'da "${activeQuiz.title}" testini çözdüm ve sonucum: ${finalResult.name}! ✨ Sen de kendini keşfet:`
    : 'Çilek Dergisi Quiz Club testlerini hemen keşfet!'

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeQuiz ? activeQuiz.title : 'Çilek Dergisi Quiz Club',
          text: shareText,
          url: shareUrl
        })
      } catch {
        // kullanıcı iptal ettiyse sessizce geç
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2400)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 2400)
    }
  }

  return (
    <Layout user={user} isAdmin={isAdmin}>
      <div className="quiz-club-page-wrapper">

        {/* ── ÜST KULÜP BANNER & BAŞLIK ────────────────────────── */}
        <header className="quiz-club-header">
          <div className="container">
            <div className="quiz-club-header-inner">
              <div className="quiz-club-stamp-wrap" aria-hidden="true">
                <span className="quiz-club-sparkle-deco">✦</span>
                <span className="quiz-club-pill-tag">ÇİLEK DERGİSİ ÖZEL KULÜBÜ</span>
                <span className="quiz-club-sparkle-deco">✦</span>
              </div>

              <h1 className="quiz-club-main-title">
                ÇİLEK <span className="title-serif-italic">QUIZ CLUB</span>
              </h1>

              <p className="quiz-club-subtitle">
                Kendini ne kadar tanıyorsun? Hadi birlikte keşfedelim!
              </p>

              <div className="quiz-club-divider-lace" aria-hidden="true">
                <span className="lace-circle" />
                <span className="lace-line" />
                <img src="/icons/cilek-vintage.png" alt="" className="lace-icon" />
                <span className="lace-line" />
                <span className="lace-circle" />
              </div>
            </div>
          </div>
        </header>

        {/* ── İÇERİK ALANI ─────────────────────────────────────── */}
        <main className="quiz-club-content">
          <div className="container">

            {/* DURUM 1: TEST LİSTESİ (ANASAYFA / /testler) ─── */}
            {(!activeQuiz || currentStep === 'list') && (
              <div className="quiz-club-home-view">

                {/* 3 Ana Test Kartı */}
                <section className="quiz-cards-grid-section" aria-label="Popüler Testler">
                  <div className="quiz-cards-grid">
                    {allQuizzes.map((quiz, idx) => (
                      <article key={quiz.id} className="quiz-card-item">
                        <div className="quiz-card-cover-wrap">
                          <img
                            src={resolveQuizImage(quiz.coverImage)}
                            alt={quiz.title}
                            className="quiz-card-cover-img"
                            loading="lazy"
                            onError={(e) => {
                              if (!e.target.dataset.triedFallback) {
                                e.target.dataset.triedFallback = 'true'
                                e.target.src = '/gossip-girl.jpg'
                              }
                            }}
                          />
                          <div className="quiz-card-cover-overlay" />
                          <span className="quiz-card-badge">{quiz.badge}</span>
                          <span className="quiz-card-time">{quiz.readingTime}</span>
                        </div>

                        <div className="quiz-card-body">
                          <span className="quiz-card-number">TEST #{String(idx + 1).padStart(2, '0')}</span>
                          <h2 className="quiz-card-title">{quiz.title}</h2>
                          <p className="quiz-card-desc">{quiz.subtitle || quiz.description}</p>

                          <div className="quiz-card-footer">
                            <span className="quiz-card-qcount">
                              🍓 {quiz.questionsCount} Özel Soru
                            </span>
                            <Link
                              to={`/testler/${quiz.slug}`}
                              className="btn-cilek-quiz-start"
                              id={`btn-start-${quiz.slug}`}
                            >
                              Testi Çöz →
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                {/* ── YAKINDA GELECEK BÖLÜMÜ ──────────────────── */}
                <section className="quiz-upcoming-section" aria-label="Yakında Gelecek Testler">
                  <div className="quiz-upcoming-card">
                    <div className="quiz-upcoming-stamp" aria-hidden="true">
                      <span>COMING SOON</span>
                    </div>

                    <span className="quiz-upcoming-eyebrow">
                      BİR DAKİKA, DAHA YENİ BAŞLIYORUZ!
                    </span>

                    <h2 className="quiz-upcoming-title">
                      YAKINDA YENİ TESTLER GELİYOR!
                    </h2>

                    <p className="quiz-upcoming-desc">
                      Yeni kişilik testleri, eğlenceli keşifler ve kendinle ilgili öğreneceğin daha birçok şey çok yakında!
                    </p>

                    {/* Yakında gelecek testler minyatür kartları */}
                    <div className="quiz-upcoming-previews-grid">
                      {upcomingList.map((item) => (
                        <div key={item.id} className="upcoming-preview-item">
                          <span className="upcoming-badge">{item.badge}</span>
                          <span className="upcoming-tag">{item.tag}</span>
                          <h3 className="upcoming-name">{item.title}</h3>
                          <p className="upcoming-snippet">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

              </div>
            )}

            {/* DURUM 2: AKTİF TEST GÖRÜNÜMÜ ───────────────────── */}
            {activeQuiz && (
              <div className="quiz-active-view-container">

                {/* Geri Dönüş Linki */}
                <div className="quiz-back-nav">
                  <Link to="/testler" className="btn-quiz-back-link">
                    ← Tüm Testlere Dön (Quiz Club)
                  </Link>
                </div>

                {/* 2.A: TEST BAŞLANGIÇ EKRANI (INTRO) ──────────── */}
                {currentStep === 'intro' && (
                  <div className="quiz-intro-card">
                    <div className="quiz-intro-media">
                      <img
                        src={resolveQuizImage(activeQuiz.coverImage)}
                        alt={activeQuiz.title}
                        className="quiz-intro-img"
                      />
                      <span className="quiz-intro-badge">{activeQuiz.badge}</span>
                    </div>

                    <div className="quiz-intro-content">
                      <span className="quiz-intro-kicker">ÇİLEK DERGİSİ ÖZEL TESTİ</span>
                      <h1 className="quiz-intro-title">{activeQuiz.title}</h1>
                      <p className="quiz-intro-subtitle">{activeQuiz.subtitle}</p>
                      <p className="quiz-intro-full-desc">{activeQuiz.description}</p>

                      <div className="quiz-intro-meta">
                        <div className="quiz-meta-pill">
                          <span>⏱ Süre:</span> <strong>{activeQuiz.readingTime}</strong>
                        </div>
                        <div className="quiz-meta-pill">
                          <span>✨ Soru Sayısı:</span> <strong>{activeQuiz.questions.length} Soru</strong>
                        </div>
                        <div className="quiz-meta-pill">
                          <span>🍓 Sonuç:</span> <strong>Detaylı Kişilik Profili</strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-quiz-primary-action"
                        onClick={handleStartQuiz}
                        id="btn-quiz-begin"
                      >
                        Hemen Teste Başla →
                      </button>
                    </div>
                  </div>
                )}

                {/* 2.B: SORU EKRANI (QUESTION STEPPER) ─────────── */}
                {currentStep === 'question' && activeQuiz.questions[currentQuestionIndex] && (
                  <div className="quiz-stepper-card">
                    {/* Üst İlerleme Çubuğu */}
                    <div className="quiz-progress-bar-wrap">
                      <div className="quiz-progress-info">
                        <span className="quiz-progress-label">
                          {activeQuiz.title}
                        </span>
                        <span className="quiz-progress-counter">
                          Soru {currentQuestionIndex + 1} / {activeQuiz.questions.length}
                        </span>
                      </div>
                      <div className="quiz-progress-track">
                        <div
                          className="quiz-progress-fill"
                          style={{
                            width: `${Math.round(((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100)}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Soru Başlığı */}
                    <div className="quiz-question-header">
                      <span className="quiz-question-number-pill">
                        Soru #{currentQuestionIndex + 1}
                      </span>
                      <h2 className="quiz-question-text">
                        {activeQuiz.questions[currentQuestionIndex].question}
                      </h2>
                    </div>

                    {/* Çoktan Seçmeli Seçenekler */}
                    <div className="quiz-options-list" role="radiogroup" aria-label="Cevap seçenekleri">
                      {activeQuiz.questions[currentQuestionIndex].options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx)
                        const isSelected = selectedOptionIndex === optIdx

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            className={`quiz-option-btn ${isSelected ? 'is-selected' : ''}`}
                            onClick={() => handleSelectOption(opt, optIdx)}
                          >
                            <span className="quiz-option-letter">{letter}</span>
                            <span className="quiz-option-text">{opt.text}</span>
                            <span className="quiz-option-check" aria-hidden="true">
                              {isSelected ? '✓' : '→'}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Alt Navigasyon (Geri Butonu) */}
                    <div className="quiz-stepper-footer">
                      {currentQuestionIndex > 0 ? (
                        <button
                          type="button"
                          className="btn-quiz-step-back"
                          onClick={handlePrevQuestion}
                        >
                          ← Önceki Soru
                        </button>
                      ) : (
                        <div />
                      )}
                      <span className="quiz-step-hint">
                        Bir cevaba dokunarak otomatik ilerleyin
                      </span>
                    </div>
                  </div>
                )}

                {/* 2.C: SONUÇ EKRANI (RESULT VIEW) ─────────────── */}
                {currentStep === 'result' && finalResult && (
                  <div className="quiz-result-card">
                    {/* Üst Kutlama Bandı */}
                    <div className="quiz-result-ribbon">
                      <span>✦ TESTİ TAMAMLADIN! İŞTE SENİN SONUCUN ✦</span>
                    </div>

                    <div className="quiz-result-grid">
                      {/* Sol / Üst: Sonuç Görseli ve Alıntı */}
                      <div className="quiz-result-visual-col">
                        <div className="quiz-result-polaroid">
                          <img
                            src={resolveQuizImage(finalResult.image, QUIZ_CHARACTER_MAP[finalResult.id])}
                            alt={finalResult.name}
                            className="quiz-result-img"
                            onError={(e) => {
                              if (!e.target.dataset.triedFallback) {
                                e.target.dataset.triedFallback = 'true'
                                e.target.src = QUIZ_CHARACTER_MAP[finalResult.id] || `/${finalResult.id}.jpg`
                              }
                            }}
                          />
                          <div className="quiz-result-polaroid-caption">
                            <strong className="caption-name">{finalResult.name}</strong>
                            <span className="caption-sub">{finalResult.role}</span>
                          </div>
                        </div>

                        {finalResult.quote && (
                          <blockquote className="quiz-result-quote">
                            {finalResult.quote}
                          </blockquote>
                        )}
                      </div>

                      {/* Sağ / Alt: Detaylı Açıklama & Karakter Analizi */}
                      <div className="quiz-result-content-col">
                        <span className="quiz-result-pretag">SENİN KARAKTER PROFİLİN</span>
                        <h2 className="quiz-result-title">{finalResult.name}</h2>
                        <p className="quiz-result-tagline">{finalResult.tagline || finalResult.role}</p>

                        <div className="quiz-result-traits-wrap">
                          {finalResult.traits?.map((trait, tIdx) => (
                            <span key={tIdx} className="quiz-trait-pill">
                              #{trait}
                            </span>
                          ))}
                        </div>

                        <div className="quiz-result-body">
                          <h3 className="result-section-label">Detaylı Kişilik Analizi</h3>
                          <p className="result-description-para">{finalResult.description}</p>

                          {finalResult.aesthetic && (
                            <div className="result-aesthetic-box">
                              <span className="aesthetic-title">✨ Senin Estetiğin:</span>
                              <p className="aesthetic-text">{finalResult.aesthetic}</p>
                            </div>
                          )}
                        </div>

                        {/* Paylaşım ve Aksiyon Butonları */}
                        <div className="quiz-result-actions">
                          <span className="share-prompt-label">Sonucunu Arkadaşlarınla Paylaş:</span>
                          <div className="share-buttons-group">
                            {/* WhatsApp */}
                            <a
                              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-share-social btn-share-wa"
                              title="WhatsApp'ta Paylaş"
                            >
                              <span>💬</span> WhatsApp'ta Paylaş
                            </a>

                            {/* X / Twitter */}
                            <a
                              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-share-social btn-share-tw"
                              title="X'te Paylaş"
                            >
                              <span>🕊</span> X'te Paylaş
                            </a>

                            {/* Bağlantıyı Kopyala */}
                            <button
                              type="button"
                              className="btn-share-social btn-share-copy"
                              onClick={handleNativeShare}
                            >
                              <span>{copied ? '✓' : '🔗'}</span>
                              {copied ? 'Kopyalandı!' : 'Sonucu Paylaş / Kopyala'}
                            </button>
                          </div>

                          <div className="result-nav-buttons">
                            <button
                              type="button"
                              className="btn-quiz-retake"
                              onClick={handleRetakeQuiz}
                            >
                              🔄 Testi Yeniden Çöz
                            </button>
                            <Link to="/testler" className="btn-quiz-all">
                              ✨ Diğer Testleri Keşfet
                            </Link>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Diğer Testler Öneri Şeridi */}
                    <div className="quiz-result-recommendations">
                      <span className="recom-title">Sıradaki Keşfin Ne Olsun?</span>
                      <div className="recom-grid">
                        {allQuizzes.filter(q => q.id !== activeQuiz.id).map(q => (
                          <Link key={q.id} to={`/testler/${q.slug}`} className="recom-card">
                            <img src={q.coverImage} alt={q.title} className="recom-img" />
                            <div className="recom-meta">
                              <span className="recom-badge">{q.badge}</span>
                              <h4 className="recom-name">{q.title}</h4>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>
        </main>

      </div>
    </Layout>
  )
}
