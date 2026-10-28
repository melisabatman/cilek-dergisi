import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import MagazineReader from '../components/MagazineReader'

const FALLBACK_MAGAZINES = [
  {
    id: 'f-1',
    issue_number: 1,
    title: 'Sayı 01 — Başlangıç',
    published_date: '2024-01-11',
    description: 'Her şeyin bir başlangıcı var. Yeni başlangıçların, ilk adımların ve sıfırdan kurmanın hikâyeleri.',
    toc: [
      'İlk Sayfanın Heyecanı',
      'Çilek Dergisi Doğuyor',
      'Bağımsız Yayıncılık Yolu',
      'Korkulara Rağmen Yola Çıkmak'
    ],
    cover_image_url: null,
    pdf_url: null
  },
  {
    id: 'f-2',
    issue_number: 2,
    title: 'Sayı 02 — Kök & Bahar',
    published_date: '2024-02-11',
    description: 'Nereden geldiğimiz, bizi kim yaptığımızı şekillendirir. Nakışlar, çiçekler ve bellek.',
    toc: [
      'Geçmişin Ayak İzleri',
      'Büyüdüğümüz Evler ve Odalar',
      'Kuşaklararası Sohbet'
    ],
    cover_image_url: '/icons/icon2.png',
    pdf_url: null
  },
  {
    id: 'f-3',
    issue_number: 3,
    title: 'Sayı 03 — Dönüşüm',
    published_date: '2024-03-11',
    description: 'Değişim kaçınılmazdır ama her dönüşüm bir seçim taşır. Stüdyo notları ve tasarım dili.',
    toc: [
      'Eski Alışkanlıklara Veda',
      'Yeniden Başlama Cesareti',
      'İçsel Dönüşüm'
    ],
    cover_image_url: '/icons/icon4.png',
    pdf_url: null
  },
  {
    id: 'f-4',
    issue_number: 4,
    title: 'Sayı 04 — Özgürlük',
    published_date: '2024-04-11',
    description: 'Özgürlük; hem bir his, hem de gündelik bir eylem. Sokak çekimleri ve manifestolar.',
    toc: [
      'Sınırların Ötesinde Yaşamak',
      'Kendi Alanını İnşa Etmek',
      'Özgür Kelimeler'
    ],
    cover_image_url: '/icons/icon1.png',
    pdf_url: null
  },
  {
    id: 'f-5',
    issue_number: 5,
    title: 'Sayı 05 — Sessizlik',
    published_date: '2024-05-11',
    description: 'Bazen en güçlü ses, içten gelendir. Şiirler, duygu haritaları ve kişisel itiraflar.',
    toc: [
      'Sessizliğin Gücü',
      'Kendi Kelimelerini Bulmak',
      'Yalnızlıkta Üretmek'
    ],
    cover_image_url: null,
    pdf_url: null
  },
  {
    id: 'f-6',
    issue_number: 6,
    title: 'Sayı 06 — Yaz Dönemi',
    published_date: '2024-06-11',
    description: 'Yaz mevsiminin hafifliği ve sonsuzluk hissi. Uzak yollar, sıcak sokaklar, yeni başlangıçlar.',
    toc: [
      'Yaz Günlüğü',
      'Sonsuz Bir Tatilde Olsaydık',
      'Güneşin Rengi',
      'Deniz Kokulu Şiirler'
    ],
    cover_image_url: null,
    pdf_url: null
  }
]

export default function ReaderPage({ user, isAdmin }) {
  const { id } = useParams()
  const [magazine, setMagazine] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMagazine() {
      setLoading(true)
      try {
        const cleanId = String(id || '').trim()
        const isNumeric = /^\d+$/.test(cleanId)
        let query = supabase.from('magazines').select('*')

        if (isNumeric) {
          query = query.eq('issue_number', parseInt(cleanId, 10))
        } else {
          query = query.eq('id', cleanId)
        }

        const { data, error } = await query.maybeSingle()

        if (!error && data) {
          setMagazine(data)
        } else {
          // Fallback kontrolü: id veya issue_number eşleştirmesi
          const found = FALLBACK_MAGAZINES.find(
            m => m.id === cleanId ||
                 String(m.issue_number) === cleanId ||
                 m.id === `f-${cleanId}` ||
                 `f-${m.issue_number}` === cleanId
          ) || FALLBACK_MAGAZINES[0]
          setMagazine(found)
        }
      } catch (err) {
        console.warn('Reader load error:', err)
        setMagazine(FALLBACK_MAGAZINES[0])
      } finally {
        setLoading(false)
      }
    }

    loadMagazine()
  }, [id])

  if (loading) {
    return (
      <div className="reader-loading-screen">
        <div className="reader-spinner" />
        <h2>Çilek Dergisi Okuyucu Açılıyor…</h2>
        <p>Lütfen bekleyin, editoryal sayfalar hazırlanıyor.</p>
      </div>
    )
  }

  if (!magazine) {
    return (
      <div className="reader-loading-screen">
        <h2>Sayı Bulunamadı</h2>
        <p>Aradığınız dergi sayısı mevcut değil veya yayından kaldırılmış olabilir.</p>
        <Link to="/dergiler" className="btn-admin-submit" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
          ← Tüm Sayılara Dön
        </Link>
      </div>
    )
  }

  return (
    <div className="reader-page-wrapper">
      <MagazineReader
        magazine={magazine}
        user={user}
        isAdmin={isAdmin}
      />
    </div>
  )
}
