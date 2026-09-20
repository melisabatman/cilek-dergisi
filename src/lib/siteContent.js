import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

const STORAGE_KEY = 'cilek_site_content_v2'
const UPDATE_EVENT_NAME = 'cilek_site_content_updated'

export const DEFAULT_SITE_CONTENT = {
  letter: {
    badge: 'ÖZEL ÇİLEK MEKTUBU',
    title: 'THANK YOU SO MUCH!',
    subtitle: 'Çilek Ailesine Aramıza Hoş Geldin Sevgili {name} 🍓',
    lead_quote: '“Kendine ait bir oda, kendine ait bir ses...”',
    body_paragraph: "Çilek Dergisi'nin bağımsız sayfalarına katıldığın için içtenlikle teşekkür ederiz. 15-25 yaşın o dur durak bilmeyen yaratıcı enerjisini, özgür hayallerini ve taze bakış açılarını birlikte paylaşacağımız sıcacık bir topluluktasın.",
    perks_title: 'Aramıza Katılarak Neler Kazandın?',
    perks: [
      '📖 **Tüm Sayılara Sınırsız Erişim:** Sayfaları gerçek bir kitap gibi çevirip okuyabilirsin.',
      '💬 **Sayfa Notları & Yorumlar:** Beğendiğin sayfaların kenarına düşüncelerini iliştirebilirsin.',
      '✍️ **Yazı Gönderme Ayrıcalığı:** Kaleme aldığın yazı, şiir veya fotoğrafları bize göndererek yeni sayılarda yer alabilirsin.',
      '🔒 **Çevrimdışı İndirme:** Tüm sayıların yüksek kaliteli PDF arşivini tek tıkla cihazına indirebilirsin.'
    ],
    signoff_quote: 'Sayfalarımızın arasında kendi rengini bulman dileğiyle,',
    signoff_signature: 'Sevgiyle, Çilek Dergi Ekibi ♥',
    envelope_sender: 'Çilek Dergisi Editoryal Masası',
    envelope_sub: 'Bağımsız Dijital Gençlik Yayını',
    button_open: 'Mektubu Aç ve Oku ✂️',
    button_explore: 'Dergileri Keşfetmeye Başla'
  },
  site: {
    hero_eyebrow: 'Çilek Dergisi',
    hero_title_line1: 'Kendi sesini',
    hero_title_italic: 'özgürce',
    hero_title_script: 'duyurduğun alan.',
    hero_copy: '15–25 yaş arası bağımsız yaratıcılar için özenle kürate edilmiş editoryal alan; her sayıda keşfedilmeyi bekleyen yeni anlatılar, şiirler, görsel seriler ve koleksiyonluk bir dergi deneyimi.',
    hero_marquee: '✦ Sayı 06 yayında · Şimdi oku ✦ Her ay yeni bir sayı ✦ Bağımsız Gençlik ✦ Çilek Dergisi ✦ ',
    about_opening_quote: 'Her gencin anlatacak sahici, kırılgan ve özgün bir hikâyesi vardır.',
    about_story_title: "Çilek Dergisi'nin Doğuşu",
    about_story_p1: "Çilek Dergisi, dijital çağın aceleci ve yüzeysel tüketimine inat; basılı bir derginin sevgisiyle, her sayfasında özenle işlenmiş kelimeler, dikiş izleri ve özgür düşler barındırmak için 2024'te doğdu.",
    about_story_p2: 'Sanat, edebiyat, kişisel deneyimler, şiir ve bağımsız görsel kültür… Burası kalıplara sığmak zorunda hissetmeyenlerin, ilk dizelerini veya illüstrasyonlarını korkmadan paylaşabileceği sıcak, estetik ve kapsayıcı bir sığınaktır.',
    about_story_p3: 'Her ay yayımlanan bir sayı; yazarların, fotoğrafçıların, şairlerin ve meraklı okurların ortak evi. Ne kadar büyük ya da küçük olursa olsun her ses burada yankı bulur, her his burada yeşerir.',
    about_manifesto_quote: '"İyi bir dergi, sadece yazanların değil — birlikte düşünen, hisseden ve birbirine omuz veren herkesin ortak evidir."',
    about_founder_quote: '"Her gencin anlatacak sahici, kırılgan ve özgün bir hikâyesi vardır. Çilek Dergisi bunun için burada."',
    about_founder_bio: 'Derginin editoryal kimliğini, bağımsız tonunu ve görsel ruhunu şekillendiriyor. Her sayıda okurlarıyla buluşmak için özenle çalışıyor.',
    magazines_title: 'Tüm Sayılar',
    magazines_subtitle: '15-25 yaşın bağımsız edebiyat, sanat ve kültür serüveni. Geçmişten bugüne yayımlanan tüm sayılarımızı inceleyin, çevrimiçi okuyun veya koleksiyonunuza indirin.'
  },
  media: {
    founder_photo: '',
    about_photo_1: '/icons/icon4.png',
    about_photo_2: '/icons/icon2.png',
    gallery: [
      { id: 'm-1', name: 'Çilek Vintage Damga', url: '/icons/cilek-vintage.png', date: '2024-01-01' },
      { id: 'm-2', name: 'Çilek İkon 1', url: '/icons/icon1.png', date: '2024-01-01' },
      { id: 'm-3', name: 'Çilek İkon 2', url: '/icons/icon2.png', date: '2024-01-01' },
      { id: 'm-4', name: 'Çilek İkon 3', url: '/icons/icon3.png', date: '2024-01-01' },
      { id: 'm-5', name: 'Çilek İkon 4', url: '/icons/icon4.png', date: '2024-01-01' },
      { id: 'm-6', name: 'Çilek İkon 5', url: '/icons/icon5.png', date: '2024-01-01' },
      { id: 'm-7', name: 'Çilek İkon 6', url: '/icons/icon6.png', date: '2024-01-01' }
    ]
  }
}

