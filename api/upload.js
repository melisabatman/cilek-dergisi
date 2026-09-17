import { PutObjectCommand } from '@aws-sdk/client-s3'
import { Readable } from 'node:stream'
import { client } from '../r2.js'

/**
 * Node.js (req, res) formatında gelen yükleme isteklerini işler.
 * Vite dev sunucusu ve Vercel Serverless Function ile tam uyumludur.
 */
export async function handleUploadRequest(req, res) {
  // CORS Başlıkları
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  // Durum kontrolü (GET)
  if (req.method === 'GET') {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        status: 'ok',
        configured: Boolean(
          process.env.R2_ACCESS_KEY_ID &&
          process.env.R2_SECRET_ACCESS_KEY &&
          process.env.R2_BUCKET_NAME
        ),
      })
    )
    return
  }

  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Yalnızca POST istekleri kabul edilir.' }))
    return
  }

  try {
    // Node akışını standart Web Request ve FormData'ya dönüştür
    let formData
    if (typeof req.formData === 'function') {
      formData = await req.formData()
    } else {
      const url = `http://${req.headers.host || 'localhost'}${req.url || '/api/upload'}`
      const webReq = new Request(url, {
        method: req.method,
        headers: req.headers,
        body: Readable.toWeb(req),
        duplex: 'half',
      })
      formData = await webReq.formData()
    }

    const file = formData.get('file')
    const folder = (formData.get('folder') || 'covers').toString()
    const prefix = (formData.get('prefix') || 'asset').toString()

    if (!file || typeof file === 'string') {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Yüklenecek dosya bulunamadı.' }))
      return
    }

    const bucketName = (process.env.R2_BUCKET_NAME || '').trim()
    const publicUrlBase = (process.env.R2_PUBLIC_URL || '').trim().replace(/\/+$/, '')

    if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !bucketName) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error:
            'Sunucu tarafında Cloudflare R2 yapılandırması eksik. Lütfen .env dosyanızda R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY ve R2_BUCKET_NAME değişkenlerini tanımlayın.',
        })
      )
      return
    }

    // Dosya adını temizle ve benzersiz bir anahtar oluştur
    const originalName = file.name || 'file'
    const cleanFileName = originalName
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '_')
      .replace(/_+/g, '_')

    const timestamp = Date.now()
    const objectKey = `${folder}/${prefix}_${timestamp}_${cleanFileName}`

    // Dosyayı ikili veri olarak al
    const arrayBuffer = await file.arrayBuffer()
    const fileBytes = Buffer.from(arrayBuffer)

    // İçerik tipini (Content-Type) belirle
    let contentType = file.type
    if (!contentType) {
      const lower = cleanFileName.toLowerCase()
      if (lower.endsWith('.pdf')) contentType = 'application/pdf'
      else if (lower.endsWith('.png')) contentType = 'image/png'
      else if (lower.endsWith('.webp')) contentType = 'image/webp'
      else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) contentType = 'image/jpeg'
      else contentType = 'application/octet-stream'
    }

    // S3Client / R2'ye yükle (forcePathStyle: true)
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: fileBytes,
        ContentType: contentType,
      })
    )

    // Genel erişim (Public URL) oluştur
    const publicUrl = publicUrlBase
      ? `${publicUrlBase}/${objectKey}`
      : `${process.env.R2_ENDPOINT || ''}/${bucketName}/${objectKey}`

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ publicUrl, key: objectKey }))
  } catch (err) {
    console.error('[API /api/upload Error]:', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: err.message || 'Dosya yükleme sırasında sunucu hatası oluştu.' }))
  }
}

// Vercel Serverless Function için varsayılan export
export default async function handler(req, res) {
  return handleUploadRequest(req, res)
}

// Vercel Node.js streaming bodyParser ayarı
export const config = {
  api: {
    bodyParser: false,
  },
}
