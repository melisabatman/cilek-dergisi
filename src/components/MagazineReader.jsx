import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as pdfjsLib from 'pdfjs-dist'
import { PageFlip } from 'page-flip'
import PageCommentsDrawer from './PageCommentsDrawer'
import { getSafeMediaUrl } from '../lib/r2'

// PDF.js Worker yapılandırması (Türkiye ve globalde engellenmeyen güvenli cdnjs CDN)
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`
}

function getIsMobile() {
  return typeof window !== 'undefined' && window.innerWidth < 768
}

// Gerçekçi sayfa çevirme ses efekti (Web Audio API)
function playPageFlipSound() {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') ctx.resume()

    const duration = 0.26
    const bufferSize = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
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

export default function MagazineReader({ magazine, user, isAdmin, onClose }) {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  // Flipbook DOM ve instance referansları
  const bookStageRef = useRef(null)
  const viewportRef = useRef(null)
  const bookMountRef = useRef(null)
  const pagesTemplateRef = useRef(null)
  const flipbookRef = useRef(null)

  // Durumlar
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const currentPageIndexRef = useRef(0)
  useEffect(() => {
    currentPageIndexRef.current = currentPageIndex
  }, [currentPageIndex])

  const [totalPagesCount, setTotalPagesCount] = useState(8)
  const [activePages, setActivePages] = useState([1])
  const [isBookReady, setIsBookReady] = useState(false)
  const [activePdfTitle, setActivePdfTitle] = useState(null)
  const [singlePageWidth, setSinglePageWidth] = useState(400)
  const [isMobileMode, setIsMobileMode] = useState(false)

  // PDF Doğal En-Boy Oranı (varsayılan ISO A4 210 × 297 mm)
  const [pdfMeta, setPdfMeta] = useState({ width: 210, height: 297, aspect: 210 / 297 })

  // Ses Efekti
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try { return localStorage.getItem('burnbook_sound') !== 'false' } catch { return true }
  })
  const soundEnabledRef = useRef(soundEnabled)
  useEffect(() => { soundEnabledRef.current = soundEnabled }, [soundEnabled])

  // PDF Yönetimi
  const [pdfPages, setPdfPages] = useState([])
  const [loadingPdf, setLoadingPdf] = useState(Boolean(magazine?.pdf_url))
  const [pdfProgress, setPdfProgress] = useState(0)
  const [pdfLoadError, setPdfLoadError] = useState(false)

  // Arayüz Kontrolleri
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [commentsCount, setCommentsCount] = useState(0)

  // Swipe Dokunma Takibi
  const touchStartXRef = useRef(null)
  const touchStartYRef = useRef(null)

  // -------------------------------------------------------------
  // 1. PDF SAYFALARINI İŞLEME (ArrayBuffer ile Güvenli & Hızlı Yükleme)
  // -------------------------------------------------------------
  const loadPdfSource = useCallback(async (source, title = null) => {
    if (!source) {
      setLoadingPdf(false)
      setPdfLoadError(true)
      return
    }

    setLoadingPdf(true)
    setPdfLoadError(false)
    setPdfProgress(10)
    if (title) setActivePdfTitle(title)

    try {
      let pdfData = null

      if (typeof source === 'string') {
        const safeUrl = getSafeMediaUrl(source)
        try {
          const resp = await fetch(safeUrl)
          if (!resp.ok) throw new Error(`Proxy status: ${resp.status}`)
          const buf = await resp.arrayBuffer()
          pdfData = new Uint8Array(buf)
        } catch (fetchErr) {
          console.warn('Proxy fetch başarısız, doğrudan kaynak deneniyor:', fetchErr)
          // Doğrudan URL fallback'i
          const directResp = await fetch(source)
          if (!directResp.ok) throw new Error(`Direct status: ${directResp.status}`)
          const buf = await directResp.arrayBuffer()
          pdfData = new Uint8Array(buf)
        }
      } else {
        pdfData = source
      }

      setPdfProgress(30)

      const loadingTask = pdfjsLib.getDocument({
        data: pdfData,
        cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/cmaps/`,
        cMapPacked: true,
      })

      const pdfDoc = await loadingTask.promise
      const numPages = pdfDoc.numPages
      setTotalPagesCount(numPages)
      setPdfProgress(45)

      const page1 = await pdfDoc.getPage(1)
      const naturalViewport = page1.getViewport({ scale: 1.0 })
      const naturalW = naturalViewport.width
      const naturalH = naturalViewport.height
      const naturalAspect = naturalW / naturalH
      setPdfMeta({ width: naturalW, height: naturalH, aspect: naturalAspect })

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
        setPdfProgress(Math.round(45 + (i / numPages) * 50))
      }

      setPdfPages(renderedUrls)
      setLoadingPdf(false)
      setPdfLoadError(false)
    } catch (err) {
      console.error('PDF yükleme hatası:', err)
      setLoadingPdf(false)
      setPdfPages([])
      setPdfLoadError(true)
    }
  }, [])

  useEffect(() => {
    if (magazine?.pdf_url) {
      loadPdfSource(magazine.pdf_url)
    } else {
      setLoadingPdf(false)
      setPdfLoadError(true)
    }
  }, [magazine?.pdf_url, loadPdfSource])

  // Kullanıcının kendi dosyasını seçmesi
  const handleLocalPdfUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { alert('Lütfen geçerli bir PDF dosyası seçin.'); return }
    const reader = new FileReader()
    reader.onload = function () {
      loadPdfSource(new Uint8Array(this.result), file.name)
    }
    reader.readAsArrayBuffer(file)
  }

  // Sürükle-bırak
  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader()
      reader.onload = function () {
        loadPdfSource(new Uint8Array(this.result), file.name)
      }
      reader.readAsArrayBuffer(file)
    }
  }

  // -------------------------------------------------------------
  // 2. SAYFA KONTROLLERİ: OKLARA BASINCA ÇEVİRME
  // -------------------------------------------------------------
  const handlePrev = useCallback(() => {
    const pf = flipbookRef.current
    if (!pf) return
    try {
      pf.flipPrev('top')
    } catch (err) {
      console.warn('flipPrev fallback:', err)
      try { pf.turnToPrevPage() } catch {}
    }
  }, [])

  const handleNext = useCallback(() => {
    const pf = flipbookRef.current
    if (!pf) return
    try {
      pf.flipNext('top')
    } catch (err) {
      console.warn('flipNext fallback:', err)
      try { pf.turnToNextPage() } catch {}
    }
  }, [])

  // -------------------------------------------------------------
  // 3. FLIPBOOK OLUŞTURMA: ÖN VE ARKA KAPAK TEK, DİĞERLERİ İKİLİ (SPREAD)
  // -------------------------------------------------------------
  const initFlipbook = useCallback(() => {
    const mountEl = bookMountRef.current
    const viewportEl = viewportRef.current
    const templateEl = pagesTemplateRef.current

    if (!mountEl || !viewportEl || !templateEl) return

    const templateItems = Array.from(templateEl.querySelectorAll('.flip-page-node'))
    if (templateItems.length === 0) return

    const isMobile = getIsMobile()
    setIsMobileMode(isMobile)

    // Önceki örneği temizle
    if (flipbookRef.current) {
      try { flipbookRef.current.destroy() } catch (e) { console.warn('destroy error:', e) }
      flipbookRef.current = null
    }

    mountEl.innerHTML = ''
    setIsBookReady(false)

    // Kullanılabilir alan (Oklar ve araç çubuğu dışarıda)
    const viewportRect = viewportEl.getBoundingClientRect()
    const paddingX = isMobile ? 16 : 80
    const paddingY = isMobile ? 16 : 36

    const availableWidth = Math.max(120, (viewportRect.width || window.innerWidth) - paddingX * 2)
    const availableHeight = Math.max(120, (viewportRect.height || (window.innerHeight - 100)) - paddingY * 2)

    const naturalWidth = Math.max(1, pdfMeta.width || 210)
    const naturalHeight = Math.max(1, pdfMeta.height || 297)

    // Masaüstünde 2 sayfa yan yana (spread). Mobilde dikey ekranda tek sayfa.
    const useSinglePage = isMobile && window.innerWidth < 640
    const spreadWidthFactor = useSinglePage ? 1 : 2

    // Ölçek: açılmış 2 sayfa yan yana ekrana tam sığsın
    const scale = Math.min(
      availableWidth / (naturalWidth * spreadWidthFactor),
      availableHeight / naturalHeight
    )

    const pageWidth = Math.max(1, Math.floor(naturalWidth * scale))
    const pageHeight = Math.max(1, Math.floor(naturalHeight * scale))
    setSinglePageWidth(pageWidth)

    // Container açık kitap genişliğinde (2 x tek sayfa) ayarlanır
    mountEl.style.width = `${pageWidth * spreadWidthFactor}px`
    mountEl.style.height = `${pageHeight}px`

    const bookWrapper = document.createElement('div')
    bookWrapper.className = 'cilek-flipbook-host'
    bookWrapper.style.width = `${pageWidth * spreadWidthFactor}px`
    bookWrapper.style.height = `${pageHeight}px`
    mountEl.appendChild(bookWrapper)

    const clonedItems = templateItems.map((item, idx) => {
      const clone = item.cloneNode(true)
      clone.style.display = 'block'
      clone.style.width = `${pageWidth}px`
      clone.style.height = `${pageHeight}px`
      // Ön kapak (idx=0) ve arka kapak sert kapak, iç sayfalar yumuşak katlama
      if (idx === 0 || idx === templateItems.length - 1) {
        clone.setAttribute('data-density', 'hard')
      } else {
        clone.setAttribute('data-density', 'soft')
      }
      return clone
    })

    const targetStartPage = Math.min(
      currentPageIndexRef.current || 0,
      Math.max(0, clonedItems.length - 1)
    )

    // STPAGEFLIP YAPILANDIRMASI:
    // showCover: true -> Ön kapak tek sayfa, iç sayfalar 2'li yan yana, arka kapak tek sayfa kapanır!
    const pf = new PageFlip(bookWrapper, {
      width: pageWidth,
      height: pageHeight,
      size: 'fixed',
      minWidth: pageWidth,
      maxWidth: pageWidth,
      minHeight: pageHeight,
      maxHeight: pageHeight,
      startPage: targetStartPage,
      showCover: true, // ÖN VE ARKA KAPAK TEK, DİĞERLERİ İKİLİ!
      usePortrait: useSinglePage,
      mobileScrollSupport: true,
      useMouseEvents: true,
      disableFlipByClick: false,
      swipeDistance: 15,
      flippingTime: isMobile ? 420 : 550,
      showPageCorners: true,
      maxShadowOpacity: 0.35,
    })

    try {
      pf.loadFromHTML(clonedItems)

      pf.on('flip', (e) => {
        const pIndex = Number(e.data) || 0
        setCurrentPageIndex(pIndex)
        if (soundEnabledRef.current) playPageFlipSound()

        try {
          const pageCollection = pf.getPageCollection()
          const currentSpreadIndex = pageCollection.getCurrentSpreadIndex()
          const spreads = pageCollection.getSpread()
          const spread = spreads ? spreads[currentSpreadIndex] : null
          if (spread && spread.length > 0) {
            setActivePages(spread.map(i => i + 1))
          } else {
            setActivePages([pIndex + 1])
          }
        } catch {
          setActivePages([pIndex + 1])
        }
      })

      pf.on('changeState', () => {
        try {
          const cur = pf.getCurrentPageIndex()
          if (typeof cur === 'number' && !isNaN(cur)) {
            setCurrentPageIndex(cur)
          }
        } catch {}
      })

      pf.on('init', () => {
        setIsBookReady(true)
        setTotalPagesCount(pf.getPageCount())
        setCurrentPageIndex(targetStartPage)
        try {
          const pageCollection = pf.getPageCollection()
          const currentSpreadIndex = pageCollection.getCurrentSpreadIndex()
          const spreads = pageCollection.getSpread()
          const spread = spreads ? spreads[currentSpreadIndex] : null
          if (spread && spread.length > 0) {
            setActivePages(spread.map(i => i + 1))
          } else {
            setActivePages([targetStartPage + 1])
          }
        } catch {
          setActivePages([targetStartPage + 1])
        }
      })

      flipbookRef.current = pf
    } catch (err) {
      console.error('Flipbook load error:', err)
    }
  }, [pdfMeta.width, pdfMeta.height])

  useEffect(() => {
    if (loadingPdf) return
    const timer = setTimeout(() => initFlipbook(), 60)
    return () => clearTimeout(timer)
  }, [loadingPdf, pdfPages.length, initFlipbook])

  useEffect(() => {
    let timeoutId
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => initFlipbook(), 180)
    }
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      clearTimeout(timeoutId)
    }
  }, [initFlipbook])

  useEffect(() => {
    return () => {
      if (flipbookRef.current) {
        try { flipbookRef.current.destroy() } catch {}
        flipbookRef.current = null
      }
    }
  }, [])

  // Klavye ile sayfa çevirme
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); handleNext() }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); handlePrev() }
      else if (e.key === 'Escape' && isFullscreen) { document.exitFullscreen?.() }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev, isFullscreen])

  // Mobilde Dokunmatik Swipe
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX
      touchStartYRef.current = e.touches[0].clientY
    }
  }

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return
    const endX = e.changedTouches?.[0]?.clientX
    const endY = e.changedTouches?.[0]?.clientY
    if (endX !== undefined && endY !== undefined) {
      const diffX = endX - touchStartXRef.current
      const diffY = endY - touchStartYRef.current
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
        if (diffX < 0) {
          handleNext()
        } else {
          handlePrev()
        }
      }
    }
    touchStartXRef.current = null
    touchStartYRef.current = null
  }

  const handlePageSliderChange = (e) => {
    if (!flipbookRef.current) return
    flipbookRef.current.flip(parseInt(e.target.value, 10) - 1)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      bookStageRef.current?.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  const getPageStatusText = () => {
    if (loadingPdf) return 'Yükleniyor…'
    if (pdfLoadError) return 'PDF yüklenemedi'
    if (!isBookReady) return 'Hazırlanıyor…'
    if (currentPageIndex === 0) return 'Ön Kapak'
    if (currentPageIndex >= totalPagesCount - 1) return 'Arka Kapak'
    if (activePages && activePages.length > 1) {
      return `Sayfa ${activePages[0]} - ${activePages[1]} / ${totalPagesCount}`
    }
    return `Sayfa ${currentPageIndex + 1} / ${totalPagesCount}`
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      navigate(-1)
    }
  }

  // ÖN VE ARKA KAPAK ORTALAMA HESABI:
  // DOM akışında margin-left ile kaydırma yapılarak fare koordinatları ve StPageFlip rect'i %100 örtüştürülür.
  // Ön kapak sağ kanatta olduğundan sola (-pageWidth/2) kaydırılır -> Ön kapak TAM EKRANIN ORTASINDA TEK SAYFA durur.
  // Arka kapak sol kanatta olduğundan sağa (+pageWidth/2) kaydırılır -> Arka kapak TAM EKRANIN ORTASINDA TEK SAYFA durur.
  // İç sayfalarda (çift sayfalar) kaydırma 0'dır -> İKİLİ SAYFA TAM MERKEZDE durur.
  let coverMarginLeft = 0
  if (!isMobileMode && singlePageWidth > 0) {
    if (currentPageIndex === 0) {
      coverMarginLeft = -(singlePageWidth / 2)
    } else if (currentPageIndex >= totalPagesCount - 1) {
      coverMarginLeft = singlePageWidth / 2
    }
  }

  return (
    <div className={`magazine-reader-root modern-editorial-layout ${isFullscreen ? 'is-fullscreen' : ''}`} ref={bookStageRef}>

      {/* Gizli dosya seçici */}
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleLocalPdfUpload}
      />

      {/* ── SOL ALT: VINTAGE DERGİ AMBLEMİ & BAŞLIK ── */}
      <aside className="reader-corner-brand" aria-label="Dergi Bilgisi">
        <div className="reader-brand-emblem-wrap">
          <img src="/icons/cilek-vintage.png" alt="" className="reader-corner-berry" />
          <div className="reader-corner-texts">
            <span className="reader-corner-title">Çilek</span>
            <span className="reader-corner-sub">{magazine?.issue_number ? `Sayı #${magazine.issue_number}` : 'Koleksiyon'}</span>
          </div>
        </div>
      </aside>

      {/* ── SAĞ KENAR: DİKEY YÜZEN ARAÇ ÇUBUĞU ── */}
      <aside className="reader-floating-vbar" aria-label="Okuma Araçları">
        {/* Yorumlar Butonu */}
        <button
          type="button"
          className={`btn-vbar-tool ${isCommentsOpen ? 'active' : ''}`}
          onClick={() => setIsCommentsOpen(v => !v)}
          title="Sayfa Yorumları"
          aria-label="Sayfa Yorumları"
        >
          <span className="vbar-icon">💬</span>
          {commentsCount > 0 && <span className="vbar-badge">{commentsCount}</span>}
        </button>

        {/* PDF İndir (Varsa - Güvenli Proxy Linki ile) */}
        {magazine?.pdf_url && (
          <a
            href={getSafeMediaUrl(magazine.pdf_url)}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="btn-vbar-tool"
            title="PDF İndir"
            aria-label="PDF İndir"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </a>
        )}

        {/* Tam Ekran */}
        <button
          type="button"
          className="btn-vbar-tool desktop-only-tool"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
          aria-label="Tam Ekran"
        >
          {isFullscreen ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 14 10 14 10 20" />
              <polyline points="20 10 14 10 14 4" />
              <line x1="14" y1="10" x2="21" y2="3" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          )}
        </button>

        {/* Ses Aç/Kapat */}
        <button
          type="button"
          className={`btn-vbar-tool ${soundEnabled ? 'sound-active' : ''}`}
          onClick={() => {
            const next = !soundEnabled
            setSoundEnabled(next)
            try { localStorage.setItem('burnbook_sound', String(next)) } catch {}
          }}
          title={soundEnabled ? 'Sayfa Sesini Kapat' : 'Sayfa Sesini Aç'}
          aria-label={soundEnabled ? 'Sayfa Sesini Kapat' : 'Sayfa Sesini Aç'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        <div className="vbar-divider" aria-hidden="true" />

        {/* Kapat (✕) Butonu */}
        <button
          type="button"
          className="btn-vbar-tool btn-vbar-close"
          onClick={handleClose}
          title="Okuyucuyu Kapat (Esc)"
          aria-label="Kapat"
        >
          ✕
        </button>
      </aside>

      {/* ── ANA OKUMA ALANI: SAYFA DIŞINDA BÜYÜK OKLAR + MERKEZDE DERGİ ── */}
      <main
        className="reader-stage-container modern-stage"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* SOL ÇEVİRME OKU (Sayfanın DIŞINDA) */}
        <button
          type="button"
          className={`btn-stage-arrow btn-stage-prev ${currentPageIndex <= 0 ? 'disabled' : ''}`}
          onClick={handlePrev}
          disabled={currentPageIndex <= 0}
          title="Önceki Sayfa (Sol Ok)"
          aria-label="Önceki Sayfa"
        >
          ‹
        </button>

        {/* ORTA SAYFA ALANI */}
        <div className="flipbook-center-viewport" ref={viewportRef}>
          {loadingPdf ? (
            <div className="reader-pdf-loading-box">
              <div className="reader-spinner" />
              <h3>Dergi Sayfaları Hazırlanıyor…</h3>
              <div className="pdf-progress-bar">
                <div className="pdf-progress-fill" style={{ width: `${pdfProgress}%` }} />
              </div>
              <p>%{pdfProgress}</p>
            </div>
          ) : pdfLoadError ? (
            <div className="reader-pdf-error-box">
              <div className="reader-error-icon">⚠️</div>
              <h3 className="reader-error-title">PDF Yüklenemedi</h3>
              <p className="reader-error-desc">Dergi dosyası açılırken bir sorun oluştu.</p>
              <div className="reader-error-actions">
                {magazine?.pdf_url && (
                  <a
                    href={getSafeMediaUrl(magazine.pdf_url)}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-reader-action-primary"
                  >
                    PDF'i İndir
                  </a>
                )}
                <button
                  type="button"
                  className="btn-reader-action-secondary"
                  onClick={() => loadPdfSource(magazine?.pdf_url)}
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          ) : (
            <div
              className="flipbook-mount-wrapper"
              ref={bookMountRef}
              style={{
                marginLeft: `${coverMarginLeft}px`,
                transition: 'margin-left 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />
          )}
        </div>

        {/* SAĞ ÇEVİRME OKU (Sayfanın DIŞINDA) */}
        <button
          type="button"
          className={`btn-stage-arrow btn-stage-next ${currentPageIndex >= totalPagesCount - 1 ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={currentPageIndex >= totalPagesCount - 1}
          title="Sonraki Sayfa (Sağ Ok)"
          aria-label="Sonraki Sayfa"
        >
          ›
        </button>
      </main>

      {/* ── ALT GEZİNME: MİNİMAL İLERLEME ÇUBUĞU ── */}
      <footer className="reader-bottom-minimal-nav">
        <div className="reader-minimal-slider-wrap">
          <input
            type="range"
            min="1"
            max={Math.max(1, totalPagesCount)}
            value={currentPageIndex + 1}
            onChange={handlePageSliderChange}
            className="reader-minimal-progress-bar"
            aria-label="Sayfa ilerleme çubuğu"
          />
        </div>
        <div className="reader-minimal-status">
          <span className="status-title">{magazine?.title || 'Çilek'}</span>
          <span className="status-separator">·</span>
          <span className="status-pages">{getPageStatusText()}</span>
        </div>
      </footer>

      {/* ── YORUMLAR ÇEKMECESİ ── */}
      <PageCommentsDrawer
        magazineId={magazine?.id}
        activePages={activePages}
        user={user}
        isAdmin={isAdmin}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        onCommentCountChange={setCommentsCount}
      />

      {/* ── GİZLİ ŞABLON SAYFALAR (SADECE GERÇEK PDF SAYFALARI) ── */}
      <div ref={pagesTemplateRef} style={{ display: 'none' }} aria-hidden="true">
        {pdfPages.map((pageUrl, idx) => (
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
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
