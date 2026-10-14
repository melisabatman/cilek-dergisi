import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

const STORAGE_KEY = 'cilek_site_settings_v3'
const UPDATE_EVENT_NAME = 'cilek_site_settings_updated'

/**
 * SİTE İÇERİĞİ VARSAYILANLARI (TÜM STATİK METİN VE GÖRSELLER İÇİN TEK KAYNAK)
 */
export const DEFAULT_SITE_SETTINGS = {
  // ── GENEL, FOOTER & SOSYAL MEDYA ──────────────────────────
  brand_name: 'Çilek Dergisi',
  brand_sub: 'DERGİ',
  footer_text: 'Kendi sesini özgürce duyurduğun, gençliğin cesur ritmiyle parıldayan bağımsız kültür durağı!',
  footer_manifesto: '“Gençliğin anlatacak güçlü, sahici ve kıvılcım dolu bir hikâyesi var!”',
  footer_copyright: '© 2026 Çilek Dergi. Tüm hakları saklıdır.',
  social_instagram_url: 'https://instagram.com/cilekdergisi',
  social_tiktok_url: 'https://tiktok.com/@cilekdergisi',
  contact_email: 'hello@cilekdergisi.com',
  contact_phone: '+90 555 000 00 00',
  contact_address: 'Kadıköy, İstanbul',

  // ── 1. ANA SAYFA HERO & MANŞET ────────────────────────────
  hero_eyebrow: 'Çilek Dergisi',
  hero_title_line1: 'Kendi sesini',
  hero_title_italic: 'özgürce',
  hero_title_script: 'haykırdığın alan!',
  hero_subtitle: '15–25 yaş arası bağımsız yaratıcılar için sınırları kaldıran editoryal sahne! Her sayıda keşfedilmeyi bekleyen yepyeni anlatılar, şiirler, görsel seriler ve koleksiyonluk dijital zine ruhu.',
  hero_cta_text: 'Son Sayıyı Oku →',
  hero_cta_archive: 'Arşivi İncele',
  hero_marquee: 'Sayı 06 Yayında · Şimdi Oku · Her Ay Yepyeni Bir Macera · Genç, Özgür, Bağımsız! · Çilek Dergisi · ',

  // ── 2. ANA SAYFA - TELLİ PANO (BU SAYIDA SENİ NELER BEKLİYOR) ──
  home_toc_tag: 'Sayı Seçkisi',
  home_toc_card_1_title: 'Güneşin Gölgesinde Kalanlar',
  home_toc_card_1_desc: 'Yaz mevsiminin yakıcı sıcağında, gölgede kalan içsel monologlar ve büyüme sancıları.',
  home_toc_card_2_title: 'Bir Yaz Öğledensonrası Notları',
  home_toc_card_2_desc: 'Zamanın yavaşladığı bir ikindi vaktinde tutulan kırılgan notlar ve çocukluk hatıraları.',
  home_toc_card_3_title: 'Deniz Kenarında Bağımsız Edebiyat',
  home_toc_card_3_desc: 'Dalgaların ritminde yazılan serbest dizeler, genç şairlerin denize bıraktığı kelimeler.',
  home_toc_card_4_title: 'Mevsim Değişirken İç Dünyamız',
  home_toc_card_4_desc: 'Mevsimlerin geçişiyle iç dünyamızda değişen renkler, vedalar ve yeni filizlenen umutlar.',

  // ── 3. ANA SAYFA - HER SAYIDA SENİ BEKLEYENLER (5 TEMEL İÇERİK) ──
  features_title: 'Her Sayıda Seni Bekleyenler',
  features_subtitle: "Çilek Dergisi'nin her sayısında nabzını tutacağın beş temel yaratıcı alan:",
  feature_1_title: 'Bir Yazı',
  feature_1_desc: 'Duyguların en yalın ve vurucu haliyle kaleme alınmış özgün bir deneme ya da kısa öykü.',
  feature_2_title: 'Bir Röportaj',
  feature_2_desc: 'İlham veren genç bir yaratıcıyla samimi, dürüst ve derinlikli bir söyleşi.',
  feature_3_title: 'Bir Görsel',
  feature_3_desc: 'Fotoğraf serisi, illüstrasyon veya kolaj; sayfayı aydınlatan rengârenk bir eser.',
  feature_4_title: 'Bir Öneri',
  feature_4_desc: 'Ruhuna iyi gelecek bir kitap, müzik, film ya da taptaze bir ilham önerisi.',
  feature_5_title: 'Bir Düşünce',
  feature_5_desc: 'Kafana takılan bir soru, yepyeni bir kavram veya zihnini açacak bir hayat notu.',

  // ── 4. ANA SAYFA - EDİTORYAL DERGİ SAYFASI ─────────────────
  editorial_tag: 'EDITORIAL FEATURE | ÇİLEK DERGİSİ',
  editorial_sub: 'EDEBİYAT • SANAT • GENÇLİK & DİNAMİK ANLATILAR',
  editorial_headline: 'Senin sesin çağırdı.',
  editorial_headline_italic: 'Çilek sayfaları seni bekliyor!',
  editorial_lead: '15-25 yaş arası genç yaratıcılar için sınırları kaldıran editoryal alan! Yeni anlatılar, şiirler, cesur görsel seriler ve koleksiyonluk dergi deneyimi seni bekliyor.',
  editorial_badge_1_val: 'Sayı 06',
  editorial_badge_1_label: 'GÜNCEL SAYI',
  editorial_badge_1_sub: '(YAZ 2024)',
  editorial_badge_2_val: '15-25',
  editorial_badge_2_label: 'YAŞ ALANI',
  editorial_badge_2_sub: 'ÖZGÜN SES',
  editorial_badge_3_val: '%100',
  editorial_badge_3_label: 'BAĞIMSIZ',
  editorial_badge_3_sub: 'DİJİTAL YAYIN',
  editorial_button_text: 'DERGİYİ KEŞFET →',
  editorial_photo_url: '',

  // ── 5. ANA SAYFA - EKİBİMİZLE TANIŞIN BÖLÜMÜ ───────────────
  home_team_eyebrow: 'Ekibimiz',
  home_team_title: 'Yaratıcı Ekibimizle Tanışın',
  home_team_cta: 'Tümünü Gör →',

  // ── 6. KURUCULAR KÖŞESİ (ANA SAYFA & HAKKIMIZDA) ───────────────
  about_founder_quote: '“Gençliğin enerjisi, tutkusu ve anlatacak cesur hikâyeleri kalıplara sığmaz! Çilek Dergisi bu bağımsız kıvılcımı birlikte parlatmak için var!”',
  about_founder_bio: 'İki kurucu ortak olarak derginin editoryal kimliğini, dinamik görsel ruhunu ve bağımsız vizyonunu el ele büyütüyoruz. Her sayıda okurlarımızla ve genç yeteneklerle buluşmanın heyecanını yaşıyoruz!',
  about_founder_name: 'Kurucu Ortaklar',
  about_founder_1_name: 'Genel Yayın Yönetmeni',
  about_founder_1_role: 'Kreatif Direktör & Kurucu Ortak',
  about_founder_2_name: 'Art Director',
  about_founder_2_role: 'Görsel Tasarım & Kurucu Ortak',
  about_founder_photo_url: '',
  about_founder_2_photo_url: '',

  // ── 7. KATILIM ÇAĞRISI / BANNER ────────────────────────────
  home_cta_title: 'Sayfalarda Yerini Al!',
  home_cta_desc: 'Şiir, öykü, illüstrasyon veya fotoğraf... Çilek\'in yeni sayısında senin de izin, senin de güçlü sesin olsun!',
  home_cta_button: 'Bize Yaz / İletişim →',

  // ── 8. HAKKIMIZDA SAYFASI ──────────────────────────────────
  about_title: 'Biz Kimiz?',
  about_opening_quote: 'Gençliğin hayalleri, cesareti ve üretme tutkusu dünyayı değiştirecek güçte!',
  about_story_title: "Çilek Dergisi'nin Doğuşu",
  about_paragraph_1: "Çilek Dergisi, dijital çağın aceleci ve yüzeysel tüketimine meydan okuyarak doğdu! İki kurucu olarak, basılı bir fanzinin samimiyetini dijitalin sınırsız enerjisiyle buluşturmak için yola çıktık.",
  about_paragraph_2: 'Sanat, edebiyat, kişisel deneyimler, şiir ve bağımsız görsel kültür… Burası kalıplara sığmayan, sesini korkusuzca duyurmak isteyen her gencin kendi rengini ortaya koyabileceği dinamik, ilham verici bir üretim yuvası!',
  about_paragraph_3: 'Her ay yayımlanan her yeni sayı; genç yazarların, illüstratörlerin, fotoğrafçıların ve meraklı okurların ortak coşkusudur. Burada hiçbir hayal küçük değil, her ses güçlü ve değerli!',
  about_manifesto_quote: '“İyi bir dergi, yalnızca yazanların değil; birlikte düşleyen, üreten ve birbirine güç veren tüm gençlerin ortak hareketidir!”',
  about_photo_1_url: '/icons/icon4.png',
  about_photo_2_url: '/icons/icon2.png',

  // ── 9. DERGİLER SAYFASI ────────────────────────────────────
  magazines_eyebrow: 'Çilek Dergisi',
  magazines_title: 'Dijital Rafımız',
  magazines_subtitle: 'Her sayı bambaşka bir enerji, yepyeni bir macera. Raftan bir dergi seç, sayfaları hemen çevir!',

  // ── 10. EKİBİMİZ SAYFASI ───────────────────────────────────
  team_page_eyebrow: 'Editoryal Masa',
  team_page_title: 'Ekibimiz',
  team_page_description: 'Derginin mutfağında, kelimelerin ve renklerin peşinde tutkuyla koşan bağımsız kolektif.',

  // ── 11. İLETİŞİM SAYFASI ───────────────────────────────────
  contact_eyebrow: 'Açık Başvuru',
  contact_title: 'Bize Yazın!',
  contact_subtitle: 'Çilek Dergisi, 15–25 yaş arası tüm bağımsız üreticilere kapılarını sonuna kadar açıyor! Kaleme aldığın yazınla, illüstrasyonunla veya fotoğraflarınla aramıza katıl!',
  contact_steps_title: 'Başvuru Süreci',
  contact_form_title: 'Çalışmanı Gönder',

  // ── 12. HOŞ GELDİN MEKTUBU (LETTER MODAL) ──────────────────
  letter_badge: 'ÖZEL ÇİLEK MEKTUBU',
  letter_title: 'THANK YOU SO MUCH!',
  letter_subtitle: 'Çilek Ailesine Aramıza Hoş Geldin Sevgili {name}! 🍓',
  letter_lead_quote: '“Kendine ait bir alan kur, kendi sesini özgürce duyur!”',
  letter_body_paragraph: "Çilek Dergisi'nin dinamik ve bağımsız sayfalarına katıldığın için çok heyecanlıyız! 15-25 yaşın o dur durak bilmeyen yaratıcı enerjisini, özgür hayallerini ve taze bakış açılarını birlikte kutlayacağımız sıcacık bir topluluktasın.",
  letter_perks_title: 'Aramıza Katılarak Neler Kazandın?',
  letter_signoff_quote: 'Sayfalarımızın arasında kendi parıltını ve ritmini bulman dileğiyle,',
  letter_signoff_signature: 'Sevgi ve Heyecanla, Çilek Dergi Kurucuları & Ekibi ♥',
  letter_envelope_sender: 'Çilek Dergisi Editoryal Masası',
  letter_envelope_sub: 'Bağımsız Dijital Gençlik Yayını',
  letter_button_open: 'Mektubu Aç ve Oku ✂️',
  letter_button_explore: 'Dergileri Keşfetmeye Başla →',
}

