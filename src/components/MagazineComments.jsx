import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function MagazineComments({
  magazineId,
  issueTitle = 'Bu Sayı',
  user,
  isAdmin = false,
  currentPage = 1,
}) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [commentPageNum, setCommentPageNum] = useState(0) // 0 = Genel Sayı Yorumu
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')

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
        setComments(data)
      }
    } catch (err) {
      console.warn('Comments fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [magazineId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  // Sayfa değiştikçe eğer istenirse formun sayfa numarasını güncelle
  useEffect(() => {
    if (currentPage && currentPage > 0) {
      // Varsayılan olarak genel veya aktif sayfa seçilebilir
    }
  }, [currentPage])

  // Yeni yorum gönderme
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    if (!user) return

    setSubmitting(true)
    setFeedback('')

    const userName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Çilek Okuru'

    try {
      const payload = {
        magazine_id: magazineId,
        page_number: parseInt(commentPageNum, 10) || 1,
        user_id: user.id || null,
        user_name: userName,
        user_email: user.email || '',
        content: newComment.trim(),
      }

      const { data, error } = await supabase
        .from('page_comments')
        .insert(payload)
        .select()
        .single()

      if (error) throw error

      if (data) {
        setComments((prev) => [data, ...prev])
        setNewComment('')
        setFeedback('Düşünceniz sayfaya eklendi! Teşekkürler 🍓')
        setTimeout(() => setFeedback(''), 4000)
      }
    } catch (err) {
      console.error('Submit comment error:', err)
      setFeedback('Yorum gönderilirken bir sorun oluştu. Lütfen tekrar deneyin.')
    } finally {
      setSubmitting(false)
    }
  }

  // Yorum silme (Sadece Admin)
  const handleDelete = async (commentId) => {
    if (!isAdmin) return
    if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('page_comments')
        .delete()
        .eq('id', commentId)

      if (!error) {
        setComments((prev) => prev.filter((c) => c.id !== commentId))
      }
    } catch (err) {
      console.warn('Delete comment error:', err)
    }
  }

  const formatDate = (isoStr) => {
    if (!isoStr) return ''
    try {
      const d = new Date(isoStr)
      return d.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  return (
    <section className="mag-comments-section" id="issue-comments-section" aria-label="Okur Yorumları">
      <div className="mag-comments-inner">
        {/* Başlık */}
        <div className="mag-comments-header">
          <div className="mag-comments-title-wrap">
            <span className="mag-comments-eyebrow">💬 Fikirler & Sayfa Notları</span>
            <h3 className="mag-comments-title">
              Okur Yorumları <span className="mag-comments-count">({comments.length})</span>
            </h3>
          </div>
          <p className="mag-comments-sub">
            {issueTitle} hakkındaki izlenimlerini, beğendiğin alıntıları ve duygularını diğer okurlarla paylaş.
          </p>
        </div>

        {/* Yorum Gönderme Formu */}
        <div className="mag-comment-form-card">
          {user ? (
            <form onSubmit={handleSubmit} className="mag-comment-form">
              <div className="mag-comment-form-top">
                <div className="mag-comment-user-chip">
                  <span className="mag-comment-avatar">
                    {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
                  </span>
                  <div className="mag-comment-user-meta">
                    <strong>
                      {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]}
                    </strong>
                    <small>{user.email}</small>
                  </div>
                </div>

                <div className="mag-comment-page-select-wrap">
                  <label htmlFor="comment-page-sel" className="mag-comment-sel-label">
                    İlgili Bölüm:
                  </label>
                  <select
                    id="comment-page-sel"
                    className="mag-comment-page-sel"
                    value={commentPageNum}
                    onChange={(e) => setCommentPageNum(Number(e.target.value))}
                  >
                    <option value={0}>Tüm Sayı (Genel)</option>
                    {currentPage > 0 && (
                      <option value={currentPage}>Şu An Okunan Sayfa (#{currentPage})</option>
                    )}
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Sayfa #{i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <textarea
                className="mag-comment-textarea"
                rows={3}
                placeholder="Bu sayı veya sayfalar hakkında bir şeyler yaz... Hangi yazı seni etkiledi?"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />

              <div className="mag-comment-form-bottom">
                {feedback && <span className="mag-comment-feedback">{feedback}</span>}
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="mag-comment-submit-btn"
                >
                  {submitting ? 'Gönderiliyor…' : 'Yorumu Paylaş 🍓'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mag-comment-auth-prompt">
              <div className="mag-comment-auth-icon">🍓</div>
              <div className="mag-comment-auth-texts">
                <strong>Bu sayıya yorum bırakmak için aramıza katıl!</strong>
                <p>Okuma deneyimini paylaşmak ve diğer okurlarla sohbet etmek için giriş yap veya üye ol.</p>
              </div>
              <Link to="/auth" className="mag-comment-login-btn">
                Giriş Yap / Kaydol →
              </Link>
            </div>
          )}
        </div>

        {/* Yorumlar Listesi */}
        <div className="mag-comments-list" role="feed" aria-label="Yorumlar listesi">
          {loading ? (
            <div className="mag-comments-loading">
              <div className="reader-spinner" style={{ width: 28, height: 28 }} />
              <span>Yorumlar yükleniyor…</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="mag-comments-empty">
              <span className="mag-comments-empty-icon">📖</span>
              <strong>Henüz yorum yapılmamış</strong>
              <p>Bu sayıya ilk düşünceyi sen iliştir! Sayfaların hatırasını birlikte büyütelim.</p>
            </div>
          ) : (
            comments.map((c) => (
              <article key={c.id} className="mag-comment-item">
                <div className="mag-comment-item-header">
                  <div className="mag-comment-author-wrap">
                    <span className="mag-comment-item-avatar">
                      {(c.user_name || 'O')[0].toUpperCase()}
                    </span>
                    <div>
                      <strong className="mag-comment-author-name">{c.user_name || 'Çilek Okuru'}</strong>
                      <span className="mag-comment-date">{formatDate(c.created_at)}</span>
                    </div>
                  </div>

                  <div className="mag-comment-item-meta">
                    {c.page_number && c.page_number > 0 ? (
                      <span className="mag-comment-page-badge">Sayfa #{c.page_number}</span>
                    ) : (
                      <span className="mag-comment-page-badge mag-comment-badge-general">Genel</span>
                    )}

                    {isAdmin && (
                      <button
                        type="button"
                        className="mag-comment-delete-btn"
                        onClick={() => handleDelete(c.id)}
                        title="Yorumu Sil (Yönetici)"
                        aria-label="Yorumu Sil"
                      >
                        Sil
                      </button>
                    )}
                  </div>
                </div>

                <p className="mag-comment-body">{c.content}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
