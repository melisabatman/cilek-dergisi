import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import MagazineReader from '../components/MagazineReader'

const FALLBACK_MAGAZINES = [
  {
    id: 'f-6',
    issue_number: 6,
    title: 'Sayı 06 — Yaz',
    published_date: '2024-06-11',
    description: 'Uzun günler, sıcak esintiler ve yeni anlatılar. Yaz mevsimine dair bağımsız perspektifler.',
    toc: [
      'Güneşin Gölgesinde Kalanlar',
      'Bir Yaz Öğledensonrası Notları',
      'Deniz Kenarında Bağımsız Edebiyat',
      'Mevsim Değişirken İç Dünyamız'
    ],
    cover_image_url: null,
    pdf_url: null
  },
  {
    id: 'f-5',
    issue_number: 5,
    title: 'Sayı 05 — Sesler',
    published_date: '2024-05-11',
    description: 'Kendi sesini bulmak, belki de en büyük macera. Farklı seslerin ve anlatıların peşine düştük.',
    toc: [
      'Sessizliği Bozma Rehberi',
      'Şehrin Fısıltıları',
      'Kadın Sesleri ve Bellek',
      'Sözcüklerin Gücü Üzerine'
    ],
    cover_image_url: null,
    pdf_url: null
  },
  {
    id: 'f-4',
    issue_number: 4,
    title: 'Sayı 04 — Özgürlük',
    published_date: '2024-04-11',
    description: 'Özgürlük; hem bir his, hem de gündelik bir eylem.',
    toc: ['Sınırların Ötesinde Yaşamak', 'Kendi Alanını İnşa Etmek'],
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
        const isNumeric = /^\d+$/.test(id)
        let query = supabase.from('magazines').select('*')

        if (isNumeric) {
          query = query.eq('issue_number', parseInt(id, 10))
        } else {
          query = query.eq('id', id)
        }

        const { data, error } = await query.maybeSingle()

        if (!error && data) {
          setMagazine(data)
        } else {
          // Fallback kontrolü
          const found = FALLBACK_MAGAZINES.find(
            m => m.id === id || m.issue_number === parseInt(id, 10)
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