// Geriye dönük uyumluluk için alias
export const DEFAULT_SITE_CONTENT = {
  letter: {
    badge: DEFAULT_SITE_SETTINGS.letter_badge,
    title: DEFAULT_SITE_SETTINGS.letter_title,
    subtitle: DEFAULT_SITE_SETTINGS.letter_subtitle,
    lead_quote: DEFAULT_SITE_SETTINGS.letter_lead_quote,
    body_paragraph: DEFAULT_SITE_SETTINGS.letter_body_paragraph,
    perks_title: DEFAULT_SITE_SETTINGS.letter_perks_title,
    perks: [
      '📖 **Tüm Sayılara Sınırsız Erişim:** Sayfaları gerçek bir kitap gibi çevirip okuyabilirsin.',
      '💬 **Sayfa Notları & Yorumlar:** Beğendiğin sayfaların kenarına düşüncelerini iliştirebilirsin.',
      '✍️ **Yazı Gönderme Ayrıcalığı:** Kaleme aldığın yazı, şiir veya fotoğrafları bize göndererek yeni sayılarda yer alabilirsin.',
      '🔒 **Çevrimdışı İndirme:** Tüm sayıların yüksek kaliteli PDF arşivini tek tıkla cihazına indirebilirsin.'
    ],
    signoff_quote: DEFAULT_SITE_SETTINGS.letter_signoff_quote,
    signoff_signature: DEFAULT_SITE_SETTINGS.letter_signoff_signature,
    envelope_sender: DEFAULT_SITE_SETTINGS.letter_envelope_sender,
    envelope_sub: DEFAULT_SITE_SETTINGS.letter_envelope_sub,
    button_open: DEFAULT_SITE_SETTINGS.letter_button_open,
    button_explore: DEFAULT_SITE_SETTINGS.letter_button_explore,
  },
  site: {
    hero_eyebrow: DEFAULT_SITE_SETTINGS.hero_eyebrow,
    hero_title_line1: DEFAULT_SITE_SETTINGS.hero_title_line1,
    hero_title_italic: DEFAULT_SITE_SETTINGS.hero_title_italic,
    hero_title_script: DEFAULT_SITE_SETTINGS.hero_title_script,
    hero_copy: DEFAULT_SITE_SETTINGS.hero_subtitle,
    hero_marquee: DEFAULT_SITE_SETTINGS.hero_marquee,
    about_opening_quote: DEFAULT_SITE_SETTINGS.about_opening_quote,
    about_story_title: DEFAULT_SITE_SETTINGS.about_story_title,
    about_story_p1: DEFAULT_SITE_SETTINGS.about_paragraph_1,
    about_story_p2: DEFAULT_SITE_SETTINGS.about_paragraph_2,
    about_story_p3: DEFAULT_SITE_SETTINGS.about_paragraph_3,
    about_manifesto_quote: DEFAULT_SITE_SETTINGS.about_manifesto_quote,
    about_founder_quote: DEFAULT_SITE_SETTINGS.about_founder_quote,
    about_founder_bio: DEFAULT_SITE_SETTINGS.about_founder_bio,
    magazines_title: DEFAULT_SITE_SETTINGS.magazines_title,
    magazines_subtitle: DEFAULT_SITE_SETTINGS.magazines_subtitle,
  },
  media: {
    founder_photo: DEFAULT_SITE_SETTINGS.about_founder_photo_url,
    founder_2_photo: DEFAULT_SITE_SETTINGS.about_founder_2_photo_url,
    about_photo_1: DEFAULT_SITE_SETTINGS.about_photo_1_url,
    about_photo_2: DEFAULT_SITE_SETTINGS.about_photo_2_url,
    gallery: []
  }
}