/**
 * Derin obje birleştirme (Deep merge)
 */
function deepMerge(target, source) {
  if (!source) return target
  const output = { ...target }
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (key in target) {
        output[key] = deepMerge(target[key], source[key])
      } else {
        output[key] = source[key]
      }
    } else {
      output[key] = source[key]
    }
  }
  return output
}

/**
 * Yerel depolamadan veya varsayılan değerlerden içeriği oku
 */
export function getLocalSiteContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return deepMerge(DEFAULT_SITE_CONTENT, parsed)
    }
  } catch (err) {
    console.warn('[getLocalSiteContent error]:', err)
  }
  return DEFAULT_SITE_CONTENT
}

/**
 * Supabase ve localStorage'dan içeriği çekip birleştirir
 */
export async function fetchSiteContent() {
  const localData = getLocalSiteContent()

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'main_content')
      .maybeSingle()

    if (!error && data?.value) {
      const merged = deepMerge(DEFAULT_SITE_CONTENT, data.value)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
      } catch (_) {}
      return merged
    }
  } catch (err) {
    // Supabase tablosu henüz yoksa veya bağlantı hatası varsa localData ile devam et
    console.info('[fetchSiteContent info]: Supabase site_settings okunmadı, yerel veriler kullanılıyor.')
  }

  return localData
}

/**
 * İçeriği hem yerel belleğe hem de Supabase'e kaydeder
 */
export async function saveSiteContent(newContent) {
  const merged = deepMerge(DEFAULT_SITE_CONTENT, newContent)

  // 1. Önce anında yerel belleğe kaydet (kullanıcı bekletilmez)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch (err) {
    console.warn('[saveSiteContent local storage error]:', err)
  }

  // 2. Sayfa içi tüm dinleyicilere anlık bildirim fırlat
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT_NAME, { detail: merged }))

  // 3. Supabase'e kalıcı olarak kaydetmeye çalış
  let dbSuccess = false
  try {
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'main_content',
        value: merged,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' })

    if (!error) {
      dbSuccess = true
    } else {
      console.warn('[saveSiteContent supabase warn]:', error.message)
    }
  } catch (err) {
    console.warn('[saveSiteContent supabase error]:', err)
  }

  return { success: true, dbSaved: dbSuccess, data: merged }
}

/**
 * React Hook: Bileşenlerde güncel site içeriğini dinler ve sağlar
 */
export function useSiteContent() {
  const [content, setContent] = useState(() => getLocalSiteContent())
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const latest = await fetchSiteContent()
    setContent(latest)
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()

    const handleUpdate = (e) => {
      if (e.detail) {
        setContent(e.detail)
      }
    }

    window.addEventListener(UPDATE_EVENT_NAME, handleUpdate)
    return () => {
      window.removeEventListener(UPDATE_EVENT_NAME, handleUpdate)
    }
  }, [reload])

  const update = useCallback(async (partialContent) => {
    const next = deepMerge(content, partialContent)
    const res = await saveSiteContent(next)
    setContent(next)
    return res
  }, [content])

  return { content, updateContent: update, refreshContent: reload, loading }
}
