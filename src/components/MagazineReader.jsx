import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as pdfjsLib from 'pdfjs-dist'
import PageCommentsDrawer from './PageCommentsDrawer'

// PDF.js Worker yapılandırması (CDN üzerinden güvenli ve hatasız yükleme)
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`
}

export default function MagazineReader({ magazine, user, isAdmin }) {
  const navigate = useNavigate()
  const [totalPages, setTotalPages] = useState(8)
  const [currentPage, setCurrentPage] = useState(1) // 1-indexed
  const [isMobile, setIsMobile] = useState(window.innerWidth < 860)
  const [flipDirection, setFlipDirection] = useState(null) // 'next' | 'prev'
  const [isFlipping, setIsFlipping] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [commentsCount, setCommentsCount] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  // PDF Sayfaları Canvas Durumu
  const [pdfPages, setPdfPages] = useState([]) // dataUrls
  const [loadingPdf, setLoadingPdf] = useState(Boolean(magazine?.pdf_url))
  const [pdfProgress, setPdfProgress] = useState(0)

  const readerStageRef = useRef(null)

  // Pencere boyutu takibi (Masaüstü çift sayfa, Mobil tek sayfa)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 860)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // -------------------------------------------------------------
  // PDF SAYFALARINI RENDER ETME (Eğer pdf_url varsa)
  // -------------------------------------------------------------
  useEffect(() => {
    let isCancelled = false

    async function loadPdfPages() {
      if (!magazine?.pdf_url) {
        setLoadingPdf(false)
        setTotalPages(8) // Editoryal zengin demo sayfaları
        return
      }

      setLoadingPdf(true)
      setPdfProgress(10)

      try {
        const loadingTask = pdfjsLib.getDocument({
          url: magazine.pdf_url,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/cmaps/`,
          cMapPacked: true,
        })

        const pdfDoc = await loadingTask.promise
        if (isCancelled) return

        const numPages = pdfDoc.numPages
        setTotalPages(numPages)
        setPdfProgress(30)

        const renderedUrls = []
        const scale = 1.5 // Yüksek çözünürlük

        for (let i = 1; i <= numPages; i++) {
          if (isCancelled) return
          const page = await pdfDoc.getPage(i)
          const viewport = page.getViewport({ scale })

          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          canvas.height = viewport.height
          canvas.width = viewport.width

          await page.render({ canvasContext: context, viewport }).promise

          renderedUrls.push(canvas.toDataURL('image/jpeg', 0.88))
          setPdfProgress(Math.round(30 + (i / numPages) * 65))
        }

        if (!isCancelled) {
          setPdfPages(renderedUrls)
          setLoadingPdf(false)
        }
      } catch (err) {
        console.warn('PDF sayfaları yüklenemedi, editoryal sayfa moduna geçiliyor:', err)
        if (!isCancelled) {
          setLoadingPdf(false)
          setTotalPages(8)
        }
      }
    }

    loadPdfPages()

    return () => {
      isCancelled = true
    }
  }, [magazine?.pdf_url])

  const [pageMode, setPageMode] = useState(() => {
    try {
      return localStorage.getItem('burnbook_reader_mode') || 'single'
    } catch {
      return 'single'
    }
  })

  // Çift sayfa modu sadece kullanıcı özellikle 'dual' seçmişse ve masaüstündeyse aktif olur
  const isDualMode = pageMode === 'dual' && !isMobile

  const handleModeChange = (newMode) => {
    setPageMode(newMode)
    try {
      localStorage.setItem('burnbook_reader_mode', newMode)
    } catch {}
    if (newMode === 'dual' && currentPage > 1 && currentPage % 2 !== 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  // -------------------------------------------------------------
  // AKTİF SAYFA HESAPLAMA (Tekli sayfa veya Çift sayfa spread)
  // -------------------------------------------------------------
  // Tekli sayfa modu (varsayılan): [currentPage]
  // Çift sayfa modunda (Masaüstü):
  // - Sayfa 1 (Kapak): [1]
  // - Sayfa 2 ve sonrası: [even, even + 1] (örn: [2, 3], [4, 5])
  const getActivePages = useCallback(() => {
    if (!isDualMode) return [currentPage]
    if (currentPage === 1) return [1]
    const left = currentPage % 2 === 0 ? currentPage : currentPage - 1
    const right = left + 1 <= totalPages ? left + 1 : null
    return right ? [left, right] : [left]
  }, [currentPage, isDualMode, totalPages])

  const activePages = getActivePages()

  // -------------------------------------------------------------
  // SAYFA ÇEVİRME METODLARI
  // -------------------------------------------------------------
  const goToNextPage = useCallback(() => {
    if (isFlipping) return
    const step = !isDualMode ? 1 : (currentPage === 1 ? 1 : 2)
    const nextP = currentPage + step
    if (nextP <= totalPages) {
      setFlipDirection('next')
      setIsFlipping(true)
      setTimeout(() => {
        setCurrentPage(nextP)
        setIsFlipping(false)
      }, 300)
    }
  }, [currentPage, isFlipping, isDualMode, totalPages])

  const goToPrevPage = useCallback(() => {
    if (isFlipping) return
    let prevP
    if (!isDualMode) {
      prevP = currentPage - 1
    } else if (currentPage <= 2) {
      prevP = 1
    } else if (currentPage % 2 === 0) {
      prevP = currentPage - 2
    } else {
      prevP = currentPage - 1
    }

    if (prevP >= 1) {
      setFlipDirection('prev')
      setIsFlipping(true)
      setTimeout(() => {
        setCurrentPage(prevP)
        setIsFlipping(false)
      }, 300)
    }
  }, [currentPage, isFlipping, isDualMode])

  // Tekli sayfaya tıklandığında sola tık geri, sağa tık ileri
  const handleSinglePageClick = (e) => {
    if (e.target.closest('a, button, input, textarea, select')) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    if (clickX < rect.width * 0.35) {
      goToPrevPage()
    } else {
      goToNextPage()
    }
  }

  // Klavye ok tuşları ile sayfa çevirme
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault()
        goToNextPage()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        goToPrevPage()
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen?.()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNextPage, goToPrevPage, isFullscreen])

  // Tam ekran geçişi
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerStageRef.current?.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  // -------------------------------------------------------------
  // SAYFA İÇERİĞİ RENDERER (PDF VEYA EDİTORYAL MİZANPAJ)
  // -------------------------------------------------------------
  const renderSinglePageContent = (pageNum) => {
    // 1. PDF sayfası varsa doğrudan render edilmiş canvas/image göster
    if (pdfPages[pageNum - 1]) {
      return (
        <div className="book-page-canvas-wrap">
          <img
            src={pdfPages[pageNum - 1]}
            alt={`Sayfa ${pageNum}`}
            className="book-page-pdf-img"
          />
          <div className="book-page-footer-num">Sayfa {pageNum}</div>
        </div>
      )
    }

    // 2. Eğer PDF yoksa: Zengin editoryal mizanpaj şablonları
    if (pageNum === 1) {
      // KAPAK SAYFASI
      return (
        <div className="editorial-page-cover">
          {magazine?.cover_image_url ? (
            <img src={magazine.cover_image_url} alt={magazine.title} className="page-cover-art" />
          ) : (
            <div className="page-cover-decorative">
              <div className="cover-vintage-badge">
                <img src="/icons/cilek-vintage.png" alt="Çilek" className="cover-strawberry-icon" />
              </div>
              <span className="cover-kicker">ÇİLEK DERGİSİ DİJİTAL YAYINI</span>
              <h1 className="cover-magazine-title">{magazine?.title || 'Sayı 06 — Yaz'}</h1>
              <span className="cover-issue-badge">Sayı #{magazine?.issue_number || '06'}</span>
              <p className="cover-tagline">"Her ay yeni bir sayfa, seninle büyüyen ve parıldayan bir ses."</p>
            </div>
          )}
          <div className="book-page-footer-num cover-num">1 / {totalPages}</div>
        </div>
      )
    }

    if (pageNum === 2) {
      // İÇİNDEKİLER VE KÜNYE
      return (
        <div className="editorial-page-content toc-page">
          <div className="page-header-line">
            <span className="page-header-tag">ÇİLEK DERGİSİ</span>
            <span className="page-header-issue">SAYI #{magazine?.issue_number || 6}</span>
          </div>
          <h2 className="editorial-page-title">İçindekiler &amp; Künye</h2>
          <div className="editorial-divider-line" />
          
          <ul className="editorial-toc-list">
            {(magazine?.toc?.length ? magazine.toc : [
              'Güneşin Gölgesinde Kalanlar',
              'Bir Yaz Öğledensonrası Notları',
              'Deniz Kenarında Bağımsız Edebiyat',
              'Mevsim Değişirken İç Dünyamız'
            ]).map((item, idx) => (
              <li key={idx} className="editorial-toc-item">
                <span className="toc-number">0{idx + 1}</span>
                <span className="toc-title">{item}</span>
                <span className="toc-dots" />
                <span className="toc-dest-page">{idx * 2 + 3}</span>
              </li>
            ))}
          </ul>

          <div className="editorial-colophon">
            <h4>YAYIN KÜNYESİ</h4>
            <p><strong>Genel Yayın Yönetmeni:</strong> Çilek Kolektif</p>
            <p><strong>Tasarım &amp; Görsel Dil:</strong> Çilek Art Studio</p>
            <p><strong>Yayın Türü:</strong> Bağımsız Dijital Dergi</p>
          </div>
          <div className="book-page-footer-num">Sayfa 2</div>
        </div>
      )
    }

    if (pageNum === 3) {
      // EDİTÖRÜN NOTU
      return (
        <div className="editorial-page-content">
          <div className="page-header-line">
            <span className="page-header-tag">GİRİŞ</span>
            <span className="page-header-issue">EDİTÖRÜN SESİ</span>
          </div>
          <h2 className="editorial-page-title">Bir Başlangıç Cümlesi</h2>
          <div className="editorial-divider-line" />

          <p className="editorial-lead-para">
            "Kendi sesini bulmak, belki de hayatın en sessiz ve en cesur yolculuğudur. Sayfaları çevirdiğin bu alan tam da bunun için var."
          </p>

          <p className="editorial-body-para">
            {magazine?.description || 'Çilek Dergisi, hiçbir kalıba sığmak zorunda hissetmeyen, kendi ritminde yazıp çizen insanların ortak sığınağıdır. Burada her cümle bir yankı, her renk bir ifade biçimidir.'}
          </p>

          <blockquote className="editorial-quote-card">
            <span className="quote-mark">“</span>
            <p>Hiçbir hikâye yarım kalmaz; sadece doğru okuyucusunun sayfayı çevirmesini bekler.</p>
          </blockquote>

          <div className="editorial-signature">
            <span>Sevgilerle,</span>
            <strong>Çilek Dergisi Yazı İşleri</strong>
          </div>
          <div className="book-page-footer-num">Sayfa 3</div>
        </div>
      )
    }

    // DİĞER SAYFALAR: EDİTORYAL MAKALE VE GÖRSEL MİZANPAJ
    return (
      <div className="editorial-page-content article-page">
        <div className="page-header-line">
          <span className="page-header-tag">BÖLÜM 0{pageNum - 3}</span>
          <span className="page-header-issue">PERSPEKTİFLER</span>
        </div>
        <h2 className="editorial-page-title">
          {magazine?.toc?.[pageNum - 4] || `Özgür Düşünceler & Yeni Sesler — ${pageNum}. Sayfa`}
        </h2>
        <div className="editorial-divider-line" />

        <div className="editorial-two-column-text">
          <p>
            Kelimeler bazen bir kentin sokaklarında yankılanır, bazen de bir odanın sessizliğinde kaybolur. Bu sayıda, bizi biz yapan detayları, küçük ama derin izleri konuştuk.
          </p>
          <p>
            Her okuma deneyimi kişiseldir; altını çizdiğin bir satır veya bu sayfaya bırakacağın bir yorum, seninle aynı sayfayı açan başka birine fısıltı gibi ulaşabilir.
          </p>
        </div>

        <div className="editorial-mini-illustration">
          <img src="/icons/cilek-vintage.png" alt="Çilek Detay" className="page-inline-strawberry" />
          <span>Sayfa {pageNum} • Çilek Dergisi Bağımsız Arşiv</span>
        </div>
        <div className="book-page-footer-num">Sayfa {pageNum}</div>
      </div>
    )
  }

  return (
    <div className={`magazine-reader-root ${isFullscreen ? 'is-fullscreen' : ''}`} ref={readerStageRef}>
      
      {/* 1. ÜST ARAÇ ÇUBUĞU (TOOLBAR) */}
      <header className="reader-top-bar">
        <div className="reader-top-left">
          <button
            type="button"
            className="btn-reader-back"
            onClick={() => navigate(-1)}
            title="Geri Dön"
          >
            ← Siteye Dön
          </button>
          <div className="reader-title-group">
            <h1 className="reader-magazine-title">{magazine?.title || 'Çilek Dergisi'}</h1>
            {magazine?.issue_number && (
              <span className="reader-issue-pill">Sayı #{magazine.issue_number}</span>
            )}
          </div>
        </div>

        <div className="reader-top-right">
          {/* Sayfa Görünüm Modu Seçimi (Tekli / İkili) */}
          {!isMobile && (
            <div className="reader-mode-toggle" title="Sayfa Görünümü">
              <button
                type="button"
                className={`btn-mode-choice ${pageMode === 'single' ? 'active' : ''}`}
                onClick={() => handleModeChange('single')}
                title="Tekli Sayfa Görünümü"
                id="btn-mode-single"
              >
                <span className="mode-icon">📄</span>
                <span className="mode-text">Tekli Sayfa</span>
              </button>
              <button
                type="button"
                className={`btn-mode-choice ${pageMode === 'dual' ? 'active' : ''}`}
                onClick={() => handleModeChange('dual')}
                title="İkili Sayfa (Kitap) Görünümü"
                id="btn-mode-dual"
              >
                <span className="mode-icon">📖</span>
                <span className="mode-text">İkili Sayfa</span>
              </button>
            </div>
          )}

          {/* Zoom kontrolleri */}
          <div className="reader-zoom-group">
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
              onClick={() => setZoomLevel(z => Math.min(1.35, z + 0.1))}
              title="Yakınlaştır"
            >
              ＋
            </button>
          </div>

          {/* Tam Ekran */}
          <button
            type="button"
            className="btn-reader-tool"
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
              className="btn-reader-pdf"
              title="PDF Olarak İndir"
            >
              ⬇ PDF
            </a>
          )}

          {/* Sayfa Yorumları Butonu */}
          <button
            type="button"
            className={`btn-reader-comments ${isCommentsOpen ? 'active' : ''}`}
            onClick={() => setIsCommentsOpen(v => !v)}
            id="btn-toggle-comments"
          >
            <span className="comments-icon">💬</span>
            <span className="comments-label">
              {activePages.length > 1
                ? `Sayfa ${activePages.join('-')} Yorumları`
                : `Sayfa ${activePages[0]} Yorumları`}
            </span>
            {commentsCount > 0 && (
              <span className="comments-badge">{commentsCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* 2. ANA OKUMA ALANI (3D FLIPBOOK STAGE) */}
      <main className="reader-stage-container">
        
        {/* Sol Sayfa Çevirme Butonu */}
        <button
          type="button"
          className={`btn-flip-arrow btn-flip-prev ${currentPage <= 1 ? 'disabled' : ''}`}
          onClick={goToPrevPage}
          disabled={currentPage <= 1}
          aria-label="Önceki Sayfayı Çevir"
        >
          ‹
        </button>

        {/* Kitap Görünümü (Book Spread) */}
        <div
          className="book-viewport"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {loadingPdf ? (
            <div className="reader-pdf-loading-box">
              <div className="reader-spinner" />
              <h3>Dergi Sayfaları Hazırlanıyor…</h3>
              <div className="pdf-progress-bar">
                <div className="pdf-progress-fill" style={{ width: `${pdfProgress}%` }} />
              </div>
              <p>Yüksek çözünürlüklü sayfalar taranıyor ({pdfProgress}%)</p>
            </div>
          ) : (
            <div
              className={`book-spread ${isFlipping ? `flipping-${flipDirection}` : ''} ${
                activePages.length === 1 ? 'single-page-mode' : 'dual-page-mode'
              }`}
            >
              {/* Ortadaki Gerçekçi Cilt / Dikiş Gölgesi */}
              {activePages.length > 1 && <div className="book-spine-crease" aria-hidden="true" />}

              {/* SOL SAYFA */}
              {activePages.length > 1 ? (
                <>
                  <div
                    className="book-page book-page-left"
                    onClick={() => goToPrevPage()}
                    title="Önceki sayfaya dönmek için tıklayın"
                  >
                    <div className="page-inner-shadow-left" />
                    {renderSinglePageContent(activePages[0])}
                  </div>

                  {/* SAĞ SAYFA */}
                  <div
                    className="book-page book-page-right"
                    onClick={() => goToNextPage()}
                    title="Sonraki sayfaya geçmek için tıklayın"
                  >
                    <div className="page-inner-shadow-right" />
                    {renderSinglePageContent(activePages[1])}
                  </div>
                </>
              ) : (
                /* TEK SAYFA (Varsayılan Okuma Modu) */
                <div
                  className="book-page book-page-single"
                  onClick={handleSinglePageClick}
                  title="Sonraki sayfaya geçmek için sağ tarafa, önceki sayfaya dönmek için sol tarafa tıklayın"
                >
                  <div className="page-single-shadow" />
                  {renderSinglePageContent(activePages[0])}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sağ Sayfa Çevirme Butonu */}
        <button
          type="button"
          className={`btn-flip-arrow btn-flip-next ${currentPage >= totalPages ? 'disabled' : ''}`}
          onClick={goToNextPage}
          disabled={currentPage >= totalPages}
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
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
          >
            ← Önceki Sayfa
          </button>

          {/* Sayfa İlerleme Çubuğu */}
          <div className="reader-slider-wrap">
            <input
              type="range"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => setCurrentPage(parseInt(e.target.value, 10))}
              className="reader-page-slider"
            />
            <span className="reader-page-counter">
              {activePages.length > 1
                ? `Sayfa ${activePages[0]} - ${activePages[1]} / ${totalPages}`
                : `Sayfa ${activePages[0]} / ${totalPages}`}
            </span>
          </div>

          <button
            type="button"
            className="btn-nav-step"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
          >
            Sonraki Sayfa →
          </button>
        </div>

        <div className="reader-keyboard-hint">
          <span>İpucu: Klavyenizdeki <strong>←</strong> ve <strong>→</strong> ok tuşlarıyla sayfaları çevirebilirsiniz.</span>
        </div>
      </footer>

      {/* 4. SAYFA BAZLI YORUMLAR ÇEKMECESİ (DRAWER) */}
      <PageCommentsDrawer
        magazineId={magazine?.id}
        activePages={activePages}
        user={user}
        isAdmin={isAdmin}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        onCommentCountChange={setCommentsCount}
      />

    </div>
  )
}
