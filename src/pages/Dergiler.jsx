import React from 'react'
import Layout from '../components/Layout'
import MagazineGrid from '../components/MagazineGrid'
import { useSiteContent } from '../lib/siteContent'

export default function Dergiler({ user, isAdmin }) {
  const { settings } = useSiteContent()

  return (
    <Layout user={user} isAdmin={isAdmin}>
      <div className="dergiler-page">

        {/* ── Sayfa Başlığı (Dijital Raf Başlığı) ────────────────────── */}
        <header className="draf-page-header">
          <div className="draf-header-deco" aria-hidden="true">
            <span className="draf-header-line" />
            <img src="/icons/cilek-vintage.png" alt="" className="draf-header-icon" />
            <span className="draf-header-line" />
          </div>

          <h1 className="draf-page-title">
            {settings.magazines_title || 'Dijital Rafımız'}
          </h1>

          <p className="draf-page-sub">
            {settings.magazines_subtitle || 'HER SAYIDA YENİ BİR HİKAYE · RAFTAN DİLEDİĞİN SAYIYI SEÇ, SAYFALARI HEMEN ÇEVİR'}
          </p>
        </header>

        {/* ── Dijital Raf Bölümü ────────────────────────────────────── */}
        <section className="draf-shelf-section-wrap" aria-label="Dijital Raf">
          <MagazineGrid user={user} isAdmin={isAdmin} />
        </section>

      </div>
    </Layout>
  )
}