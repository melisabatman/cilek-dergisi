import { S3Client } from '@aws-sdk/client-s3'

/**
 * Endpoint URL'sini temizler (eğer sonuna kova ismi veya slash eklenmişse güvenle ayıklar).
 */
export function getEndpoint() {
  const raw = (process.env.R2_ENDPOINT || '').trim()
  if (!raw) {
    const accountId = (process.env.R2_ACCOUNT_ID || '').trim()
    return accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined
  }
  let clean = raw.replace(/\/+$/, '')
  const bucket = (process.env.R2_BUCKET_NAME || '').trim()
  if (bucket && clean.endsWith(`/${bucket}`)) {
    clean = clean.slice(0, -(`/${bucket}`.length))
  }
  return clean
}

let _cachedClient = null

/**
 * Cloudflare R2 S3 Uyumlu İstemci oluşturucu (Sunucu Tarafı)
 * forcePathStyle: true Cloudflare R2 ile tam uyumluluk sağlar.
 */
export function getR2Client() {
  if (!_cachedClient) {
    _cachedClient = new S3Client({
      region: 'auto',
      endpoint: getEndpoint(),
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
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