/**
 * Yerel depolamadan güncel ayarları oku
 */
export function getLocalSiteSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...DEFAULT_SITE_SETTINGS, ...parsed }
    }
  } catch (err) {
    console.warn('[getLocalSiteSettings error]:', err)
  }
  return { ...DEFAULT_SITE_SETTINGS }
}

/**
 * Supabase'den site_settings tablosundaki TÜM kayıtları çekip birleştirir
 */
export async function fetchSiteSettings() {
  const localData = getLocalSiteSettings()

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')

    if (!error && Array.isArray(data) && data.length > 0) {
      const dbSettings = {}

      data.forEach((row) => {
        if (!row || !row.key) return
        if (row.key === 'main_content' || row.key === 'all_settings') {
          // Toplu JSON nesnesi
          if (row.value && typeof row.value === 'object') {
            Object.assign(dbSettings, row.value)
            // Eğer eski formatta site altındaysa
            if (row.value.site) Object.assign(dbSettings, row.value.site)
            if (row.value.media?.founder_photo) dbSettings.about_founder_photo_url = row.value.media.founder_photo
            if (row.value.media?.founder_2_photo) dbSettings.about_founder_2_photo_url = row.value.media.founder_2_photo
            if (row.value.media?.about_photo_1) dbSettings.about_photo_1_url = row.value.media.about_photo_1
            if (row.value.media?.about_photo_2) dbSettings.about_photo_2_url = row.value.media.about_photo_2
          }
        } else {
          // Bireysel anahtar-değer
          let val = row.value
          if (val && typeof val === 'object' && 'val' in val) {
            val = val.val
          } else if (typeof val === 'string') {
            try {
              const unquoted = JSON.parse(val)
              if (typeof unquoted === 'string') val = unquoted
            } catch (_) {}
          }
          dbSettings[row.key] = val
        }
      })

      const merged = { ...DEFAULT_SITE_SETTINGS, ...localData, ...dbSettings }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
      } catch (_) {}
      return merged
    }
  } catch (err) {
    console.info('[fetchSiteSettings info]: Supabase site_settings okunamadı, yerel veriler kullanılıyor.')
  }

  return localData
}

