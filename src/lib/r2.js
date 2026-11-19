/**
 * Cloudflare R2 İstemci Tarafı Yükleme Yardımcısı
 * 
 * Güvenlik Bildirimi:
 * R2_ACCESS_KEY_ID ve R2_SECRET_ACCESS_KEY gibi gizli anahtarlar istemci (tarayıcı)
 * koduna ASLA dahil edilmez. Dosyalar güvenli bir şekilde sunucu tarafındaki /api/upload
 * uç noktasına iletilir ve yükleme sunucuda gerçekleştirilir.
 */

// isR2Configured hem boolean hem de fonksiyon olarak güvenle kullanılabilir
export const isR2Configured = Object.assign(
  function () { return true },
  { valueOf: () => true, toString: () => 'true' }
)

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

export const PDF_MAX_BYTES = 200 * 1024 * 1024

/**
 * Kullanıcının Supabase oturum token'ını alır (circular import olmaması için lazy).
 */
async function getAccessToken() {
  const { supabase } = await import('./supabase')
  const { data } = await supabase.auth.getSession()
  return data?.session?.access_token || null
}

/**
 * Dosyayı Vercel'den GEÇİRMEDEN doğrudan Cloudflare R2'ye yükler.
 * 1) /api/presign ile (yalnızca admin) kısa ömürlü imzalı PUT URL alınır (küçük JSON).
 * 2) Dosya tarayıcıdan doğrudan R2'ye PUT edilir (XHR ile ilerleme bildirilir).
 *
 * @param {'pdf'|'image'} kind
 * @param {File} file
 * @param {{ prefix?: string, onProgress?: (pct:number, loaded:number, total:number)=>void, signal?: AbortSignal }} opts
 * @returns {Promise<{ publicUrl: string | null, key?: string, error: Error | null }>}
 */
export async function uploadDirectToR2(kind, file, opts = {}) {
  const { prefix = 'asset', onProgress, signal } = opts
  if (!file) return { publicUrl: null, error: null }

  try {
    // İstemci tarafı ön kontroller (anlaşılır hata için; asıl denetim sunucudadır)
    if (kind === 'pdf') {
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
      if (!isPdf) throw new Error('Yalnızca PDF dosyası yükleyebilirsiniz.')
      if (file.size > PDF_MAX_BYTES) {
        throw new Error(`PDF en fazla ${Math.round(PDF_MAX_BYTES / 1024 / 1024)} MB olabilir (seçilen: ${(file.size / 1024 / 1024).toFixed(1)} MB).`)
      }
    }
    if (file.size === 0) throw new Error('Seçilen dosya boş.')

    const token = await getAccessToken()
    if (!token) throw new Error('Oturum bulunamadı. Lütfen çıkış yapıp tekrar giriş yapın.')

    // 1) Presigned URL iste
    let presignRes
    try {
      presignRes = await fetch('/api/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          kind,
          filename: file.name,
          contentType: file.type || (kind === 'pdf' ? 'application/pdf' : ''),
          size: file.size,
          prefix,
        }),
        signal,
      })
    } catch (e) {
      if (e?.name === 'AbortError') throw e
      throw new Error('Yükleme sunucusuna ulaşılamadı. İnternet bağlantınızı kontrol edin.')
    }
    const presign = await presignRes.json().catch(() => null)
    if (!presignRes.ok || !presign?.uploadUrl) {
      throw new Error(presign?.error || `Yükleme izni alınamadı (HTTP ${presignRes.status}).`)
    }

    // 2) Doğrudan R2'ye PUT (ilerleme göstergeli)
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', presign.uploadUrl)
      Object.entries(presign.headers || {}).forEach(([k, v]) => xhr.setRequestHeader(k, v))

      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable && onProgress) {
          onProgress(Math.min(99, Math.round((ev.loaded / ev.total) * 100)), ev.loaded, ev.total)
        }
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.(100, file.size, file.size)
          resolve()
        } else if (xhr.status === 403) {
          reject(new Error('R2 yüklemeyi reddetti (403). Bağlantının süresi dolmuş olabilir; lütfen tekrar deneyin.'))
        } else {
          reject(new Error(`R2 yükleme hatası (HTTP ${xhr.status}).`))
        }
      }
      xhr.onerror = () =>
        reject(new Error('Dosya R2\'ye gönderilemedi. İnternet bağlantınızı veya R2 CORS ayarlarını (bu site adresine PUT izni) kontrol edin.'))
      xhr.ontimeout = () => reject(new Error('Yükleme zaman aşımına uğradı.'))
      xhr.onabort = () => reject(new DOMException('Yükleme iptal edildi.', 'AbortError'))
      if (signal) {
        if (signal.aborted) return xhr.abort()
        signal.addEventListener('abort', () => xhr.abort(), { once: true })
      }
      xhr.send(file)
    })

    return { publicUrl: presign.publicUrl, key: presign.key, error: null }
  } catch (err) {
    console.error('[Cloudflare R2 Direct Upload Error]:', err)
    return { publicUrl: null, error: err }
  }
}

/**
 * Dosyayı yükler. PDF'ler doğrudan R2'ye (presigned URL), küçük görseller
 * mevcut /api/upload rotasına gider.
 * @param {'covers' | 'pdfs' | string} folder
 * @param {File} file
 * @param {string} prefix
 * @param {(pct:number)=>void} [onProgress]
 * @returns {Promise<{ publicUrl: string | null, error: any }>}
 */
export async function uploadAsset(folder, file, prefix = 'asset', onProgress) {
  if (!file) return { publicUrl: null, error: null }

  if (folder === 'pdfs') {
    return uploadDirectToR2('pdf', file, { prefix, onProgress })
  }

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
