import React from 'react'
import Layout from '../components/Layout'
import MagazineGrid from '../components/MagazineGrid'
import { useSiteContent, DEFAULT_SITE_CONTENT } from '../lib/siteContent'

export default function Dergiler({ user, isAdmin }) {
  const { settings } = useSiteContent()

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
              <span className="eyebrow-cilek">{settings.magazines_eyebrow || 'Çilek Dergisi Arşivi'}</span>
              <h1 className="dergiler-page-title">
                {settings.magazines_title || 'Tüm Sayılar'}
              </h1>
              <p className="dergiler-page-sub">
                {settings.magazines_subtitle || 'EST. 2024 · Gençliğin ilham dolu dünyasına adım at! Raftan dilediğin sayıyı seç, sayfaları hemen çevir ve özgür sesleri keşfet!'}
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

        {/* ── Dergi Izgarası (Boydan Boya Dijital Kitaplık) ────────── */}
        <section className="dergiler-grid-section" aria-label="Tüm Sayılar">
          <MagazineGrid user={user} />
        </section>

      </div>
    </Layout>
  )
}
