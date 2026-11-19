import React from 'react'

export default function AdminGeneralSettings({
  siteState = {},
  handleSiteChange,
  handleSaveSiteContent,
  savingSite,
  showFeedback
}) {
  return (
    <div className="admin-general-settings-manager">
      <div className="admin-cms-header-row">
        <div>
          <span className="admin-strawberry-badge">⚙️ SİTE &amp; İLETİŞİM AYARLARI</span>
          <h2 className="admin-card-title">Genel Ayarlar, SEO &amp; Sosyal Medya</h2>
          <p className="admin-card-subtitle">
            Marka ismi, iletişim e-postası, sosyal medya hesapları, SEO başlıkları ve telif metinleri.
          </p>
        </div>
        <button
          type="button"
          className="btn-admin-primary"
          onClick={handleSaveSiteContent}
          disabled={savingSite}
        >
          {savingSite ? '⏳ Kaydediliyor…' : '💾 Ayarları Kaydet'}
        </button>
      </div>

      <div className="admin-two-col-grid" style={{ marginTop: '1.8rem' }}>
        {/* Sol Kolon: Marka & SEO */}
        <div className="admin-form-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title" style={{ fontSize: '1.35rem' }}>🍓 Marka Kimliği &amp; SEO</h3>
              <p className="admin-card-subtitle">Arama motorları ve tarayıcı sekmeleri için temel bilgiler</p>
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-field-group" style={{ flex: 1 }}>
              <label className="admin-label">Marka Adı</label>
              <input
                type="text"
                className="admin-input"
                value={siteState.brand_name || 'Çilek Dergisi'}
                onChange={(e) => handleSiteChange('brand_name', e.target.value)}
              />
            </div>
            <div className="admin-field-group" style={{ flex: '0 0 140px' }}>
              <label className="admin-label">Alt Etiket</label>
              <input
                type="text"
                className="admin-input"
                value={siteState.brand_sub || 'DERGİ'}
                onChange={(e) => handleSiteChange('brand_sub', e.target.value)}
              />
            </div>
          </div>

          <div className="admin-field-group">
            <label className="admin-label">Arama Motoru Başlığı (SEO Title)</label>
            <input
              type="text"
              className="admin-input"
              value={siteState.site_seo_title || ''}
              onChange={(e) => handleSiteChange('site_seo_title', e.target.value)}
              placeholder="Çilek Dergisi — Bağımsız Dijital Gençlik, Kültür & Edebiyat Dergisi"
            />
          </div>

          <div className="admin-field-group">
            <label className="admin-label">SEO Açıklaması (Meta Description)</label>
            <textarea
              rows={3}
              className="admin-textarea"
              value={siteState.site_seo_desc || ''}
              onChange={(e) => handleSiteChange('site_seo_desc', e.target.value)}
              placeholder="15-25 yaş kuşağı için sınırları kaldıran bağımsız dijital kültür, sanat, edebiyat ve estetik durağı."
            />
          </div>

          <div className="admin-field-group">
            <label className="admin-label">Footer Kapanış Manifestosu</label>
            <input
              type="text"
              className="admin-input"
              value={siteState.footer_manifesto || ''}
              onChange={(e) => handleSiteChange('footer_manifesto', e.target.value)}
              placeholder="“Gençliğin anlatacak güçlü, sahici ve kıvılcım dolu bir hikâyesi var!”"
            />
          </div>

          <div className="admin-field-group">
            <label className="admin-label">Telif Hakkı Metni</label>
            <input
              type="text"
              className="admin-input"
              value={siteState.footer_copyright || ''}
              onChange={(e) => handleSiteChange('footer_copyright', e.target.value)}
              placeholder="© 2026 Çilek Dergi. Tüm hakları saklıdır."
            />
          </div>
        </div>

        {/* Sağ Kolon: İletişim & Sosyal Medya */}
        <div className="admin-form-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title" style={{ fontSize: '1.35rem' }}>📫 İletişim Kanalları &amp; Sosyal Medya</h3>
              <p className="admin-card-subtitle">Okuyucu ve yazar başvurularının geleceği iletişim adresleri</p>
            </div>
          </div>

          <div className="admin-field-group">
            <label className="admin-label">Resmi İletişim &amp; Başvuru E-postası *</label>
            <input
              type="email"
              className="admin-input"
              value={siteState.contact_email || ''}
              onChange={(e) => handleSiteChange('contact_email', e.target.value)}
              placeholder="hello@cilekdergisi.com"
              required
            />
            <small style={{ color: '#888', marginTop: '4px', display: 'block' }}>
              İletişim sayfasındaki "E-posta Gönder" butonları bu adrese yönlendirilir.
            </small>
          </div>

          <div className="admin-field-group">
            <label className="admin-label">Telefon / WhatsApp Numarası</label>
            <input
              type="text"
              className="admin-input"
              value={siteState.contact_phone || ''}
              onChange={(e) => handleSiteChange('contact_phone', e.target.value)}
              placeholder="+90 555 000 00 00"
            />
          </div>

          <div className="admin-field-group">
            <label className="admin-label">Şehir / Lokasyon</label>
            <input
              type="text"
              className="admin-input"
              value={siteState.contact_address || ''}
              onChange={(e) => handleSiteChange('contact_address', e.target.value)}
              placeholder="Kadıköy, İstanbul"
            />
          </div>

          <div className="admin-field-group" style={{ marginTop: '1.2rem' }}>
            <label className="admin-label">📸 Instagram Profili Linki</label>
            <input
              type="url"
              className="admin-input"
              value={siteState.social_instagram_url || ''}
              onChange={(e) => handleSiteChange('social_instagram_url', e.target.value)}
              placeholder="https://instagram.com/cilekdergisi"
            />
          </div>

          <div className="admin-field-group">
            <label className="admin-label">🎵 TikTok Profili Linki</label>
            <input
              type="url"
              className="admin-input"
              value={siteState.social_tiktok_url || ''}
              onChange={(e) => handleSiteChange('social_tiktok_url', e.target.value)}
              placeholder="https://tiktok.com/@cilekdergisi"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
