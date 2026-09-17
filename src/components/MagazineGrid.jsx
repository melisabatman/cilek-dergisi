import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import MagazineModal from './MagazineModal'

const PDF_REQUIRE_LOGIN = import.meta.env.VITE_PDF_REQUIRE_LOGIN !== 'false'

const ALL_MAGAZINES_FALLBACK = [
  {
    id: 'mag-6',
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
    pdf_url: null,
    badge: 'Son Sayı',
  },
  {
    id: 'mag-5',
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
    pdf_url: null,
    badge: 'Mayıs 2024',
  },
  {
    id: 'mag-4',
    issue_number: 4,
    title: 'Sayı 04 — Özgürlük',
    published_date: '2024-04-11',
    description: 'Özgürlük; hem bir his, hem de gündelik bir eylem. Bağımsız üretimler ve kişisel alanlar üzerine.',
    toc: [
      'Sınırların Ötesinde Yaşamak',
      'Kendi Alanını İnşa Etmek',
      'Yaratıcı Bağımsızlık Manifestosu',
      'Küçük Adımlarla Büyük Özgürlükler'
    ],
    cover_image_url: null,
    pdf_url: null,
    badge: 'Nisan 2024',
  },
  {
    id: 'mag-3',
    issue_number: 3,
    title: 'Sayı 03 — Dönüşüm',
    published_date: '2024-03-11',
    description: 'Değişim kaçınılmazdır ama her dönüşüm bir seçim taşır. Şehirde ve iç dünyamızda yenilenme adımları.',
    toc: [
      'Eski Alışkanlıklara Veda',
      'Yeniden Başlama Cesareti',
      'Kentsel Dönüşüm ve Hafıza',
      'Ruhun Bahar Temizliği'
    ],
    cover_image_url: null,
    pdf_url: null,
    badge: 'Mart 2024',
  },
  {
    id: 'mag-2',
    issue_number: 2,
    title: 'Sayı 02 — Kök',
    published_date: '2024-02-11',
    description: 'Nereden geldiğimiz, bizi kim yaptığımızı şekillendirir. Kökler, hafıza ve kimlik üzerine yazılar.',
    toc: [
      'Geçmişin Ayak İzleri',
      'Büyüdüğümüz Evler ve Odalar',
      'Kök Salmak mı, Kanatlanmak mı?',
      'Kuşaktan Kuşağa Kalan Masallar'
    ],
    cover_image_url: null,
    pdf_url: null,
    badge: 'Şubat 2024',
  },
  {
    id: 'mag-1',
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
    pdf_url: null,
    badge: 'Ocak 2024',
  },
]

export default function MagazineGrid({ user, onFirstLoaded }) {
  const [magazines, setMagazines]     = useState(ALL_MAGAZINES_FALLBACK)
  const [selectedMag, setSelectedMag] = useState(null)

  const fetchMagazines = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('magazines')
        .select('*')
        .order('published_date', { ascending: false })

      if (!error && data?.length) {
        setMagazines(data)
        onFirstLoaded?.(data[0])
      }
    } catch (err) {
      console.warn('Could not fetch magazines from Supabase:', err)
    }
  }, [onFirstLoaded])

  useEffect(() => {
    fetchMagazines()
  }, [fetchMagazines])

  return (
    <div className="magazines-archive-section">
      {/* Sıra Sıra Gösterilen Dergi Kartları */}
      <div className="magazines-sequential-grid" role="list" aria-label="Yayımlanan Sayılar">
        {magazines.map((mag, idx) => (
          <article
            key={mag.id || idx}
            className="mag-sequential-card"
            role="listitem"
            tabIndex={0}
            onClick={() => setSelectedMag(mag)}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedMag(mag)}
            aria-label={`${mag.title} — Sayıyı Oku`}
          >
            {/* Kapak Görseli */}
            <div className="mag-seq-cover">
              {mag.cover_image_url ? (
                <img src={mag.cover_image_url} alt={mag.title} loading="lazy" />
              ) : (
                <div className="mag-seq-placeholder">
                  <span className="mag-seq-icon">🍓</span>
                  <span className="mag-seq-brand">ÇİLEK</span>
                  <span className="mag-seq-sub">{mag.title}</span>
                </div>
              )}
              {mag.issue_number && (
                <span className="mag-seq-badge">Sayı #{mag.issue_number}</span>
              )}
            </div>

            {/* İçerik */}
            <div className="mag-seq-body">
              <div className="mag-seq-header-row">
                <h2 className="mag-seq-title">{mag.title}</h2>
                {mag.published_date && (
                  <span className="mag-seq-date">
                    {new Date(mag.published_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
                  </span>
                )}
              </div>

              <p className="mag-seq-desc">{mag.description}</p>

              {/* TOC Önizleme */}
              {Array.isArray(mag.toc) && mag.toc.length > 0 && (
                <div className="mag-seq-toc-preview">
                  <span className="mag-seq-toc-label">İçindekiler:</span>
                  <span className="mag-seq-toc-items">
                    {mag.toc.slice(0, 3).join(' • ')}
                    {mag.toc.length > 3 ? ` ve ${mag.toc.length - 3} yazı daha…` : ''}
                  </span>
                </div>
              )}

              <div className="mag-seq-footer">
                <Link
                  to={`/oku/${mag.id || mag.issue_number || idx + 1}`}
                  className="btn-read-book-quick"
                  onClick={(e) => e.stopPropagation()}
                  id={`btn-read-book-${mag.issue_number || idx}`}
                >
                  <span aria-hidden="true">📖</span> Kitap Olarak Oku
                </Link>

                <button
                  type="button"
                  className="btn-read-seq"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedMag(mag)
                  }}
                  id={`btn-read-issue-${mag.issue_number || idx}`}
                >
                  İçindekiler &amp; Detay <span aria-hidden="true">→</span>
                </button>

                {mag.pdf_url && (
                  PDF_REQUIRE_LOGIN && !user ? (
                    <button
                      type="button"
                      className="btn-pdf-seq-quick login-required"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedMag(mag)
                      }}
                      title="PDF indirmek için lütfen giriş yapın veya kayıt olun"
                      id={`btn-pdf-quick-${mag.issue_number || idx}`}
                    >
                      🔒 PDF İndir
                    </button>
                  ) : (
                    <a
                      href={mag.pdf_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-pdf-seq-quick"
                      onClick={(e) => e.stopPropagation()}
                      id={`btn-pdf-quick-${mag.issue_number || idx}`}
                    >
                      ⬇ PDF İndir
                    </a>
                  )
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Okuma / Detay Modalı */}
      {selectedMag && (
        <MagazineModal
          magazine={selectedMag}
          user={user}
          onClose={() => setSelectedMag(null)}
        />
      )}
    </div>
  )
}
