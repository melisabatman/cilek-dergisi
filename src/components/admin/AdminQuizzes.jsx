import React, { useState, useEffect } from 'react'
import { QUIZZES, UPCOMING_QUIZZES } from '../../data/quizzesData'
import { uploadAsset, isR2Configured } from '../../lib/r2'

export default function AdminQuizzes({
  settings = {},
  onSave,
  showFeedback
}) {
  // Aktif testler ve yakında listesi state'i
  const [quizzes, setQuizzes] = useState(() => {
    if (Array.isArray(settings?.quizzes_custom) && settings.quizzes_custom.length > 0) {
      return JSON.parse(JSON.stringify(settings.quizzes_custom))
    }
    return JSON.parse(JSON.stringify(QUIZZES))
  })

  const [upcoming, setUpcoming] = useState(() => {
    if (Array.isArray(settings?.upcoming_quizzes_custom) && settings.upcoming_quizzes_custom.length > 0) {
      return JSON.parse(JSON.stringify(settings.upcoming_quizzes_custom))
    }
    return JSON.parse(JSON.stringify(UPCOMING_QUIZZES))
  })

  // Hangi test seçili: slug / id veya 'upcoming' veya 'new'
  const [selectedQuizId, setSelectedQuizId] = useState(quizzes[0]?.id || 'gossip-girl')
  // Hangi alt sekme: 'general' | 'results' | 'questions'
  const [quizSubTab, setQuizSubTab] = useState('results')
  const [saving, setSaving] = useState(false)
  const [uploadingTarget, setUploadingTarget] = useState(null) // 'cover' veya 'result_<resultKey>'

  const isUpcomingTab = selectedQuizId === 'upcoming'
  const currentQuiz = quizzes.find(q => q.id === selectedQuizId) || quizzes[0]

  // Seçili testin temel alanlarını güncelle
  const handleUpdateQuizField = (field, value) => {
    setQuizzes(prev => prev.map(q => {
      if (q.id === currentQuiz.id) {
        return { ...q, [field]: value }
      }
      return q
    }))
  }

  // Kapak görseli dosya yükleme
  const handleUploadCoverImage = async (file) => {
    if (!file) return
    setUploadingTarget('cover')
    try {
      const res = await uploadAsset(file, 'covers')
      if (res && res.url) {
        handleUpdateQuizField('coverImage', res.url)
        showFeedback('success', 'Test kapağı başarıyla yüklendi!')
      } else {
        showFeedback('error', 'Görsel yüklenemedi. Lütfen tekrar deneyin.')
      }
    } catch (err) {
      showFeedback('error', 'Yükleme hatası: ' + err.message)
    } finally {
      setUploadingTarget(null)
    }
  }

  // Karakter/Sonuç fotoğrafı dosya yükleme
  const handleUploadResultPhoto = async (resKey, file) => {
    if (!file) return
    setUploadingTarget(`result_${resKey}`)
    try {
      const res = await uploadAsset(file, 'covers')
      if (res && res.url) {
        handleUpdateResultField(resKey, 'image', res.url)
        showFeedback('success', `Fotoğraf başarıyla yüklendi! (${resKey})`)
      } else {
        showFeedback('error', 'Fotoğraf yüklenemedi.')
      }
    } catch (err) {
      showFeedback('error', 'Yükleme hatası: ' + err.message)
    } finally {
      setUploadingTarget(null)
    }
  }

  // Karakter/Sonuç alanı güncelleme
  const handleUpdateResultField = (resKey, field, value) => {
    setQuizzes(prev => prev.map(q => {
      if (q.id === currentQuiz.id) {
        const updatedResults = { ...q.results }
        if (updatedResults[resKey]) {
          updatedResults[resKey] = {
            ...updatedResults[resKey],
            [field]: value
          }
        }
        return { ...q, results: updatedResults }
      }
      return q
    }))
  }

  // Karakter traits (özellikler) güncelleme (virgülle ayrılmış dizi)
  const handleUpdateResultTraits = (resKey, rawText) => {
    const list = rawText.split(',').map(s => s.trim()).filter(Boolean)
    handleUpdateResultField(resKey, 'traits', list)
  }

  // Soru metni güncelleme
  const handleUpdateQuestionTitle = (qIdx, title) => {
    setQuizzes(prev => prev.map(q => {
      if (q.id === currentQuiz.id) {
        const updatedQuestions = [...q.questions]
        if (updatedQuestions[qIdx]) {
          updatedQuestions[qIdx] = { ...updatedQuestions[qIdx], question: title }
        }
        return { ...q, questions: updatedQuestions }
      }
      return q
    }))
  }

  // Soru seçeneği metni güncelleme
  const handleUpdateOptionText = (qIdx, optIdx, text) => {
    setQuizzes(prev => prev.map(q => {
      if (q.id === currentQuiz.id) {
        const updatedQuestions = [...q.questions]
        if (updatedQuestions[qIdx]?.options?.[optIdx]) {
          const updatedOptions = [...updatedQuestions[qIdx].options]
          updatedOptions[optIdx] = { ...updatedOptions[optIdx], text }
          updatedQuestions[qIdx] = { ...updatedQuestions[qIdx], options: updatedOptions }
        }
        return { ...q, questions: updatedQuestions }
      }
      return q
    }))
  }

  // Yeni soru ekle
  const handleAddQuestion = () => {
    setQuizzes(prev => prev.map(q => {
      if (q.id === currentQuiz.id) {
        const resultKeys = Object.keys(q.results || {})
        const defaultScores = resultKeys[0] ? { [resultKeys[0]]: 3 } : {}
        const newQ = {
          id: `q-${Date.now()}`,
          question: 'Yeni Soru Başlığı Buraya Yazılacak?',
          options: [
            { text: 'Birinci Seçenek', scores: defaultScores },
            { text: 'İkinci Seçenek', scores: defaultScores },
            { text: 'Üçüncü Seçenek', scores: defaultScores },
            { text: 'Dördüncü Seçenek', scores: defaultScores }
          ]
        }
        const updatedQuestions = [...(q.questions || []), newQ]
        return { ...q, questions: updatedQuestions, questionsCount: updatedQuestions.length }
      }
      return q
    }))
    showFeedback('success', 'Yeni soru eklendi. Düzenleyebilirsiniz.')
  }

  // Soru sil
  const handleDeleteQuestion = (qIdx) => {
    if (!window.confirm(`Bu soruyu silmek istediğinize emin misiniz?`)) return
    setQuizzes(prev => prev.map(q => {
      if (q.id === currentQuiz.id) {
        const updatedQuestions = q.questions.filter((_, i) => i !== qIdx)
        return { ...q, questions: updatedQuestions, questionsCount: updatedQuestions.length }
      }
      return q
    }))
    showFeedback('success', 'Soru silindi.')
  }

  // Yeni test ekle
  const handleCreateNewQuiz = () => {
    const newId = `quiz-${Date.now()}`
    const newQuizObj = {
      id: newId,
      slug: `yeni-test-${quizzes.length + 1}`,
      title: 'Yeni Kişilik Testi Başlığı',
      subtitle: 'Kendini keşfetmeye hazır mısın?',
      badge: 'YENİ TEST · KÜLTÜR & YAŞAM',
      readingTime: '3 dk',
      coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      accentColor: '#BE2625',
      questionsCount: 4,
      description: 'Test hakkında okuyucuları heyecanlandıracak giriş açıklaması buraya gelecek.',
      results: {
        karakter1: {
          id: 'karakter1',
          name: 'Birinci Karakter / Sonuç',
          role: 'İkonik Lider',
          tagline: 'Özgüven & Karizma',
          quote: '“Hayat cesurları sever.”',
          image: '',
          color: '#BE2625',
          traits: ['Lider', 'Özgüvenli', 'Kararlı'],
          description: 'Bu sonuç çıktığında okuyucuya gösterilecek samimi ve derinlikli açıklama.',
          aesthetic: 'Kırmızı güller, saten kumaşlar, vintage aynalar.'
        },
        karakter2: {
          id: 'karakter2',
          name: 'İkinci Karakter / Sonuç',
          role: 'Özgür Ruh',
          tagline: 'Doğallık & Sanat',
          quote: '“Kendi melodini kendin yarat.”',
          image: '',
          color: '#6B9B7C',
          traits: ['Yaratıcı', 'Hassas', 'Özgür'],
          description: 'İkinci sonuç için kişilik analizi.',
          aesthetic: 'Analog fotoğraf makineleri, kahve fincanları, çilek reçeli.'
        }
      },
      questions: [
        {
          id: 'q1',
          question: 'Hafta sonu sabahı senin için ne ifade ediyor?',
          options: [
            { text: 'Erkenden uyanıp planlarımı kusursuzca hayata geçirmek.', scores: { karakter1: 3 } },
            { text: 'Kahvemi alıp balkonda saatlerce müzik dinlemek.', scores: { karakter2: 3 } }
          ]
        }
      ]
    }
    setQuizzes([...quizzes, newQuizObj])
    setSelectedQuizId(newId)
    setQuizSubTab('general')
    showFeedback('success', 'Yeni test taslağı oluşturuldu! Bilgilerini doldurabilirsiniz.')
  }

  // Yakında kartı güncelle
  const handleUpdateUpcoming = (id, field, value) => {
    setUpcoming(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  // Değişiklikleri Kaydet
  const handleSaveAll = async () => {
    setSaving(true)
    try {
      await onSave({
        quizzes_custom: quizzes,
        upcoming_quizzes_custom: upcoming
      })
      showFeedback('success', '🎉 Tüm testler, karakter fotoğrafları ve sorular başarıyla kaydedildi!')
    } catch (err) {
      showFeedback('error', 'Kayıt sırasında hata oluştu: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Varsayılana Sıfırla
  const handleResetToDefaults = () => {
    if (!window.confirm('DİKKAT: Testleri orijinal ilk haline sıfırlamak istediğinize emin misiniz? Yapılan özel düzenlemeler sıfırlanacaktır.')) {
      return
    }
    setQuizzes(JSON.parse(JSON.stringify(QUIZZES)))
    setUpcoming(JSON.parse(JSON.stringify(UPCOMING_QUIZZES)))
    showFeedback('success', 'Testler varsayılan orijinal haline sıfırlandı. Kaydetmek için "Tümünü Kaydet" butonuna basınız.')
  }

  return (
    <div className="admin-quizzes-manager">
      {/* ── Üst Başlık & Kaydet Butonu Barı ─────────────────────── */}
      <div className="admin-cms-header-row">
        <div>
          <span className="admin-strawberry-badge">🎀 QUIZ CLUB KONTROLÜ</span>
          <h2 className="admin-card-title">Hey Girl Quiz Club Yönetimi</h2>
          <p className="admin-card-subtitle">
            Kişilik testlerini, her sonucun karakter fotoğraflarını, sorularını ve yakında çıkacak testleri buradan kolayca yönetin.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-admin-table-action"
            style={{ color: '#888' }}
            onClick={handleResetToDefaults}
          >
            ↺ Orijinal Verilere Sıfırla
          </button>
          <button
            type="button"
            className="btn-admin-primary"
            onClick={handleSaveAll}
            disabled={saving}
            id="btn-save-quizzes-master"
          >
            {saving ? '⏳ Kaydediliyor…' : '💾 Tüm Testleri Kaydet'}
          </button>
        </div>
      </div>

      {/* ── Test Seçim Sekmeleri (Navigasyon) ───────────────────── */}
      <div className="admin-cms-subtabs-nav" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        {quizzes.map((q, idx) => (
          <button
            key={q.id}
            type="button"
            className={`admin-subtab-btn ${selectedQuizId === q.id ? 'active' : ''}`}
            onClick={() => setSelectedQuizId(q.id)}
          >
            {idx === 0 ? '💅' : idx === 1 ? '⏳' : '🌟'} {q.title.length > 25 ? q.title.slice(0, 25) + '…' : q.title}
          </button>
        ))}
        <button
          type="button"
          className={`admin-subtab-btn ${selectedQuizId === 'upcoming' ? 'active' : ''}`}
          onClick={() => setSelectedQuizId('upcoming')}
        >
          🔮 Yakında Testleri ({upcoming.length})
        </button>
        <button
          type="button"
          className="admin-subtab-btn"
          style={{ borderStyle: 'dashed', color: 'var(--color-primary)' }}
          onClick={handleCreateNewQuiz}
        >
          ➕ Yeni Test Ekle
        </button>
      </div>

      {/* ── DURUM 1: YAKINDA TESTLERİ DÜZENLEME ─────────────────── */}
      {isUpcomingTab ? (
        <div className="admin-form-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">🔮 Yakında Gelecek Test Kartları</h3>
              <p className="admin-card-subtitle">
                "BİR DAKİKA, DAHA YENİ BAŞLIYORUZ! YAKINDA YENİ TESTLER GELİYOR!" altındaki 3 önizleme kartı.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {upcoming.map((item, idx) => (
              <div key={item.id} style={{ border: '1px solid #E8B54D', borderRadius: '16px', padding: '1.4rem', background: '#FFFDF9' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#BE2625' }}>KART #{idx + 1}</span>
                <div className="admin-field-group" style={{ marginTop: '0.5rem' }}>
                  <label className="admin-label">Başlık</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={item.title}
                    onChange={(e) => handleUpdateUpcoming(item.id, 'title', e.target.value)}
                  />
                </div>
                <div className="admin-field-group">
                  <label className="admin-label">Kategori / Etiket</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={item.tag}
                    onChange={(e) => handleUpdateUpcoming(item.id, 'tag', e.target.value)}
                  />
                </div>
                <div className="admin-field-group">
                  <label className="admin-label">Rozet (Örn: PEK YAKINDA)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={item.badge}
                    onChange={(e) => handleUpdateUpcoming(item.id, 'badge', e.target.value)}
                  />
                </div>
                <div className="admin-field-group">
                  <label className="admin-label">Açıklama</label>
                  <textarea
                    rows={3}
                    className="admin-textarea"
                    value={item.desc}
                    onChange={(e) => handleUpdateUpcoming(item.id, 'desc', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── DURUM 2: SEÇİLİ TESTİ DÜZENLEME ───────────────────────── */
        <div>
          {/* Test İçi 3 Sekme: Genel | Karakterler (Sonuçlar) | Sorular */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem', borderBottom: '2px solid rgba(190, 38, 37, 0.12)', paddingBottom: '0.6rem' }}>
            <button
              type="button"
              className={`admin-tab-btn ${quizSubTab === 'results' ? 'active' : ''}`}
              style={{ fontSize: '0.96rem', padding: '0.5rem 1.2rem' }}
              onClick={() => setQuizSubTab('results')}
            >
              📸 Karakterler &amp; Fotoğraflar ({Object.keys(currentQuiz.results || {}).length})
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${quizSubTab === 'general' ? 'active' : ''}`}
              style={{ fontSize: '0.96rem', padding: '0.5rem 1.2rem' }}
              onClick={() => setQuizSubTab('general')}
            >
              📝 Test Başlığı &amp; Kapak Görseli
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${quizSubTab === 'questions' ? 'active' : ''}`}
              style={{ fontSize: '0.96rem', padding: '0.5rem 1.2rem' }}
              onClick={() => setQuizSubTab('questions')}
            >
              ❓ Test Soruları ({currentQuiz.questions?.length || 0})
            </button>
          </div>

          {/* ── 2A. KARAKTERLER & FOTOĞRAFLAR (EN ÖNEMLİ BÖLÜM) ─────── */}
          {quizSubTab === 'results' && (
            <div>
              <div className="admin-cms-section-card" style={{ marginBottom: '1.5rem', background: '#FFF5F6', border: '1.5px solid #F3D8DC' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '2rem' }}>💡</span>
                  <div>
                    <h4 style={{ margin: 0, color: '#BE2625', fontWeight: 800 }}>Karakter Fotoğraflarını Doğrudan Buradan Yükleyin</h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', color: '#666' }}>
                      Koda girmenize gerek yok! Her karakterin fotoğraf kutusundaki "📁 Fotoğraf Yükle" butonuna basarak bilgisayarınızdan bir resim seçin. Cloudflare R2'ye yüklenip doğrudan sonuç kartına atanacaktır.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.8rem' }}>
                {Object.entries(currentQuiz.results || {}).map(([resKey, resObj]) => (
                  <div
                    key={resKey}
                    className="admin-form-card"
                    style={{
                      borderTop: `4px solid ${resObj.color || 'var(--color-primary)'}`,
                      padding: '1.6rem',
                      borderRadius: '18px'
                    }}
                  >
                    {/* Karakter Başlığı & Önizleme Fotoğrafı */}
                    <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
                      <div style={{ position: 'relative', width: '90px', height: '110px', flexShrink: 0, borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(0,0,0,0.1)', background: '#F8E9EB' }}>
                        {resObj.image ? (
                          <img
                            src={resObj.image}
                            alt={resObj.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#999' }}>
                            👤
                          </div>
                        )}
                        {uploadingTarget === `result_${resKey}` && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 800 }}>
                            Yükleniyor…
                          </div>
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, color: resObj.color || '#BE2625', textTransform: 'uppercase' }}>
                          SONUÇ KODU: {resKey}
                        </span>
                        <h4 style={{ margin: '0.1rem 0 0.5rem', fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-text-dark)' }}>
                          {resObj.name}
                        </h4>
                        
                        {/* Fotoğraf Yükleme Butonu */}
                        <label className="btn-admin-upload" style={{ display: 'inline-flex', padding: '0.4rem 0.9rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                          📁 Fotoğraf Yükle (R2)
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleUploadResultPhoto(resKey, e.target.files?.[0])}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Fotoğraf URL'si Kutusu */}
                    <div className="admin-field-group" style={{ marginBottom: '0.8rem' }}>
                      <label className="admin-label">Fotoğraf URL'si (Doğrudan Link)</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={resObj.image || ''}
                        onChange={(e) => handleUpdateResultField(resKey, 'image', e.target.value)}
                        placeholder="https://... veya dosya yükleyin"
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>

                    {/* İsim & Rol */}
                    <div className="admin-form-row" style={{ gap: '0.8rem', marginBottom: '0.8rem' }}>
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">Karakter Adı</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={resObj.name || ''}
                          onChange={(e) => handleUpdateResultField(resKey, 'name', e.target.value)}
                        />
                      </div>
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">Rolü / Unvanı</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={resObj.role || ''}
                          onChange={(e) => handleUpdateResultField(resKey, 'role', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Slogan & Alıntı */}
                    <div className="admin-field-group" style={{ marginBottom: '0.8rem' }}>
                      <label className="admin-label">Slogan (Tagline)</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={resObj.tagline || ''}
                        onChange={(e) => handleUpdateResultField(resKey, 'tagline', e.target.value)}
                      />
                    </div>

                    <div className="admin-field-group" style={{ marginBottom: '0.8rem' }}>
                      <label className="admin-label">Karakter Alıntı Sözü (Quote)</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={resObj.quote || ''}
                        onChange={(e) => handleUpdateResultField(resKey, 'quote', e.target.value)}
                      />
                    </div>

                    {/* Özellikler (Etiketler) */}
                    <div className="admin-field-group" style={{ marginBottom: '0.8rem' }}>
                      <label className="admin-label">Özellikler (Virgülle Ayırın)</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={Array.isArray(resObj.traits) ? resObj.traits.join(', ') : ''}
                        onChange={(e) => handleUpdateResultTraits(resKey, e.target.value)}
                        placeholder="Örn: Lider, Stratejik, Sadık, Kusursuz Tarz"
                      />
                    </div>

                    {/* Detaylı Açıklama */}
                    <div className="admin-field-group" style={{ marginBottom: '0.8rem' }}>
                      <label className="admin-label">Kişilik Analizi Açıklaması</label>
                      <textarea
                        rows={3}
                        className="admin-textarea"
                        value={resObj.description || ''}
                        onChange={(e) => handleUpdateResultField(resKey, 'description', e.target.value)}
                      />
                    </div>

                    {/* Senin Estetiğin */}
                    <div className="admin-field-group">
                      <label className="admin-label">"Senin Estetiğin" Açıklaması</label>
                      <textarea
                        rows={2}
                        className="admin-textarea"
                        value={resObj.aesthetic || ''}
                        onChange={(e) => handleUpdateResultField(resKey, 'aesthetic', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 2B. TEST BAŞLIĞI, AÇIKLAMASI & KAPAK GÖRSELİ ───────── */}
          {quizSubTab === 'general' && (
            <div className="admin-form-card" style={{ maxWidth: '800px' }}>
              <h3 className="admin-card-title">Test Genel Ayarları</h3>
              <p className="admin-card-subtitle">Testin anasayfada ve liste görünümünde nasıl duracağını ayarlayın.</p>

              <div className="admin-field-group">
                <label className="admin-label">Test Başlığı</label>
                <input
                  type="text"
                  className="admin-input"
                  value={currentQuiz.title || ''}
                  onChange={(e) => handleUpdateQuizField('title', e.target.value)}
                />
              </div>

              <div className="admin-field-group">
                <label className="admin-label">Alt Başlık (Slogan)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={currentQuiz.subtitle || ''}
                  onChange={(e) => handleUpdateQuizField('subtitle', e.target.value)}
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-field-group" style={{ flex: 1 }}>
                  <label className="admin-label">Rozet (Badge)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={currentQuiz.badge || ''}
                    onChange={(e) => handleUpdateQuizField('badge', e.target.value)}
                  />
                </div>
                <div className="admin-field-group" style={{ flex: 1 }}>
                  <label className="admin-label">Okuma Süresi</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={currentQuiz.readingTime || ''}
                    onChange={(e) => handleUpdateQuizField('readingTime', e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-field-group">
                <label className="admin-label">Detaylı Tanıtım Açıklaması</label>
                <textarea
                  rows={4}
                  className="admin-textarea"
                  value={currentQuiz.description || ''}
                  onChange={(e) => handleUpdateQuizField('description', e.target.value)}
                />
              </div>

              {/* Kapak Görseli */}
              <div className="admin-field-group">
                <label className="admin-label">Test Kapak Görseli</label>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {currentQuiz.coverImage ? (
                    <img
                      src={currentQuiz.coverImage}
                      alt={currentQuiz.title}
                      style={{ width: '120px', height: '140px', objectFit: 'cover', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.1)' }}
                    />
                  ) : (
                    <div style={{ width: '120px', height: '140px', borderRadius: '12px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Kapak Yok
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      className="admin-input"
                      value={currentQuiz.coverImage || ''}
                      onChange={(e) => handleUpdateQuizField('coverImage', e.target.value)}
                      placeholder="Görsel URL'si yapıştırın veya dosya yükleyin"
                      style={{ marginBottom: '0.6rem' }}
                    />
                    <label className="btn-admin-upload" style={{ cursor: 'pointer', display: 'inline-block' }}>
                      {uploadingTarget === 'cover' ? '⏳ Yükleniyor…' : '📁 Yeni Kapak Görseli Yükle (R2)'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={uploadingTarget === 'cover'}
                        onChange={(e) => handleUploadCoverImage(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 2C. TEST SORULARI & SEÇENEKLER ─────────────────────── */}
          {quizSubTab === 'questions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <div>
                  <h3 className="admin-card-title" style={{ fontSize: '1.4rem' }}>Test Soruları ({currentQuiz.questions?.length || 0})</h3>
                  <p className="admin-card-subtitle">Soruları ve her cevabın hangi karaktere puan verdiğini düzenleyin.</p>
                </div>
                <button
                  type="button"
                  className="btn-admin-primary"
                  onClick={handleAddQuestion}
                >
                  ➕ Yeni Soru Ekle
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {currentQuiz.questions?.map((qItem, qIdx) => (
                  <div key={qItem.id || qIdx} className="admin-form-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.9rem' }}>
                        SORU #{qIdx + 1}
                      </span>
                      <button
                        type="button"
                        className="btn-table-del"
                        style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
                        onClick={() => handleDeleteQuestion(qIdx)}
                      >
                        Soruyu Sil
                      </button>
                    </div>

                    <div className="admin-field-group">
                      <label className="admin-label">Soru Cümlesi</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={qItem.question || ''}
                        onChange={(e) => handleUpdateQuestionTitle(qIdx, e.target.value)}
                        style={{ fontWeight: 700 }}
                      />
                    </div>

                    {/* Seçenekler */}
                    <div style={{ marginTop: '0.8rem' }}>
                      <label className="admin-label" style={{ marginBottom: '0.4rem', display: 'block' }}>
                        Seçenekler &amp; Cevaplar:
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.8rem' }}>
                        {qItem.options?.map((opt, optIdx) => (
                          <div key={optIdx} style={{ background: '#FFFDF9', border: '1px solid #EAD8C7', borderRadius: '10px', padding: '0.8rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#888' }}>
                              SEÇENEK {String.fromCharCode(65 + optIdx)}
                            </span>
                            <textarea
                              rows={2}
                              className="admin-textarea"
                              value={opt.text || ''}
                              onChange={(e) => handleUpdateOptionText(qIdx, optIdx, e.target.value)}
                              style={{ marginTop: '0.3rem', fontSize: '0.88rem' }}
                            />
                            <div style={{ marginTop: '0.4rem', fontSize: '0.76rem', color: '#999' }}>
                              Hedef: {JSON.stringify(opt.scores || {})}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
