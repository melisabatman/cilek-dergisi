/**
 * Sunucu tarafı kimlik doğrulama + admin yetkilendirme yardımcısı.
 * İstemciden gelen Supabase access token'ı Supabase Auth ile doğrulanır;
 * ardından e-posta, admin listesi / `admins` tablosu ile eşleştirilir.
 * (Dosya adı `_` ile başladığı için Vercel bunu ayrı bir API rotası saymaz.)
 */

const DEFAULT_SUPABASE_URL = 'https://itfgfbghcuvoyplqvbor.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0ZmdmYmdoY3V2b3lwbHF2Ym9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NTE1ODMsImV4cCI6MjEwNTAyNzU4M30.zj-8E0D8A1VpE7KUNx3aa-XIx2ka_E3u0klV8nQsdiU'

// src/lib/supabase.js içindeki DEFAULT_ADMIN_EMAILS ile aynı tutulmalıdır.
const DEFAULT_ADMIN_EMAILS = ['irselinas@gmail.com', 'burcaksirin367@gmail.com']

function supabaseConfig() {
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL)
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/rest\/v1$/, '')
    .replace(/\/auth\/v1$/, '')
  const anonKey = (
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY
  ).trim()
  return { url, anonKey }
}

function adminEmailList() {
  const raw = `${process.env.ADMIN_EMAILS || ''},${process.env.VITE_ADMIN_EMAIL || ''}`
  const fromEnv = raw.split(/[,;]/).map((e) => e.trim().toLowerCase()).filter(Boolean)
  return [...new Set([...DEFAULT_ADMIN_EMAILS, ...fromEnv])]
}

/**
 * @returns {Promise<{ ok: true, user: { id: string, email: string } } | { ok: false, status: number, error: string }>}
 */
export async function requireAdmin(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || ''
  const match = /^Bearer\s+(.+)$/i.exec(Array.isArray(header) ? header[0] : header)
  if (!match) {
    return { ok: false, status: 401, error: 'Oturum bulunamadı. Lütfen yeniden giriş yapın.' }
  }
  const token = match[1].trim()
  const { url, anonKey } = supabaseConfig()

  let user
  try {
    const res = await fetch(`${url}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
    })
    if (!res.ok) {
      return { ok: false, status: 401, error: 'Oturumunuzun süresi dolmuş. Lütfen yeniden giriş yapın.' }
    }
    user = await res.json()
  } catch {
    return { ok: false, status: 503, error: 'Kimlik doğrulama servisine ulaşılamadı. Lütfen tekrar deneyin.' }
  }

  const email = (user?.email || '').trim().toLowerCase()
  if (!user?.id || !email) {
    return { ok: false, status: 401, error: 'Geçersiz oturum.' }
  }

  let isAdmin = adminEmailList().includes(email)

  if (!isAdmin) {
    try {
      const q = new URLSearchParams({ select: 'email', email: `ilike.${email}`, limit: '1' })
      const res = await fetch(`${url}/rest/v1/admins?${q}`, {
        headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
      })
      if (res.ok) {
        const rows = await res.json()
        isAdmin = Array.isArray(rows) && rows.length > 0
      }
    } catch {
      /* admins sorgusu başarısızsa yetki verilmez */
    }
  }

  if (!isAdmin) {
    return { ok: false, status: 403, error: 'Bu işlem için yönetici yetkisi gerekiyor.' }
  }
  return { ok: true, user: { id: user.id, email } }
}
