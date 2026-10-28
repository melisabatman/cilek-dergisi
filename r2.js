import { S3Client } from '@aws-sdk/client-s3'

/**
 * Endpoint URL'sini temizler (eğer sonuna kova ismi veya slash eklenmişse güvenle ayıklar).
 */
export function getEndpoint() {
  const raw = (process.env.R2_ENDPOINT || '').trim() || 'https://a5e80597e8412dbe8c4c576a2e5d5030.r2.cloudflarestorage.com'
  let clean = raw.replace(/\/+$/, '')
  const bucket = (process.env.R2_BUCKET_NAME || 'cilek-dergisi-files').trim()
  if (bucket && clean.endsWith(`/${bucket}`)) {
    clean = clean.slice(0, -(`/${bucket}`.length))
  }
  return clean
}

let _cachedClient = null

/**
 * Cloudflare R2 S3 Uyumlu İstemci oluşturucu (Sunucu Tarafı)
 * Ortam değişkenleri tanımlanmamış olsa bile güvenli fallback ile her koşulda çalışır.
 * forcePathStyle: true Cloudflare R2 ile tam uyumluluk sağlar.
 */
export function getR2Client() {
  if (!_cachedClient) {
    const accessKeyId = (process.env.R2_ACCESS_KEY_ID || '08b379dbc554917e88a870de3534a766').trim()
    const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || '1d88289d41d3e59fe81b5086a235d88343f5c1e25988b304f3ccec2edd566b70').trim()

    _cachedClient = new S3Client({
      region: 'auto',
      endpoint: getEndpoint(),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    })
  }
  return _cachedClient
}

/**
 * S3Client / R2 istemcisi
 */
export const client = new Proxy({}, {
  get(target, prop) {
    const instance = getR2Client()
    const val = instance[prop]
    return typeof val === 'function' ? val.bind(instance) : val
  }
})
