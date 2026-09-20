import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import MagazineModal from './MagazineModal'

const PDF_REQUIRE_LOGIN = import.meta.env.VITE_PDF_REQUIRE_LOGIN !== 'false'

const ALL_MAGAZINES_FALLBACK = [
  { id: 'mag-6', issue_number: 6, title: 'Sayı 06 — Yaz', published_date: '2024-06-11', description: 'Uzun günler, sıcak esintiler ve yeni anlatılar. Yaz mevsimine dair bağımsız perspektifler.', toc: ['Güneşin Gölgesinde Kalanlar', 'Bir Yaz Öğledensonrası Notları', 'Deniz Kenarında Bağımsız Edebiyat', 'Mevsim Değişirken İç Dünyamız'], cover_image_url: null, pdf_url: null, badge: 'Son Sayı' },
  { id: 'mag-5', issue_number: 5, title: 'Sayı 05 — Sesler', published_date: '2024-05-11', description: 'Kendi sesini bulmak, belki de en büyük macera. Farklı seslerin ve anlatıların peşine düştük.', toc: ['Sessizliği Bozma Rehberi', 'Şehrin Fısıltıları', 'Kadın Sesleri ve Bellek', 'Sözcüklerin Gücü Üzerine'], cover_image_url: null, pdf_url: null, badge: 'Mayıs 2024' },
  { id: 'mag-4', issue_number: 4, title: 'Sayı 04 — Özgürlük', published_date: '2024-04-11', description: 'Özgürlük; hem bir his, hem de gündelik bir eylem. Bağımsız üretimler ve kişisel alanlar üzerine.', toc: ['Sınırların Ötesinde Yaşamak', 'Kendi Alanını İnşa Etmek', 'Yaratıcı Bağımsızlık Manifestosu', 'Küçük Adımlarla Büyük Özgürlükler'], cover_image_url: null, pdf_url: null, badge: 'Nisan 2024' },
  { id: 'mag-3', issue_number: 3, title: 'Sayı 03 — Dönüşüm', published_date: '2024-03-11', description: 'Değişim kaçınılmazdır ama her dönüşüm bir seçim taşır. Şehirde ve iç dünyamızda yenilenme adımları.', toc: ['Eski Alışkanlıklara Veda', 'Yeniden Başlama Cesareti', 'Kentsel Dönüşüm ve Hafıza', 'Ruhun Bahar Temizliği'], cover_image_url: null, pdf_url: null, badge: 'Mart 2024' },
  { id: 'mag-2', issue_number: 2, title: 'Sayı 02 — Kök', published_date: '2024-02-11', description: 'Nereden geldiğimiz, bizi kim yaptığımızı şekillendirir. Kökler, hafıza ve kimlik üzerine yazılar.', toc: ['Geçmişin Ayak İzleri', 'Büyüdüğümüz Evler ve Odalar', 'Kök Salmak mı, Kanatlanmak mı?', 'Kuşaktan Kuşağa Kalan Masallar'], cover_image_url: null, pdf_url: null, badge: 'Şubat 2024' },
  { id: 'mag-1', issue_number: 1, title: 'Sayı 01 — Başlangıç', published_date: '2024-01-11', description: 'Her şeyin bir başlangıcı var. Yeni başlangıçların, ilk adımların ve sıfırdan kurmanın hikâyeleri.', toc: ['İlk Sayfanın Heyecanı', 'Çilek Dergisi Doğuyor', 'Bağımsız Yayıncılık Yolu', 'Korkulara Rağmen Yola Çıkmak'], cover_image_url: null, pdf_url: null, badge: 'Ocak 2024' },
]

// Tilt açıları — her kart hafif farklı açıda durur
const TILTS = [-1.8, 1.2, -0.8, 1.6, -1.4, 0.9]

export default function MagazineGrid({ user, onFirstLoaded }) {
  const [magazines, setMagazines] = useState(ALL_MAGAZINES_FALLBACK)
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
      console.warn('Could not fetch magazines:', err)
    }
  }, [onFirstLoaded])

  useEffect(() => { fetchMagazines() }, [fetchMagazines])

  return (
    <div className="mag-v2-grid-wrapper">
      {/* Flatlay ızgara */}
      <div className="mag-v2-grid" role="list" aria-label="Yayımlanan tüm sayılar">
        {magazines.map((mag, idx) => {
          const tilt = TILTS[idx % TILTS.length]
          const isNewest = idx === 0

          return (
            <article
              key={mag.id || idx}
              className={`mag-v2-card ${isNewest ? 'mag-v2-card--featured' : ''}`}
              style={{ '--tilt': `${tilt}deg` }}
              role="listitem"
              tabIndex={0}
              onClick={() => setSelectedMag(mag)}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedMag(mag)}
              aria-label={`${mag.title} — detayları gör`}
            >
              {/* Arka gölge (kağıt efekti) */}
              <div className="mag-v2-card-shadow" />

              {/* Ana kart */}
              <div className="mag-v2-card-inner">
                {/* Kapak */}
                <div className="mag-v2-cover">
                  {mag.cover_image_url ? (
                    <img src={mag.cover_image_url} alt={mag.title} loading="lazy" className="mag-v2-cover-img" />
                  ) : (
                    <div className="mag-v2-cover-placeholder">
                      <img src="/icons/cilek-vintage.png" alt="" className="mag-v2-placeholder-icon" />
                      <span className="mag-v2-placeholder-title">ÇİLEK DERGİSİ</span>
                      <span className="mag-v2-placeholder-issue">Sayı {mag.issue_number || (idx + 1)}</span>
                    </div>
                  )}

                  {/* Badge */}
                  {isNewest && (
                    <div className="mag-v2-badge-new">Son Sayı</div>
                  )}
                  <div className="mag-v2-badge-num">#{mag.issue_number || (idx + 1)}</div>
                </div>

                {/* Bilgi */}
                <div className="mag-v2-info">
                  <div className="mag-v2-meta">
                    {mag.published_date && (
                      <span className="mag-v2-date">
                        {new Date(mag.published_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
                      </span>
                    )}
                  </div>
                  <h2 className="mag-v2-title">{mag.title}</h2>
                  <p className="mag-v2-desc">{mag.description}</p>

                  {/* TOC önizleme */}
                  {Array.isArray(mag.toc) && mag.toc.length > 0 && (
                    <div className="mag-v2-toc">
                      {mag.toc.slice(0, 3).map((item, i) => (
                        <span key={i} className="mag-v2-toc-item">
                          <span className="mag-v2-toc-dot">✦</span>
                          {item}
                        </span>
                      ))}
                      {mag.toc.length > 3 && (
                        <span className="mag-v2-toc-more">+{mag.toc.length - 3} yazı daha</span>
                      )}
                    </div>
                  )}

                  {/* Butonlar */}
                  <div className="mag-v2-actions">
                    <Link
                      to={`/oku/${mag.id || mag.issue_number || idx + 1}`}
                      className="btn-cilek-primary"
                      onClick={(e) => e.stopPropagation()}
                      id={`btn-read-${mag.issue_number || idx}`}
                    >
                      Sayıyı Oku →
                    </Link>

                    <button
                      type="button"
                      className="btn-cilek-secondary mag-v2-btn-detail"
                      onClick={(e) => { e.stopPropagation(); setSelectedMag(mag) }}
                      id={`btn-detail-${mag.issue_number || idx}`}
                    >
                      Detaylar & İçindekiler
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {/* Modal */}
      {selectedMag && (
        <MagazineModal magazine={selectedMag} user={user} onClose={() => setSelectedMag(null)} />
      )}
    </div>
  )
}
