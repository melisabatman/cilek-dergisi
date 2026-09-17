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

const rawUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || ''
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || ''

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
    'Canlı veritabanı için .env.local dosyasına VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY ekleyin. ' +
    'Şu anda editoryal fallback verileri gösteriliyor.'
  )
}

/**
 * Tek ve merkezi Supabase istemcisi.
 * Tüm veritabanı, Storage ve Auth işlemleri doğrudan bu istemci üzerinden yürütülür.
 * Manuel URL birleştirme veya REST fetch çağrısı yapılmaz.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-cilek.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
)

/**
 * Kullanıcının admin yetkisine sahip olup olmadığını doğrular:
 * 1. İlk olarak .env.local dosyasındaki VITE_ADMIN_EMAIL ile eşleşiyor mu bakar.
 * 2. Ardından veritabanındaki `admins` tablosunda kayıtlı mı sorgular.
 */
export async function checkIsAdmin(user) {
  if (!user || !user.email) return false

  const envAdminEmail = (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase()
  const userEmail = user.email.trim().toLowerCase()

  // 1. Çevresel değişken kontrolü
  if (envAdminEmail && userEmail === envAdminEmail) {
    return true
  }

  // 2. Supabase `admins` tablosu kontrolü
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
