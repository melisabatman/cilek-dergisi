import React, { useState } from 'react'
import { getSafeMediaUrl } from '../../lib/r2'

export default function AdminTeam({
  siteState = {},
  handleSiteChange,
  handleSaveSiteContent,
  savingSite,
  teamMembers = [],
  editingMemberId,
  submittingMember,
  deleteConfirmMemberId,
  setDeleteConfirmMemberId,
  memberName,
  setMemberName,
  memberRole,
  setMemberRole,
  memberBio,
  setMemberBio,
  memberOrder,
  setMemberOrder,
  memberPhotoFile,
  setMemberPhotoFile,
  memberPhotoPreview,
  setMemberPhotoPreview,
  memberPhotoUrl,
  setMemberPhotoUrl,
  handleSubmitMember,
  handleStartEditMember,
  resetTeamForm,
  handleDeleteMember,
  uploadingImageKey,
  handleUploadImageForField,
  showFeedback
}) {
  const [activeSection, setActiveSection] = useState('founder') // 'founder' | 'team'

  return (
    <div className="admin-team-manager">
      {/* ── Üst Başlık & Sekmeler ─────────────────────────────────── */}
      <div className="admin-cms-header-row">
        <div>
          <span className="admin-strawberry-badge">👥 İNSAN KAYNAKLARI & VİZYON</span>
          <h2 className="admin-card-title">Kurucu &amp; Ekip Yönetimi</h2>
          <p className="admin-card-subtitle">
            Kurucu Melisa Batman'ın polaroid mesajı ile editoryal ekibin tüm üyelerini buradan tek merkezden yönetin.
          </p>
        </div>
      </div>

      {/* Alt Navigasyon: Kurucu Köşesi vs Editoryal Ekip */}
      <div className="admin-cms-subtabs-nav" style={{ marginTop: '1.5rem', marginBottom: '1.8rem' }}>
        <button
          type="button"
          className={`admin-subtab-btn ${activeSection === 'founder' ? 'active' : ''}`}
          onClick={() => setActiveSection('founder')}
        >
          🍓 Kurucu Köşesi (Melisa Batman)
        </button>
        <button
          type="button"
          className={`admin-subtab-btn ${activeSection === 'team' ? 'active' : ''}`}
          onClick={() => setActiveSection('team')}
        >
          👥 Editoryal Ekip Üyeleri ({teamMembers.length})
        </button>
      </div>

      {/* ── BÖLÜM 1: KURUCU KÖŞESİ (MELISA BATMAN) ────────────────── */}
      {activeSection === 'founder' && (
        <div className="admin-two-col-grid">
          {/* Sol Kolon: Kurucu Bilgileri Formu */}
          <div className="admin-form-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title" style={{ fontSize: '1.4rem' }}>Kurucu Profili &amp; Mesajı</h3>
                <p className="admin-card-subtitle">
                  Anasayfada ve Hakkımızda sayfasında tam boy polaroid kart olarak sergilenen profil.
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSaveSiteContent()
              }}
            >
              <div className="admin-form-row">
                <div className="admin-field-group" style={{ flex: 1 }}>
                  <label className="admin-label">Kurucu Adı Soyadı *</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={siteState.about_founder_name || siteState.about_founder_1_name || ''}
                    onChange={(e) => {
                      handleSiteChange('about_founder_name', e.target.value)
                      handleSiteChange('about_founder_1_name', e.target.value)
                    }}
                    placeholder="Örn: Melisa Batman"
                    required
                  />
                </div>
                <div className="admin-field-group" style={{ flex: 1 }}>
                  <label className="admin-label">Kurucu Unvanı *</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={siteState.about_founder_role || siteState.about_founder_1_role || ''}
                    onChange={(e) => {
                      handleSiteChange('about_founder_role', e.target.value)
                      handleSiteChange('about_founder_1_role', e.target.value)
                    }}
                    placeholder="Örn: Kurucu & Genel Yayın Yönetmeni"
                    required
                  />
                </div>
              </div>

              {/* Kurucu Fotoğrafı Yükleme */}
              <div className="admin-field-group" style={{ marginTop: '0.8rem' }}>
                <label className="admin-label">📸 Kurucu Fotoğrafı (R2 Bulut Depolama)</label>
                <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ width: '90px', height: '110px', borderRadius: '10px', overflow: 'hidden', border: '2px solid rgba(0,0,0,0.1)', background: '#F8E9EB', flexShrink: 0 }}>
                    {siteState.about_founder_photo_url ? (
                      <img
                        src={getSafeMediaUrl(siteState.about_founder_photo_url)}
                        alt="Kurucu"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                        🍓
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <input
                      type="text"
                      className="admin-input"
                      value={siteState.about_founder_photo_url || ''}
                      onChange={(e) => handleSiteChange('about_founder_photo_url', e.target.value)}
                      placeholder="Görsel linki girin veya aşağıdan dosya seçin..."
                      style={{ marginBottom: '0.6rem' }}
                    />
                    <label className="btn-admin-upload" style={{ cursor: 'pointer', display: 'inline-block' }}>
                      {uploadingImageKey === 'about_founder_photo_url' ? '⏳ Cloudflare R2\'ye Yükleniyor…' : '📁 Yeni Kurucu Fotoğrafı Yükle (R2)'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={uploadingImageKey === 'about_founder_photo_url'}
                        onChange={(e) => handleUploadImageForField('about_founder_photo_url', e.target.files?.[0], 'founder')}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Kurucu Mesajı / Manifestosu */}
              <div className="admin-field-group" style={{ marginTop: '0.8rem' }}>
                <label className="admin-label">Kurucunun Mesajı / Manifestosu (Alıntı Kutusu)</label>
                <textarea
                  rows={3}
                  className="admin-textarea"
                  value={siteState.about_founder_quote || ''}
                  onChange={(e) => handleSiteChange('about_founder_quote', e.target.value)}
                  placeholder="Gençliğin enerjisi, tutkusu ve anlatacak cesur hikâyeleri kalıplara sığmaz…"
                />
              </div>

              {/* Kurucu Biyografisi */}
              <div className="admin-field-group">
                <label className="admin-label">Kurucu Biyografisi / Editoryal Açıklama</label>
                <textarea
                  rows={4}
                  className="admin-textarea"
                  value={siteState.about_founder_bio || ''}
                  onChange={(e) => handleSiteChange('about_founder_bio', e.target.value)}
                  placeholder="Bağımsız bir gençlik yayını olarak derginin editoryal kimliğini…"
                />
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  className="btn-admin-primary"
                  disabled={savingSite}
                  style={{ width: '100%', padding: '0.9rem' }}
                >
                  {savingSite ? '⏳ Kaydediliyor…' : '💾 Kurucu Bilgilerini Kaydet'}
                </button>
              </div>
            </form>
          </div>

          {/* Sağ Kolon: Canlı Önizleme Kartı */}
          <div className="admin-list-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: '#FFFDF9' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.15em', color: '#BE2625', textTransform: 'uppercase', marginBottom: '1rem' }}>
              CANLI ÖNİZLEME (POLAROID GÖRÜNÜMÜ)
            </span>

            <div style={{ background: '#fff', padding: '1.2rem 1.2rem 1.8rem', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid #eee', width: '100%', maxWidth: '340px' }}>
              <div style={{ width: '100%', height: '340px', borderRadius: '8px', overflow: 'hidden', background: '#f5f5f5', marginBottom: '1.2rem' }}>
                {siteState.about_founder_photo_url ? (
                  <img
                    src={getSafeMediaUrl(siteState.about_founder_photo_url)}
                    alt="Kurucu"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                    🍓
                  </div>
                )}
              </div>
              <h4 style={{ margin: '0 0 0.3rem', fontSize: '1.35rem', fontWeight: 900, color: 'var(--burgundy)' }}>
                {siteState.about_founder_name || 'Melisa Batman'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#BE2625' }}>
                {siteState.about_founder_role || 'Kurucu & Genel Yayın Yönetmeni'}
              </p>
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#FFF5F6', borderRadius: '12px', border: '1px dashed #F3D8DC', textAlign: 'left', width: '100%', maxWidth: '340px' }}>
              <small style={{ fontWeight: 800, color: '#BE2625' }}>Sözü:</small>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.88rem', fontStyle: 'italic', color: '#555' }}>
                {siteState.about_founder_quote || 'Henüz alıntı eklenmemiş.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── BÖLÜM 2: EDİTORYAL EKİP ÜYELERİ ─────────────────────── */}
      {activeSection === 'team' && (
        <div className="admin-two-col-grid">
          {/* Sol Kolon: Form */}
          <div className="admin-form-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title" style={{ fontSize: '1.4rem' }}>
                  {editingMemberId ? `Üyeyi Düzenle (${memberName})` : 'Yeni Ekip Üyesi Ekle'}
                </h3>
                <p className="admin-card-subtitle">Ekibimiz sayfasında ve ana sayfada yer alan yaratıcı kadro.</p>
              </div>
              {editingMemberId && (
                <button
                  type="button"
                  className="btn-cancel-edit"
                  onClick={resetTeamForm}
                >
                  İptal
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitMember}>
              <div className="admin-form-row">
                <div className="admin-field-group" style={{ flex: 1 }}>
                  <label className="admin-label">İsim Soyisim *</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="Örn: Aslı Yılmaz"
                    required
                  />
                </div>
                <div className="admin-field-group" style={{ flex: '0 0 100px' }}>
                  <label className="admin-label">Sıra No</label>
                  <input
                    type="number"
                    min="1"
                    className="admin-input"
                    value={memberOrder}
                    onChange={(e) => setMemberOrder(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-field-group">
                <label className="admin-label">Rolü / Görevi *</label>
                <input
                  type="text"
                  className="admin-input"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  placeholder="Örn: Sanat Yönetmeni & İllüstrasyon"
                  required
                />
              </div>

              <div className="admin-field-group">
                <label className="admin-label">Kısa Biyografi / Tanıtım</label>
                <textarea
                  rows={3}
                  className="admin-textarea"
                  value={memberBio}
                  onChange={(e) => setMemberBio(e.target.value)}
                  placeholder="Dergideki sorumluluğu veya editoryal vizyonu…"
                />
              </div>

              {/* Fotoğraf Yükleme */}
              <div className="admin-field-group">
                <label className="admin-label">Fotoğraf (Cloudflare R2)</label>
                <div className="admin-dropzone" style={{ minHeight: '120px' }}>
                  {memberPhotoPreview ? (
                    <div className="upload-preview-wrap">
                      <img src={memberPhotoPreview} alt="Önizleme" className="member-avatar-preview" />
                      <button
                        type="button"
                        className="btn-remove-preview"
                        onClick={() => {
                          setMemberPhotoFile(null)
                          setMemberPhotoPreview('')
                          setMemberPhotoUrl('')
                        }}
                      >
                        Fotoğrafı Kaldır
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="member-photo-file-upload" className="dropzone-label">
                      <span className="dropzone-icon">📸</span>
                      <span className="dropzone-text">Fotoğraf Seç veya Sürükle</span>
                      <span className="dropzone-sub">Kare veya portre görsel</span>
                    </label>
                  )}
                  <input
                    id="member-photo-file-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setMemberPhotoFile(file)
                        setMemberPhotoPreview(URL.createObjectURL(file))
                      }
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.2rem' }}>
                <button
                  type="submit"
                  className="btn-admin-primary"
                  disabled={submittingMember}
                  style={{ width: '100%', padding: '0.85rem' }}
                >
                  {submittingMember ? '⏳ Kaydediliyor…' : (editingMemberId ? 'Güncellemeleri Kaydet' : '➕ Ekip Üyesini Ekle')}
                </button>
              </div>
            </form>
          </div>

          {/* Sağ Kolon: Ekip Listesi */}
          <div className="admin-list-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title" style={{ fontSize: '1.4rem' }}>Mevcut Ekip Kadrosu ({teamMembers.length})</h3>
                <p className="admin-card-subtitle">Yayındaki ekip üyeleri ve sıralamaları</p>
              </div>
            </div>

            {teamMembers.length === 0 ? (
              <p className="empty-state-text">Henüz ekip üyesi eklenmemiş.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.9rem 1.2rem',
                      background: '#FFFDF9',
                      border: '1px solid rgba(190, 38, 37, 0.12)',
                      borderRadius: '12px'
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#BE2625', minWidth: '24px' }}>
                      #{member.order_index || 0}
                    </span>

                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', background: '#eee', flexShrink: 0 }}>
                      {member.photo_url ? (
                        <img src={member.photo_url} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: 'block', fontSize: '0.96rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {member.name}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: '#666' }}>{member.role}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="btn-table-edit"
                        style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
                        onClick={() => handleStartEditMember(member)}
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        className="btn-table-del"
                        style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
                        onClick={() => handleDeleteMember(member.id)}
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
