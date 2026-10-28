import { GetObjectCommand } from '@aws-sdk/client-s3'
import { client } from '../r2.js'

/**
 * Cloudflare R2 engelli domain (r2.dev) sorununu çözen güvenli medya proxy'si.
 * Türkiye'deki kullanıcıların VPN olmadan görsellere ve PDF'lere erişebilmesini sağlar.
 * Hem Vercel Serverless Function hem de Vite dev sunucusu ile tam uyumludur.
 */
export async function handleFileRequest(req, res) {
  // CORS Başlıkları
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range')
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Type')

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  try {
    const parsedUrl = new URL(req.url, 'http://localhost')
    const fileKeyParam = parsedUrl.searchParams.get('key')
    const fullUrlParam = parsedUrl.searchParams.get('url')

    let fileKey = ''
    if (fileKeyParam) {
      fileKey = fileKeyParam
    } else if (fullUrlParam) {
      try {
        const u = new URL(fullUrlParam)
        fileKey = u.pathname.replace(/^\/+/, '')
      } catch {
        fileKey = fullUrlParam.replace(/^https?:\/\/[^/]+\//, '')
      }
    }

    if (!fileKey) {
      res.statusCode = 400
      res.end('Dosya anahtarı (key veya url) belirtilmedi.')
      return
    }

    const bucketName = process.env.R2_BUCKET_NAME || 'cilek-dergisi-files'

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Range: req.headers.range,
    })

    const s3Response = await client.send(command)

    // İçerik tipi
    const contentType = s3Response.ContentType || (
      fileKey.endsWith('.pdf') ? 'application/pdf' :
      fileKey.endsWith('.jpg') || fileKey.endsWith('.jpeg') ? 'image/jpeg' :
      fileKey.endsWith('.png') ? 'image/png' :
      fileKey.endsWith('.webp') ? 'image/webp' :
      fileKey.endsWith('.svg') ? 'image/svg+xml' : 'application/octet-stream'
    )

    res.statusCode = s3Response.ContentRange ? 206 : 200
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')

    if (s3Response.ContentLength) {
      res.setHeader('Content-Length', s3Response.ContentLength.toString())
    }
    if (s3Response.ContentRange) {
      res.setHeader('Content-Range', s3Response.ContentRange)
    }
    if (s3Response.AcceptRanges) {
      res.setHeader('Accept-Ranges', s3Response.AcceptRanges)
    }

    if (req.method === 'HEAD') {
      res.end()
      return
    }

    // Akışı istemciye aktar
    if (s3Response.Body) {
      if (typeof s3Response.Body.pipe === 'function' && typeof res.on === 'function') {
        s3Response.Body.pipe(res)
      } else if (typeof s3Response.Body.transformToByteArray === 'function') {
        const bytes = await s3Response.Body.transformToByteArray()
        const buf = Buffer.from(bytes)
        if (typeof res.send === 'function') {
          res.send(buf)
        } else {
          res.end(buf)
        }
      } else {
        res.end()
      }
    } else {
      res.end()
    }
  } catch (err) {
    console.error('[api/file proxy error]:', err)
    if (!res.headersSent) {
      res.statusCode = err.$metadata?.httpStatusCode || 500
      res.end('Dosya getirilemedi: ' + (err.message || 'Hata'))
    }
  }
}

// Vercel Serverless Function varsayılan dışa aktarımı
export default async function handler(req, res) {
  return handleFileRequest(req, res)
}

