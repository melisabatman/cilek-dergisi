import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function PageCommentsDrawer({
  magazineId,
  activePages = [1],
  user,
  isAdmin = false,
  isOpen,
  onClose,
  onCommentCountChange
}) {
  // Seçili sayfa sekmesi (çift sayfalı görünümde sol veya sağ sayfa seçimi)
  const [selectedPage, setSelectedPage] = useState(activePages[0] || 1)
  const [allComments, setAllComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')

  // Aktif sayfalar değiştikçe seçili sayfayı senkronize et
  useEffect(() => {
    if (!activePages.includes(selectedPage)) {
      setSelectedPage(activePages[0] || 1)
    }
  }, [activePages, selectedPage])

  // Yorumları çek
  const fetchComments = useCallback(async () => {
    if (!magazineId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('page_comments')
        .select('*')
        .eq('magazine_id', magazineId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setAllComments(data)
        onCommentCountChange?.(data.length)
      }
    } catch (err) {
      console.warn('Page comments fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [magazineId, onCommentCountChange])

  useEffect(() => {
    if (isOpen && magazineId) {
      fetchComments()
    }
  }, [isOpen, magazineId, fetchComments])

  // Seçili sayfaya ait yorumlar
  const currentPageComments = allComments.filter(c => c.page_number === selectedPage)

  // Yeni yorum gönderme
  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    if (!user) return

    setSubmitting(true)
    setFeedback('')

    const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Okuyucu'

    try {
      const { data, error } = await supabase
        .from('page_comments')
        .insert({
          magazine_id: magazineId,
          page_number: selectedPage,
          user_id: user.id || null,
          user_name: userName,
          user_email: user.email || '',
          content: newComment.trim(),
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setAllComments(prev => [data, ...prev])
        setNewComment('')
        setFeedback('Yorumunuz sayfaya eklendi! 🍓')
        setTimeout(() => setFeedback(''), 3500)
        onCommentCountChange?.(allComments.length + 1)
      }
    } catch (err) {
      console.error('Submit comment error:', err)
      setFeedback('Yorum gönderilirken bir hata oluştu.')
    } finally {
      setSubmitting(false)
    }
  }

  // Yorum silme
  const handleDeleteComment = async (commentId) => {
    try {
      const { error } = await supabase
        .from('page_comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error
      setAllComments(prev => prev.filter(c => c.id !== commentId))
      onCommentCountChange?.(Math.max(0, allComments.length - 1))
    } catch (err) {
      console.error('Delete comment error:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="comments-drawer-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <aside className="comments-drawer" role="dialog" aria-labelledby="drawer-heading" aria-modal="true">
        {/* Üst Bar */}
        <div className="drawer-header">
          <div className="drawer-header-left">
            <span className="drawer-strawberry-icon">💬</span>
            <div>
              <h3 id="drawer-heading" className="drawer-title">Sayfa Yorumları</h3>
              <p className="drawer-subtitle">
                {activePages.length > 1
                  ? `Sayfa ${activePages.join(' ve ')} için okuyucu düşünceleri`
                  : `Sayfa ${selectedPage} için okuyucu düşünceleri`}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Yorum panelini kapat"
          >
            ✕
          </button>
        </div>

        {/* Çoklu Sayfa Sekmeleri (Masaüstü çift sayfa görünümünde) */}
        {activePages.length > 1 && (
          <div className="drawer-page-tabs" role="tablist" aria-label="Görüntülenen Sayfalar">
            {activePages.map(pageNum => {
              const count = allComments.filter(c => c.page_number === pageNum).length
              return (
                <button
                  key={pageNum}
                  type="button"
                  role="tab"
                  aria-selected={selectedPage === pageNum}
                  className={`drawer-tab-btn ${selectedPage === pageNum ? 'active' : ''}`}
                  onClick={() => setSelectedPage(pageNum)}
                >
                  Sayfa {pageNum}
                  <span className="tab-comment-count">{count}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Yorum Gönderme Formu veya Giriş Çağrısı */}
        <div className="drawer-composer-wrap">
          {user ? (
            <form className="drawer-comment-form" onSubmit={handleCommentSubmit}>
              <div className="composer-user-hint">
                <span className="composer-avatar-letter">
                  {(user.email?.[0] || 'O').toUpperCase()}
                </span>
                <span className="composer-user-label">
                  <strong>Sayfa {selectedPage}</strong> için yorum bırak:
                </span>
              </div>
              <textarea
                className="drawer-comment-textarea"
                rows={3}
                placeholder={`Bu sayfa hakkında ne düşünüyorsun? Bir not, alıntı veya fikir paylaş…`}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                required
              />
              <div className="composer-actions">
                {feedback && <span className="composer-feedback">{feedback}</span>}
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="btn-drawer-send"
                >
                  {submitting ? 'Gönderiliyor…' : 'Yorumu Paylaş 🍓'}
                </button>
              </div>
            </form>
          ) : (
            <div className="drawer-login-prompt">
              <span className="prompt-lock">🔒</span>
              <p>
                <strong>Sayfa {selectedPage}</strong> için yorum yazmak ve diğer okuyucularla etkileşime geçmek için lütfen giriş yapın.
              </p>
              <Link
                to={`/auth?mode=register&redirect=${encodeURIComponent(window.location.pathname)}`}
                className="btn-drawer-login"
                onClick={onClose}
              >
                Giriş Yap / Kayıt Ol →
              </Link>
            </div>
          )}
        </div>

        {/* Yorumlar Listesi */}
        <div className="drawer-comments-body">
          <div className="drawer-body-meta">
            <span className="comments-count-headline">
              Sayfa {selectedPage} Yorumları ({currentPageComments.length})
            </span>
          </div>

          {loading ? (
            <div className="drawer-loading">
              <div className="drawer-spinner" />
              <span>Yorumlar yükleniyor…</span>
            </div>
          ) : currentPageComments.length === 0 ? (
            <div className="drawer-empty-state">
              <span className="empty-book-icon">📖</span>
              <h4>Bu sayfaya henüz yorum yapılmamış.</h4>
              <p>Sayfayı okurken aklına gelen ilk düşünceyi sen paylaş!</p>
            </div>
          ) : (
            <div className="drawer-comments-list" role="list">
              {currentPageComments.map(comment => {
                const isOwner = user?.id && comment.user_id === user.id
                const canDelete = isOwner || isAdmin
                const initial = (comment.user_name?.[0] || comment.user_email?.[0] || 'O').toUpperCase()
                const dateStr = comment.created_at
                  ? new Date(comment.created_at).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : ''

                return (
                  <article key={comment.id} className="drawer-comment-card" role="listitem">
                    <div className="comment-card-top">
                      <div className="comment-author-wrap">
                        <div className="comment-avatar">{initial}</div>
                        <div>
                          <h4 className="comment-author-name">{comment.user_name}</h4>
                          <span className="comment-time">{dateStr}</span>
                        </div>
                      </div>
                      {canDelete && (
                        <button
                          type="button"
                          className="btn-delete-comment"
                          onClick={() => handleDeleteComment(comment.id)}
                          title="Yorumu sil"
                          aria-label="Yorumu sil"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <p className="comment-card-content">{comment.content}</p>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
