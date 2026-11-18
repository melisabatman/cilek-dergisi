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

export default function MagazineReader({ magazine, user, isAdmin, embedded = false, onPageChange, onClose }) {
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

  const [totalPagesCount, setTotalPagesCount] = useState(6)
  const totalPagesCountRef = useRef(6)
  useEffect(() => {
    totalPagesCountRef.current = totalPagesCount
  }, [totalPagesCount])

  const [activePages, setActivePages] = useState([1])
  const [isBookReady, setIsBookReady] = useState(false)
  const [activePdfTitle, setActivePdfTitle] = useState(null)
  const [singlePageWidth, setSinglePageWidth] = useState(400)
  const [isMobileMode, setIsMobileMode] = useState(getIsMobile)

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

  // Fallback dergi sayfaları (PDF bulunamazsa veya örnek dergilerde kusursuz açılması için)
  const fallbackPages = React.useMemo(() => {
    const cover = magazine?.cover_image_url || '/icons/cilek-vintage.png'
    return [
      cover,
      '/images/cilek_women_illustration.jpg',
      '/images/magazine_spread_ref.jpg',
      '/images/editorial_girl.jpg',
      '/icons/icon2.png',
      cover,
    ]
  }, [magazine?.cover_image_url])

  const effectivePages = pdfPages.length > 0 ? pdfPages : (!loadingPdf ? fallbackPages : [])

  const displayPages = React.useMemo(() => {
    let pages = [...effectivePages]
    // Çift sayıda sayfa garantisi: Ön kapak tekli, iç sayfalar çiftli, arka kapak tekli kapanır
    if (pages.length > 1 && pages.length % 2 !== 0) {
      pages.push(pages[pages.length - 1])
    }
    return pages
  }, [effectivePages])

  // Arayüz Kontrolleri
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [commentsCount, setCommentsCount] = useState(0)

  // ─── BÜYÜTME (ZOOM) VE BÜYÜTEÇ (LOUPE) DURUMLARI ──────────────
  const [zoomLevel, setZoomLevel] = useState(1.0)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef({ x: 0, y: 0, originX: 0, originY: 0 })
  const didPanRef = useRef(false)

  const [isLoupeActive, setIsLoupeActive] = useState(false)
  const isLoupeActiveRef = useRef(isLoupeActive)
  useEffect(() => { isLoupeActiveRef.current = isLoupeActive }, [isLoupeActive])

  const [loupeState, setLoupeState] = useState({
    visible: false,
    x: 0,
    y: 0,
    bgX: 0,
    bgY: 0,
    bgW: 0,
    bgH: 0,
    imgUrl: '',
  })

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

      const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768
      const targetW = isMobileDevice ? 900 : 1400
      const renderScale = Math.min(2.0, Math.max(1.0, targetW / naturalW))
      const jpegQuality = isMobileDevice ? 0.86 : 0.92
      const renderedUrls = []

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i)
        const viewport = page.getViewport({ scale: renderScale })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width
        await page.render({ canvasContext: context, viewport }).promise
        renderedUrls.push(canvas.toDataURL('image/jpeg', jpegQuality))
        setPdfProgress(Math.round(45 + (i / numPages) * 50))
      }

      setPdfPages(renderedUrls)
      setLoadingPdf(false)
      setPdfLoadError(false)
    } catch (err) {
      console.warn('PDF yükleme hatası, yedek sayfalara geçiliyor:', err)
      setLoadingPdf(false)
      setPdfPages([])
      setPdfLoadError(false) // Hata ekranı yerine yedek sayfalarla derginin açılmasını sağla
    }
  }, [])

  useEffect(() => {
    if (magazine?.pdf_url) {
      loadPdfSource(magazine.pdf_url)
    } else {
      setLoadingPdf(false)
      setPdfLoadError(false)
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
      if (pf.getState() === 'flipping') return
      pf.flipPrev()
    } catch (err) {
      console.warn('flipPrev fallback:', err)
      try { pf.turnToPrevPage() } catch { }
    }
  }, [])

  const handleNext = useCallback(() => {
    const pf = flipbookRef.current
    if (!pf) return
    try {
      if (pf.getState() === 'flipping') return
      pf.flipNext()
    } catch (err) {
      console.warn('flipNext fallback:', err)
      try { pf.turnToNextPage() } catch { }
    }
  }, [])

  // ─── BÜYÜTME (ZOOM) VE BÜYÜTEÇ (LOUPE) FONKSİYONLARI ──────────
  const handleZoomIn = useCallback(() => {
    setZoomLevel(z => Math.min(2.25, Number((z + 0.25).toFixed(2))))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoomLevel(z => {
      const next = Math.max(1.0, Number((z - 0.25).toFixed(2)))
      if (next === 1.0) setPanOffset({ x: 0, y: 0 })
      return next
    })
  }, [])

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1.0)
    setPanOffset({ x: 0, y: 0 })
  }, [])

  const toggleLoupe = useCallback(() => {
    setIsLoupeActive(prev => {
      const next = !prev
      if (!next) {
        setLoupeState(s => ({ ...s, visible: false }))
      }
      return next
    })
  }, [])

  const updateLoupe = useCallback((e) => {
    if (!bookMountRef.current) return
    const bookHost = bookMountRef.current.querySelector('.cilek-flipbook-host') || bookMountRef.current
    const rect = bookHost.getBoundingClientRect()

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
      setLoupeState(s => (s.visible ? { ...s, visible: false } : s))
      return
    }

    const totalW = rect.width
    const hostH = rect.height
    const halfW = totalW / 2

    let targetPageIdx = 0
    let relX = 0
    let pageW = halfW

    const cur = currentPageIndexRef.current || 0
    const total = totalPagesCountRef.current || 1

    if (cur === 0) {
      targetPageIdx = 0
      relX = Math.max(0, x - halfW)
    } else if (cur >= total - 1) {
      targetPageIdx = total - 1
      relX = Math.min(halfW, x)
    } else {
      if (x < halfW) {
        targetPageIdx = Math.max(0, cur)
        relX = x
      } else {
        targetPageIdx = Math.min(total - 1, cur + 1)
        relX = x - halfW
      }
    }

    const imgUrl = displayPages[targetPageIdx] || displayPages[0] || ''
    const zoomRatio = 2.6
    const radius = 95 // 190px loupe lens diameter

    const bgW = pageW * zoomRatio
    const bgH = hostH * zoomRatio
    const bgX = -(relX * zoomRatio - radius)
    const bgY = -(y * zoomRatio - radius)

    setLoupeState({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      bgX,
      bgY,
      bgW,
      bgH,
      imgUrl: getSafeMediaUrl(imgUrl),
    })
  }, [displayPages])

  const handleMouseMove = useCallback((e) => {
    if (isLoupeActiveRef.current) {
      updateLoupe(e)
    }
    if (isPanning && zoomLevel > 1.0) {
      const dx = e.clientX - panStartRef.current.x
      const dy = e.clientY - panStartRef.current.y
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        didPanRef.current = true
      }
      const maxPanX = (singlePageWidth * 2 * (zoomLevel - 1)) / 1.4
      const maxPanY = (singlePageWidth * 1.414 * (zoomLevel - 1)) / 1.4
      setPanOffset({
        x: Math.max(-maxPanX, Math.min(maxPanX, panStartRef.current.originX + dx)),
        y: Math.max(-maxPanY, Math.min(maxPanY, panStartRef.current.originY + dy)),
      })
    }
  }, [isPanning, zoomLevel, singlePageWidth, updateLoupe])

  const handleMouseDown = useCallback((e) => {
    if (isLoupeActiveRef.current || zoomLevel <= 1.0) return
    if (e.target.closest('button') || e.target.closest('input')) return
    setIsPanning(true)
    didPanRef.current = false
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      originX: panOffset.x,
      originY: panOffset.y,
    }
  }, [zoomLevel, panOffset])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (isLoupeActiveRef.current) {
      setLoupeState(s => ({ ...s, visible: false }))
    }
    setIsPanning(false)
  }, [])

  const handleDoubleClick = useCallback((e) => {
    if (isLoupeActiveRef.current) return
    if (e.target.closest('button') || e.target.closest('input')) return
    if (zoomLevel > 1.0) {
      handleZoomReset()
    } else {
      setZoomLevel(1.6)
    }
  }, [zoomLevel, handleZoomReset])

  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      if (e.deltaY < 0) {
        handleZoomIn()
      } else {
        handleZoomOut()
      }
    }
  }, [handleZoomIn, handleZoomOut])

  // -------------------------------------------------------------
  // 3. FLIPBOOK OLUŞTURMA: GERÇEKÇİ ÇİFT SAYFA & TEK KAPAK (HTML RENDER)
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
    const paddingX = isMobile ? 4 : (embedded ? 32 : 64)
    const paddingY = isMobile ? 6 : (embedded ? 12 : 24)

    const containerW = viewportRect.width || viewportEl.clientWidth || window.innerWidth
    const containerH = viewportRect.height || viewportEl.clientHeight || (window.innerHeight * 0.75)

    const availableWidth = Math.max(120, containerW - paddingX * 2)
    const availableHeight = Math.max(120, containerH - paddingY * 2)

    const naturalWidth = Math.max(1, pdfMeta.width || 210)
    const naturalHeight = Math.max(1, pdfMeta.height || 297)

    // Masaüstünde 2 sayfa yan yana (spread). Mobilde ise derginin kocaman ve net olması için tek sayfa modu
    const spreadWidthFactor = isMobile ? 1 : 2

    // Ölçek: ekrana tam ve büyük sığsın
    const scale = Math.min(
      availableWidth / (naturalWidth * spreadWidthFactor),
      availableHeight / naturalHeight
    )

    const pageWidth = Math.max(1, Math.floor(naturalWidth * scale))
    const pageHeight = Math.max(1, Math.floor(naturalHeight * scale))
    setSinglePageWidth(pageWidth)

    // Container açık kitap genişliğinde (veya mobilde tek sayfa genişliğinde) ayarlanır
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
      if (isMobile) {
        // Mobilde tek sayfa çevrildiğinde pürüzsüz kuşe sayfa hissi
        clone.setAttribute('data-density', 'hard')
      } else if (idx === 0 || idx === templateItems.length - 1) {
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

    setTotalPagesCount(clonedItems.length)

    // STPAGEFLIP YAPILANDIRMASI:
    // Masaüstünde: showCover: true, usePortrait: false (2 sayfa yan yana, açık kitap)
    // Mobilde: usePortrait: true, showCover: false (ekranı tam kaplayan büyük tek sayfa)
    const pf = new PageFlip(bookWrapper, {
      width: pageWidth,
      height: pageHeight,
      size: 'fixed',
      minWidth: pageWidth,
      maxWidth: pageWidth,
      minHeight: pageHeight,
      maxHeight: pageHeight,
      startPage: targetStartPage,
      showCover: !isMobile,
      usePortrait: isMobile,
      mobileScrollSupport: false,
      useMouseEvents: true, // Fare ve parmakla tutup kıvırma/katlama desteği
      disableFlipByClick: false, // Kenarlara tıklayarak veya dokunarak sayfa çevirme
      clickEventForward: true,
      swipeDistance: isMobile ? 24 : 20,
      flippingTime: isMobile ? 420 : 480, // Doğal, akıcı yaprak çevirme süresi
      showPageCorners: !isMobile,
      maxShadowOpacity: isMobile ? 0.24 : 0.35,
      drawShadow: true,
    })

    // DERGİYE BASINCA FLIPBOOK ÇEVRİLME DİNLENMESİ (Click-to-Flip)
    bookWrapper.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('a')) return
      if (isLoupeActiveRef.current) return
      if (didPanRef.current) {
        didPanRef.current = false
        return
      }
      const pfInstance = flipbookRef.current
      if (!pfInstance) return
      try {
        if (pfInstance.getState() === 'flipping') return
      } catch { }

      const rect = bookWrapper.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const cur = currentPageIndexRef.current
      const total = clonedItems.length

      if (isMobile) {
        // Mobilde sağ yarı ileri, sol yarı geri
        if (clickX >= rect.width / 2) {
          handleNext()
        } else {
          handlePrev()
        }
      } else if (cur === 0) {
        // Masaüstünde ön kapak kapalıyken tıklandığında açılır
        handleNext()
      } else if (cur >= total - 1) {
        // Masaüstünde arka kapak kapalıyken tıklandığında geri döner
        handlePrev()
      } else {
        // İç çift sayfalarda: sağ yarı ileri, sol yarı geri
        if (clickX >= rect.width / 2) {
          handleNext()
        } else {
          handlePrev()
        }
      }
    })

    try {
      pf.loadFromHTML(clonedItems)

      pf.on('flip', (e) => {
        const pIndex = Number(e.data) || 0
        setCurrentPageIndex(pIndex)
        onPageChange?.(pIndex + 1)
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
        } catch { }
      })

      pf.on('init', () => {
        setIsBookReady(true)
        setTotalPagesCount(pf.getPageCount())
        setCurrentPageIndex(targetStartPage)
        onPageChange?.(targetStartPage + 1)

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
  }, [pdfMeta.width, pdfMeta.height, handleNext, handlePrev])

  useEffect(() => {
    if (loadingPdf) return
    const timer = setTimeout(() => initFlipbook(), 60)
    return () => clearTimeout(timer)
  }, [loadingPdf, displayPages.length, initFlipbook])

  // Tam ekran veya pencere büyüklüğü değiştiğinde flipbook'u yeniden hesapla ve büyüt
  useEffect(() => {
    if (loadingPdf) return
    const timer = setTimeout(() => {
      initFlipbook()
    }, 120)
    return () => clearTimeout(timer)
  }, [isFullscreen, loadingPdf, initFlipbook])

  // Tarayıcı yerel tam ekran olayını dinle (Esc ile çıkıldığında durumu senkronize et)
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement)
      setIsFullscreen(isFs)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    document.addEventListener('webkitfullscreenchange', handleFsChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange)
      document.removeEventListener('webkitfullscreenchange', handleFsChange)
    }
  }, [])

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
        try { flipbookRef.current.destroy() } catch { }
        flipbookRef.current = null
      }
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    const isCurrentlyFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement || isFullscreen)
    if (!isCurrentlyFs) {
      if (bookStageRef.current?.requestFullscreen) {
        bookStageRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true)
        })
      } else if (bookStageRef.current?.webkitRequestFullscreen) {
        bookStageRef.current.webkitRequestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {})
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        }
      }
      setIsFullscreen(false)
    }
  }, [isFullscreen])

  // Klavye ile sayfa çevirme ve kısayollar (+/- zoom, M büyüteç, F tam ekran)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); handleNext() }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); handlePrev() }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); handleZoomIn() }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); handleZoomOut() }
      else if (e.key === '0') { e.preventDefault(); handleZoomReset() }
      else if (e.key.toLowerCase() === 'm' || e.key.toLowerCase() === 'b') { e.preventDefault(); toggleLoupe() }
      else if (e.key.toLowerCase() === 'f') { e.preventDefault(); toggleFullscreen() }
      else if (e.key === 'Escape') {
        if (isLoupeActiveRef.current) { toggleLoupe() }
        else if (zoomLevel > 1.0) { handleZoomReset() }
        else if (isFullscreen) { toggleFullscreen() }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev, isFullscreen, handleZoomIn, handleZoomOut, handleZoomReset, toggleLoupe, toggleFullscreen, zoomLevel])

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
        const pf = flipbookRef.current
        if (pf) {
          try {
            if (pf.getState() === 'flipping') {
              touchStartXRef.current = null
              touchStartYRef.current = null
              return
            }
          } catch { }
        }
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

  const getPageStatusText = () => {
    if (loadingPdf) return 'Yükleniyor…'
    if (pdfLoadError) return 'PDF yüklenemedi'
    if (!isBookReady) return 'Hazırlanıyor…'
    if (isLoupeActive) return '🔍 Büyüteç Aktif · Sayfa üzerinde gezdirin'
    if (zoomLevel > 1.0) return `🔎 %${Math.round(zoomLevel * 100)} Yakınlaştırma · Sürükleyerek gezinin (Çift tık: sıfırla)`
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
    <div className={`magazine-reader-root ${embedded ? 'reader-embedded-mode' : ''} modern-editorial-layout ${isFullscreen ? 'is-fullscreen' : ''}`} ref={bookStageRef}>

      {/* Gizli dosya seçici */}
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleLocalPdfUpload}
      />

      {/* ── SOL ALT: VINTAGE DERGİ AMBLEMİ & BAŞLIK (Modal veya Tam Ekran Açıkken) ── */}
      {(!embedded || isFullscreen) && (
        <aside className="reader-corner-brand" aria-label="Dergi Bilgisi">
          <div className="reader-brand-emblem-wrap">
            <img src="/icons/cilek-vintage.png" alt="" className="reader-corner-berry" />
            <div className="reader-corner-texts">
              <span className="reader-corner-title">Çilek</span>
              <span className="reader-corner-sub">{magazine?.issue_number ? `Sayı #${magazine.issue_number}` : 'Koleksiyon'}</span>
            </div>
          </div>
        </aside>
      )}

      {/* ── SAĞ KENAR: DİKEY YÜZEN ARAÇ ÇUBUĞU ── */}
      <aside className="reader-floating-vbar" aria-label="Okuma Araçları">
        {/* Yorumlar Butonu (Sadece Modal veya Tam Ekran Açıkken) */}
        {(!embedded || isFullscreen) && (
          <button
            type="button"
            className={`btn-vbar-tool ${isCommentsOpen ? 'active' : ''}`}
            onClick={() => {
              const el = document.getElementById('issue-comments-section')
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' })
              } else {
                setIsCommentsOpen(v => !v)
              }
            }}
            title="Okur Yorumları"
            aria-label="Okur Yorumları"
          >
            <span className="vbar-icon">💬</span>
            {commentsCount > 0 && <span className="vbar-badge">{commentsCount}</span>}
          </button>
        )}

        {/* PDF İndir (Sadece Modal veya Tam Ekran Açıkken - Normal sayfada başlık altında mevcut) */}
        {(!embedded || isFullscreen) && magazine?.pdf_url && (
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

        {/* Tam Ekran / Ekranı Kapla */}
        <button
          type="button"
          className={`btn-vbar-tool ${isFullscreen ? 'active' : ''}`}
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Tam Sayfadan Çık (F / Esc)' : 'Ekranı Kapla / Tam Boyut (F)'}
          aria-label={isFullscreen ? 'Tam Sayfadan Çık' : 'Ekranı Kapla'}
          id="btn-reader-fullscreen"
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

        <div className="vbar-divider" aria-hidden="true" />

        {/* Büyüteç (Magnifying Glass Loupe) */}
        <button
          type="button"
          className={`btn-vbar-tool ${isLoupeActive ? 'active' : ''}`}
          onClick={toggleLoupe}
          title={isLoupeActive ? 'Büyüteci Kapat (M)' : 'Büyüteç (Sayfa Detayını Büyüt - M)'}
          aria-label="Büyüteç"
          id="btn-reader-loupe"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <circle cx="11" cy="11" r="3" strokeWidth="1.5" />
          </svg>
        </button>

        {/* Büyüt (+) */}
        <button
          type="button"
          className={`btn-vbar-tool ${zoomLevel > 1.0 ? 'active' : ''}`}
          onClick={handleZoomIn}
          disabled={zoomLevel >= 2.25}
          title="Sayfayı Büyüt (+)"
          aria-label="Büyüt"
          id="btn-reader-zoom-in"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>

        {/* Küçült (-) */}
        <button
          type="button"
          className="btn-vbar-tool"
          onClick={handleZoomOut}
          disabled={zoomLevel <= 1.0}
          title="Sayfayı Küçült (-)"
          aria-label="Küçült"
          id="btn-reader-zoom-out"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>

        {/* Büyütmeyi Sıfırla (% Göstergesi) */}
        {zoomLevel > 1.0 && (
          <button
            type="button"
            className="btn-vbar-tool btn-vbar-zoom-reset"
            onClick={handleZoomReset}
            title="Büyütmeyi Sıfırla (%100)"
            aria-label="Büyütmeyi Sıfırla"
          >
            <span style={{ fontSize: '10.5px', fontWeight: 'bold' }}>%{Math.round(zoomLevel * 100)}</span>
          </button>
        )}

        <div className="vbar-divider" aria-hidden="true" />

        {/* Ses Aç/Kapat */}
        <button
          type="button"
          className={`btn-vbar-tool ${soundEnabled ? 'sound-active' : ''}`}
          onClick={() => {
            const next = !soundEnabled
            setSoundEnabled(next)
            try { localStorage.setItem('burnbook_sound', String(next)) } catch { }
          }}
          title={soundEnabled ? 'Sayfa Sesini Kapat' : 'Sayfa Sesini Aç'}
          aria-label={soundEnabled ? 'Sayfa Sesini Kapat' : 'Sayfa Sesini Aç'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        {/* Kapat (✕) Butonu (Sadece modal modunda) */}
        {!embedded && (
          <>
            <div className="vbar-divider" aria-hidden="true" />
            <button
              type="button"
              className="btn-vbar-tool btn-vbar-close"
              onClick={handleClose}
              title="Okuyucuyu Kapat (Esc)"
              aria-label="Kapat"
            >
              ✕
            </button>
          </>
        )}
      </aside>

      {/* ── ANA OKUMA ALANI: SAYFA DIŞINDA BÜYÜK OKLAR + MERKEZDE DERGİ ── */}
      <main
        className={`reader-stage-container modern-stage ${isLoupeActive ? 'loupe-mode-active' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
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
              className={`flipbook-mount-wrapper ${zoomLevel > 1.0 ? 'is-zoomed' : ''} ${isPanning ? 'is-panning' : ''}`}
              ref={bookMountRef}
              style={{
                marginLeft: `${coverMarginLeft}px`,
                transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), margin-left 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
                cursor: isLoupeActive ? 'crosshair' : (zoomLevel > 1.0 ? (isPanning ? 'grabbing' : 'grab') : undefined),
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
          <div className="status-quick-actions">
            <button
              type="button"
              className={`btn-reader-quick-zoom ${zoomLevel > 1.0 ? 'active' : ''}`}
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2.25}
              title="Sayfayı Yakınlaştır (+)"
              aria-label="Büyüt"
            >
              🔍 + Büyüt
            </button>
            {zoomLevel > 1.0 && (
              <button
                type="button"
                className="btn-reader-quick-reset"
                onClick={handleZoomReset}
                title="Büyütmeyi Sıfırla (%100)"
                aria-label="Sıfırla"
              >
                %{Math.round(zoomLevel * 100)} Sıfırla
              </button>
            )}
            <button
              type="button"
              className={`btn-reader-quick-expand ${isFullscreen ? 'active' : ''}`}
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Tam Sayfadan Çık (F / Esc)' : 'Ekranı Tam Kapla / Büyüt (F)'}
              aria-label="Tam Sayfa Kapla"
            >
              {isFullscreen ? '✕ Normal Boyut' : '⛶ Tam Sayfa Kapla'}
            </button>
          </div>
        </div>
      </footer>

      {/* ── TAM SAYFA MODU ÇIKIŞ BUTONU (Ekranın sağ üstünde belirgin) ── */}
      {isFullscreen && (
        <button
          type="button"
          className="btn-exit-fullscreen-floating"
          onClick={toggleFullscreen}
          title="Tam Sayfadan Çık (F veya Esc)"
          aria-label="Tam Sayfadan Çık"
        >
          ✕ Tam Sayfadan Çık (Esc)
        </button>
      )}

      {/* ── YORUMLAR ÇEKMECESİ (Yalnızca Modal / Bağımsız Modda) ── */}
      {!embedded && (
        <PageCommentsDrawer
          magazineId={magazine?.id}
          activePages={activePages}
          user={user}
          isAdmin={isAdmin}
          isOpen={isCommentsOpen}
          onClose={() => setIsCommentsOpen(false)}
          onCommentCountChange={setCommentsCount}
        />
      )}

      {/* ── GİZLİ ŞABLON SAYFALAR (HTML FLIPBOOK ÇEVİRİMİ İÇİN) ── */}
      <div ref={pagesTemplateRef} style={{ display: 'none' }} aria-hidden="true">
        {displayPages.map((pageUrl, idx) => (
          <div
            key={`page-node-${idx}`}
            className="flip-page-node flip-page-pdf"
            data-density={isMobileMode ? 'hard' : (idx === 0 || idx === displayPages.length - 1 ? 'hard' : 'soft')}
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

      {/* ── BÜYÜTEÇ LENSİ (MAGNIFYING GLASS LOUPE) ── */}
      {isLoupeActive && loupeState.visible && loupeState.imgUrl && (
        <div
          className="reader-loupe-lens"
          style={{
            left: `${loupeState.x}px`,
            top: `${loupeState.y}px`,
            backgroundImage: `url("${loupeState.imgUrl}")`,
            backgroundSize: `${loupeState.bgW}px ${loupeState.bgH}px`,
            backgroundPosition: `${loupeState.bgX}px ${loupeState.bgY}px`,
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="reader-loupe-glare" />
          <div className="reader-loupe-crosshair" />
          <span className="reader-loupe-badge">2.6x Büyüteç</span>
        </div>
      )}

    </div>
  )
}
