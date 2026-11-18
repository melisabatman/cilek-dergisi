import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomBytes } from 'node:crypto'
import { client } from '../r2.js'
import { requireAdmin } from './_lib/auth.js'

/**
 * Direct-to-R2 yükleme için kısa ömürlü presigned PUT URL üretir.
 * Dosyanın kendisi bu sunucudan GEÇMEZ; yalnızca küçük bir JSON isteği/yanıtı taşınır.
 *
 * İstek (POST, JSON, Authorization: Bearer <supabase access token>):
 *   { kind: 'pdf' | 'image', filename, contentType, size, prefix }
 */

const MB = 1024 * 1024
const PRESIGN_EXPIRES_SECONDS = 600 // 10 dk

const PDF_MAX_BYTES = (Number(process.env.PDF_MAX_MB) || 200) * MB
const IMAGE_MAX_BYTES = (Number(process.env.IMAGE_MAX_MB) || 15) * MB

const KINDS = {
  pdf: {
    folder: 'pdfs',
    maxBytes: PDF_MAX_BYTES,
    types: { 'application/pdf': ['pdf'] },
    label: 'PDF',
  },
  image: {
    folder: 'covers',
    maxBytes: IMAGE_MAX_BYTES,
    types: {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/webp': ['webp'],
    },
    label: 'görsel',
  },
}

function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string' && req.body) return JSON.parse(req.body)
  const chunks = []
  let total = 0
  for await (const chunk of req) {
    total += chunk.length
    if (total > 16 * 1024) throw new Error('İstek gövdesi çok büyük.')
    chunks.push(chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

/** Yalnızca [a-z0-9_] — yol gezinmesi (../, /) imkânsız. */
function safeSegment(value, fallback, maxLen = 48) {
  const s = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, maxLen)
  return s || fallback
}

export async function handlePresignRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }
  if (req.method !== 'POST') {
    return send(res, 405, { error: 'Yalnızca POST istekleri kabul edilir.' })
  }

  // 1) Kimlik doğrulama + admin yetkisi
  const auth = await requireAdmin(req)
  if (!auth.ok) return send(res, auth.status, { error: auth.error })

  // 2) Girdi doğrulama
  let body
  try {
    body = await readJson(req)
  } catch {
    return send(res, 400, { error: 'Geçersiz istek gövdesi.' })
  }

  const spec = KINDS[body.kind]
  if (!spec) return send(res, 400, { error: 'Geçersiz dosya türü (kind).' })

  const size = Number(body.size)
  if (!Number.isFinite(size) || size <= 0) {
    return send(res, 400, { error: 'Dosya boyutu geçersiz veya dosya boş.' })
  }
  if (size > spec.maxBytes) {
    return send(res, 413, {
      error: `${spec.label} dosyası en fazla ${Math.round(spec.maxBytes / MB)} MB olabilir (seçilen: ${(size / MB).toFixed(1)} MB).`,
    })
  }

  const contentType = String(body.contentType || '').toLowerCase().split(';')[0].trim()
  const allowedExts = spec.types[contentType]
  if (!allowedExts) {
    return send(res, 415, {
      error: `Desteklenmeyen dosya türü. İzin verilenler: ${Object.keys(spec.types).join(', ')}`,
    })
  }

  const filename = String(body.filename || '').toLowerCase()
  const ext = filename.includes('.') ? filename.split('.').pop() : ''
  if (!allowedExts.includes(ext)) {
    return send(res, 415, { error: `Dosya uzantısı ${allowedExts.map((e) => '.' + e).join(' / ')} olmalıdır.` })
  }

  // 3) Anahtar (yol) sunucuda üretilir — istemci klasör/yol belirleyemez
  const bucket = (process.env.R2_BUCKET_NAME || 'cilek-dergisi-files').trim()
  const prefix = safeSegment(body.prefix, 'asset')
  const base = safeSegment(filename.replace(/\.[^.]+$/, ''), 'file', 60)
  const key = `${spec.folder}/${prefix}_${Date.now()}_${randomBytes(4).toString('hex')}_${base}.${ext === 'jpeg' ? 'jpg' : ext}`

  try {
    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
        ContentLength: size, // imzaya dahil: farklı boyutta gövde R2 tarafından reddedilir
      }),
      { expiresIn: PRESIGN_EXPIRES_SECONDS, signableHeaders: new Set(['content-type']) }
    )

    const publicBase = (
      process.env.R2_PUBLIC_URL || 'https://pub-f78a1a3cdd5a4aefae2d5638cdb54f87.r2.dev'
    ).trim().replace(/\/+$/, '')
    const publicUrl = `${publicBase}/${key}`

    return send(res, 200, {
      uploadUrl,
      key,
      publicUrl,
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      expiresIn: PRESIGN_EXPIRES_SECONDS,
    })
  } catch (err) {
    console.error('[api/presign error]:', err)
    return send(res, 500, { error: 'Yükleme bağlantısı oluşturulamadı. R2 yapılandırmasını kontrol edin.' })
  }
}

export default async function handler(req, res) {
  return handlePresignRequest(req, res)
}