/**
 * Ayarları hem yerel belleğe hem de Supabase site_settings tablosuna kaydeder
 */
export async function saveSiteSettings(newSettings) {
  const merged = { ...DEFAULT_SITE_SETTINGS, ...getLocalSiteSettings(), ...newSettings }

  // 1. Önce anında yerel belleğe kaydet (kullanıcı bekletilmez)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch (err) {
    console.warn('[saveSiteSettings local storage error]:', err)
  }

  // 2. Sayfa içi tüm dinleyicilere anlık bildirim fırlat
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT_NAME, { detail: merged }))

  // 3. Supabase'e kalıcı olarak kaydet
  let dbSuccess = false
  try {
    // Hem 'all_settings' toplu kaydı hem de tek tek anahtar kayıtları oluştur
    const rows = [
      {
        key: 'all_settings',
        value: merged,
        updated_at: new Date().toISOString()
      },
      {
        key: 'main_content',
        value: merged,
        updated_at: new Date().toISOString()
      }
    ]

    // İstenen anahtarları tek tek de ekle (bireysel sorgulamalar için)
    for (const [k, v] of Object.entries(merged)) {
      rows.push({
        key: k,
        value: typeof v === 'object' ? v : { val: v },
        updated_at: new Date().toISOString()
      })
    }

    const { error } = await supabase
      .from('site_settings')
      .upsert(rows, { onConflict: 'key' })

    if (!error) {
      dbSuccess = true
    } else {
      console.warn('[saveSiteSettings supabase warn]:', error.message)
    }
  } catch (err) {
    console.warn('[saveSiteSettings supabase error]:', err)
  }

  return { success: true, dbSaved: dbSuccess, data: merged }
}

