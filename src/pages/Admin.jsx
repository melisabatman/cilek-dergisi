import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, checkIsAdmin } from '../lib/supabase'
import { uploadAsset, isR2Configured } from '../lib/r2'
import { useSiteContent, DEFAULT_SITE_SETTINGS, DEFAULT_SITE_CONTENT } from '../lib/siteContent'
import WelcomePostcardModal from '../components/WelcomePostcardModal'

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
  // 3. SİTE İÇERİK & CMS DURUMU (CMS HOOK & STATES)
  // -------------------------------------------------------------
  const { content, updateContent } = useSiteContent()

  // 3A. HOŞ GELDİN MEKTUBU DURUMU (LETTER)
  const [letterState, setLetterState] = useState(() => content?.letter || DEFAULT_SITE_CONTENT.letter)
  const [previewLetterModalOpen, setPreviewLetterModalOpen] = useState(false)
  const [savingLetter, setSavingLetter] = useState(false)

  // 3B. SİTE METİNLERİ & CMS AYARLARI (TÜM SAYFALAR)
  const { settings, updateSettings } = useSiteContent()
  const [siteState, setSiteState] = useState(() => settings || DEFAULT_SITE_SETTINGS)
  const [contentSubTab, setContentSubTab] = useState('home')
  const [uploadingImageKey, setUploadingImageKey] = useState(null)
  const [savingSite, setSavingSite] = useState(false)

  // 3C. MEDYA & FOTOĞRAFLAR DURUMU (MEDIA)
  const [mediaState, setMediaState] = useState(() => content?.media || DEFAULT_SITE_CONTENT.media)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [mediaUploadFile, setMediaUploadFile] = useState(null)
  const [mediaUploadPreview, setMediaUploadPreview] = useState('')
  const [mediaUploadTitle, setMediaUploadTitle] = useState('')
  const [mediaCopiedId, setMediaCopiedId] = useState(null)
  const [savingMediaSettings, setSavingMediaSettings] = useState(false)

  useEffect(() => {
    if (content?.letter) setLetterState(content.letter)
    if (content?.media) setMediaState(content.media)
  }, [content])

  useEffect(() => {
    if (settings) {
      setSiteState(prev => ({ ...DEFAULT_SITE_SETTINGS, ...prev, ...settings }))
    }
  }, [settings])

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
  // 3. HOŞ GELDİN MEKTUBU İŞLEMLERİ (LETTER HANDLERS)
  // -------------------------------------------------------------
  const handleLetterChange = (field, val) => {
    setLetterState(prev => ({ ...prev, [field]: val }))
  }

  const handlePerkChange = (index, val) => {
    setLetterState(prev => {
      const perks = [...(prev.perks || [])]
      perks[index] = val
      return { ...prev, perks }
    })
  }

  const handleAddPerk = () => {
    setLetterState(prev => ({ ...prev, perks: [...(prev.perks || []), ''] }))
  }

  const handleRemovePerk = (index) => {
    setLetterState(prev => ({
      ...prev,
      perks: (prev.perks || []).filter((_, i) => i !== index)
    }))
  }

  const handleSaveLetter = async (e) => {
    if (e) e.preventDefault()
    setSavingLetter(true)
    try {
      await updateContent({ letter: letterState })
      showFeedback('success', 'Hoş Geldin Mektubu başarıyla güncellendi!')
    } catch (err) {
      showFeedback('error', 'Mektup kaydedilirken hata oluştu.')
    } finally {
      setSavingLetter(false)
    }
  }

  const handleResetLetter = () => {
    if (window.confirm('Hoş geldin mektubunu orijinal fabrika ayarlarına sıfırlamak istediğinize emin misiniz?')) {
      setLetterState(DEFAULT_SITE_CONTENT.letter)
      updateContent({ letter: DEFAULT_SITE_CONTENT.letter })
      showFeedback('success', 'Mektup varsayılan değerlerine sıfırlandı.')
    }
  }

  // -------------------------------------------------------------
  // 4. SİTE METİNLERİ & CMS İŞLEMLERİ (TÜM SAYFALAR)
  // -------------------------------------------------------------
  const handleSiteChange = (field, val) => {
    setSiteState(prev => ({ ...prev, [field]: val }))
  }

  const handleUploadImageForField = async (fieldKey, file, prefix = 'site') => {
    if (!file) return
    setUploadingImageKey(fieldKey)
    try {
      const cleanPrefix = `${prefix}_${fieldKey}`.replace(/[^a-zA-Z0-9_]/g, '')
      const { publicUrl, error } = await uploadAsset('covers', file, cleanPrefix)
      if (error || !publicUrl) {
        showFeedback('error', 'Fotoğraf yüklenemedi: ' + (error?.message || 'Bilinmeyen hata'))
      } else {
        setSiteState(prev => ({ ...prev, [fieldKey]: publicUrl }))
        showFeedback('success', 'Fotoğraf Cloudflare R2\'ye yüklendi! "Tüm Değişiklikleri Kaydet" butonuna basarak kalıcı yapabilirsiniz.')
      }
    } catch (err) {
      showFeedback('error', 'Hata: ' + err.message)
    } finally {
      setUploadingImageKey(null)
    }
  }

  const handleSaveSite = async (e) => {
    if (e) e.preventDefault()
    setSavingSite(true)
    try {
      await updateSettings(siteState)
      showFeedback('success', 'Site içeriği ve ayarları başarıyla kaydedildi! Canlı sitede anında güncellendi.')
    } catch (err) {
      showFeedback('error', 'Ayarlar kaydedilirken hata oluştu: ' + (err?.message || err))
    } finally {
      setSavingSite(false)
    }
  }

  const handleResetSite = () => {
    if (window.confirm('Tüm site metin ve görsel ayarlarını orijinal varsayılan hallerine döndürmek istediğinize emin misiniz?')) {
      setSiteState(DEFAULT_SITE_SETTINGS)
      updateSettings(DEFAULT_SITE_SETTINGS)
      showFeedback('success', 'Tüm site ayarları varsayılan değerlerine sıfırlandı.')
    }
  }

  // -------------------------------------------------------------
  // 5. MEDYA & FOTOĞRAFLAR İŞLEMLERİ (MEDIA HANDLERS)
  // -------------------------------------------------------------
  const handleMediaFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setMediaUploadFile(file)
      setMediaUploadPreview(URL.createObjectURL(file))
      if (!mediaUploadTitle) {
        setMediaUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '))
      }
    }
  }

  const handleUploadNewMedia = async (e) => {
    e.preventDefault()
    if (!mediaUploadFile) {
      showFeedback('error', 'Lütfen yüklenecek bir fotoğraf seçin.')
      return
    }

    setUploadingMedia(true)
    try {
      const cleanPrefix = `site_media_${Date.now()}`
      const { publicUrl, error: uploadErr } = await uploadAsset('covers', mediaUploadFile, cleanPrefix)
      if (uploadErr) throw uploadErr

      const newItem = {
        id: 'm-' + Date.now(),
        name: mediaUploadTitle.trim() || mediaUploadFile.name,
        url: publicUrl,
        date: new Date().toISOString().split('T')[0]
      }

      const updatedGallery = [newItem, ...(mediaState.gallery || [])]
      const nextMedia = { ...mediaState, gallery: updatedGallery }
      setMediaState(nextMedia)
      await updateContent({ media: nextMedia })

      // Formu temizle
      setMediaUploadFile(null)
      setMediaUploadPreview('')
      setMediaUploadTitle('')
      showFeedback('success', `"${newItem.name}" fotoğrafı kütüphaneye başarıyla eklendi!`)
    } catch (err) {
      console.error('Media upload error:', err)
      showFeedback('error', 'Fotoğraf yüklenirken hata oluştu: ' + (err.message || 'Bilinmeyen hata'))
    } finally {
      setUploadingMedia(false)
    }
  }

  const handleCopyMediaUrl = (url, id) => {
    if (!url) return
    navigator.clipboard.writeText(url)
    setMediaCopiedId(id)
    setTimeout(() => setMediaCopiedId(null), 2500)
    showFeedback('success', 'Fotoğraf bağlantısı (URL) panoya kopyalandı!')
  }

  const handleDeleteMedia = async (id) => {
    const updatedGallery = (mediaState.gallery || []).filter(item => item.id !== id)
    const nextMedia = { ...mediaState, gallery: updatedGallery }
    setMediaState(nextMedia)
    await updateContent({ media: nextMedia })
    showFeedback('success', 'Fotoğraf galeriden silindi.')
  }

  const handleSetAsFounderPhoto = async (url) => {
    const nextMedia = { ...mediaState, founder_photo: url }
    setMediaState(nextMedia)
    await updateContent({ media: nextMedia })
    showFeedback('success', 'Seçilen görsel Kurucu Fotoğrafı olarak atandı!')
  }

  const handleSetAsAboutPhoto = async (url, slot) => {
    const nextMedia = { ...mediaState, [`about_photo_${slot}`]: url }
    setMediaState(nextMedia)
    await updateContent({ media: nextMedia })
    showFeedback('success', `Seçilen görsel Hakkımızda Polaroid ${slot} olarak atandı!`)
  }

  const handleSaveMediaSettings = async (e) => {
    if (e) e.preventDefault()
    setSavingMediaSettings(true)
    try {
      await updateContent({ media: mediaState })
      showFeedback('success', 'Site fotoğraf tercihleri başarıyla kaydedildi!')
    } catch (err) {
      showFeedback('error', 'Fotoğraf tercihleri kaydedilemedi.')
    } finally {
      setSavingMediaSettings(false)
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
            <a
              href="/"
              className="btn-admin-gate-ghost"
              id="btn-gate-home"
              onClick={(e) => {
                e.preventDefault()
                window.location.href = '/'
              }}
            >
              ← Siteye Dön
            </a>
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
            <a
              href="/"
              className="admin-back-site-link"
              title="Ana Sayfaya Dön"
              id="btn-admin-view-site"
              onClick={(e) => {
                e.preventDefault()
                window.location.href = '/'
              }}
            >
              ← Siteyi Gör
            </a>
            <div className="admin-brand-info">
              <a
                href="/"
                title="Ana Sayfaya Git"
                style={{ textDecoration: 'none' }}
                onClick={(e) => {
                  e.preventDefault()
                  window.location.href = '/'
                }}
              >
                <span className="admin-brand-pre">Çilek Dergisi ↗</span>
              </a>
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
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'letter'}
            className={`admin-tab-btn ${activeTab === 'letter' ? 'active' : ''}`}
            onClick={() => setActiveTab('letter')}
            id="tab-btn-letter"
          >
            💌 Hoş Geldin Mektubu
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'content'}
            className={`admin-tab-btn ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
            id="tab-btn-content"
          >
            ✍️ Site Metinleri
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'media'}
            className={`admin-tab-btn ${activeTab === 'media' ? 'active' : ''}`}
            onClick={() => setActiveTab('media')}
            id="tab-btn-media"
          >
            🖼️ Medya & Fotoğraflar ({mediaState?.gallery?.length || 0})
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

        {/* -------------------------------------------------------------
            TAB 3: HOŞ GELDİN MEKTUBU YÖNETİMİ
        ------------------------------------------------------------- */}
        {activeTab === 'letter' && (
          <div className="admin-tab-content">
            <div className="admin-cms-header">
              <div>
                <h2 className="admin-card-title">💌 Hoş Geldin Mektubu Düzenleyici</h2>
                <p className="admin-card-subtitle">
                  Yeni veya kayıtlı okurların sitenin sağ üst köşesindeki mektup simgesine tıkladığında açılan nostaljik zarf ve mektubun tüm metinlerini buradan düzenleyebilirsiniz.
                </p>
              </div>
              <div className="admin-cms-actions">
                <button
                  type="button"
                  className="btn-cms-preview"
                  onClick={() => setPreviewLetterModalOpen(true)}
                  id="btn-preview-welcome-letter"
                >
                  👁️ Mektubu Canlı Önizle
                </button>
                <button
                  type="button"
                  className="btn-cms-reset"
                  onClick={handleResetLetter}
                  id="btn-reset-welcome-letter"
                >
                  Varsayılanlara Dön
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveLetter} className="admin-cms-form" id="form-letter-admin">
              {/* Bölüm 1: Zarf & Dış Kapak Ayarları */}
              <div className="admin-cms-section-card">
                <div className="cms-section-title">
                  <span className="cms-section-icon">✉️</span>
                  <div>
                    <h3>Aşama 1: Nostaljik Kartpostal & Zarf Detayları</h3>
                    <small>Kullanıcının mektubu açmadan önce gördüğü mühürlü zarf üzerindeki etiketler.</small>
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-field-group" style={{ flex: 1 }}>
                    <label className="admin-label">Zarf Gönderici Bilgisi (FROM)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={letterState.envelope_sender || ''}
                      onChange={(e) => handleLetterChange('envelope_sender', e.target.value)}
                      placeholder="Örn: Çilek Dergisi Editoryal Masası"
                    />
                  </div>
                  <div className="admin-field-group" style={{ flex: 1 }}>
                    <label className="admin-label">Zarf Marka Alt Başlığı</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={letterState.envelope_sub || ''}
                      onChange={(e) => handleLetterChange('envelope_sub', e.target.value)}
                      placeholder="Örn: Bağımsız Dijital Gençlik Yayını"
                    />
                  </div>
                  <div className="admin-field-group" style={{ flex: 1 }}>
                    <label className="admin-label">Zarfı Aç Buton Metni</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={letterState.button_open || ''}
                      onChange={(e) => handleLetterChange('button_open', e.target.value)}
                      placeholder="Örn: Mektubu Aç ve Oku ✂️"
                    />
                  </div>
                </div>
              </div>

              {/* Bölüm 2: Mektup Başlık ve Karşılama */}
              <div className="admin-cms-section-card">
                <div className="cms-section-title">
                  <span className="cms-section-icon">🏷️</span>
                  <div>
                    <h3>Aşama 2: Mektup Başlığı & Karşılama</h3>
                    <small>Zarf açıldığında en üstte parıldayan rozet, ana başlık ve selamlama.</small>
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-field-group" style={{ flex: '0 0 240px' }}>
                    <label className="admin-label">Üst Rozet / Etiket</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={letterState.badge || ''}
                      onChange={(e) => handleLetterChange('badge', e.target.value)}
                      placeholder="Örn: ÖZEL ÇİLEK MEKTUBU"
                    />
                  </div>
                  <div className="admin-field-group" style={{ flex: 1 }}>
                    <label className="admin-label">Mektup Ana Başlığı</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={letterState.title || ''}
                      onChange={(e) => handleLetterChange('title', e.target.value)}
                      placeholder="Örn: THANK YOU SO MUCH!"
                    />
                  </div>
                </div>

                <div className="admin-field-group">
                  <label className="admin-label">Alt Başlık (Selamlama)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={letterState.subtitle || ''}
                    onChange={(e) => handleLetterChange('subtitle', e.target.value)}
                    placeholder="Örn: Çilek Ailesine Aramıza Hoş Geldin Sevgili {name} 🍓"
                  />
                  <span className="admin-field-hint">İpucu: <code>{'{name}'}</code> yazdığınız yer giriş yapan okuyucunun adıyla otomatik değişir.</span>
                </div>
              </div>

              {/* Bölüm 3: Mektup İçeriği ve Gövdesi */}
              <div className="admin-cms-section-card">
                <div className="cms-section-title">
                  <span className="cms-section-icon">✍️</span>
                  <div>
                    <h3>Aşama 3: Mektup Metni & Alıntı</h3>
                    <small>Mektubun kalbini oluşturan el yazısı açılış cümlesi ve ana paragraf.</small>
                  </div>
                </div>

                <div className="admin-field-group">
                  <label className="admin-label">El Yazısı Açılış Alıntısı (Lead)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={letterState.lead_quote || ''}
                    onChange={(e) => handleLetterChange('lead_quote', e.target.value)}
                    placeholder='Örn: “Kendine ait bir oda, kendine ait bir ses...”'
                  />
                </div>

                <div className="admin-field-group">
                  <label className="admin-label">Ana Mektup Paragrafı</label>
                  <textarea
                    rows={4}
                    className="admin-textarea"
                    value={letterState.body_paragraph || ''}
                    onChange={(e) => handleLetterChange('body_paragraph', e.target.value)}
                    placeholder="Çilek Dergisi'nin bağımsız sayfalarına katıldığın için..."
                  />
                </div>
              </div>

              {/* Bölüm 4: Kazanımlar / Ayrıcalıklar Listesi */}
              <div className="admin-cms-section-card">
                <div className="cms-section-title" style={{ justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span className="cms-section-icon">🎁</span>
                    <div>
                      <h3>Aşama 4: Neler Kazandın? (Kazanımlar Listesi)</h3>
                      <small>Okuyucunun dergiye üye olarak kazandığı haklar ve ayrıcalıklar.</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-add-toc-item"
                    onClick={handleAddPerk}
                  >
                    + Madde Ekle
                  </button>
                </div>

                <div className="admin-field-group">
                  <label className="admin-label">Kazanımlar Kutusu Başlığı</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={letterState.perks_title || ''}
                    onChange={(e) => handleLetterChange('perks_title', e.target.value)}
                    placeholder="Örn: Aramıza Katılarak Neler Kazandın?"
                  />
                </div>

                <div className="toc-inputs-list">
                  {(letterState.perks || []).map((perk, pIdx) => (
                    <div key={pIdx} className="toc-input-row">
                      <span className="toc-row-number">{pIdx + 1}.</span>
                      <input
                        type="text"
                        className="admin-input toc-item-input"
                        value={perk}
                        onChange={(e) => handlePerkChange(pIdx, e.target.value)}
                        placeholder="Örn: 📖 **Tüm Sayılara Sınırsız Erişim:** Sayfaları kitap gibi çevirerek oku."
                      />
                      <button
                        type="button"
                        className="btn-remove-toc"
                        onClick={() => handleRemovePerk(pIdx)}
                        title="Maddeyi Sil"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bölüm 5: İmza & Keşfet Butonu */}
              <div className="admin-cms-section-card">
                <div className="cms-section-title">
                  <span className="cms-section-icon">✒️</span>
                  <div>
                    <h3>Aşama 5: Kapanış & İmza</h3>
                    <small>Mektup sonundaki iyi dilek cümlesi, imza ve aksiyon butonu.</small>
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-field-group" style={{ flex: 1 }}>
                    <label className="admin-label">Kapanış İyi Dilek Cümlesi</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={letterState.signoff_quote || ''}
                      onChange={(e) => handleLetterChange('signoff_quote', e.target.value)}
                      placeholder="Sayfalarımızın arasında kendi rengini bulman dileğiyle,"
                    />
                  </div>
                  <div className="admin-field-group" style={{ flex: 1 }}>
                    <label className="admin-label">İmza Metni</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={letterState.signoff_signature || ''}
                      onChange={(e) => handleLetterChange('signoff_signature', e.target.value)}
                      placeholder="Sevgiyle, Çilek Dergi Ekibi ♥"
                    />
                  </div>
                  <div className="admin-field-group" style={{ flex: 1 }}>
                    <label className="admin-label">Alt Aksiyon Buton Metni</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={letterState.button_explore || ''}
                      onChange={(e) => handleLetterChange('button_explore', e.target.value)}
                      placeholder="Dergileri Keşfetmeye Başla"
                    />
                  </div>
                </div>
              </div>

              {/* Kaydet Bar */}
              <div className="admin-cms-submit-bar">
                <button
                  type="submit"
                  className="btn-admin-submit-cms"
                  disabled={savingLetter}
                  id="btn-save-letter"
                >
                  {savingLetter ? 'Kaydediliyor…' : '💾 Mektup Değişikliklerini Kaydet'}
                </button>
                <button
                  type="button"
                  className="btn-cms-preview-secondary"
                  onClick={() => setPreviewLetterModalOpen(true)}
                >
                  Canlı Önizle 👁️
                </button>
              </div>
            </form>
          </div>
        )}

                {/* -------------------------------------------------------------
            TAB 4: SİTE İÇERİĞİ & SAYFA DÜZENLEYİCİ (TAM CMS)
        ------------------------------------------------------------- */}
        {activeTab === 'content' && (
          <div className="admin-tab-content">
            <div className="admin-cms-header">
              <div>
                <h2 className="admin-card-title">✍️ Site İçeriği &amp; Sayfa Düzenleyici (CMS)</h2>
                <p className="admin-card-subtitle">
                  Sitedeki tüm metinleri ve fotoğrafları sayfa bazında düzenleyebilirsiniz. Değişiklikler canlı sitede anında görünür.
                </p>
              </div>
              <div className="admin-cms-actions">
                <button
                  type="button"
                  className="btn-cms-reset"
                  onClick={handleResetSite}
                  id="btn-reset-site-content"
                >
                  Varsayılanlara Sıfırla
                </button>
              </div>
            </div>

            {/* Sayfa Alt Sekmeleri (Page Subtabs) */}
            <div className="admin-content-subtabs" role="tablist" aria-label="Sayfa Seçimi">
              <button
                type="button"
                className={`admin-subtab-btn ${contentSubTab === 'home' ? 'active' : ''}`}
                onClick={() => setContentSubTab('home')}
              >
                🏠 Ana Sayfa
              </button>
              <button
                type="button"
                className={`admin-subtab-btn ${contentSubTab === 'about' ? 'active' : ''}`}
                onClick={() => setContentSubTab('about')}
              >
                📖 Hakkımızda
              </button>
              <button
                type="button"
                className={`admin-subtab-btn ${contentSubTab === 'magazines' ? 'active' : ''}`}
                onClick={() => setContentSubTab('magazines')}
              >
                📚 Dergiler
              </button>
              <button
                type="button"
                className={`admin-subtab-btn ${contentSubTab === 'team' ? 'active' : ''}`}
                onClick={() => setContentSubTab('team')}
              >
                👥 Ekibimiz
              </button>
              <button
                type="button"
                className={`admin-subtab-btn ${contentSubTab === 'contact' ? 'active' : ''}`}
                onClick={() => setContentSubTab('contact')}
              >
                ✉️ İletişim
              </button>
              <button
                type="button"
                className={`admin-subtab-btn ${contentSubTab === 'footer' ? 'active' : ''}`}
                onClick={() => setContentSubTab('footer')}
              >
                ⚙️ Genel &amp; Footer
              </button>
            </div>

            <form onSubmit={handleSaveSite} className="admin-cms-form" id="form-site-content-admin">

              {/* ══════════════════════════════════════════════════════════
                  1. ANA SAYFA DÜZENLEME
                  ══════════════════════════════════════════════════════════ */}
              {contentSubTab === 'home' && (
                <>
                  {/* Hero & Manşet */}
                  <div className="admin-cms-section-card">
                    <div className="cms-section-title">
                      <span className="cms-section-icon">🌟</span>
                      <div>
                        <h3>Ana Sayfa Giriş (Hero) Bölümü</h3>
                        <small>Ziyaretçilerin karşılaştığı ilk büyük başlık, açıklama ve kayan duyuru şeridi.</small>
                      </div>
                    </div>

                    <div className="admin-form-row">
                      <div className="admin-field-group" style={{ flex: '0 0 200px' }}>
                        <label className="admin-label">Üst Başlık (Eyebrow)</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.hero_eyebrow || ''}
                          onChange={(e) => handleSiteChange('hero_eyebrow', e.target.value)}
                        />
                      </div>
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">Başlık 1. Satır</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.hero_title_line1 || ''}
                          onChange={(e) => handleSiteChange('hero_title_line1', e.target.value)}
                        />
                      </div>
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">Başlık Vurgulu Kelime (İtalik)</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.hero_title_italic || ''}
                          onChange={(e) => handleSiteChange('hero_title_italic', e.target.value)}
                        />
                      </div>
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">Başlık 2. Kısım (El Yazısı)</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.hero_title_script || ''}
                          onChange={(e) => handleSiteChange('hero_title_script', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="admin-field-group">
                      <label className="admin-label">Hero Alt Açıklama Paragrafı</label>
                      <textarea
                        rows={3}
                        className="admin-textarea"
                        value={siteState.hero_subtitle || ''}
                        onChange={(e) => handleSiteChange('hero_subtitle', e.target.value)}
                      />
                    </div>

                    <div className="admin-form-row">
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">Birincil Buton Metni (Son Sayıyı Oku)</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.hero_cta_text || ''}
                          onChange={(e) => handleSiteChange('hero_cta_text', e.target.value)}
                        />
                      </div>
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">İkincil Buton Metni (Arşivi İncele)</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.hero_cta_archive || ''}
                          onChange={(e) => handleSiteChange('hero_cta_archive', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="admin-field-group">
                      <label className="admin-label">Kayan Duyuru Şeridi Metni (Marquee)</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={siteState.hero_marquee || ''}
                        onChange={(e) => handleSiteChange('hero_marquee', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Telli Pano */}
                  <div className="admin-cms-section-card">
                    <div className="cms-section-title">
                      <span className="cms-section-icon">📌</span>
                      <div>
                        <h3>Telli Pano (Bu Sayıda Seni Neler Bekliyor)</h3>
                        <small>Mandal klipsli telli panoda sergilenen 4 içerik kartı.</small>
                      </div>
                    </div>

                    <div className="admin-field-group">
                      <label className="admin-label">Pano Rozet Etiketi</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={siteState.home_toc_tag || ''}
                        onChange={(e) => handleSiteChange('home_toc_tag', e.target.value)}
                      />
                    </div>

                    <div className="admin-form-row">
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">1. Kart Başlık</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.home_toc_card_1_title || ''}
                          onChange={(e) => handleSiteChange('home_toc_card_1_title', e.target.value)}
                        />
                        <label className="admin-label" style={{ marginTop: '8px' }}>1. Kart Açıklama</label>
                        <textarea
                          rows={2}
                          className="admin-textarea"
                          value={siteState.home_toc_card_1_desc || ''}
                          onChange={(e) => handleSiteChange('home_toc_card_1_desc', e.target.value)}
                        />
                      </div>
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">2. Kart Başlık</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.home_toc_card_2_title || ''}
                          onChange={(e) => handleSiteChange('home_toc_card_2_title', e.target.value)}
                        />
                        <label className="admin-label" style={{ marginTop: '8px' }}>2. Kart Açıklama</label>
                        <textarea
                          rows={2}
                          className="admin-textarea"
                          value={siteState.home_toc_card_2_desc || ''}
                          onChange={(e) => handleSiteChange('home_toc_card_2_desc', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="admin-form-row">
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">3. Kart Başlık</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.home_toc_card_3_title || ''}
                          onChange={(e) => handleSiteChange('home_toc_card_3_title', e.target.value)}
                        />
                        <label className="admin-label" style={{ marginTop: '8px' }}>3. Kart Açıklama</label>
                        <textarea
                          rows={2}
                          className="admin-textarea"
                          value={siteState.home_toc_card_3_desc || ''}
                          onChange={(e) => handleSiteChange('home_toc_card_3_desc', e.target.value)}
                        />
                      </div>
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">4. Kart Başlık</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.home_toc_card_4_title || ''}
                          onChange={(e) => handleSiteChange('home_toc_card_4_title', e.target.value)}
                        />
                        <label className="admin-label" style={{ marginTop: '8px' }}>4. Kart Açıklama</label>
                        <textarea
                          rows={2}
                          className="admin-textarea"
                          value={siteState.home_toc_card_4_desc || ''}
                          onChange={(e) => handleSiteChange('home_toc_card_4_desc', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 5 Temel İçerik Türü */}
                  <div className="admin-cms-section-card">
                    <div className="cms-section-title">
                      <span className="cms-section-icon">✨</span>
                      <div>
                        <h3>Her Sayıda Seni Bekleyenler (5 Temel İçerik Türü)</h3>
                        <small>Retro spiral takvim/bloknot alanındaki 5 sütun içeriği.</small>
                      </div>
                    </div>

                    <div className="admin-form-row">
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">Ana Başlık</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.features_title || ''}
                          onChange={(e) => handleSiteChange('features_title', e.target.value)}
                        />
                      </div>
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">Alt Açıklama Cümlesi</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.features_subtitle || ''}
                          onChange={(e) => handleSiteChange('features_subtitle', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* 5 Madde */}
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} className="admin-form-row" style={{ alignItems: 'flex-start', borderTop: '1px dashed rgba(190,38,37,0.15)', paddingTop: '10px' }}>
                        <div className="admin-field-group" style={{ flex: '0 0 200px' }}>
                          <label className="admin-label">#{num} Başlık</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={siteState[`feature_${num}_title`] || ''}
                            onChange={(e) => handleSiteChange(`feature_${num}_title`, e.target.value)}
                          />
                        </div>
                        <div className="admin-field-group" style={{ flex: 1 }}>
                          <label className="admin-label">#{num} Açıklama</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={siteState[`feature_${num}_desc`] || ''}
                            onChange={(e) => handleSiteChange(`feature_${num}_desc`, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Editoryal Dergi Sayfası (MagazineSpreadSection) */}
                  <div className="admin-cms-section-card">
                    <div className="cms-section-title">
                      <span className="cms-section-icon">📖</span>
                      <div>
                        <h3>Editoryal Dergi Sayfası (Açık Çift Sayfa)</h3>
                        <small>Sol sayfadaki manşet, rozetler ve sağ sayfadaki washi bantlı fotoğraf alanı.</small>
                      </div>
                    </div>

                    <div className="admin-form-row">
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">Üst Etiket (Tag)</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.editorial_tag || ''}
                          onChange={(e) => handleSiteChange('editorial_tag', e.target.value)}
                        />
                      </div>
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">Alt Konu Bandı</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.editorial_sub || ''}
                          onChange={(e) => handleSiteChange('editorial_sub', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="admin-form-row">
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">Manşet 1. Satır</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.editorial_headline || ''}
                          onChange={(e) => handleSiteChange('editorial_headline', e.target.value)}
                        />
                      </div>
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">Manşet 2. Satır (İtalik)</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.editorial_headline_italic || ''}
                          onChange={(e) => handleSiteChange('editorial_headline_italic', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="admin-field-group">
                      <label className="admin-label">Editoryal Açıklama Paragrafı</label>
                      <textarea
                        rows={3}
                        className="admin-textarea"
                        value={siteState.editorial_lead || ''}
                        onChange={(e) => handleSiteChange('editorial_lead', e.target.value)}
                      />
                    </div>

                    {/* 3 Rozet */}
                    <div className="admin-form-row">
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">1. Rozet (Sarı Pul): Başlık &amp; Alt</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.editorial_badge_1_val || ''}
                          onChange={(e) => handleSiteChange('editorial_badge_1_val', e.target.value)}
                          placeholder="Sayı 06"
                        />
                        <input
                          type="text"
                          className="admin-input"
                          style={{ marginTop: '6px' }}
                          value={siteState.editorial_badge_1_label || ''}
                          onChange={(e) => handleSiteChange('editorial_badge_1_label', e.target.value)}
                          placeholder="GÜNCEL SAYI"
                        />
                      </div>
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">2. Rozet (Kırmızı Pul): Başlık &amp; Alt</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.editorial_badge_2_val || ''}
                          onChange={(e) => handleSiteChange('editorial_badge_2_val', e.target.value)}
                          placeholder="15-25"
                        />
                        <input
                          type="text"
                          className="admin-input"
                          style={{ marginTop: '6px' }}
                          value={siteState.editorial_badge_2_label || ''}
                          onChange={(e) => handleSiteChange('editorial_badge_2_label', e.target.value)}
                          placeholder="YAŞ ALANI"
                        />
                      </div>
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">3. Rozet (Yeşil Pul): Başlık &amp; Alt</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.editorial_badge_3_val || ''}
                          onChange={(e) => handleSiteChange('editorial_badge_3_val', e.target.value)}
                          placeholder="%100"
                        />
                        <input
                          type="text"
                          className="admin-input"
                          style={{ marginTop: '6px' }}
                          value={siteState.editorial_badge_3_label || ''}
                          onChange={(e) => handleSiteChange('editorial_badge_3_label', e.target.value)}
                          placeholder="BAĞIMSIZ"
                        />
                      </div>
                    </div>

                    {/* Sağ Sayfa Editoryal Fotoğrafı */}
                    <div className="admin-field-group" style={{ borderTop: '1px solid rgba(190,38,37,0.15)', paddingTop: '16px' }}>
                      <label className="admin-label">📸 Sağ Sayfa Editoryal Fotoğrafı</label>
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {siteState.editorial_photo_url ? (
                          <img
                            src={siteState.editorial_photo_url}
                            alt="Editoryal Önizleme"
                            style={{ width: '100px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #1A0A0E' }}
                          />
                        ) : (
                          <div style={{ width: '100px', height: '120px', borderRadius: '8px', border: '2px dashed #1A0A0E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                            📷
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            className="admin-input"
                            value={siteState.editorial_photo_url || ''}
                            onChange={(e) => handleSiteChange('editorial_photo_url', e.target.value)}
                            placeholder="Görsel URL veya doğrudan yükleyin..."
                            style={{ marginBottom: '8px' }}
                          />
                          <label className="btn-admin-upload" style={{ cursor: uploadingImageKey === 'editorial_photo_url' ? 'wait' : 'pointer', display: 'inline-block' }}>
                            {uploadingImageKey === 'editorial_photo_url' ? '⏳ Cloudflare R2\'ye Yükleniyor…' : '📁 Yeni Fotoğraf Seç & Yükle (R2)'}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              disabled={uploadingImageKey === 'editorial_photo_url'}
                              onChange={(e) => handleUploadImageForField('editorial_photo_url', e.target.files[0], 'spread')}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ekip Başlığı & Kurucu Köşesi */}
                  <div className="admin-cms-section-card">
                    <div className="cms-section-title">
                      <span className="cms-section-icon">👥</span>
                      <div>
                        <h3>Ekip Kayan Şeridi &amp; Kurucu Bölümü</h3>
                        <small>Ana sayfada ekip şeridinin başlığı ve kurucu polaroid alanı.</small>
                      </div>
                    </div>

                    <div className="admin-form-row">
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">Ekip Başlığı</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.home_team_title || ''}
                          onChange={(e) => handleSiteChange('home_team_title', e.target.value)}
                        />
                      </div>
                      <div className="admin-field-group" style={{ flex: '0 0 200px' }}>
                        <label className="admin-label">Ekip Buton Metni</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.home_team_cta || ''}
                          onChange={(e) => handleSiteChange('home_team_cta', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="admin-form-row" style={{ borderTop: '1px dashed rgba(190,38,37,0.15)', paddingTop: '14px' }}>
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">Kurucu Alıntısı</label>
                        <textarea
                          rows={2}
                          className="admin-textarea"
                          value={siteState.about_founder_quote || ''}
                          onChange={(e) => handleSiteChange('about_founder_quote', e.target.value)}
                        />
                      </div>
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">Kurucu Biyografi / Editoryal Açıklama</label>
                        <textarea
                          rows={2}
                          className="admin-textarea"
                          value={siteState.about_founder_bio || ''}
                          onChange={(e) => handleSiteChange('about_founder_bio', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Kurucu Fotoğrafı Yükleme */}
                    <div className="admin-field-group" style={{ marginTop: '10px' }}>
                      <label className="admin-label">📸 Kurucu Fotoğrafı (Polaroid Görsel)</label>
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {siteState.about_founder_photo_url ? (
                          <img
                            src={siteState.about_founder_photo_url}
                            alt="Kurucu Önizleme"
                            style={{ width: '100px', height: '110px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #1A0A0E' }}
                          />
                        ) : (
                          <div style={{ width: '100px', height: '110px', borderRadius: '8px', border: '2px dashed #1A0A0E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                            🍓
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            className="admin-input"
                            value={siteState.about_founder_photo_url || ''}
                            onChange={(e) => handleSiteChange('about_founder_photo_url', e.target.value)}
                            placeholder="Kurucu fotoğrafı bağlantısı veya doğrudan yükleyin..."
                            style={{ marginBottom: '8px' }}
                          />
                          <label className="btn-admin-upload" style={{ cursor: uploadingImageKey === 'about_founder_photo_url' ? 'wait' : 'pointer', display: 'inline-block' }}>
                            {uploadingImageKey === 'about_founder_photo_url' ? '⏳ Cloudflare R2\'ye Yükleniyor…' : '📁 Fotoğraf Değiştir (Cloudflare R2)'}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              disabled={uploadingImageKey === 'about_founder_photo_url'}
                              onChange={(e) => handleUploadImageForField('about_founder_photo_url', e.target.files[0], 'founder')}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Katılım Çağrısı (CTA Banner) */}
                  <div className="admin-cms-section-card">
                    <div className="cms-section-title">
                      <span className="cms-section-icon">💌</span>
                      <div>
                        <h3>Katılım Çağrısı / Bize Yazın Banner'ı</h3>
                        <small>Ana sayfanın altındaki "Sayfalarda Yerini Al" çağrı kartı.</small>
                      </div>
                    </div>

                    <div className="admin-form-row">
                      <div className="admin-field-group" style={{ flex: 1 }}>
                        <label className="admin-label">Banner Başlığı</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.home_cta_title || ''}
                          onChange={(e) => handleSiteChange('home_cta_title', e.target.value)}
                        />
                      </div>
                      <div className="admin-field-group" style={{ flex: '0 0 220px' }}>
                        <label className="admin-label">Buton Metni</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={siteState.home_cta_button || ''}
                          onChange={(e) => handleSiteChange('home_cta_button', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="admin-field-group">
                      <label className="admin-label">Açıklama Metni</label>
                      <textarea
                        rows={2}
                        className="admin-textarea"
                        value={siteState.home_cta_desc || ''}
                        onChange={(e) => handleSiteChange('home_cta_desc', e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ══════════════════════════════════════════════════════════
                  2. HAKKIMIZDA SAYFASI DÜZENLEME
                  ══════════════════════════════════════════════════════════ */}
              {contentSubTab === 'about' && (
                <div className="admin-cms-section-card">
                  <div className="cms-section-title">
                    <span className="cms-section-icon">📖</span>
                    <div>
                      <h3>Hakkımızda Sayfası İçeriği &amp; Görselleri</h3>
                      <small>/hakkimizda sayfasındaki açılış sözü, hikaye paragrafları ve 2 adet polaroid fotoğraf.</small>
                    </div>
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Büyük Duygusal Açılış Sözü</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={siteState.about_opening_quote || ''}
                      onChange={(e) => handleSiteChange('about_opening_quote', e.target.value)}
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Hikâyemiz Başlığı</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={siteState.about_story_title || ''}
                      onChange={(e) => handleSiteChange('about_story_title', e.target.value)}
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Hikaye Paragraf 1</label>
                    <textarea
                      rows={3}
                      className="admin-textarea"
                      value={siteState.about_paragraph_1 || ''}
                      onChange={(e) => handleSiteChange('about_paragraph_1', e.target.value)}
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Hikaye Paragraf 2</label>
                    <textarea
                      rows={3}
                      className="admin-textarea"
                      value={siteState.about_paragraph_2 || ''}
                      onChange={(e) => handleSiteChange('about_paragraph_2', e.target.value)}
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Hikaye Paragraf 3</label>
                    <textarea
                      rows={3}
                      className="admin-textarea"
                      value={siteState.about_paragraph_3 || ''}
                      onChange={(e) => handleSiteChange('about_paragraph_3', e.target.value)}
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Manifesto Vurgu Alıntısı</label>
                    <textarea
                      rows={2}
                      className="admin-textarea"
                      value={siteState.about_manifesto_quote || ''}
                      onChange={(e) => handleSiteChange('about_manifesto_quote', e.target.value)}
                    />
                  </div>

                  {/* 2 Adet Hakkımızda Polaroid Görseli */}
                  <div className="admin-form-row" style={{ borderTop: '1px solid rgba(190,38,37,0.15)', paddingTop: '16px' }}>
                    <div className="admin-field-group" style={{ flex: 1 }}>
                      <label className="admin-label">📸 Hakkımızda Görsel 1 (Polaroid Üst)</label>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {siteState.about_photo_1_url ? (
                          <img src={siteState.about_photo_1_url} alt="Önizleme 1" style={{ width: '70px', height: '85px', objectFit: 'cover', borderRadius: '6px', border: '1.5px solid #1A0A0E' }} />
                        ) : null}
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            className="admin-input"
                            value={siteState.about_photo_1_url || ''}
                            onChange={(e) => handleSiteChange('about_photo_1_url', e.target.value)}
                            style={{ marginBottom: '6px' }}
                          />
                          <label className="btn-admin-upload" style={{ cursor: 'pointer', display: 'inline-block' }}>
                            {uploadingImageKey === 'about_photo_1_url' ? 'Yükleniyor…' : 'Fotoğraf Değiştir (R2)'}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => handleUploadImageForField('about_photo_1_url', e.target.files[0], 'about1')}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="admin-field-group" style={{ flex: 1 }}>
                      <label className="admin-label">📸 Hakkımızda Görsel 2 (Polaroid Alt)</label>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {siteState.about_photo_2_url ? (
                          <img src={siteState.about_photo_2_url} alt="Önizleme 2" style={{ width: '70px', height: '85px', objectFit: 'cover', borderRadius: '6px', border: '1.5px solid #1A0A0E' }} />
                        ) : null}
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            className="admin-input"
                            value={siteState.about_photo_2_url || ''}
                            onChange={(e) => handleSiteChange('about_photo_2_url', e.target.value)}
                            style={{ marginBottom: '6px' }}
                          />
                          <label className="btn-admin-upload" style={{ cursor: 'pointer', display: 'inline-block' }}>
                            {uploadingImageKey === 'about_photo_2_url' ? 'Yükleniyor…' : 'Fotoğraf Değiştir (R2)'}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => handleUploadImageForField('about_photo_2_url', e.target.files[0], 'about2')}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════
                  3. DERGİLER SAYFASI DÜZENLEME
                  ══════════════════════════════════════════════════════════ */}
              {contentSubTab === 'magazines' && (
                <div className="admin-cms-section-card">
                  <div className="cms-section-title">
                    <span className="cms-section-icon">📚</span>
                    <div>
                      <h3>Dergiler Arşivi &amp; Dijital Raf Başlıkları</h3>
                      <small>/dergiler sayfasının üstündeki başlık, etiket ve açıklama cümleleri.</small>
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-field-group" style={{ flex: '0 0 200px' }}>
                      <label className="admin-label">Üst Etiket (Eyebrow)</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={siteState.magazines_eyebrow || ''}
                        onChange={(e) => handleSiteChange('magazines_eyebrow', e.target.value)}
                      />
                    </div>
                    <div className="admin-field-group" style={{ flex: 1 }}>
                      <label className="admin-label">Sayfa Ana Başlığı</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={siteState.magazines_title || ''}
                        onChange={(e) => handleSiteChange('magazines_title', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Açıklama Paragrafı</label>
                    <textarea
                      rows={3}
                      className="admin-textarea"
                      value={siteState.magazines_subtitle || ''}
                      onChange={(e) => handleSiteChange('magazines_subtitle', e.target.value)}
                    />
                  </div>
                  <span className="admin-field-hint">Not: Raftaki dergileri ve PDF/kapaklarını "Sayılar &amp; Dergiler" sekmesinden yönetebilirsiniz.</span>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════
                  4. EKİBİMİZ SAYFASI DÜZENLEME
                  ══════════════════════════════════════════════════════════ */}
              {contentSubTab === 'team' && (
                <div className="admin-cms-section-card">
                  <div className="cms-section-title">
                    <span className="cms-section-icon">👥</span>
                    <div>
                      <h3>Ekibimiz Sayfası Başlık &amp; Açıklaması</h3>
                      <small>/ekibimiz sayfasındaki streaming kart slider'ının üst başlığı ve açıklaması.</small>
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-field-group" style={{ flex: '0 0 200px' }}>
                      <label className="admin-label">Üst Etiket (Eyebrow)</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={siteState.team_page_eyebrow || ''}
                        onChange={(e) => handleSiteChange('team_page_eyebrow', e.target.value)}
                      />
                    </div>
                    <div className="admin-field-group" style={{ flex: 1 }}>
                      <label className="admin-label">Sayfa Başlığı</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={siteState.team_page_title || ''}
                        onChange={(e) => handleSiteChange('team_page_title', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Sayfa Açıklama Cümlesi</label>
                    <textarea
                      rows={2}
                      className="admin-textarea"
                      value={siteState.team_page_description || ''}
                      onChange={(e) => handleSiteChange('team_page_description', e.target.value)}
                    />
                  </div>
                  <span className="admin-field-hint">Not: Ekip üyelerini, rollerini ve fotoğraflarını "Ekip Üyeleri" sekmesinden düzenleyebilirsiniz.</span>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════
                  5. İLETİŞİM / YAZI GÖNDERİN DÜZENLEME
                  ══════════════════════════════════════════════════════════ */}
              {contentSubTab === 'contact' && (
                <div className="admin-cms-section-card">
                  <div className="cms-section-title">
                    <span className="cms-section-icon">✉️</span>
                    <div>
                      <h3>İletişim &amp; Yazı Gönderin Sayfası</h3>
                      <small>/iletisim sayfasındaki başlıklar ve iletişim bilgileri.</small>
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-field-group" style={{ flex: '0 0 200px' }}>
                      <label className="admin-label">Üst Etiket</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={siteState.contact_eyebrow || ''}
                        onChange={(e) => handleSiteChange('contact_eyebrow', e.target.value)}
                      />
                    </div>
                    <div className="admin-field-group" style={{ flex: 1 }}>
                      <label className="admin-label">Sayfa Başlığı</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={siteState.contact_title || ''}
                        onChange={(e) => handleSiteChange('contact_title', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Açıklama Paragrafı</label>
                    <textarea
                      rows={2}
                      className="admin-textarea"
                      value={siteState.contact_subtitle || ''}
                      onChange={(e) => handleSiteChange('contact_subtitle', e.target.value)}
                    />
                  </div>

                  <div className="admin-form-row" style={{ borderTop: '1px dashed rgba(190,38,37,0.15)', paddingTop: '12px' }}>
                    <div className="admin-field-group" style={{ flex: 1 }}>
                      <label className="admin-label">E-Posta Adresi</label>
                      <input
                        type="email"
                        className="admin-input"
                        value={siteState.contact_email || ''}
                        onChange={(e) => handleSiteChange('contact_email', e.target.value)}
                      />
                    </div>
                    <div className="admin-field-group" style={{ flex: 1 }}>
                      <label className="admin-label">Telefon Numarası</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={siteState.contact_phone || ''}
                        onChange={(e) => handleSiteChange('contact_phone', e.target.value)}
                      />
                    </div>
                    <div className="admin-field-group" style={{ flex: 1 }}>
                      <label className="admin-label">Adres / Şehir</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={siteState.contact_address || ''}
                        onChange={(e) => handleSiteChange('contact_address', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════
                  6. GENEL & FOOTER AYARLARI
                  ══════════════════════════════════════════════════════════ */}
              {contentSubTab === 'footer' && (
                <div className="admin-cms-section-card">
                  <div className="cms-section-title">
                    <span className="cms-section-icon">⚙️</span>
                    <div>
                      <h3>Genel Bilgiler, Footer &amp; Sosyal Medya</h3>
                      <small>Sitenin tüm sayfalarında yer alan alt bilgi (footer) metinleri ve sosyal ağ bağlantıları.</small>
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-field-group" style={{ flex: 1 }}>
                      <label className="admin-label">Marka İsmi</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={siteState.brand_name || ''}
                        onChange={(e) => handleSiteChange('brand_name', e.target.value)}
                      />
                    </div>
                    <div className="admin-field-group" style={{ flex: 1 }}>
                      <label className="admin-label">Telif Hakkı (Copyright Metni)</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={siteState.footer_copyright || ''}
                        onChange={(e) => handleSiteChange('footer_copyright', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Footer Marka Açıklama Cümlesi</label>
                    <textarea
                      rows={2}
                      className="admin-textarea"
                      value={siteState.footer_text || ''}
                      onChange={(e) => handleSiteChange('footer_text', e.target.value)}
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Footer Manifesto Alıntısı</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={siteState.footer_manifesto || ''}
                      onChange={(e) => handleSiteChange('footer_manifesto', e.target.value)}
                    />
                  </div>

                  <div className="admin-form-row" style={{ borderTop: '1px dashed rgba(190,38,37,0.15)', paddingTop: '12px' }}>
                    <div className="admin-field-group" style={{ flex: 1 }}>
                      <label className="admin-label">Instagram Bağlantısı (URL)</label>
                      <input
                        type="url"
                        className="admin-input"
                        value={siteState.social_instagram_url || ''}
                        onChange={(e) => handleSiteChange('social_instagram_url', e.target.value)}
                        placeholder="https://instagram.com/cilekdergisi"
                      />
                    </div>
                    <div className="admin-field-group" style={{ flex: 1 }}>
                      <label className="admin-label">TikTok Bağlantısı (URL)</label>
                      <input
                        type="url"
                        className="admin-input"
                        value={siteState.social_tiktok_url || ''}
                        onChange={(e) => handleSiteChange('social_tiktok_url', e.target.value)}
                        placeholder="https://tiktok.com/@cilekdergisi"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Ortak Kaydet Barı */}
              <div className="admin-cms-submit-bar" style={{ position: 'sticky', bottom: '20px', zIndex: 10, background: 'var(--color-bg)', padding: '16px', borderRadius: '16px', border: '2px solid #1A0A0E', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                <button
                  type="submit"
                  className="btn-admin-submit-cms"
                  disabled={savingSite}
                  id="btn-save-site-texts"
                  style={{ width: '100%', padding: '14px 24px', fontSize: '15px' }}
                >
                  {savingSite ? '⏳ Kaydediliyor…' : '💾 Tüm Site İçeriği Değişikliklerini Kaydet'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 5: MEDYA & FOTOĞRAFLAR YÖNETİMİ
        ------------------------------------------------------------- */}
        {activeTab === 'media' && (
          <div className="admin-tab-content">
            <div className="admin-two-col-grid">
              
              {/* SOL SÜTUN: FOTOĞRAF YÜKLE VE SİTE GÖRSELLERİNİ BELİRLE */}
              <div className="admin-form-card">
                <div className="admin-card-header">
                  <div>
                    <h2 className="admin-card-title">🖼️ Yeni Fotoğraf Yükle</h2>
                    <p className="admin-card-subtitle">
                      Cloudflare R2 kovanına doğrudan yeni yüksek çözünürlüklü fotoğraflar yükleyin ve sitenin her yerinde kullanın.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUploadNewMedia} className="admin-form" id="form-upload-media">
                  <div className="admin-field-group">
                    <label className="admin-label">Fotoğraf Başlığı / İsmi</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={mediaUploadTitle}
                      onChange={(e) => setMediaUploadTitle(e.target.value)}
                      placeholder="Örn: Kurucu Çalışma Masası Fotoğrafı"
                    />
                  </div>

                  <div className="admin-upload-box" style={{ marginTop: '0.8rem' }}>
                    <input
                      type="file"
                      id="media-file-input"
                      accept="image/*"
                      onChange={handleMediaFileSelect}
                      style={{ display: 'none' }}
                    />
                    {mediaUploadPreview ? (
                      <div className="upload-preview-wrap">
                        <img src={mediaUploadPreview} alt="Önizleme" className="upload-preview-img" style={{ maxHeight: '200px', objectFit: 'contain' }} />
                        <label htmlFor="media-file-input" className="btn-change-file">
                          Farklı Fotoğraf Seç
                        </label>
                      </div>
                    ) : (
                      <label htmlFor="media-file-input" className="upload-dropzone">
                        <span className="upload-drop-icon">📸</span>
                        <strong>Fotoğraf Seçmek İçin Tıklayın</strong>
                        <small>PNG, JPG, WEBP veya GIF (Maks. 10MB)</small>
                      </label>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn-admin-submit-mag"
                    disabled={uploadingMedia || !mediaUploadFile}
                    id="btn-submit-media-upload"
                    style={{ marginTop: '1.2rem' }}
                  >
                    {uploadingMedia ? 'Yükleniyor…' : '☁️ Cloudflare R2 Kovanına Yükle'}
                  </button>
                </form>

                {/* SİTE ANA FOTOĞRAFLARI SEÇİCİ */}
                <div className="admin-card-header" style={{ marginTop: '2.5rem', borderTop: '2px dashed var(--c-pink)', paddingTop: '1.5rem' }}>
                  <div>
                    <h3 className="admin-card-title" style={{ fontSize: '1.15rem' }}>🎯 Site Ana Fotoğrafları</h3>
                    <p className="admin-card-subtitle">
                      Sitede sabit kullanılan kurucu fotoğrafı ve Hakkımızda polaroidlerini buradan doğrudan link yapıştırarak veya aşağıdaki galeriden tek tıkla seçebilirsiniz.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveMediaSettings} className="admin-form">
                  <div className="admin-field-group">
                    <label className="admin-label">Kurucu Fotoğrafı URL</label>
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="admin-input"
                        value={mediaState.founder_photo || ''}
                        onChange={(e) => setMediaState({ ...mediaState, founder_photo: e.target.value })}
                        placeholder="https://... veya /icons/cilek-vintage.png"
                      />
                      {mediaState.founder_photo && (
                        <img
                          src={mediaState.founder_photo}
                          alt="Kurucu Önizleme"
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--c-bordo)' }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Hakkımızda Polaroid 1 URL</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={mediaState.about_photo_1 || ''}
                      onChange={(e) => setMediaState({ ...mediaState, about_photo_1: e.target.value })}
                      placeholder="/icons/icon4.png veya görsel linki"
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Hakkımızda Polaroid 2 URL</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={mediaState.about_photo_2 || ''}
                      onChange={(e) => setMediaState({ ...mediaState, about_photo_2: e.target.value })}
                      placeholder="/icons/icon1.png veya görsel linki"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-admin-submit-mag"
                    disabled={savingMediaSettings}
                    style={{ background: 'var(--c-bordo)', marginTop: '0.6rem' }}
                  >
                    {savingMediaSettings ? 'Kaydediliyor…' : '✓ Site Fotoğraf Tercihlerini Kaydet'}
                  </button>
                </form>
              </div>

              {/* SAĞ SÜTUN: FOTOĞRAF GALERİSİ & LİSTESİ */}
              <div className="admin-list-card">
                <div className="admin-card-header">
                  <div>
                    <h2 className="admin-card-title">
                      📚 Fotoğraf Kütüphanesi ({mediaState?.gallery?.length || 0})
                    </h2>
                    <p className="admin-card-subtitle">
                      Yüklenen tüm görseller burada listelenir. Tek tıkla bağlantısını kopyalayabilir veya sitenin ilgili alanına atayabilirsiniz.
                    </p>
                  </div>
                </div>

                {(!mediaState?.gallery || mediaState.gallery.length === 0) ? (
                  <div className="admin-empty-state">
                    <span className="empty-state-icon">🖼️</span>
                    <h3>Henüz fotoğraf yüklenmemiş</h3>
                    <p>Sol taraftaki yükleme kutusunu kullanarak yeni bir fotoğraf ekleyin.</p>
                  </div>
                ) : (
                  <div className="admin-media-gallery-grid">
                    {mediaState.gallery.map((item) => (
                      <div key={item.id} className="admin-media-item-card">
                        <div className="media-card-thumb-wrap">
                          <img src={item.url} alt={item.name} className="media-card-thumb" />
                        </div>
                        <div className="media-card-meta">
                          <strong className="media-card-name" title={item.name}>{item.name}</strong>
                          <span className="media-card-date">{item.date || 'Sistem Görseli'}</span>
                        </div>
                        <div className="media-card-actions">
                          <button
                            type="button"
                            className={`btn-media-copy ${mediaCopiedId === item.id ? 'copied' : ''}`}
                            onClick={() => handleCopyMediaUrl(item.url, item.id)}
                            title="Fotoğraf URL adresini panoya kopyala"
                          >
                            {mediaCopiedId === item.id ? '✓ Kopyalandı!' : '📋 URL Kopyala'}
                          </button>
                          
                          <div className="media-card-assign-group">
                            <button
                              type="button"
                              className="btn-media-assign"
                              onClick={() => handleSetAsFounderPhoto(item.url)}
                              title="Bu fotoğrafı kurucu fotoğrafı yap"
                            >
                              Kurucu Yap
                            </button>
                            <button
                              type="button"
                              className="btn-media-delete"
                              onClick={() => handleDeleteMedia(item.id)}
                              title="Galeriden sil"
                            >
                              Sil
                            </button>
                          </div>
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

      {/* Hoş Geldin Mektubu Canlı Önizleme Modalı */}
      <WelcomePostcardModal
        isOpen={previewLetterModalOpen}
        onClose={() => setPreviewLetterModalOpen(false)}
        user={user}
      />
    </div>
  )
}
