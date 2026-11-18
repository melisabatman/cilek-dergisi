/**
 * R2 bucket CORS yapılandırması (direct-to-R2 yükleme için).
 *
 * Kullanım:
 *   node scripts/configure-r2-cors.mjs          # mevcut CORS'u gösterir, uygulanacak kuralı yazdırır (dry-run)
 *   node scripts/configure-r2-cors.mjs --apply  # kuralı uygular
 *
 * Ekstra origin: R2_CORS_ORIGINS="https://alanadim.com,https://www.alanadim.com"
 * Not: S3 API token'ı bucket CORS yazma iznine sahip değilse (Object Read & Write),
 * Cloudflare Dashboard > R2 > bucket > Settings > CORS Policy bölümüne aşağıdaki JSON'u yapıştırın.
 */
import { readFileSync, existsSync } from 'node:fs'
import { GetBucketCorsCommand, PutBucketCorsCommand } from '@aws-sdk/client-s3'

for (const f of ['.env', '.env.local']) {
  if (!existsSync(f)) continue
  for (const line of readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const { client } = await import('../r2.js')
const Bucket = (process.env.R2_BUCKET_NAME || 'cilek-dergisi-files').trim()

const origins = [
  'https://cilek-dergisi.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  ...(process.env.R2_CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
]

const rule = {
  AllowedOrigins: [...new Set(origins)],
  AllowedMethods: ['GET', 'HEAD', 'PUT'],
  AllowedHeaders: ['Content-Type', 'Content-Length', 'Content-MD5', 'x-amz-*'],
  ExposeHeaders: ['ETag', 'Content-Length', 'Content-Range', 'Accept-Ranges'],
  MaxAgeSeconds: 3600,
}

try {
  const cur = await client.send(new GetBucketCorsCommand({ Bucket }))
  console.log('Mevcut CORS:', JSON.stringify(cur.CORSRules, null, 2))
} catch (e) {
  console.log('Mevcut CORS okunamadı/yok:', e.name || e.message)
}

console.log('Uygulanacak kural:\n' + JSON.stringify([rule], null, 2))

if (process.argv.includes('--apply')) {
  try {
    await client.send(new PutBucketCorsCommand({ Bucket, CORSConfiguration: { CORSRules: [rule] } }))
    console.log('✓ CORS uygulandı.')
  } catch (e) {
    console.error('✕ CORS uygulanamadı:', e.name, e.message)
    console.error('→ Dashboard üzerinden yukarıdaki kuralı elle ekleyin.')
    process.exitCode = 1
  }
}
