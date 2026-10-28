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

  // Arayüz Kontrolleri
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [commentsCount, setCommentsCount] = useState(0)

  // Swipe Dokunma Takibi
  const touchStartXRef = useRef(null)
  const touchStartYRef = useRef(null)

  // -------------------------------------------------------------
  // 1. PDF SAYFALARINI İŞLEME (VPN Gerektirmeyen Güvenli Proxy ile)
  // -------------------------------------------------------------
  const loadPdfSource = useCallback(async (source, title = null) => {
    setLoadingPdf(true)
    setPdfProgress(10)
    if (title) setActivePdfTitle(title)

    // Türkiye ve kısıtlı ağlarda r2.dev engelini aşan güvenli URL
    const safeSource = typeof source === 'string' ? getSafeMediaUrl(source) : source

    try {
      let loadingTask
      if (typeof safeSource === 'string') {
        loadingTask = pdfjsLib.getDocument({
          url: safeSource,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/cmaps/`,
          cMapPacked: true,
        })
      } else {
        loadingTask = pdfjsLib.getDocument({
          data: safeSource,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/cmaps/`,
          cMapPacked: true,
        })
      }

      const pdfDoc = await loadingTask.promise
      const numPages = pdfDoc.numPages
      setTotalPagesCount(numPages)
      setPdfProgress(25)

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
        setPdfProgress(Math.round(25 + (i / numPages) * 70))
      }

      setPdfPages(renderedUrls)
      setLoadingPdf(false)
    } catch (err) {
      console.warn('PDF yüklenemedi, zengin editoryal dergi sayfalarına geçiliyor:', err)
      // PDF yüklenemese dahi dergi ASLA kapanmaz, editoryal şablonla flipbook olarak açılır!
      setLoadingPdf(false)
      setPdfPages([])
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
    if (!flipbookRef.current) return
    try {
      flipbookRef.current.flipPrev()
    } catch (err) {
      console.warn('flipPrev fallback:', err)
      const cur = currentPageIndexRef.current
      if (cur > 0) {
        flipbookRef.current.flip(cur - 1)
      }
    }
  }, [])

  const handleNext = useCallback(() => {
    if (!flipbookRef.current) return
    try {
      flipbookRef.current.flipNext()
    } catch (err) {
      console.warn('flipNext fallback:', err)
      const cur = currentPageIndexRef.current
      if (cur < totalPagesCount - 1) {
        flipbookRef.current.flip(cur + 1)
      }
    }
  }, [totalPagesCount])

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
    if (!isBookReady) return 'Yükleniyor…'
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
            max={totalPagesCount}
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

      {/* ── GİZLİ ŞABLON SAYFALAR ── */}
      <div ref={pagesTemplateRef} style={{ display: 'none' }} aria-hidden="true">
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
          <>
            {/* SAYFA 1: ÖN KAPAK */}
            <div className="flip-page-node page-cover-front" data-density="hard">
              {magazine?.cover_image_url ? (
                <div className="page-paper-sheet pdf-page-clean">
                  <img src={getSafeMediaUrl(magazine.cover_image_url)} alt={magazine.title} className="cover-art-full" />
                </div>
              ) : (
                <div className="page-paper-sheet cover-sheet">
                  <div className="editorial-cover-layout">
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

            {/* SAYFA 2: YAYIN KÜNYESİ */}
            <div className="flip-page-node" data-density="soft">
              <div className="page-paper-sheet inner-sheet">
                <div className="colophon-header">
                  <span className="sheet-kicker">ÇİLEK DERGİSİ BASKI KÜNYESİ</span>
                  <span className="sheet-edition">EST. 2024 • İSTANBUL</span>
                </div>
                <div className="sheet-divider-line" />
                <div className="colophon-manifesto">
                  <h3 className="colophon-title">Bağımsız Yayın İlkemiz</h3>
                  <p>Çilek Dergisi, 15-25 yaş kuşağının sahici, yargısız ve özgün sesini sayfalarında büyütmek amacıyla kurulmuş bağımsız bir editoryal kolektiftir.</p>
                </div>
                <div className="colophon-team-grid">
                  <div className="colophon-role-block"><h4>GENEL YAYIN YÖNETMENİ</h4><p>Çilek Kolektif Masası</p></div>
                  <div className="colophon-role-block"><h4>ART DIRECTOR &amp; MİZANPAJ</h4><p>Çilek Art Studio</p></div>
                  <div className="colophon-role-block"><h4>EDEBİYAT &amp; İÇERİK</h4><p>Yazı İşleri Masası</p></div>
                  <div className="colophon-role-block"><h4>GÖRSEL SANATLAR &amp; FOTOĞRAF</h4><p>Genç Sanatçı Kolektifi</p></div>
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

            {/* SAYFA 3: İÇİNDEKİLER */}
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

            {/* SAYFA 4: EDİTÖRÜN NOTU */}
            <div className="flip-page-node" data-density="soft">
              <div className="page-paper-sheet inner-sheet">
                <div className="colophon-header">
                  <span className="sheet-kicker">EDİTÖRÜN MASASINDAN</span>
                  <span className="sheet-edition">BİR BAŞLANGIÇ CÜMLESİ</span>
                </div>
                <div className="sheet-divider-line" />
                <h2 className="editorial-sheet-h2">Sevgili Okur,</h2>
                <p className="editorial-sheet-lead">
                  Kendi sesini bulmak, belki de hayatın en sessiz ve en cesur yolculuğudur.
                </p>
                <div className="editorial-sheet-text-cols">
                  <p>{magazine?.description || 'Çilek Dergisi, hiçbir kalıba sığmak zorunda hissetmeyen, kendi ritminde yazıp çizen insanların ortak sığınağıdır.'}</p>
                  <p>15-25 yaş arası büyüme sancılarını, ilk dizelerin heyecanını ve stüdyoda dökülen fırça izlerini bir araya getirdik.</p>
                </div>
                <blockquote className="editorial-sheet-blockquote">
                  <span className="quote-mark">"</span>
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

            {/* SAYFA 5: EDEBİ ANLATI */}
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
                    <span className="dropcap">K</span>elimeler bazen bir kentin sokaklarında yankılanır, bazen de bir odanın sessizliğinde kaybolur. Bu sayıda, bizi biz yapan detayları konuştuk.
                  </p>
                  <p>Pencerelerden içeri süzülen öğleden sonra ışığı gibi; bazen tek bir satır, günlerce zihnimizde bir melodi gibi dolanır.</p>
                  <p>Kendi alanını kurmak ve kalıplara inat üretmek... Çilek Dergisi'nin her sayfasında bu özgürlüğün ayak izlerini arıyoruz.</p>
                </div>
                <div className="page-sheet-spine-shadow" />
                <div className="page-number-folio">5 • ANLATI</div>
              </div>
            </div>

            {/* SAYFA 6: ŞİİR */}
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

            {/* SAYFA 7: RÖPORTAJ */}
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
                    <p className="qa-a">"Hiçbir ticari kaygı olmadan, doğrudan kendi yaşdaşlarına hitap etmek paha biçilmez bir özgürlük."</p>
                  </div>
                  <div className="qa-item">
                    <span className="qa-q">Soru: Genç yazarlara tavsiyeniz nedir?</span>
                    <p className="qa-a">"Mükemmel olmayı beklemeyin. İlk taslaklarınızı saklamayın. Çilek bu ilk adımları karşılamak için var."</p>
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

            {/* SAYFA 8: ARKA KAPAK */}
            <div className="flip-page-node page-cover-back" data-density="hard">
              <div className="page-paper-sheet back-cover-sheet">
                <div className="back-cover-layout">
                  <div className="back-cover-emblem">
                    <img src="/icons/cilek-vintage.png" alt="Çilek" className="back-strawberry-img" />
                  </div>
                  <h2 className="back-cover-title">ÇİLEK DERGİSİ</h2>
                  <p className="back-cover-motto">"To Read Forever, To Feel Together."</p>
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
