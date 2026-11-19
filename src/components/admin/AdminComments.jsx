import React, { useState, useMemo } from 'react'

export default function AdminComments({
  comments = [],
  magazines = [],
  onDeleteComment,
  onRefresh,
  showFeedback
}) {
  const [selectedMagId, setSelectedMagId] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  // Filtrelenmiş yorumlar
  const filteredComments = useMemo(() => {
    return comments.filter((c) => {
      // Sayı filtresi
      if (selectedMagId !== 'all' && c.magazine_id !== selectedMagId) {
        return false
      }
      // Arama filtresi
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const nameMatch = (c.user_name || '').toLowerCase().includes(q)
        const emailMatch = (c.user_email || '').toLowerCase().includes(q)
        const contentMatch = (c.content || '').toLowerCase().includes(q)
        if (!nameMatch && !emailMatch && !contentMatch) return false
      }
      return true
    })
  }, [comments, selectedMagId, searchQuery])

  // Dergi başlığını bul
  const getMagTitle = (magId) => {
    const mag = magazines.find(m => m.id === magId)
    if (!mag) return 'Bilinmeyen Sayı'
    return `Sayı #${mag.issue_number} — ${mag.title}`
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu yorumu kalıcı olarak silmek istediğinize emin misiniz?')) {
      return
    }
    setDeletingId(id)
    try {
      await onDeleteComment(id)
      showFeedback('success', 'Yorum başarıyla silindi.')
    } catch (err) {
      showFeedback('error', 'Yorum silinirken hata oluştu: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="admin-comments-manager">
      {/* ── Üst Başlık & Eylemler ─────────────────────────────────── */}
      <div className="admin-cms-header-row">
        <div>
          <span className="admin-strawberry-badge">💬 OKUR ETKİLEŞİMİ</span>
          <h2 className="admin-card-title">Dergi Sayfa Yorumları Moderasyonu</h2>
          <p className="admin-card-subtitle">
            Okuyucuların dergilerin sayfalarına veya genel sayıya bıraktığı tüm yorumları inceleyin, filtreleyin ve gerektiğinde silin.
          </p>
        </div>
        <button
          type="button"
          className="btn-admin-table-action"
          onClick={onRefresh}
        >
          🔄 Yorumları Yenile ({comments.length})
        </button>
      </div>

      {/* ── Filtre Çubuğu ─────────────────────────────────────────── */}
      <div className="admin-comments-filter-bar" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '240px' }}>
          <input
            type="text"
            className="admin-input"
            placeholder="Yorum içinde, okur adında veya e-postasında ara…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ width: '260px' }}>
          <select
            className="admin-select"
            value={selectedMagId}
            onChange={(e) => setSelectedMagId(e.target.value)}
          >
            <option value="all">Tüm Sayılar ({comments.length})</option>
            {magazines.map((m) => {
              const count = comments.filter(c => c.magazine_id === m.id).length
              return (
                <option key={m.id} value={m.id}>
                  Sayı #{m.issue_number} — {m.title} ({count})
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {/* ── Yorum Listesi ─────────────────────────────────────────── */}
      {filteredComments.length === 0 ? (
        <div className="admin-empty-state" style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#FFFDF9', borderRadius: '16px', border: '1.5px dashed rgba(190, 38, 37, 0.2)' }}>
          <span style={{ fontSize: '2.5rem' }}>💬</span>
          <h3 style={{ margin: '0.8rem 0 0.3rem', color: 'var(--burgundy)' }}>
            {searchQuery || selectedMagId !== 'all' ? 'Aramanıza uygun yorum bulunamadı' : 'Henüz okur yorumu bulunmuyor'}
          </h3>
          <p style={{ color: '#888', fontSize: '0.92rem' }}>
            Okuyucular dergi sayfalarına yorum bıraktıkça burada listelenecektir.
          </p>
        </div>
      ) : (
        <div className="admin-comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="admin-form-card"
              style={{
                padding: '1.4rem 1.8rem',
                borderRadius: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1.5rem',
                flexWrap: 'wrap'
              }}
            >
              {/* Sol: Yorum Detayları */}
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--color-text-dark)' }}>
                    {comment.user_name || 'İsimsiz Okur'}
                  </strong>
                  <span style={{ fontSize: '0.82rem', color: '#777' }}>
                    ({comment.user_email || 'E-posta yok'})
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      background: 'rgba(190, 38, 37, 0.08)',
                      color: 'var(--color-primary)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px'
                    }}
                  >
                    {getMagTitle(comment.magazine_id)} · {comment.page_number === 0 ? 'Genel Yorum' : `Sayfa #${comment.page_number}`}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#999', marginLeft: 'auto' }}>
                    {new Date(comment.created_at).toLocaleString('tr-TR')}
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.6', color: '#333', background: '#FFF9F6', padding: '0.8rem 1rem', borderRadius: '10px', borderLeft: '3px solid var(--color-primary)' }}>
                  “{comment.content}”
                </p>
              </div>

              {/* Sağ: Sil Butonu */}
              <div>
                <button
                  type="button"
                  className="btn-table-del"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.86rem' }}
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletingId === comment.id}
                >
                  {deletingId === comment.id ? '⏳ Siliniyor…' : '🗑️ Yorumu Sil'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
