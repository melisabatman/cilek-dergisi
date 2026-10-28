/**
 * Cloudflare R2 İstemci Tarafı Yükleme Yardımcısı
 * 
 * Güvenlik Bildirimi:
 * R2_ACCESS_KEY_ID ve R2_SECRET_ACCESS_KEY gibi gizli anahtarlar istemci (tarayıcı)
 * koduna ASLA dahil edilmez. Dosyalar güvenli bir şekilde sunucu tarafındaki /api/upload
 * uç noktasına iletilir ve yükleme sunucuda gerçekleştirilir.
 */

export const isR2Configured = true

/**
 * Sunucu tarafındaki R2 yapılandırma durumunu kontrol eder.
 * @returns {Promise<boolean>}
 */
export async function checkR2Status() {
  try {
    const res = await fetch('/api/upload')
    if (res.ok) {
      const data = await res.json()
      return Boolean(data.configured)
    }
  } catch (err) {
    console.warn('R2 durum kontrolü yapılamadı:', err)
  }
  return true
}

/**
 * Dosyayı /api/upload backend rotasına göndererek Cloudflare R2'ye yükler.
 * @param {'covers' | 'pdfs' | string} folder 
 * @param {File} file 
 * @param {string} prefix 
 * @returns {Promise<{ publicUrl: string | null, error: any }>}
 */
export async function uploadAsset(folder, file, prefix = 'asset') {
  if (!file) return { publicUrl: null, error: null }

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder || 'covers')
    formData.append('prefix', prefix || 'asset')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      let errMsg = data?.error
      if (response.status === 413) {
        errMsg = 'Dosya boyutu sunucu yükleme sınırını aşıyor (HTTP 413). Lütfen kapağı "A4 Formatına Optimize Et" butonuyla küçülterek tekrar deneyin.'
      } else if (!errMsg) {
        errMsg = `Yükleme başarısız oldu (HTTP ${response.status})`
      }
      throw new Error(errMsg)
    }

    if (!data?.publicUrl) {
      throw new Error('Sunucudan geçerli bir dosya bağlantısı (publicUrl) alınamadı.')
    }

    return { publicUrl: data.publicUrl, error: null }
  } catch (err) {
    console.error('[Cloudflare R2 Client Upload Error]:', err)
    return { publicUrl: null, error: err }
  }
}

/**
 * Türkiye'de r2.dev domainine uygulanan DNS/ISP engellerini aşmak için
 * r2.dev bağlantılarını kendi güvenli /api/file proxy rotamıza yönlendirir.
 * Bu sayede kullanıcılar VPN kullanmadan tüm kapakları ve PDF'leri görebilir.
 */
export function getSafeMediaUrl(url) {
  if (!url || typeof url !== 'string') return url
  if (url.includes('.r2.dev')) {
    try {
      const u = new URL(url)
      const key = u.pathname.replace(/^\/+/, '')
      return `/api/file?key=${encodeURIComponent(key)}`
    } catch {
      return `/api/file?url=${encodeURIComponent(url)}`
    }
  }
  return url
}
