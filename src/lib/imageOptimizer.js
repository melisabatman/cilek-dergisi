/**
 * Çilek Dergisi — A4 Görsel Optimizasyon ve Boyutlandırma Yardımcısı
 * 
 * Amaç:
 * 1. Dergi kapaklarını standart ISO 216 A4 oranına (210 × 297 mm ≈ 1 : 1.414285) dönüştürmek.
 * 2. Yüklenen yüksek boyutlu (10-25 MB) baskı dosyalarını web için kristal netliğinde
 *    optimize ederek (1485 × 2100 px, ~300-600 KB) sunucu ve Cloudflare R2 yükleme
 *    hatalarını ("Payload Too Large", 413, zaman aşımı) %100 önlemek.
 */

// Standart ISO 216 A4 En-Boy Oranı (Genişlik / Yükseklik)
export const A4_RATIO = 210 / 297 // ≈ 0.7070707

// Web için yüksek çözünürlüklü A4 piksel ölçüleri (180 DPI kalitesi)
export const TARGET_A4_WIDTH = 1485
export const TARGET_A4_HEIGHT = 2100

/**
 * Dosya boyutunu insan tarafından okunabilir formata dönüştürür (KB / MB).
 * @param {number} bytes 
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Bir görsel dosyasının veya URL'sinin doğal piksel ölçülerini ve A4 uyumunu analiz eder.
 * @param {File | string} source 
 * @returns {Promise<{
 *   width: number,
 *   height: number,
 *   aspectRatio: number,
 *   isA4Match: boolean,
 *   ratioDiffPercent: number,
 *   sizeBytes: number,
 *   formattedSize: string
 * }>}
 */
export async function analyzeImageDimensions(source) {
  return new Promise((resolve, reject) => {
    const isFile = source instanceof File
    const sizeBytes = isFile ? source.size : 0
    const url = isFile ? URL.createObjectURL(source) : source

    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const width = img.naturalWidth || img.width
      const height = img.naturalHeight || img.height
      const aspectRatio = width / height

      // A4 oranından sapma yüzdesi
      const diffPercent = Math.abs(aspectRatio - A4_RATIO) / A4_RATIO * 100
      // %4'ten az fark varsa birebir A4 kabul edilir
      const isA4Match = diffPercent < 4.0

      if (isFile) URL.revokeObjectURL(url)

      resolve({
        width,
        height,
        aspectRatio,
        isA4Match,
        ratioDiffPercent: Math.round(diffPercent * 10) / 10,
        sizeBytes,
        formattedSize: formatBytes(sizeBytes)
      })
    }

    img.onerror = (err) => {
      if (isFile) URL.revokeObjectURL(url)
      reject(new Error('Görsel ölçüleri analiz edilemedi.'))
    }

    img.src = url
  })
}

/**
 * Görseli standart yüksek çözünürlüklü A4 formatına (1485 × 2100 px) optimize eder.
 * Dosya boyutunu küçültürken tipografi ve renkleri kristal netliğinde korur.
 * 
 * @param {File} file - Yüklenen orijinal görsel dosyası
 * @param {Object} options
 * @param {'cover' | 'contain'} [options.fitMode='cover'] - 'cover' (tam doldur/kenarlardan hafif kırp) veya 'contain' (boşlukları zarifçe doldur)
 * @param {number} [options.quality=0.92] - WebP / JPEG sıkıştırma kalitesi
 * @param {string} [options.outputFormat='image/webp'] - Çıktı formatı ('image/webp' veya 'image/jpeg')
 * @returns {Promise<{
 *   file: File,
 *   previewUrl: string,
 *   originalSize: string,
 *   optimizedSize: string,
 *   width: number,
 *   height: number
 * }>}
 */
export async function optimizeCoverToA4(file, options = {}) {
  const {
    fitMode = 'cover',
    quality = 0.92,
    outputFormat = 'image/webp',
    targetWidth = TARGET_A4_WIDTH,
    targetHeight = TARGET_A4_HEIGHT,
  } = options

  if (!file) throw new Error('Optimize edilecek görsel dosyası bulunamadı.')

  const objectUrl = URL.createObjectURL(file)

  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image()
      el.crossOrigin = 'anonymous'
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Görsel taranırken hata oluştu.'))
      el.src = objectUrl
    })

    const srcW = img.naturalWidth || img.width
    const srcH = img.naturalHeight || img.height

    // Canvas oluştur
    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext('2d')

    if (!ctx) throw new Error('Canvas render bağlamı alınamadı.')

    // Yüksek kaliteli görüntü yumuşatma algoritmaları
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Temiz arka plan (krem/bej dergi tonu)
    ctx.fillStyle = '#FAF7F5'
    ctx.fillRect(0, 0, targetWidth, targetHeight)

    if (fitMode === 'contain') {
      // Arka plana hafif şık bir bulanıklık vererek boşlukları zarifçe doldur
      ctx.save()
      ctx.filter = 'blur(28px) brightness(0.92)'
      ctx.drawImage(img, -20, -20, targetWidth + 40, targetHeight + 40)
      ctx.restore()

      // İçeriği orijinal oranını koruyarak A4 içine yerleştir
      const scale = Math.min(targetWidth / srcW, targetHeight / srcH)
      const renderW = Math.round(srcW * scale)
      const renderH = Math.round(srcH * scale)
      const offsetX = Math.round((targetWidth - renderW) / 2)
      const offsetY = Math.round((targetHeight - renderH) / 2)

      ctx.drawImage(img, offsetX, offsetY, renderW, renderH)
    } else {
      // 'cover' modu: A4 alanını tam doldurur, merkezden ölçeklendirir
      const srcAspect = srcW / srcH
      const targetAspect = targetWidth / targetHeight

      let drawW, drawH, drawX, drawY

      if (srcAspect > targetAspect) {
        // Kaynak görsel daha geniş: yükseklik tam uyar, yanlardan merkezlenir
        drawH = targetHeight
        drawW = Math.round(targetHeight * srcAspect)
        drawX = Math.round((targetWidth - drawW) / 2)
        drawY = 0
      } else {
        // Kaynak görsel daha uzun veya eşit: genişlik tam uyar, yukarı/aşağıdan merkezlenir
        drawW = targetWidth
        drawH = Math.round(targetWidth / srcAspect)
        drawX = 0
        drawY = Math.round((targetHeight - drawH) / 2)
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH)
    }

    // Blob çıktısı oluştur
    const blob = await new Promise((resolve) => {
      canvas.toBlob(
        (b) => resolve(b),
        outputFormat,
        quality
      )
    })

    if (!blob) throw new Error('Görsel sıkıştırılamadı.')

    // Dosya adını sanitize et
    const ext = outputFormat === 'image/webp' ? '.webp' : '.jpg'
    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
    const optimizedFileName = `${baseName}_a4${ext}`

    const optimizedFile = new File([blob], optimizedFileName, {
      type: outputFormat,
      lastModified: Date.now(),
    })

    const previewUrl = URL.createObjectURL(blob)

    return {
      file: optimizedFile,
      previewUrl,
      originalSize: formatBytes(file.size),
      optimizedSize: formatBytes(optimizedFile.size),
      width: targetWidth,
      height: targetHeight,
      ratio: A4_RATIO,
    }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
