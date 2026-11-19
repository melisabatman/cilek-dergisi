import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary yakaladı:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#FFFDF9',
          color: '#1A0A0E',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            background: '#fff',
            border: '2px solid #BE2625',
            borderRadius: '20px',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: '0 15px 40px rgba(190, 38, 37, 0.12)'
          }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🍓</span>
            <h2 style={{ color: '#BE2625', margin: '0 0 0.8rem', fontSize: '1.6rem' }}>
              Sayfa Yüklenirken Bir Sorun Oluştu
            </h2>
            <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 1.5rem' }}>
              Beklenmeyen bir hata meydana geldi. Sayfayı yenileyerek veya ana sayfaya dönerek tekrar deneyebilirsiniz.
            </p>
            {this.state.error && (
              <pre style={{
                background: '#FFF5F6',
                border: '1px solid #F3D8DC',
                padding: '0.8rem 1rem',
                borderRadius: '10px',
                color: '#BE2625',
                fontSize: '0.82rem',
                textAlign: 'left',
                overflowX: 'auto',
                marginBottom: '1.5rem'
              }}>
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  background: '#BE2625',
                  color: '#fff',
                  border: 'none',
                  padding: '0.7rem 1.4rem',
                  borderRadius: '999px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                🔄 Sayfayı Yenile
              </button>
              <a
                href="/"
                style={{
                  background: '#f4f4f4',
                  color: '#333',
                  padding: '0.7rem 1.4rem',
                  borderRadius: '999px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                ← Ana Sayfa
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
