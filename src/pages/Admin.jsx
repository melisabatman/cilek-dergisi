import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, checkIsAdmin } from '../lib/supabase'
import { uploadAsset, isR2Configured } from '../lib/r2'

export default function Admin({ user, isAdmin: propIsAdmin }) {
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(propIsAdmin ?? false)
  const [authChecking, setAuthChecking] = useState(propIsAdmin === undefined)

  // Aktif Tab: 'magazines' (Sayılar) | 'team' (Ekip)
  const [activeTab, setActiveTab] = useState('magazines')

  // Bildirim mesajları (Toast / Alert)
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback({ type: '', message: '' }), 6000)
  }

  // -------------------------------------------------------------
  // YETKİ KONTROLÜ
  // -------------------------------------------------------------
  useEffect(() => {
    async function verifyAdmin() {
      if (user === undefined) return
      if (!user) {
        setIsAdmin(false)
        setAuthChecking(false)
        return
      }
      const adminVerified = await checkIsAdmin(user)
      setIsAdmin(adminVerified)
      setAuthChecking(false)
    }
    verifyAdmin()
  }, [user])

  // -------------------------------------------------------------
  // 1. DERGİ / SAYI YÖNETİMİ DURUMU (MAGAZINES)
  // -------------------------------------------------------------
  const [magazines, setMagazines] = useState([])
  const [loadingMagazines, setLoadingMagazines] = useState(true)
  const [editingMagazineId, setEditingMagazineId] = useState(null)
  const [submittingMagazine, setSubmittingMagazine] = useState(false)
  const [deleteConfirmMagId, setDeleteConfirmMagId] = useState(null)

  // Form alanları (Magazines)
  const [magIssueNumber, setMagIssueNumber] = useState('')
  const [magTitle, setMagTitle] = useState('')
  const [magDescription, setMagDescription] = useState('')
  const [magPublishedDate, setMagPublishedDate] = useState(new Date().toISOString().split('T')[0])
  const [magToc, setMagToc] = useState(['', '', '', '']) // Varsayılan 4 madde
  const [magCoverFile, setMagCoverFile] = useState(null)
  const [magCoverPreview, setMagCoverPreview] = useState('')
  const [magCoverUrl, setMagCoverUrl] = useState('')
  const [magPdfFile, setMagPdfFile] = useState(null)
  const [magPdfUrl, setMagPdfUrl] = useState('')

  // -------------------------------------------------------------
  // 2. EKİP YÖNETİMİ DURUMU (TEAM MEMBERS)
  // -------------------------------------------------------------
  const [teamMembers, setTeamMembers] = useState([])
  const [loadingTeam, setLoadingTeam] = useState(true)
  const [editingMemberId, setEditingMemberId] = useState(null)
  const [submittingMember, setSubmittingMember] = useState(false)
  const [deleteConfirmMemberId, setDeleteConfirmMemberId] = useState(null)

  // Form alanları (Team)
  const [memberName, setMemberName] = useState('')
  const [memberRole, setMemberRole] = useState('')
  const [memberBio, setMemberBio] = useState('')
  const [memberOrder, setMemberOrder] = useState('1')
  const [memberPhotoFile, setMemberPhotoFile] = useState(null)
  const [memberPhotoPreview, setMemberPhotoPreview] = useState('')
  const [memberPhotoUrl, setMemberPhotoUrl] = useState('')

  // -------------------------------------------------------------
  // VERİLERİ ÇEKME FONKSİYONLARI
  // -------------------------------------------------------------
  const fetchMagazines = useCallback(async () => {
    setLoadingMagazines(true)
    try {
      const { data, error } = await supabase
        .from('magazines')
        .select('*')
        .order('issue_number', { ascending: false })

      if (!error && data) {
        setMagazines(data)
      }
    } catch (err) {
      console.error('Magazines fetch error:', err)
    } finally {
      setLoadingMagazines(false)
    }
  }, [])

  const fetchTeamMembers = useCallback(async () => {
    setLoadingTeam(true)
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('order_index', { ascending: true })

      if (!error && data) {
        setTeamMembers(data)
      }
    } catch (err) {
      console.error('Team fetch error:', err)
    } finally {
      setLoadingTeam(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      fetchMagazines()
      fetchTeamMembers()
    }
  }, [isAdmin, fetchMagazines, fetchTeamMembers])

  // -------------------------------------------------------------
  // SAYI (MAGAZINE) FORM İŞLEMLERİ
  // -------------------------------------------------------------
  const resetMagazineForm = () => {
    setEditingMagazineId(null)
    setMagIssueNumber('')
    setMagTitle('')
    setMagDescription('')
    setMagPublishedDate(new Date().toISOString().split('T')[0])
    setMagToc(['', '', '', ''])
    setMagCoverFile(null)
    setMagCoverPreview('')
    setMagCoverUrl('')
    setMagPdfFile(null)
    setMagPdfUrl('')
  }

  const handleStartEditMagazine = (mag) => {
    setEditingMagazineId(mag.id)
    setMagIssueNumber(mag.issue_number?.toString() || '')
    setMagTitle(mag.title || '')
    setMagDescription(mag.description || '')
    setMagPublishedDate(mag.published_date || '')
    const existingToc = Array.isArray(mag.toc) && mag.toc.length > 0 ? mag.toc : ['', '', '', '']
    setMagToc(existingToc)
    setMagCoverUrl(mag.cover_image_url || '')
    setMagCoverPreview(mag.cover_image_url || '')
    setMagCoverFile(null)
    setMagPdfUrl(mag.pdf_url || '')
    setMagPdfFile(null)

    // Form alanına yumuşak kaydır
    window.scrollTo({ top: 180, behavior: 'smooth' })
  }

  // TOC (İçindekiler) dinamik ekle/çıkar/değiştir
  const handleTocChange = (index, value) => {
    const updated = [...magToc]
    updated[index] = value
    setMagToc(updated)
  }

  const handleAddTocItem = () => {
    setMagToc([...magToc, ''])
  }

  const handleRemoveTocItem = (index) => {
    if (magToc.length <= 1) {
      setMagToc([''])
      return
    }
    const updated = magToc.filter((_, i) => i !== index)
    setMagToc(updated)
  }

  const handleCoverFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setMagCoverFile(file)
      setMagCoverPreview(URL.createObjectURL(file))
    }
  }

  const handlePdfFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setMagPdfFile(file)
    }
  }

  const handleSubmitMagazine = async (e) => {
    e.preventDefault()
    if (!magTitle.trim()) {
      showFeedback('error', 'Lütfen sayı başlığını girin.')
      return
    }
    const parsedIssueNumber = parseInt(magIssueNumber, 10)
    if (isNaN(parsedIssueNumber)) {
      showFeedback('error', 'Lütfen geçerli bir sayı numarası girin (Örn: 7).')
      return
    }

    setSubmittingMagazine(true)

    try {
      let finalCoverUrl = magCoverUrl
      let finalPdfUrl = magPdfUrl

      // 1. Kapak görseli yükle (covers bucket'ı)
      if (magCoverFile) {
        const { publicUrl, error: uploadErr } = await uploadAsset('covers', magCoverFile, `issue_${parsedIssueNumber}_cover`)
        if (uploadErr) throw uploadErr
        if (publicUrl) finalCoverUrl = publicUrl
      }

      // 2. PDF dosyası yükle (pdfs bucket'ı)
      if (magPdfFile) {
        const { publicUrl, error: pdfErr } = await uploadAsset('pdfs', magPdfFile, `issue_${parsedIssueNumber}_doc`)
        if (pdfErr) throw pdfErr
        if (publicUrl) finalPdfUrl = publicUrl
      }

      // Boş olmayan TOC maddelerini filtrele
      const cleanedToc = magToc.map(t => t.trim()).filter(Boolean)

      const payload = {
        issue_number: parsedIssueNumber,
        title: magTitle.trim(),
        description: magDescription.trim() || null,
        toc: cleanedToc,
        cover_image_url: finalCoverUrl || null,
        pdf_url: finalPdfUrl || null,
        published_date: magPublishedDate || null,
      }

      if (editingMagazineId) {
        // Güncelle
        const { error: updateErr } = await supabase
          .from('magazines')
          .update(payload)
          .eq('id', editingMagazineId)

        if (updateErr) throw updateErr
        showFeedback('success', `"${magTitle}" sayısı başarıyla güncellendi!`)
      } else {
        // Yeni ekle
        const { error: insertErr } = await supabase
          .from('magazines')
          .insert(payload)

        if (insertErr) throw insertErr
        showFeedback('success', `"${magTitle}" sayısı başarıyla eklendi!`)
      }

      resetMagazineForm()
      await fetchMagazines()
    } catch (err) {
      console.error('Save magazine error:', err)
      showFeedback('error', `İşlem başarısız: ${err.message || 'Veritabanına kaydedilemedi.'}`)
    } finally {
      setSubmittingMagazine(false)
    }
  }

  const handleDeleteMagazine = async (id) => {
    try {
      const { error } = await supabase.from('magazines').delete().eq('id', id)
      if (error) throw error
      showFeedback('success', 'Sayı başarıyla silindi.')
      setMagazines(prev => prev.filter(m => m.id !== id))
      setDeleteConfirmMagId(null)
      if (editingMagazineId === id) resetMagazineForm()
    } catch (err) {
      showFeedback('error', `Silme hatası: ${err.message}`)
    }
  }

  // -------------------------------------------------------------
  // EKİP (TEAM) FORM İŞLEMLERİ
  // -------------------------------------------------------------
  const resetTeamForm = () => {
    setEditingMemberId(null)
    setMemberName('')
    setMemberRole('')
    setMemberBio('')
    setMemberOrder((teamMembers.length + 1).toString())
    setMemberPhotoFile(null)
    setMemberPhotoPreview('')
    setMemberPhotoUrl('')
  }

  const handleStartEditMember = (member) => {
    setEditingMemberId(member.id)
    setMemberName(member.name || '')
    setMemberRole(member.role || '')
    setMemberBio(member.bio || '')
    setMemberOrder(member.order_index?.toString() || '1')
    setMemberPhotoUrl(member.photo_url || '')
    setMemberPhotoPreview(member.photo_url || '')
    setMemberPhotoFile(null)

    window.scrollTo({ top: 180, behavior: 'smooth' })
  }

  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setMemberPhotoFile(file)
      setMemberPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmitMember = async (e) => {
    e.preventDefault()
    if (!memberName.trim()) {
      showFeedback('error', 'Lütfen ekip üyesinin ismini girin.')
      return
    }
    if (!memberRole.trim()) {
      showFeedback('error', 'Lütfen ekip üyesinin rolünü girin.')
      return
    }

    setSubmittingMember(true)

    try {
      let finalPhotoUrl = memberPhotoUrl

      if (memberPhotoFile) {
        const { publicUrl, error: uploadErr } = await uploadAsset('covers', memberPhotoFile, `team_${memberName.replace(/\s+/g, '_')}`)
        if (uploadErr) throw uploadErr
        if (publicUrl) finalPhotoUrl = publicUrl
      }

      const payload = {
        name: memberName.trim(),
        role: memberRole.trim(),
        bio: memberBio.trim() || null,
        photo_url: finalPhotoUrl || null,
        order_index: parseInt(memberOrder, 10) || 0,
      }

      if (editingMemberId) {
        const { error: updateErr } = await supabase
          .from('team_members')
          .update(payload)
          .eq('id', editingMemberId)

        if (updateErr) throw updateErr
        showFeedback('success', `"${memberName}" üyesi başarıyla güncellendi!`)
      } else {
        const { error: insertErr } = await supabase
          .from('team_members')
          .insert(payload)

        if (insertErr) throw insertErr
        showFeedback('success', `"${memberName}" başarıyla ekibe eklendi!`)
      }

      resetTeamForm()
      await fetchTeamMembers()
    } catch (err) {
      console.error('Save member error:', err)
      showFeedback('error', `İşlem başarısız: ${err.message}`)
    } finally {
      setSubmittingMember(false)
    }
  }

  const handleDeleteMember = async (id) => {
    try {
      const { error } = await supabase.from('team_members').delete().eq('id', id)
      if (error) throw error
      showFeedback('success', 'Ekip üyesi silindi.')
      setTeamMembers(prev => prev.filter(m => m.id !== id))
      setDeleteConfirmMemberId(null)
      if (editingMemberId === id) resetTeamForm()
    } catch (err) {
      showFeedback('error', `Silme hatası: ${err.message}`)
    }
  }

  // -------------------------------------------------------------
  // YETKİ KONTROL EKRANLARI (LOADING VEYA ERİŞİM ENGELİ)
  // -------------------------------------------------------------
  if (authChecking) {
    return (
      <div className="admin-gate-page">
        <div className="admin-gate-box">
          <div className="admin-gate-icon">🍓</div>
          <h2>Yetki Kontrol Ediliyor…</h2>
          <p>Lütfen bekleyin, Çilek Dergisi yönetim izinleri doğrulanıyor.</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="admin-gate-page">
        <div className="admin-gate-box">
          <div className="admin-strawberry-badge" aria-hidden="true">
            <img src="/icons/cilek-vintage.png" alt="Çilek Dergisi" className="auth-strawberry-img" />
          </div>
          <span className="admin-gate-tag">Güvenlik Korumalı Alan</span>
          <h1 className="admin-gate-title">Yönetici Girişi Gerekli</h1>
          <p className="admin-gate-desc">
            Bu sayfa yalnızca yetkili <strong>Çilek Dergisi Editör ve Yöneticileri</strong> tarafından görüntülenebilir.
            {user ? (
              <>
                <br />
                Şu anda <strong>{user.email}</strong> hesabıyla giriş yaptınız ancak bu hesabın admin yetkisi bulunmuyor.
              </>
            ) : (
              <>
                <br />
                Lütfen yetkili e-posta adresiniz ile giriş yapın.
              </>
            )}
          </p>

          <div className="admin-gate-actions">
            {!user ? (
              <Link to="/auth?mode=login&redirect=/admin" className="btn-admin-gate-primary" id="btn-gate-login">
                Yönetici Girişi Yap →
              </Link>
            ) : (
              <button
                type="button"
                className="btn-admin-gate-primary"
                onClick={async () => {
                  await supabase.auth.signOut()
                  navigate('/auth?mode=login&redirect=/admin')
                }}
                id="btn-gate-switch"
              >
                Farklı Hesapla Giriş Yap →
              </button>
            )}
            <Link to="/" className="btn-admin-gate-ghost" id="btn-gate-home">
              ← Siteye Dön
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // ADMIN DASHBOARD ANA ARAYÜZÜ
  // -------------------------------------------------------------
  return (
    <div className="admin-editorial-root" role="main">
      {/* Üst Yönetim Çubuğu */}
      <header className="admin-top-bar">
        <div className="admin-top-inner">
          <div className="admin-brand-area">
            <Link to="/" className="admin-back-site-link" title="Ana Sayfaya Dön">
              ← Siteyi Gör
            </Link>
            <div className="admin-brand-info">
              <span className="admin-brand-pre">Çilek Dergisi</span>
              <h1 className="admin-brand-head">Yönetim Paneli</h1>
            </div>
          </div>

          <div className="admin-user-badge">
            <span className="admin-role-pill">★ Editör & Admin</span>
            <span className="admin-user-email" title={user.email}>{user.email}</span>
            <button
              type="button"
              className="admin-btn-logout"
              onClick={async () => {
                await supabase.auth.signOut()
                navigate('/')
              }}
              id="btn-admin-logout"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      {/* Geri Bildirim Bildirimi (Toast) */}
      {feedback.message && (
        <div className={`admin-toast ${feedback.type}`} role="alert">
          <span>{feedback.type === 'success' ? '✓' : '⚠️'} {feedback.message}</span>
          <button type="button" onClick={() => setFeedback({ type: '', message: '' })}>✕</button>
        </div>
      )}

      {/* Ana Gövde */}
      <div className="admin-main-container">
        {/* Sekmeler (Tab Bar) */}
        <div className="admin-tabs-nav" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'magazines'}
            className={`admin-tab-btn ${activeTab === 'magazines' ? 'active' : ''}`}
            onClick={() => setActiveTab('magazines')}
            id="tab-btn-magazines"
          >
            📚 Sayı Yönetimi ({magazines.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'team'}
            className={`admin-tab-btn ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
            id="tab-btn-team"
          >
            👥 Ekip Yönetimi ({teamMembers.length})
          </button>
        </div>

        {/* -------------------------------------------------------------
            TAB 1: SAYI YÖNETİMİ
        ------------------------------------------------------------- */}
        {activeTab === 'magazines' && (
          <div className="admin-tab-content">
            <div className="admin-two-col-grid">
              
              {/* SOL SÜTUN: FORM (YENİ SAYI EKLE VEYA DÜZENLE) */}
              <div className="admin-form-card">
                <div className="admin-card-header">
                  <div>
                    <h2 className="admin-card-title">
                      {editingMagazineId ? `Sayıyı Düzenle (#${magIssueNumber})` : 'Yeni Sayı Ekle'}
                    </h2>
                    <p className="admin-card-subtitle">
                      {editingMagazineId
                        ? 'Seçili sayının bilgilerini güncelleyin veya yeni dosyalar yükleyin.'
                        : 'Yeni bir dergi sayısı oluşturup kapak ve PDF dosyalarını bağlayın.'}
                    </p>
                  </div>
                  {editingMagazineId && (
                    <button
                      type="button"
                      className="btn-cancel-edit"
                      onClick={resetMagazineForm}
                      id="btn-cancel-edit-mag"
                    >
                      İptal / Yeni Sayı
                    </button>
                  )}
                </div>

                {!isR2Configured && (
                  <div className="admin-r2-alert-banner">
                    <span className="r2-alert-icon">⚡</span>
                    <div className="r2-alert-text">
                      <strong>Cloudflare R2 Yapılandırması Bekleniyor:</strong>
                      <p>Kapak görseli ve PDF yükleyebilmek için <code>.env.local</code> dosyanıza R2 bilgilerinizi (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL) ekleyin.</p>
                    </div>
                  </div>
                )}

                <form className="admin-form" onSubmit={handleSubmitMagazine} id="form-magazine-admin">
                  {/* Sayı No ve Başlık */}
                  <div className="admin-form-row">
                    <div className="admin-field-group" style={{ flex: '0 0 130px' }}>
                      <label htmlFor="mag-issue" className="admin-label">Sayı No *</label>
                      <input
                        id="mag-issue"
                        type="number"
                        min="1"
                        className="admin-input"
                        placeholder="Örn: 7"
                        value={magIssueNumber}
                        onChange={(e) => setMagIssueNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="admin-field-group" style={{ flex: 1 }}>
                      <label htmlFor="mag-title" className="admin-label">Sayı Başlığı *</label>
                      <input
                        id="mag-title"
                        type="text"
                        className="admin-input"
                        placeholder="Örn: Sayı 07 — Rüzgâr"
                        value={magTitle}
                        onChange={(e) => setMagTitle(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Yayın Tarihi ve Açıklama */}
                  <div className="admin-field-group">
                    <label htmlFor="mag-date" className="admin-label">Yayın Tarihi</label>
                    <input
                      id="mag-date"
                      type="date"
                      className="admin-input"
                      value={magPublishedDate}
                      onChange={(e) => setMagPublishedDate(e.target.value)}
                    />
                  </div>

                  <div className="admin-field-group">
                    <label htmlFor="mag-desc" className="admin-label">Açıklama / Editoryal Özet</label>
                    <textarea
                      id="mag-desc"
                      rows={3}
                      className="admin-textarea"
                      placeholder="Bu sayıda hangi konular, anlatılar ve perspektifler yer alıyor?"
                      value={magDescription}
                      onChange={(e) => setMagDescription(e.target.value)}
                    />
                  </div>

                  {/* DİNAMİK İÇİNDEKİLER (TOC) LİSTESİ */}
                  <div className="admin-field-group admin-toc-builder">
                    <div className="toc-builder-header">
                      <label className="admin-label">İçindekiler Listesi (TOC)</label>
                      <button
                        type="button"
                        className="btn-add-toc-item"
                        onClick={handleAddTocItem}
                        id="btn-add-toc"
                      >
                        + Madde Ekle
                      </button>
                    </div>
                    <p className="admin-field-hint">
                      Bu sayıda yer alan makale, deneme ve konu başlıkları (Okuyucu modalında gösterilir).
                    </p>

                    <div className="toc-inputs-list">
                      {magToc.map((item, index) => (
                        <div key={index} className="toc-input-row">
                          <span className="toc-row-number">{index + 1}.</span>
                          <input
                            type="text"
                            className="admin-input toc-item-input"
                            placeholder={`Madde ${index + 1} (Örn: Sessizliği Bozma Rehberi)`}
                            value={item}
                            onChange={(e) => handleTocChange(index, e.target.value)}
                          />
                          <button
                            type="button"
                            className="btn-remove-toc"
                            onClick={() => handleRemoveTocItem(index)}
                            title="Maddeyi Sil"
                            aria-label={`Madde ${index + 1} sil`}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DOSYA YÜKLEMELERİ: KAPAK & PDF */}
                  <div className="admin-upload-grid">
                    {/* Kapak Görseli */}
                    <div className="admin-upload-box">
                      <label className="admin-label">Kapak Görseli (Cloudflare R2: covers)</label>
                      <div className="admin-dropzone">
                        {magCoverPreview ? (
                          <div className="upload-preview-wrap">
                            <img src={magCoverPreview} alt="Kapak Önizleme" className="cover-img-preview" />
                            <button
                              type="button"
                              className="btn-remove-preview"
                              onClick={() => { setMagCoverFile(null); setMagCoverPreview(''); setMagCoverUrl(''); }}
                            >
                              Görseli Kaldır
                            </button>
                          </div>
                        ) : (
                          <label htmlFor="mag-cover-file" className="dropzone-label">
                            <span className="dropzone-icon">🖼️</span>
                            <span className="dropzone-text">Görsel Seç veya Sürükle</span>
                            <span className="dropzone-sub">PNG, JPG, WebP</span>
                          </label>
                        )}
                        <input
                          id="mag-cover-file"
                          type="file"
                          accept="image/*"
                          onChange={handleCoverFileChange}
                          className="file-hidden-input"
                        />
                      </div>
                      {/* Alternatif URL girişi */}
                      <input
                        type="url"
                        className="admin-input-sm"
                        placeholder="Veya görsel URL'si yapıştırın"
                        value={magCoverUrl}
                        onChange={(e) => {
                          setMagCoverUrl(e.target.value)
                          if (!magCoverFile) setMagCoverPreview(e.target.value)
                        }}
                      />
                    </div>

                    {/* PDF Dosyası */}
                    <div className="admin-upload-box">
                      <label className="admin-label">PDF Dosyası (Cloudflare R2: pdfs)</label>
                      <div className="admin-dropzone">
                        {magPdfFile ? (
                          <div className="pdf-file-badge">
                            <span className="pdf-icon">📄</span>
                            <span className="pdf-filename">{magPdfFile.name}</span>
                            <button
                              type="button"
                              className="btn-remove-preview"
                              onClick={() => setMagPdfFile(null)}
                            >
                              Kaldır
                            </button>
                          </div>
                        ) : magPdfUrl ? (
                          <div className="pdf-file-badge">
                            <span className="pdf-icon">📄</span>
                            <span className="pdf-filename">Mevcut PDF Bağlı</span>
                            <a href={magPdfUrl} target="_blank" rel="noopener noreferrer" className="pdf-view-link">
                              Görüntüle ↗
                            </a>
                          </div>
                        ) : (
                          <label htmlFor="mag-pdf-file" className="dropzone-label">
                            <span className="dropzone-icon">📑</span>
                            <span className="dropzone-text">PDF Dosyası Seç</span>
                            <span className="dropzone-sub">.pdf formatında</span>
                          </label>
                        )}
                        <input
                          id="mag-pdf-file"
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handlePdfFileChange}
                          className="file-hidden-input"
                        />
                      </div>
                      {/* Alternatif PDF linki */}
                      <input
                        type="url"
                        className="admin-input-sm"
                        placeholder="Veya harici PDF linki yapıştırın"
                        value={magPdfUrl}
                        onChange={(e) => setMagPdfUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Kaydet Butonu */}
                  <div className="admin-form-actions">
                    <button
                      type="submit"
                      disabled={submittingMagazine}
                      className="btn-admin-submit"
                      id="btn-save-magazine"
                    >
                      {submittingMagazine
                        ? 'Kaydediliyor & Yükleniyor…'
                        : editingMagazineId
                        ? 'Değişiklikleri Güncelle'
                        : 'Sayıyı Yayınla'}
                    </button>
                    {editingMagazineId && (
                      <button
                        type="button"
                        className="btn-admin-secondary"
                        onClick={resetMagazineForm}
                      >
                        Vazgeç
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* SAĞ SÜTUN: MEVCUT SAYILAR LİSTESİ */}
              <div className="admin-list-card">
                <div className="admin-card-header">
                  <h2 className="admin-card-title">Mevcut Sayılar</h2>
                  <span className="admin-count-pill">{magazines.length} Sayı</span>
                </div>

                {loadingMagazines ? (
                  <div className="admin-loading-state">
                    <div className="admin-spinner" />
                    <span>Sayılar yükleniyor…</span>
                  </div>
                ) : magazines.length === 0 ? (
                  <div className="admin-empty-state">
                    <span className="empty-emoji">🍓</span>
                    <p>Henüz veritabanında kayıtlı sayı bulunmuyor.</p>
                    <small>Soldaki formu doldurarak ilk sayıyı ekleyebilirsiniz.</small>
                  </div>
                ) : (
                  <div className="admin-items-list" role="list">
                    {magazines.map((mag) => (
                      <div
                        key={mag.id}
                        className={`admin-item-row ${editingMagazineId === mag.id ? 'is-editing' : ''}`}
                        role="listitem"
                      >
                        {/* Kapak Thumbnail */}
                        <div className="admin-item-cover">
                          {mag.cover_image_url ? (
                            <img src={mag.cover_image_url} alt={mag.title} />
                          ) : (
                            <div className="admin-item-ph">🍓</div>
                          )}
                        </div>

                        {/* Bilgi */}
                        <div className="admin-item-details">
                          <div className="admin-item-headline">
                            <span className="admin-issue-pill">Sayı #{mag.issue_number}</span>
                            <h3 className="admin-item-title">{mag.title}</h3>
                          </div>
                          <div className="admin-item-meta">
                            {mag.published_date && (
                              <span>📅 {new Date(mag.published_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}</span>
                            )}
                            <span>• {Array.isArray(mag.toc) ? mag.toc.length : 0} Madde</span>
                            {mag.pdf_url ? (
                              <span className="meta-pdf-badge active">✓ PDF Var</span>
                            ) : (
                              <span className="meta-pdf-badge missing">PDF Yok</span>
                            )}
                          </div>
                        </div>

                        {/* Aksiyon Butonları */}
                        <div className="admin-item-actions">
                          <button
                            type="button"
                            className="btn-item-edit"
                            onClick={() => handleStartEditMagazine(mag)}
                            title="Düzenle"
                            id={`btn-edit-mag-${mag.id}`}
                          >
                            Düzenle
                          </button>

                          {deleteConfirmMagId === mag.id ? (
                            <div className="delete-confirm-group">
                              <button
                                type="button"
                                className="btn-confirm-delete"
                                onClick={() => handleDeleteMagazine(mag.id)}
                                id={`btn-confirm-del-${mag.id}`}
                              >
                                Evet, Sil
                              </button>
                              <button
                                type="button"
                                className="btn-cancel-delete"
                                onClick={() => setDeleteConfirmMagId(null)}
                              >
                                Vazgeç
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="btn-item-delete"
                              onClick={() => setDeleteConfirmMagId(mag.id)}
                              title="Sil"
                              id={`btn-del-mag-${mag.id}`}
                            >
                              Sil
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 2: EKİP YÖNETİMİ
        ------------------------------------------------------------- */}
        {activeTab === 'team' && (
          <div className="admin-tab-content">
            <div className="admin-two-col-grid">

              {/* SOL SÜTUN: FORM (EKİP ÜYESİ EKLE / DÜZENLE) */}
              <div className="admin-form-card">
                <div className="admin-card-header">
                  <div>
                    <h2 className="admin-card-title">
                      {editingMemberId ? `Ekip Üyesini Düzenle (${memberName})` : 'Yeni Ekip Üyesi Ekle'}
                    </h2>
                    <p className="admin-card-subtitle">
                      Ekip sayfasındaki kaydırmalı kartlarda görüntülenecek yaratıcı kadro üyeleri.
                    </p>
                  </div>
                  {editingMemberId && (
                    <button
                      type="button"
                      className="btn-cancel-edit"
                      onClick={resetTeamForm}
                      id="btn-cancel-edit-member"
                    >
                      İptal / Yeni Üye
                    </button>
                  )}
                </div>

                <form className="admin-form" onSubmit={handleSubmitMember} id="form-team-admin">
                  <div className="admin-form-row">
                    <div className="admin-field-group" style={{ flex: 1 }}>
                      <label htmlFor="member-name" className="admin-label">İsim Soyisim *</label>
                      <input
                        id="member-name"
                        type="text"
                        className="admin-input"
                        placeholder="Örn: Melisa Batman"
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="admin-field-group" style={{ flex: '0 0 110px' }}>
                      <label htmlFor="member-order" className="admin-label">Sıra No</label>
                      <input
                        id="member-order"
                        type="number"
                        min="1"
                        className="admin-input"
                        placeholder="1"
                        value={memberOrder}
                        onChange={(e) => setMemberOrder(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="admin-field-group">
                    <label htmlFor="member-role" className="admin-label">Rol / Görev *</label>
                    <input
                      id="member-role"
                      type="text"
                      className="admin-input"
                      placeholder="Örn: Genel Yayın Yönetmeni & Editör"
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin-field-group">
                    <label htmlFor="member-bio" className="admin-label">Kısa Biyografi / Açıklama</label>
                    <textarea
                      id="member-bio"
                      rows={3}
                      className="admin-textarea"
                      placeholder="Dergideki sorumluluğu, editoryal tutkusu veya kısa tanıtımı…"
                      value={memberBio}
                      onChange={(e) => setMemberBio(e.target.value)}
                    />
                  </div>

                  {/* Fotoğraf Yükleme */}
                  <div className="admin-field-group">
                    <label className="admin-label">Fotoğraf (Cloudflare R2: covers)</label>
                    <div className="admin-dropzone" style={{ minHeight: '130px' }}>
                      {memberPhotoPreview ? (
                        <div className="upload-preview-wrap">
                          <img src={memberPhotoPreview} alt="Fotoğraf Önizleme" className="member-avatar-preview" />
                          <button
                            type="button"
                            className="btn-remove-preview"
                            onClick={() => { setMemberPhotoFile(null); setMemberPhotoPreview(''); setMemberPhotoUrl(''); }}
                          >
                            Fotoğrafı Kaldır
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="member-photo-file" className="dropzone-label">
                          <span className="dropzone-icon">📸</span>
                          <span className="dropzone-text">Fotoğraf Seç veya Sürükle</span>
                          <span className="dropzone-sub">Kare veya portre görsel</span>
                        </label>
                      )}
                      <input
                        id="member-photo-file"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileChange}
                        className="file-hidden-input"
                      />
                    </div>
                    <input
                      type="url"
                      className="admin-input-sm"
                      placeholder="Veya profil fotoğrafı URL'si girin"
                      value={memberPhotoUrl}
                      onChange={(e) => {
                        setMemberPhotoUrl(e.target.value)
                        if (!memberPhotoFile) setMemberPhotoPreview(e.target.value)
                      }}
                    />
                  </div>

                  <div className="admin-form-actions">
                    <button
                      type="submit"
                      disabled={submittingMember}
                      className="btn-admin-submit"
                      id="btn-save-member"
                    >
                      {submittingMember
                        ? 'Kaydediliyor…'
                        : editingMemberId
                        ? 'Üyeyi Güncelle'
                        : 'Ekibe Ekle'}
                    </button>
                    {editingMemberId && (
                      <button
                        type="button"
                        className="btn-admin-secondary"
                        onClick={resetTeamForm}
                      >
                        Vazgeç
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* SAĞ SÜTUN: EKİP LİSTESİ */}
              <div className="admin-list-card">
                <div className="admin-card-header">
                  <h2 className="admin-card-title">Ekip Kadrosu</h2>
                  <span className="admin-count-pill">{teamMembers.length} Üye</span>
                </div>

                {loadingTeam ? (
                  <div className="admin-loading-state">
                    <div className="admin-spinner" />
                    <span>Ekip listesi yükleniyor…</span>
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="admin-empty-state">
                    <span className="empty-emoji">👥</span>
                    <p>Henüz veritabanında ekip üyesi bulunmuyor.</p>
                    <small>Soldaki formu kullanarak ekip üyelerini sırayla ekleyebilirsiniz.</small>
                  </div>
                ) : (
                  <div className="admin-items-list" role="list">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className={`admin-item-row ${editingMemberId === member.id ? 'is-editing' : ''}`}
                        role="listitem"
                      >
                        {/* Fotoğraf */}
                        <div className="admin-member-avatar-box">
                          {member.photo_url ? (
                            <img src={member.photo_url} alt={member.name} />
                          ) : (
                            <span>🍓</span>
                          )}
                        </div>

                        {/* Bilgiler */}
                        <div className="admin-item-details">
                          <div className="admin-item-headline">
                            <span className="admin-order-pill">#{member.order_index}</span>
                            <h3 className="admin-item-title">{member.name}</h3>
                          </div>
                          <p className="admin-member-role-tag">{member.role}</p>
                          {member.bio && <p className="admin-member-bio-preview">{member.bio}</p>}
                        </div>

                        {/* Aksiyonlar */}
                        <div className="admin-item-actions">
                          <button
                            type="button"
                            className="btn-item-edit"
                            onClick={() => handleStartEditMember(member)}
                            id={`btn-edit-member-${member.id}`}
                          >
                            Düzenle
                          </button>

                          {deleteConfirmMemberId === member.id ? (
                            <div className="delete-confirm-group">
                              <button
                                type="button"
                                className="btn-confirm-delete"
                                onClick={() => handleDeleteMember(member.id)}
                                id={`btn-confirm-del-member-${member.id}`}
                              >
                                Evet, Sil
                              </button>
                              <button
                                type="button"
                                className="btn-cancel-delete"
                                onClick={() => setDeleteConfirmMemberId(null)}
                              >
                                Vazgeç
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="btn-item-delete"
                              onClick={() => setDeleteConfirmMemberId(member.id)}
                              id={`btn-del-member-${member.id}`}
                            >
                              Sil
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}
