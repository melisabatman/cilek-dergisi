import React from 'react'
import { isR2Configured } from '../../lib/r2'

export default function AdminDashboard({
  magazines = [],
  teamMembers = [],
  quizzes = [],
  comments = [],
  siteState = {},
  setActiveTab,
}) {
  const latestMagazine = magazines[0]
  const latestComment = comments[0]
  const isR2Ready = isR2Configured()

  return (
    <div className="admin-dashboard-view">
      {/* ── Üst Hoş Geldin & Durum Başlığı ───────────────────────── */}
      <div className="admin-dash-welcome-card">
        <div className="dash-welcome-text">
          <span className="dash-eyebrow">🍓 ÇİLEK DERGİSİ EDİTORYAL KONTROL MERKEZİ</span>
          <h2 className="dash-title">Yönetim Paneline Hoş Geldiniz</h2>
          <p className="dash-subtitle">
            Dergilerden testlere, okur yorumlarından kurucu köşesine kadar sitenin tüm dinamiklerini bu merkezden tek tıkla yönetebilirsiniz.
          </p>
        </div>
        <div className="dash-actions">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-dash-primary"
            id="btn-dash-view-site"
          >
            🌐 Canlı Siteyi Görüntüle ↗
          </a>
        </div>
      </div>

      {/* ── İstatistik Özet Kartları ─────────────────────────────── */}
      <div className="admin-stats-grid">
        {/* Kart 1: Dergiler */}
        <div className="admin-stat-card" onClick={() => setActiveTab('magazines')} role="button" tabIndex={0}>
          <div className="stat-card-icon">📚</div>
          <div className="stat-card-info">
            <span className="stat-card-label">Toplam Sayı</span>
            <strong className="stat-card-value">{magazines.length}</strong>
            <span className="stat-card-sub">
              {latestMagazine ? `Son Sayı: #${latestMagazine.issue_number} (${latestMagazine.title})` : 'Henüz sayı yok'}
            </span>
          </div>
          <span className="stat-card-arrow">→</span>
        </div>

        {/* Kart 2: Quiz Club */}
        <div className="admin-stat-card" onClick={() => setActiveTab('quizzes')} role="button" tabIndex={0}>
          <div className="stat-card-icon">🎀</div>
          <div className="stat-card-info">
            <span className="stat-card-label">Quiz Club Testleri</span>
            <strong className="stat-card-value">{quizzes.length}</strong>
            <span className="stat-card-sub">Kişilik testleri & karakter fotoğrafları</span>
          </div>
          <span className="stat-card-arrow">→</span>
        </div>

        {/* Kart 3: Okur Yorumları */}
        <div className="admin-stat-card" onClick={() => setActiveTab('comments')} role="button" tabIndex={0}>
          <div className="stat-card-icon">💬</div>
          <div className="stat-card-info">
            <span className="stat-card-label">Okur Yorumları</span>
            <strong className="stat-card-value">{comments.length}</strong>
            <span className="stat-card-sub">
              {latestComment ? `Son yorum: ${latestComment.user_name || 'Okur'}` : 'Henüz yorum yok'}
            </span>
          </div>
          <span className="stat-card-arrow">→</span>
        </div>

        {/* Kart 4: Ekip & Kurucu */}
        <div className="admin-stat-card" onClick={() => setActiveTab('team')} role="button" tabIndex={0}>
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-info">
            <span className="stat-card-label">Ekip & Kurucu</span>
            <strong className="stat-card-value">{teamMembers.length + 1}</strong>
            <span className="stat-card-sub">
              Kurucu: {siteState.about_founder_name || 'Melisa Batman'}
            </span>
          </div>
          <span className="stat-card-arrow">→</span>
        </div>

        {/* Kart 5: Bulut Depolama R2 */}
        <div className="admin-stat-card stat-system">
          <div className="stat-card-icon">☁️</div>
          <div className="stat-card-info">
            <span className="stat-card-label">Medya & PDF Deposu</span>
            <strong className="stat-card-value" style={{ fontSize: '1.25rem' }}>
              {isR2Ready ? 'Cloudflare R2 Aktif' : 'Yerel / Supabase'}
            </strong>
            <span className="stat-card-sub">Kapaklar, PDF’ler ve fotoğraflar</span>
          </div>
          <button
            type="button"
            className="stat-card-mini-btn"
            onClick={(e) => {
              e.stopPropagation()
              setActiveTab('media')
            }}
          >
            Galeri
          </button>
        </div>
      </div>

      {/* ── Hızlı İşlem Kısayolları ─────────────────────────────────── */}
      <div className="admin-quick-actions-bar">
        <h3 className="quick-actions-title">⚡ Hızlı İşlemler</h3>
        <div className="quick-actions-btns">
          <button
            type="button"
            className="btn-quick-action"
            onClick={() => setActiveTab('magazines')}
          >
            📖 Yeni Dergi Sayısı Yükle
          </button>
          <button
            type="button"
            className="btn-quick-action"
            onClick={() => setActiveTab('quizzes')}
          >
            💅 Quiz Karakter & Sonuçlarını Düzenle
          </button>
          <button
            type="button"
            className="btn-quick-action"
            onClick={() => setActiveTab('comments')}
          >
            💬 Okur Yorumlarını İncele & Modere Et
          </button>
          <button
            type="button"
            className="btn-quick-action"
            onClick={() => setActiveTab('team')}
          >
            🍓 Kurucu Fotoğrafı & Mesajını Güncelle
          </button>
          <button
            type="button"
            className="btn-quick-action"
            onClick={() => setActiveTab('content')}
          >
            ✍️ Ana Sayfa Metinlerini Değiştir
          </button>
          <button
            type="button"
            className="btn-quick-action"
            onClick={() => setActiveTab('announcement')}
          >
            📢 Geri Sayım & Duyuruları Yönet
          </button>
        </div>
      </div>

      {/* ── İki Kolonlu Özet: Son Dergiler & Son Yorumlar ──────────── */}
      <div className="admin-two-col-grid" style={{ marginTop: '2rem' }}>
        {/* Sol Kolon: Son Eklenen Sayılar */}
        <div className="admin-list-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title" style={{ fontSize: '1.35rem' }}>📚 Son Eklenen Sayılar</h3>
              <p className="admin-card-subtitle">Yayındaki son dergi sayıları</p>
            </div>
            <button
              type="button"
              className="btn-admin-table-action"
              onClick={() => setActiveTab('magazines')}
            >
              Tümünü Gör ({magazines.length}) →
            </button>
          </div>

          {magazines.length === 0 ? (
            <p className="empty-state-text">Henüz dergi sayısı eklenmemiş.</p>
          ) : (
            <div className="dash-mini-list">
              {magazines.slice(0, 4).map((m) => (
                <div key={m.id} className="dash-mini-item">
                  <div className="dash-mini-thumb">
                    {m.cover_image_url ? (
                      <img src={m.cover_image_url} alt={m.title} />
                    ) : (
                      <span>#{m.issue_number}</span>
                    )}
                  </div>
                  <div className="dash-mini-meta">
                    <strong>{m.title}</strong>
                    <small>Sayı #{m.issue_number} · {m.published_date || 'Tarih yok'}</small>
                  </div>
                  <button
                    type="button"
                    className="dash-mini-link-btn"
                    onClick={() => setActiveTab('magazines')}
                  >
                    Düzenle
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sağ Kolon: Son Okur Yorumları */}
        <div className="admin-list-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title" style={{ fontSize: '1.35rem' }}>💬 Son Okur Yorumları</h3>
              <p className="admin-card-subtitle">Dergilere gelen son geri bildirimler</p>
            </div>
            <button
              type="button"
              className="btn-admin-table-action"
              onClick={() => setActiveTab('comments')}
            >
              Tümünü Gör ({comments.length}) →
            </button>
          </div>

          {comments.length === 0 ? (
            <p className="empty-state-text">Henüz okur yorumu bulunmuyor.</p>
          ) : (
            <div className="dash-mini-list">
              {comments.slice(0, 4).map((c) => (
                <div key={c.id} className="dash-mini-comment">
                  <div className="dash-comment-head">
                    <span className="dash-comment-author">{c.user_name || 'Gizli Okur'}</span>
                    <span className="dash-comment-date">
                      {new Date(c.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <p className="dash-comment-body">
                    “{c.content ? (c.content.length > 80 ? c.content.slice(0, 80) + '…' : c.content) : ''}”
                  </p>
                  <small className="dash-comment-sub">
                    {c.page_number === 0 ? 'Genel Sayı Yorumu' : `Sayfa ${c.page_number}`}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