/**
 * Geriye dönük uyumluluk aliasları
 */
export const getLocalSiteContent = () => {
  const s = getLocalSiteSettings()
  return {
    settings: s,
    site: s,
    letter: DEFAULT_SITE_CONTENT.letter,
    media: {
      founder_photo: s.about_founder_photo_url,
      founder_2_photo: s.about_founder_2_photo_url,
      about_photo_1: s.about_photo_1_url,
      about_photo_2: s.about_photo_2_url,
      gallery: []
    }
  }
}

export const fetchSiteContent = async () => {
  const s = await fetchSiteSettings()
  return {
    settings: s,
    site: s,
    letter: DEFAULT_SITE_CONTENT.letter,
    media: {
      founder_photo: s.about_founder_photo_url,
      founder_2_photo: s.about_founder_2_photo_url,
      about_photo_1: s.about_photo_1_url,
      about_photo_2: s.about_photo_2_url,
      gallery: []
    }
  }
}

export const saveSiteContent = async (newContent) => {
  if (newContent?.settings) return saveSiteSettings(newContent.settings)
  if (newContent?.site) return saveSiteSettings(newContent.site)
  return saveSiteSettings(newContent)
}

/**
 * React Hook: Bileşenlerde dinamik CMS site içeriğini dinler ve sağlar
 */
export function useSiteContent() {
  const [settings, setSettings] = useState(() => getLocalSiteSettings())
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const latest = await fetchSiteSettings()
    setSettings(latest)
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()

    const handleUpdate = (e) => {
      if (e.detail) {
        setSettings(e.detail)
      }
    }

    window.addEventListener(UPDATE_EVENT_NAME, handleUpdate)
    return () => {
      window.removeEventListener(UPDATE_EVENT_NAME, handleUpdate)
    }
  }, [reload])

  const update = useCallback(async (partialSettings) => {
    const next = { ...settings, ...partialSettings }
    const res = await saveSiteSettings(next)
    setSettings(next)
    return res
  }, [settings])

  // Hem düz { settings }, hem de eski { content } formatında nesne döndür
  const content = {
    settings,
    site: settings,
    letter: DEFAULT_SITE_CONTENT.letter,
    media: {
      founder_photo: settings.about_founder_photo_url,
      founder_2_photo: settings.about_founder_2_photo_url,
      about_photo_1: settings.about_photo_1_url,
      about_photo_2: settings.about_photo_2_url,
      gallery: []
    }
  }

  return {
    settings,
    content,
    updateSettings: update,
    updateContent: update,
    refreshContent: reload,
    loading
  }
}
