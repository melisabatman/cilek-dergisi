import React from 'react'
import Layout from '../components/Layout'
import MagazineGrid from '../components/MagazineGrid'
import { useSiteContent, DEFAULT_SITE_CONTENT } from '../lib/siteContent'

export default function Dergiler({ user, isAdmin }) {
  const { content } = useSiteContent()
  const siteData = content?.site || DEFAULT_SITE_CONTENT.site

  return (
    <Layout user={user} isAdmin={isAdmin}>
      <div className="dergiler-page">

        {/* ── Sayfa Başlığı ─────────────────────────────────────────── */}
        <header className="dergiler-page-header">
          <div className="dergiler-header-inner container">
            <div className="dergiler-header-deco" aria-hidden="true">
              <img src="/icons/cilek-vintage.png" alt="" className="dergiler-header-icon" />
            </div>
            <div className="dergiler-header-text">
              <span className="eyebrow-cilek"><span className="eyebrow-star">✦</span> Çilek Dergisi Arşivi</span>
              <h1 className="dergiler-page-title">
                {siteData.magazines_title || 'Tüm Sayılar'}
              </h1>
              <p className="dergiler-page-sub">
                {siteData.magazines_subtitle || 'EST. 2024 · Her sayı, 15–25 yaş bağımsız yaratıcıların sesiyle şekillenen, özenle kürate edilmiş bir editoryal deneyimdir.'}
              </p>
            </div>
          </div>

          {/* Dekoratif çizgi */}
          <div className="dergiler-header-divider" aria-hidden="true">
            <span />
            <img src="/icons/cilek-vintage.png" alt="" style={{ width: 28, opacity: 0.6 }} />
            <span />
          </div>
        </header>

        {/* ── Dergi Izgarası ────────────────────────────────────────── */}
        <section className="dergiler-grid-section container" aria-label="Tüm Sayılar">
          <MagazineGrid user={user} />
        </section>

      </div>
    </Layout>
  )
}
