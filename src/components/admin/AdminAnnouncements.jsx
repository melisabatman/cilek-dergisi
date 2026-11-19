import React from 'react'

export default function AdminAnnouncements({
  siteState = {},
  handleSiteChange,
  handleSaveSiteContent,
  savingSite,
  showFeedback
}) {
  return (
    <div className="admin-announcements-manager">
      <div className="admin-cms-header-row">
        <div>
          <span className="admin-strawberry-badge">📢 DUYURU & ZAMANLAYICILAR</span>
          <h2 className="admin-card-title">Duyurular &amp; Geri Sayım Sayacı</h2>
          <p className="admin-card-subtitle">
            Bir sonraki dergi sayısının geri sayım sayacını, üst duyuru çubuğunu ve anasayfa kayan yazı şeridini buradan yönetin.
          </p>
        </div>
        <button
          type="button"
          className="btn-admin-primary"
          onClick={handleSaveSiteContent}
          disabled={savingSite}
        >
          {savingSite ? '⏳ Kaydediliyor…' : '💾 Duyuru Ayarlarını Kaydet'}
        </button>
      </div>

      <div className="admin-two-col-grid" style={{ marginTop: '1.8rem' }}>
        {/* Sol Kolon: Yeni Sayı Geri Sayım Sayacı */}
        <div className="admin-form-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title" style={{ fontSize: '1.35rem' }}>⏳ Yeni Sayı Geri Sayım Sayacı</h3>
              <p className="admin-card-subtitle">Ana sayfada yer alan geri sayım sayacı modülü</p>
            </div>
            {/* Açık/Kapalı Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 800 }}>
              <input
                type="checkbox"
                checked={siteState.countdown_is_active ?? true}
                onChange={(e) => handleSiteChange('countdown_is_active', e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#BE2625' }}
              />
              <span style={{ color: siteState.countdown_is_active ? '#BE2625' : '#888' }}>
                {siteState.countdown_is_active ? 'Geri Sayım AKTİF' : 'PASİF (Gizli)'}
              </span>
            </label>
          </div>

          <div className="admin-field-group">
            <label className="admin-label">Hedef Çıkış Tarihi ve Saati *</label>
            <input
              type="datetime-local"
              className="admin-input"
              value={siteState.countdown_target_date || '2026-12-01T12:00'}
              onChange={(e) => handleSiteChange('countdown_target_date', e.target.value)}
            />
          </div>

          <div className="admin-field-group">
            <label className="admin-label">Sayaç Üst Rozeti</label>
            <input
              type="text"
              className="admin-input"
              value={siteState.countdown_badge || ''}
              onChange={(e) => handleSiteChange('countdown_badge', e.target.value)}
              placeholder="Örn: BİR SONRAKİ SAYI GELİYOR"
            />
          </div>

          <div className="admin-field-group">
            <label className="admin-label">Sayaç Başlığı</label>
            <input
              type="text"
              className="admin-input"
              value={siteState.countdown_title || ''}
              onChange={(e) => handleSiteChange('countdown_title', e.target.value)}
              placeholder="Örn: Sayı 02 — Kök & Bahar İçin Geri Sayım!"
            />
          </div>

          <div className="admin-field-group">
            <label className="admin-label">Sayaç Alt Açıklaması</label>
            <textarea
              rows={3}
              className="admin-textarea"
              value={siteState.countdown_subtitle || ''}
              onChange={(e) => handleSiteChange('countdown_subtitle', e.target.value)}
              placeholder="Yeni sayımız matbaada hazırlanıyor…"
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-field-group" style={{ flex: 1 }}>
              <label className="admin-label">Buton Metni</label>
              <input
                type="text"
                className="admin-input"
                value={siteState.countdown_btn_text || ''}
                onChange={(e) => handleSiteChange('countdown_btn_text', e.target.value)}
                placeholder="Örn: Bize Katıl / İçerik Gönder →"
              />
            </div>
            <div className="admin-field-group" style={{ flex: 1 }}>
              <label className="admin-label">Buton Linki</label>
              <input
                type="text"
                className="admin-input"
                value={siteState.countdown_btn_link || ''}
                onChange={(e) => handleSiteChange('countdown_btn_link', e.target.value)}
                placeholder="/iletisim"
              />
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Kayan Yazı & Üst Duyuru Çubuğu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
          {/* 1. Üst Duyuru Çubuğu */}
          <div className="admin-form-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title" style={{ fontSize: '1.35rem' }}>✨ Üst Duyuru Bandı</h3>
                <p className="admin-card-subtitle">Sitenin en tepesindeki koyu bordo şerit metni</p>
              </div>
            </div>

            <div className="admin-field-group">
              <label className="admin-label">Duyuru Metni</label>
              <input
                type="text"
                className="admin-input"
                value={siteState.announcement_text || ''}
                onChange={(e) => handleSiteChange('announcement_text', e.target.value)}
                placeholder="Hey Chaps! Welcome to Çilek Dergisi 🍓"
              />
            </div>
          </div>

          {/* 2. Ana Sayfa Kayan Yazı Şeridi */}
          <div className="admin-form-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title" style={{ fontSize: '1.35rem' }}>🎞️ Kayan Yazı (Marquee) Şeridi</h3>
                <p className="admin-card-subtitle">Ana sayfadaki animasyonlu akan duyuru yazısı</p>
              </div>
            </div>

            <div className="admin-field-group">
              <label className="admin-label">Kayan Yazı Metni</label>
              <textarea
                rows={3}
                className="admin-textarea"
                value={siteState.hero_marquee || ''}
                onChange={(e) => handleSiteChange('hero_marquee', e.target.value)}
                placeholder="Sayı 06 Yayında · Şimdi Oku · Her Ay Yepyeni Bir Macera · Genç, Özgür, Bağımsız! · Çilek Dergisi · "
              />
              <small style={{ color: '#888', marginTop: '4px', display: 'block' }}>
                İpucu: Kelimelerin arasına " · " işareti koyarak akıcı ve şık bir görünüm elde edebilirsiniz.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
