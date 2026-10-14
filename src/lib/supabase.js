import { createClient } from '@supabase/supabase-js'

/**
 * Supabase URL'sini normalize eder.
 * Kullanıcı Dashboard'dan kopyalarken yanlışlıkla '/rest/v1/' veya sondaki slash'leri eklediyse
 * bu fonksiyon bunları otomatik temizleyerek URL çakışmalarını (örn: /rest/v1/auth/v1/signup 404 hatasını) önler.
 */
function normalizeSupabaseUrl(url) {
  if (!url) return ''
  let clean = url.trim()
  // Sondaki eğik çizgileri temizle
  clean = clean.replace(/\/+$/, '')
  // Eğer yanlışlıkla /rest/v1 eklenmişse kaldır
  clean = clean.replace(/\/rest\/v1\/?$/, '')
  // Eğer yanlışlıkla /auth/v1 eklenmişse kaldır
  clean = clean.replace(/\/auth\/v1\/?$/, '')
  return clean.replace(/\/+$/, '')
}

// Varsayılan aktif Supabase proje yapılandırması (ortam değişkeni okunamazsa dahi DNS hatasını önler)
const DEFAULT_SUPABASE_URL = 'https://itfgfbghcuvoyplqvbor.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0ZmdmYmdoY3V2b3lwbHF2Ym9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NTE1ODMsImV4cCI6MjEwNTAyNzU4M30.zj-8E0D8A1VpE7KUNx3aa-XIx2ka_E3u0klV8nQsdiU'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || DEFAULT_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY

const supabaseUrl = normalizeSupabaseUrl(rawUrl)
const supabaseAnonKey = (rawKey || '').trim()

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseUrl.includes('placeholder')
)

if (!isSupabaseConfigured) {
  console.info(
    '[Çilek Dergisi] Supabase yapılandırması bekleniyor. ' +
    'Canlı veritabanı için .env dosyasına VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY ekleyin.'
  )
}

/**
 * Tek ve merkezi Supabase istemcisi.
 * Tüm veritabanı, Storage ve Auth işlemleri doğrudan bu istemci üzerinden yürütülür.
 * Manuel URL birleştirme veya REST fetch çağrısı yapılmaz.
 */
export const supabase = createClient(
  supabaseUrl || DEFAULT_SUPABASE_URL,
  supabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
)

// Varsayılan sistem yöneticisi e-posta adresleri (her iki kurucu / yönetici)
export const DEFAULT_ADMIN_EMAILS = [
  'irselinas@gmail.com',
  'burcaksirin367@gmail.com'
]

/**
 * Kullanıcının admin yetkisine sahip olup olmadığını doğrular:
 * 1. Tanımlı varsayılan yönetici e-postaları veya .env'deki VITE_ADMIN_EMAIL listesi ile eşleşiyor mu bakar.
 * 2. Ardından veritabanındaki `admins` tablosunda kayıtlı mı sorgular.
 */
export async function checkIsAdmin(user) {
  if (!user || !user.email) return false

  const userEmail = user.email.trim().toLowerCase()

  // 1. Varsayılan e-posta listesi kontrolü
  if (DEFAULT_ADMIN_EMAILS.includes(userEmail)) {
    return true
  }

  // 2. Çevresel değişken (VITE_ADMIN_EMAIL) kontrolü (virgülle ayrılmış çoklu e-posta desteklenir)
  const envRaw = (import.meta.env.VITE_ADMIN_EMAIL || '').trim()
  if (envRaw) {
    const envEmails = envRaw.split(/[,;]/).map(e => e.trim().toLowerCase()).filter(Boolean)
    if (envEmails.includes(userEmail)) {
      return true
    }
  }

  // 3. Supabase `admins` tablosu kontrolü
  if (!isSupabaseConfigured) return false

  try {
    const { data, error } = await supabase
      .from('admins')
      .select('email')
      .ilike('email', userEmail)
      .maybeSingle()

    if (!error && data?.email) {
      return true
    }
  } catch (err) {
    console.warn('[checkIsAdmin] Admin kontrol hatası:', err)
  }

  return false
}

/**
 * Dosya yükleme yardımcısı (Cloudflare R2 S3 API'sini kullanır).
 * Kapak görseli ve PDF dosyaları artık doğrudan Cloudflare R2'ye yüklenir.
 */
export { uploadAsset, isR2Configured } from './r2'


/**
 * Supabase Auth hata mesajlarını Türkçe kullanıcı dostu metinlere dönüştürür.
 */
export function translateAuthError(errMsg) {
  if (!errMsg) return 'Bilinmeyen bir hata oluştu.'
  const msg = errMsg.toLowerCase()
  if (msg.includes('failed to fetch') || msg.includes('err_name_not_resolved') || msg.includes('networkerror') || msg.includes('network request failed')) {
    return 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.'
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'E-posta adresi veya şifre hatalı. Lütfen tekrar deneyin.'
  }
  if (msg.includes('user already registered') || msg.includes('already registered')) {
    return 'Bu e-posta adresiyle zaten kayıtlı bir hesap var. Giriş yapmayı deneyin.'
  }
  if (msg.includes('password should be at least')) {
    return 'Şifre en az 6 karakter uzunluğunda olmalıdır.'
  }
  if (msg.includes('rate limit')) {
    return 'Çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin.'
  }
  if (msg.includes('email not confirmed')) {
    return 'E-posta adresi henüz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin.'
  }
  return errMsg
}

