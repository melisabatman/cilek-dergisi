import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as pdfjsLib from 'pdfjs-dist'
import { PageFlip } from 'page-flip'
import PageCommentsDrawer from './PageCommentsDrawer'

// PDF.js Worker yapılandırması
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`
}

// Gerçekçi sayfa çevirme ses efekti (Web Audio API)
function playPageFlipSound() {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const duration = 0.26
    const bufferSize = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      // Kağıt sürtünme dokusu
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.5))
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1200, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + duration)
    filter.Q.setValueAtTime(2.0, ctx.currentTime)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.001, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    noise.start()
    noise.stop(ctx.currentTime + duration + 0.04)
  } catch {
    // Autoplay kısıtlamalarını sessizce yoksay
  }
}

export default function MagazineReader({ magazine, user, isAdmin }) {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  
  // Flipbook DOM ve instance referansları
  const bookStageRef = useRef(null)
  const bookMountRef = useRef(null)
  const pagesTemplateRef = useRef(null)
  const flipbookRef = useRef(null)

  // Durumlar
  const [currentPageIndex, setCurrentPageIndex] = useState(0) // 0-indexed
  const currentPageIndexRef = useRef(0)
  useEffect(() => {
    currentPageIndexRef.current = currentPageIndex
  }, [currentPageIndex])

  const [totalPagesCount, setTotalPagesCount] = useState(8)
  const [activePages, setActivePages] = useState([1]) // 1-indexed gösterilen sayfalar
  const [isBookReady, setIsBookReady] = useState(false)
  const [activePdfTitle, setActivePdfTitle] = useState(null)
  
  // PDF Doğal En-Boy Oranı (varsayılan ISO A4 210 × 297 mm, 1 : 1.414)
  const [pdfMeta, setPdfMeta] = useState({ width: 210, height: 297, aspect: 210 / 297 })

  // Ses Efekti
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem('burnbook_sound') !== 'false'
    } catch {
      return true
    }
  })
  const soundEnabledRef = useRef(soundEnabled)
  useEffect(() => {
    soundEnabledRef.current = soundEnabled
  }, [soundEnabled])

  // PDF Yönetimi
  const [pdfPages, setPdfPages] = useState([])
  const [loadingPdf, setLoadingPdf] = useState(Boolean(magazine?.pdf_url))
  const [pdfProgress, setPdfProgress] = useState(0)

  // Arayüz Kontrolleri
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [commentsCount, setCommentsCount] = useState(0)
  const [orientationMode, setOrientationMode] = useState('landscape')

  // -------------------------------------------------------------
  // 1. PDF SAYFALARINI İŞLEME (URL veya Doğrudan Dosya)
  // -------------------------------------------------------------
  const loadPdfSource = useCallback(async (source, title = null) => {
    setLoadingPdf(true)
    setPdfProgress(10)
    if (title) setActivePdfTitle(title)

    try {
      let loadingTask
      if (typeof source === 'string') {
        loadingTask = pdfjsLib.getDocument({
          url: source,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/cmaps/`,
          cMapPacked: true,
        })
      } else {
        loadingTask = pdfjsLib.getDocument({
          data: source,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/cmaps/`,
          cMapPacked: true,
        })
      }

      const pdfDoc = await loadingTask.promise
      const numPages = pdfDoc.numPages
      setTotalPagesCount(numPages)
      setPdfProgress(25)

      // 1. Sayfadan gerçek doğal en-boy oranını çıkar (olduğu gibi görünmesi için)
      const page1 = await pdfDoc.getPage(1)
      const naturalViewport = page1.getViewport({ scale: 1.0 })
      const naturalW = naturalViewport.width
      const naturalH = naturalViewport.height
      const naturalAspect = naturalW / naturalH
      setPdfMeta({ width: naturalW, height: naturalH, aspect: naturalAspect })

      // Yüksek DPI render ölçeği (ekranda cam gibi keskin durması için)
      const renderScale = Math.min(2.5, Math.max(1.8, 1600 / naturalW))

      const renderedUrls = []
      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i)
        const viewport = page.getViewport({ scale: renderScale })

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width

        await page.render({ canvasContext: context, viewport }).promise
        renderedUrls.push(canvas.toDataURL('image/jpeg', 0.92))
        setPdfProgress(Math.round(25 + (i / numPages) * 70))
      }

      setPdfPages(renderedUrls)
      setLoadingPdf(false)
    } catch (err) {
      console.warn('PDF yüklenemedi, editoryal sayfa şablonlarına geçiliyor:', err)
      setLoadingPdf(false)
      setTotalPagesCount(8)
    }
  }, [])

  useEffect(() => {
    if (magazine?.pdf_url) {
      loadPdfSource(magazine.pdf_url)
    } else {
      setLoadingPdf(false)
      setTotalPagesCount(8)
    }
  }, [magazine?.pdf_url, loadPdfSource])

  // Kullanıcının kendi dosyasını doğrudan seçip açması
  const handleLocalPdfUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      alert('Lütfen geçerli bir PDF dosyası seçin.')
      return
    }
    const reader = new FileReader()
    reader.onload = function() {
      const buffer = new Uint8Array(this.result)
      loadPdfSource(buffer, file.name)
    }
    reader.readAsArrayBuffer(file)
  }

  // Sürükle-bırak desteği
  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader()
      reader.onload = function() {
        const buffer = new Uint8Array(this.result)
        loadPdfSource(buffer, file.name)
      }
      reader.readAsArrayBuffer(file)
    }
  }

  // -------------------------------------------------------------
  // 2. REALISTIC FLIPBOOK OLUŞTURMA & BAĞLAMA (StPageFlip Engine)
  // -------------------------------------------------------------
  const initFlipbook = useCallback(() => {
    if (!bookMountRef.current || !pagesTemplateRef.current) return

    // Önceki örneği yok et
    if (flipbookRef.current) {
      try {
        flipbookRef.current.destroy()
      } catch (e) {
        console.warn('Error destroying pageflip:', e)
      }
      flipbookRef.current = null
    }

    // Hedef container'ı sıfırla
    bookMountRef.current.innerHTML = ''
    const bookWrapper = document.createElement('div')
    bookWrapper.className = 'cilek-flipbook-host'
    bookMountRef.current.appendChild(bookWrapper)

    // Sayfa elementlerini şablondan klonla
    const templateItems = Array.from(pagesTemplateRef.current.querySelectorAll('.flip-page-node'))
    if (templateItems.length === 0) return

    const clonedItems = templateItems.map((item) => {
      const clone = item.cloneNode(true)
      clone.style.display = 'block'
      // Mobilde sayfaları dokunmatik ekranlara tam uyumlu yumuşak (soft) katlama yap
      if (isMobile) {
        clone.setAttribute('data-density', 'soft')
      }
      return clone
    })

    // Ekrana ve dosyanın gerçek en-boy oranına göre dinamik boyutlandırma
    const isMobile = window.innerWidth < 768
    const aspect = pdfMeta.aspect || (210 / 297)

    // Sahne alanı ölçüleri (tam ekran veya ekran boyutuna göre sığdırma)
    const stageEl = bookStageRef.current
    const availW = stageEl
      ? (isMobile ? window.innerWidth : Math.min(stageEl.clientWidth - 40, 1600))
      : (isMobile ? window.innerWidth : 1200)
    const availH = stageEl
      ? (isMobile ? Math.min(window.innerHeight - 105, stageEl.clientHeight || (window.innerHeight - 105)) : Math.min(stageEl.clientHeight - 110, 960))
      : (isMobile ? window.innerHeight - 105 : 780)

    let baseWidth, baseHeight
    if (isMobile) {
      // Mobilde tek sayfa dikey: Ekran genişliğini tam kaplasın (yarım kalmasın)
      baseWidth = Math.round(availW)
      baseHeight = Math.round(baseWidth / aspect)
      if (baseHeight > availH) {
        baseHeight = Math.round(availH)
        baseWidth = Math.round(baseHeight * aspect)
      }
    } else {
      // Masaüstünde 2'li açık dergi yayılımı
      baseHeight = Math.round(availH)
      baseWidth = Math.round(baseHeight * aspect)
      if (baseWidth * 2 > availW) {
        baseWidth = Math.round(availW / 2)
        baseHeight = Math.round(baseWidth / aspect)
      }
    }

    baseWidth = Math.max(isMobile ? 180 : 260, baseWidth)
    baseHeight = Math.max(isMobile ? 260 : 370, baseHeight)

    // StPageFlip yapılandırması
    // MOBİL İÇİN ÇÖZÜMLER:
    // 1) showCover: !isMobile -> Mobilde 2'li kapak yayılımı sağa kayma ve yarım sayfa boşluğu yaratır. Mobilde showCover=false ile sayfa 0 tek başına tüm ekranı ortalar.
    // 2) minWidth: isMobile ? 3000 : 280 -> Mobilde blockWidth < minWidth * 2 şartı %100 sağlansın, kütüphane asla çift sayfaya geçmeye çalışmasın.
    // 3) size: 'stretch', usePortrait: true
    const targetStartPage = Math.min(currentPageIndexRef.current || 0, Math.max(0, clonedItems.length - 1))

    const pf = new PageFlip(bookWrapper, {
      width: baseWidth,
      height: baseHeight,
      size: 'stretch',
      minWidth: isMobile ? 3000 : 280,
      maxWidth: isMobile ? 1200 : 1400,
      minHeight: isMobile ? 200 : 420,
      maxHeight: isMobile ? 2400 : 1800,
      maxShadowOpacity: isMobile ? 0.3 : 0.5,
      showCover: !isMobile, // Mobilde tek sayfa tam ekran, masaüstünde çift sayfa kapak
      mobileScrollSupport: true,
      usePortrait: true, // Mobilde tek dikey sayfa
      startPage: targetStartPage,
      flippingTime: isMobile ? 450 : 650,
      useMouseEvents: true, // Köşeden tutup çekerek çevirme
      swipeDistance: isMobile ? 12 : 20,
      showPageCorners: !isMobile,
      disableFlipByClick: false,
    })

    try {
      pf.loadFromHTML(clonedItems)

      pf.on('flip', (e) => {
        const pIndex = e.data
        setCurrentPageIndex(pIndex)

        if (soundEnabledRef.current) {
          playPageFlipSound()
        }

        try {
          const spread = pf.getPageCollection().getSpread()[pf.getPageCollection().getCurrentSpreadIndex()]
          if (spread && spread.length > 0) {
            setActivePages(spread.map(i => i + 1))
          } else {
            setActivePages([pIndex + 1])
          }
        } catch {
          setActivePages([pIndex + 1])
        }
      })

      pf.on('changeOrientation', (e) => {
        setOrientationMode(e.data)
      })

      pf.on('init', () => {
        setIsBookReady(true)
        setTotalPagesCount(pf.getPageCount())
        try {
          const spread = pf.getPageCollection().getSpread()[pf.getPageCollection().getCurrentSpreadIndex()]
          if (spread && spread.length > 0) {
            setActivePages(spread.map(i => i + 1))
          }
        } catch {}
      })

      flipbookRef.current = pf
    } catch (err) {
      console.error('Flipbook load error:', err)
    }
  }, [pdfMeta.aspect])

  // Sayfalar veya PDF yüklendiğinde flipbook'u başlat
  useEffect(() => {
    if (loadingPdf) return
    const timer = setTimeout(() => {
      initFlipbook()
    }, 60)
    return () => clearTimeout(timer)
  }, [loadingPdf, pdfPages.length, initFlipbook])

  // Ekran boyutu veya yön değiştiğinde (responsive) yeniden hesapla
  useEffect(() => {
    let timeoutId
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        initFlipbook()
      }, 200)
    }
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      clearTimeout(timeoutId)
    }
  }, [initFlipbook])

  // Component unmount olduğunda temizle
  useEffect(() => {
    return () => {
      if (flipbookRef.current) {
        try {
          flipbookRef.current.destroy()
        } catch {}
        flipbookRef.current = null
      }
    }
  }, [])

  // -------------------------------------------------------------
  // 3. SAYFA KONTROL EYLEMLERİ
  // -------------------------------------------------------------
  const handlePrev = useCallback(() => {
    if (!flipbookRef.current) return
    flipbookRef.current.flipPrev()
  }, [])

  const handleNext = useCallback(() => {
    if (!flipbookRef.current) return
    flipbookRef.current.flipNext()
  }, [])

  const handlePageSliderChange = (e) => {
    if (!flipbookRef.current) return
    const target = parseInt(e.target.value, 10) - 1
    flipbookRef.current.flip(target)
  }

  // Klavye ok tuşları ile sayfa çevirme
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev, isFullscreen])

  // Tam ekran geçişi
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      bookStageRef.current?.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  // Sayfa başlığı / konumu gösterimi
  const getPageStatusText = () => {
    if (!isBookReady) return 'Yükleniyor…'
    if (currentPageIndex === 0) return 'Ön Kapak (Sayfa 1)'
    if (currentPageIndex >= totalPagesCount - 1) return `Arka Kapak (Sayfa ${totalPagesCount})`
    if (activePages.length > 1) {
      return `Sayfa ${activePages[0]} - ${activePages[1]} / ${totalPagesCount}`
    }
    return `Sayfa ${activePages[0]} / ${totalPagesCount}`
  }

  return (
    <div className={`magazine-reader-root ${isFullscreen ? 'is-fullscreen' : ''}`} ref={bookStageRef}>
      
      {/* Gizli Dosya Seçici (Kullanıcının kendi PDF'ini doğrudan test edebilmesi için) */}
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleLocalPdfUpload}
      />

      {/* 1. ÜST ARAÇ ÇUBUĞU (TOOLBAR) */}
      <header className="reader-top-bar" role="banner">
        <div className="reader-top-left">
          <button
            type="button"
            className="btn-reader-back"
            onClick={() => navigate(-1)}
            title="Dergiler Arşivine Dön"
          >
            ← <span className="btn-back-text">Geri</span>
          </button>
          <div className="reader-title-group">
            <h1 className="reader-magazine-title">{activePdfTitle || magazine?.title || 'Çilek Dergisi'}</h1>
            {magazine?.issue_number && !activePdfTitle && (
              <span className="reader-issue-pill">Sayı #{magazine.issue_number}</span>
            )}
            <span className="reader-badge-flipbook desktop-only-badge">✨ 3D Flipbook</span>
          </div>
        </div>

        <div className="reader-top-right">
          {/* PDF Dosyası Aç Butonu */}
          <button
            type="button"
            className="btn-reader-upload"
            onClick={() => fileInputRef.current?.click()}
            title="Kendi PDF Dosyanı Aç / Yükle"
            id="btn-reader-upload-pdf"
          >
            📂 <span className="upload-label">PDF Aç</span>
          </button>

          {/* Zoom kontrolleri (Desktop) */}
          <div className="reader-zoom-group desktop-only-tool">
            <button
              type="button"
              className="btn-reader-tool"
              onClick={() => setZoomLevel(z => Math.max(0.85, z - 0.1))}
              title="Uzaklaştır"
            >
              －
            </button>
            <span className="zoom-value">{Math.round(zoomLevel * 100)}%</span>
            <button
              type="button"
              className="btn-reader-tool"
              onClick={() => setZoomLevel(z => Math.min(1.3, z + 0.1))}
              title="Yakınlaştır"
            >
              ＋
            </button>
          </div>

          {/* Sayfa Çevirme Sesi Butonu */}
          <button
            type="button"
            className={`btn-reader-tool btn-reader-sound ${soundEnabled ? 'sound-active' : ''}`}
            onClick={() => {
              const next = !soundEnabled
              setSoundEnabled(next)
              try {
                localStorage.setItem('burnbook_sound', String(next))
              } catch {}
            }}
            title={soundEnabled ? 'Sayfa Çevirme Sesini Kapat' : 'Sayfa Çevirme Sesini Aç'}
            aria-label={soundEnabled ? 'Sayfa Çevirme Sesini Kapat' : 'Sayfa Çevirme Sesini Aç'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          {/* Tam Ekran */}
          <button
            type="button"
            className="btn-reader-tool desktop-only-tool"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
          >
            {isFullscreen ? '⤓' : '⤢'}
          </button>

          {/* PDF İndir (Varsa) */}
          {magazine?.pdf_url && (
            <a
              href={magazine.pdf_url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="btn-reader-pdf desktop-only-tool"
              title="PDF Olarak İndir"
            >
              ⬇ PDF
            </a>
          )}

          {/* Sayfa Yorumları Çekmecesi Butonu */}
          <button
            type="button"
            className={`btn-reader-comments ${isCommentsOpen ? 'active' : ''}`}
            onClick={() => setIsCommentsOpen(v => !v)}
            id="btn-toggle-comments"
          >
            <span className="comments-icon">💬</span>
            <span className="comments-label">
              {activePages.length > 1
                ? `Sayfa ${activePages.join('-')}`
                : `Sayfa ${activePages[0]}`}
            </span>
            {commentsCount > 0 && (
              <span className="comments-badge">{commentsCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* 2. ANA OKUMA ALANI (3D REALISTIC FLIPBOOK STAGE) */}
      <main
        className="reader-stage-container"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* Sol Çevirme Oku */}
        <button
          type="button"
          className={`btn-flip-arrow btn-flip-prev ${currentPageIndex <= 0 ? 'disabled' : ''}`}
          onClick={handlePrev}
          disabled={currentPageIndex <= 0}
          aria-label="Önceki Sayfayı Çevir"
        >
          ‹
        </button>

        {/* Gerçek Dergi Boyutunda Flipbook Sahnesi */}
        <div
          className="flipbook-center-viewport"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {loadingPdf ? (
            <div className="reader-pdf-loading-box">
              <div className="reader-spinner" />
              <h3>Dergi Sayfaları Hazırlanıyor…</h3>
              <div className="pdf-progress-bar">
                <div className="pdf-progress-fill" style={{ width: `${pdfProgress}%` }} />
              </div>
              <p>Yüksek çözünürlüklü editoryal baskı taranıyor (%{pdfProgress})</p>
            </div>
          ) : (
            <div className="flipbook-mount-wrapper" ref={bookMountRef} />
          )}
        </div>

        {/* Sağ Çevirme Oku */}
        <button
          type="button"
          className={`btn-flip-arrow btn-flip-next ${currentPageIndex >= totalPagesCount - 1 ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={currentPageIndex >= totalPagesCount - 1}
          aria-label="Sonraki Sayfayı Çevir"
        >
          ›
        </button>
      </main>

      {/* 3. ALT GEZİNME VE SAYFA İLERLEME ÇUBUĞU */}
      <footer className="reader-bottom-nav">
        <div className="reader-nav-controls">
          <button
            type="button"
            className="btn-nav-step"
            onClick={handlePrev}
            disabled={currentPageIndex <= 0}
          >
            ‹ Önceki
          </button>

          {/* Sayfa İlerleme Çubuğu */}
          <div className="reader-slider-wrap">
            <input
              type="range"
              min="1"
              max={totalPagesCount}
              value={currentPageIndex + 1}
              onChange={handlePageSliderChange}
              className="reader-page-slider"
            />
            <span className="reader-page-counter">
              {getPageStatusText()}
            </span>
          </div>

          <button
            type="button"
            className="btn-nav-step"
            onClick={handleNext}
            disabled={currentPageIndex >= totalPagesCount - 1}
          >
            Sonraki ›
          </button>
        </div>

        <div className="reader-keyboard-hint">
          <span>
            ✨ <strong>Gerçek Flipbook:</strong> Sayfa köşelerini farenizle tutup çekerek çevirebilir veya klavyedeki <strong>←</strong> / <strong>→</strong> tuşlarını kullanabilirsiniz.
          </span>
        </div>
      </footer>

      {/* 4. SAYFA BAZLI YORUMLAR ÇEKMECESİ */}
      <PageCommentsDrawer
        magazineId={magazine?.id}
        activePages={activePages}
        user={user}
        isAdmin={isAdmin}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        onCommentCountChange={setCommentsCount}
      />

      {/* =========================================================================
          5. GİZLİ ŞABLON (TEMPLATE PAGES)
          StPageFlip tarafından okunup gerçek 3D katlanan sayfalara dönüştürülür
          ========================================================================= */}
      <div ref={pagesTemplateRef} style={{ display: 'none' }} aria-hidden="true">
        
        {/* EĞER PDF SAYFALARI VARSA */}
        {pdfPages.length > 0 ? (
          pdfPages.map((pageUrl, idx) => (
            <div
              key={`pdf-p-${idx}`}
              className="flip-page-node flip-page-pdf"
              data-density={idx === 0 || idx === pdfPages.length - 1 ? 'hard' : 'soft'}
            >
              <div className="page-paper-sheet pdf-page-clean">
                <img
                  src={pageUrl}
                  alt={`Sayfa ${idx + 1}`}
                  className="page-pdf-content-img"
                  loading="lazy"
                />
              </div>
            </div>
          ))
        ) : (
          /* EDİTORYAL DERGİ SAYFALARI (ZENGİN BASKI DÜZENİ) */
          <>
            {/* SAYFA 1: ÖN KAPAK (HARD COVER) */}
            <div className="flip-page-node page-cover-front" data-density="hard">
              {magazine?.cover_image_url ? (
                <div className="page-paper-sheet pdf-page-clean">
                  <img src={magazine.cover_image_url} alt={magazine.title} className="cover-art-full" />
                </div>
              ) : (
                <div className="page-paper-sheet cover-sheet">
                  <div className="editorial-cover-layout">
                    {/* Üst Logo ve Başlık */}
                    <div className="cover-header-meta">
                      <span className="cover-badge-season">YAZ 2024 • THE JOURNEY</span>
                      <span className="cover-badge-price">Koleksiyon Sayısı</span>
                    </div>

                    <div className="cover-emblem-wrap">
                      <img src="/icons/cilek-vintage.png" alt="Çilek" className="cover-strawberry-img" />
                    </div>

                    <h1 className="cover-magazine-brand">ÇİLEK</h1>
                    <span className="cover-brand-subscript">Bağımsız Gençlik &amp; Edebiyat Dergisi</span>

                    <div className="cover-title-box">
                      <span className="cover-issue-tag">SAYI #{magazine?.issue_number || '06'}</span>
                      <h2 className="cover-main-story-title">{magazine?.title || 'Sayı 06 — Başlangıç & Bahar'}</h2>
                    </div>

                    {/* Manşetler */}
                    <div className="cover-headlines-list">
                      <div className="cover-headline-item">
                        <span className="bullet">•</span>
                        <p><strong>Güneşin Gölgesinde:</strong> Genç yazarların büyüme ve arayış notları</p>
                      </div>
                      <div className="cover-headline-item">
                        <span className="bullet">•</span>
                        <p><strong>Bağımsız Edebiyat:</strong> 15-25 yaş üreticilerinin kolektif belleği</p>
                      </div>
                      <div className="cover-headline-item">
                        <span className="bullet">•</span>
                        <p><strong>Özgür Sanat Alanı:</strong> Şiirler, analog seriler ve stüdyo günlükleri</p>
                      </div>
                    </div>

                    {/* Kapak Alt Bilgisi & Barkod */}
                    <div className="cover-footer-bar">
                      <div className="cover-barcode">
                        <div className="barcode-bars" />
                        <span className="barcode-num">ISSN 2980-1524 • #06</span>
                      </div>
                      <span className="cover-price-tag">Özgür &amp; Koleksiyonluk</span>
                    </div>
                  </div>
                  <div className="page-sheet-spine-shadow" />
                </div>
              )}
            </div>

            {/* SAYFA 2: YAYIN KÜNYESİ (EDITORIAL COLOPHON) */}
            <div className="flip-page-node" data-density="soft">
              <div className="page-paper-sheet inner-sheet">
                <div className="colophon-header">
                  <span className="sheet-kicker">ÇİLEK DERGİSİ BASKI KÜNYESİ</span>
                  <span className="sheet-edition">EST. 2024 • İSTANBUL</span>
                </div>

                <div className="sheet-divider-line" />

                <div className="colophon-manifesto">
                  <h3 className="colophon-title">Bağımsız Yayın İlkemiz</h3>
                  <p>
                    Çilek Dergisi, 15-25 yaş kuşağının sahici, yargısız ve özgün sesini sayfalarında büyütmek amacıyla kurulmuş bağımsız bir editoryal kolektiftir. Hızlı tüketime inat; hissederek okunan, saklanan ve dönüp dönüp tekrar bakılan bir edebiyat ve sanat evi olmayı hedefler.
                  </p>
                </div>

                <div className="colophon-team-grid">
                  <div className="colophon-role-block">
                    <h4>GENEL YAYIN YÖNETMENİ</h4>
                    <p>Çilek Kolektif Masası</p>
                  </div>
                  <div className="colophon-role-block">
                    <h4>ART DIRECTOR &amp; MİZANPAJ</h4>
                    <p>Çilek Art Studio</p>
                  </div>
                  <div className="colophon-role-block">
                    <h4>EDEBİYAT &amp; İÇERİK</h4>
                    <p>Yazı İşleri Masası</p>
                  </div>
                  <div className="colophon-role-block">
                    <h4>GÖRSEL SANATLAR &amp; FOTOĞRAF</h4>
                    <p>Genç Sanatçı Kolektifi</p>
                  </div>
                </div>

                <div className="colophon-quote-box">
                  <p>"İyi bir dergi, yalnızca yazanların değil; sayfalarını sevgiyle aralayan herkesin ortak evidir."</p>
                </div>

                <div className="colophon-contact-footer">
                  <p><strong>Yazı Gönderimi:</strong> yazi@cilekdergisi.com</p>
                  <p><strong>Sosyal:</strong> @cilekdergisi</p>
                </div>

                <div className="page-sheet-spine-shadow" />
                <div className="page-number-folio">2 • ÇİLEK DERGİSİ</div>
              </div>
            </div>

            {/* SAYFA 3: İÇİNDEKİLER (TABLE OF CONTENTS) */}
            <div className="flip-page-node" data-density="soft">
              <div className="page-paper-sheet inner-sheet">
                <div className="colophon-header">
                  <span className="sheet-kicker">BU SAYIDA NELER VAR?</span>
                  <span className="sheet-edition">İÇİNDEKİLER</span>
                </div>

                <div className="sheet-divider-line" />

                <h2 className="editorial-sheet-h2">Sayfaların Haritası</h2>

                <ul className="flip-toc-list">
                  {(magazine?.toc?.length ? magazine.toc : [
                    'Güneşin Gölgesinde Kalanlar',
                    'Bir Yaz Öğledensonrası Notları',
                    'Deniz Kenarında Bağımsız Edebiyat',
                    'Mevsim Değişirken İç Dünyamız'
                  ]).map((item, idx) => (
                    <li key={idx} className="flip-toc-item">
                      <div className="toc-left">
                        <span className="toc-index">0{idx + 1}</span>
                        <div className="toc-info">
                          <strong className="toc-title">{item}</strong>
                          <span className="toc-category">{['Deneme & Anlatı', 'Şiir & Edebiyat', 'Kültür Sanat', 'Fotoğraf Serisi'][idx % 4]}</span>
                        </div>
                      </div>
                      <div className="toc-dots-filler" />
                      <span className="toc-page-num">s. {idx + 4}</span>
                    </li>
                  ))}
                </ul>

                <div className="toc-vignette-box">
                  <img src="/icons/cilek-vintage.png" alt="Çilek" className="toc-vignette-img" />
                  <p>Her sayfa bir ses, her ses yeni bir başlangıçtır.</p>
                </div>

                <div className="page-sheet-spine-shadow" />
                <div className="page-number-folio">3 • İÇİNDEKİLER</div>
              </div>
            </div>

            {/* SAYFA 4: EDİTÖRÜN NOTU (LETTER FROM THE EDITOR) */}
            <div className="flip-page-node" data-density="soft">
              <div className="page-paper-sheet inner-sheet">
                <div className="colophon-header">
                  <span className="sheet-kicker">EDİTÖRÜN MASASINDAN</span>
                  <span className="sheet-edition">BİR BAŞLANGIÇ CÜMLESİ</span>
                </div>

                <div className="sheet-divider-line" />

                <h2 className="editorial-sheet-h2">Sevgili Okur,</h2>

                <p className="editorial-sheet-lead">
                  Kendi sesini bulmak, belki de hayatın en sessiz ve en cesur yolculuğudur. Sayfalarını çevirdiğin bu dergi, tam da bu yolculukta sana omuz vermek için var.
                </p>

                <div className="editorial-sheet-text-cols">
                  <p>
                    {magazine?.description || 'Çilek Dergisi, hiçbir kalıba sığmak zorunda hissetmeyen, kendi ritminde yazıp çizen insanların ortak sığınağıdır. Burada her cümle bir yankı, her renk bir ifade biçimidir.'}
                  </p>
                  <p>
                    15-25 yaş arası büyüme sancılarını, ilk dizelerin heyecanını ve stüdyoda dökülen fırça izlerini bir araya getirdik. Bu sayfalarda kendini bulman dileğiyle.
                  </p>
                </div>

                <blockquote className="editorial-sheet-blockquote">
                  <span className="quote-mark">“</span>
                  <p>Hiçbir hikâye yarım kalmaz; sadece doğru okuyucusunun sayfayı çevirmesini bekler.</p>
                </blockquote>

                <div className="editorial-sheet-sign">
                  <span>With all our love,</span>
                  <strong>Çilek Dergisi Yayın Kurulu 🍓</strong>
                </div>

                <div className="page-sheet-spine-shadow" />
                <div className="page-number-folio">4 • EDİTÖRÜN NOTU</div>
              </div>
            </div>

            {/* SAYFA 5: EDEBİ ANLATI & DENEME */}
            <div className="flip-page-node" data-density="soft">
              <div className="page-paper-sheet inner-sheet">
                <div className="colophon-header">
                  <span className="sheet-kicker">EDEBİYAT &amp; ANLATI</span>
                  <span className="sheet-edition">ÖZGÜN SESLER</span>
                </div>

                <div className="sheet-divider-line" />

                <h2 className="editorial-sheet-h2">Güneşin Gölgesinde Kalanlar</h2>
                <span className="editorial-byline">Yazan: Genç Yazarlar Kolektifi</span>

                <div className="editorial-article-body">
                  <p className="article-dropcap-para">
                    <span className="dropcap">K</span>elimeler bazen bir kentin sokaklarında yankılanır, bazen de bir odanın sessizliğinde kaybolur. Bu sayıda, bizi biz yapan detayları, küçük ama derin izleri konuştuk. Büyümek, her an yeniden başlayan bir hikâyeye cesaret edebilmektir.
                  </p>
                  <p>
                    Pencerelerden içeri süzülen öğleden sonra ışığı gibi; bazen tek bir satır, günlerce zihnimizde bir melodi gibi dolanır. Sayfaları çevirirken bıraktığın her nefes, bu metni seninle birlikte yeniden yazar.
                  </p>
                  <p>
                    Kendi alanını kurmak ve kalıplara inat üretmek... Çilek Dergisi'nin her sayfasında bu özgürlüğün ayak izlerini arıyoruz.
                  </p>
                </div>

                <div className="page-sheet-spine-shadow" />
                <div className="page-number-folio">5 • ANLATI</div>
              </div>
            </div>

            {/* SAYFA 6: GÖRSEL SERGİ & ŞİİR */}
            <div className="flip-page-node" data-density="soft">
              <div className="page-paper-sheet inner-sheet">
                <div className="colophon-header">
                  <span className="sheet-kicker">ŞİİR &amp; GÖRSEL DİL</span>
                  <span className="sheet-edition">GALERİ ALANI</span>
                </div>

                <div className="sheet-divider-line" />

                <div className="poetry-spread-card">
                  <div className="poem-polaroid-frame">
                    <img src="/icons/cilek-vintage.png" alt="Sanat" className="poem-art-icon" />
                    <span className="poem-polaroid-caption">Stüdyo Notları, No: 4</span>
                  </div>

                  <div className="poem-content-wrap">
                    <h3 className="poem-title">Sözcüklerin Bahçesi</h3>
                    <div className="poem-stanzas">
                      <p>Bir yaprağın düşüşü gibi sessiz,<br />Bir çileğin kokusunda saklı yaz.<br />Adını bilmediğimiz yollardan geçtik,<br />Kelimeler bize yurt oldu bu gece.</p>
                      <p>Korkmadan açılan defterler,<br />Mürekkebin kağıda fısıldadığı cesaret.<br />Biz buradayız, bir aradayız,<br />Sayfaların sıcak sığınağında.</p>
                    </div>
                    <span className="poem-author">— Çilek Şiir İnisiyatifi</span>
                  </div>
                </div>

                <div className="page-sheet-spine-shadow" />
                <div className="page-number-folio">6 • ŞİİR &amp; SANAT</div>
              </div>
            </div>

            {/* SAYFA 7: GENÇ SANATÇILAR SERİSİ */}
            <div className="flip-page-node" data-density="soft">
              <div className="page-paper-sheet inner-sheet">
                <div className="colophon-header">
                  <span className="sheet-kicker">RÖPORTAJ &amp; PERSPEKTİF</span>
                  <span className="sheet-edition">15-25 ÜRETİM MANİFESTOSU</span>
                </div>

                <div className="sheet-divider-line" />

                <h2 className="editorial-sheet-h2">Genç Üretim Alanı</h2>

                <div className="interview-qa-block">
                  <div className="qa-item">
                    <span className="qa-q">Soru: Bağımsız bir dergide üretmek nasıl hissettiriyor?</span>
                    <p className="qa-a">"Hiçbir ticari kaygı olmadan, doğrudan kendi yaşdaşlarına hitap eden sahici bir sayfaya dokunmak paha biçilmez bir özgürlük hissi veriyor."</p>
                  </div>
                  <div className="qa-item">
                    <span className="qa-q">Soru: Genç yazarlara ve sanatçılara tavsiyeniz nedir?</span>
                    <p className="qa-a">"Mükemmel olmayı beklemeyin. İlk taslaklarınızı, kırılgan dizelerinizi saklamayın. Çilek Dergisi gibi alanlar bu ilk adımları karşılamak için var."</p>
                  </div>
                </div>

                <div className="submission-callout-mini">
                  <strong>Sen de Eserini Bize Gönder!</strong>
                  <p>Deneme, şiir, kültür incelemesi ve fotoğraf serilerini bir sonraki sayımız için bekliyoruz.</p>
                </div>

                <div className="page-sheet-spine-shadow" />
                <div className="page-number-folio">7 • PERSPEKTİF</div>
              </div>
            </div>

            {/* SAYFA 8: ARKA KAPAK (HARD COVER) */}
            <div className="flip-page-node page-cover-back" data-density="hard">
              <div className="page-paper-sheet back-cover-sheet">
                <div className="back-cover-layout">
                  <div className="back-cover-emblem">
                    <img src="/icons/cilek-vintage.png" alt="Çilek" className="back-strawberry-img" />
                  </div>

                  <h2 className="back-cover-title">ÇİLEK DERGİSİ</h2>
                  <p className="back-cover-motto">
                    "To Read Forever, To Feel Together."
                  </p>

                  <div className="back-cover-features">
                    <span>15-25 Yaş Bağımsız Yayın</span>
                    <span>Koleksiyonluk Sanat &amp; Edebiyat</span>
                    <span>Sahici Genç Anlatılar</span>
                  </div>

                  <div className="back-cover-barcode-box">
                    <div className="barcode-bars" />
                    <span className="barcode-num">ISSN 2980-1524 • Sayı 06</span>
                    <span className="barcode-info">cilekdergisi.com • @cilekdergisi</span>
                  </div>

                  <div className="back-cover-closing-note">
                    Bir sonraki sayıda yeni sayfalarla buluşmak dileğiyle 💌
                  </div>
                </div>
                <div className="page-sheet-spine-shadow" />
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  )
}
