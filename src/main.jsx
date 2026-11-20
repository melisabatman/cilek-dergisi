import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Mobil iOS Safari ve Android BFCache (Back-Forward Cache) Donma Önleyici
if (typeof window !== 'undefined') {
  window.addEventListener('pageshow', (event) => {
    // Sayfa tarayıcı önbelleğinden (dondurulmuş bellekten) geldiyse tazelemek için yeniden yükle
    if (event.persisted) {
      window.location.reload()
    }
  })

  // Eski v1/v2/v3 yerel depolama kalıntılarını temizle (böylece mobilde eski ayarlar kalmaz)
  try {
    const CURRENT_VERSION = 'v5'
    const storedVersion = localStorage.getItem('cilek_app_cache_version')
    if (storedVersion !== CURRENT_VERSION) {
      localStorage.removeItem('cilek_site_settings_v1')
      localStorage.removeItem('cilek_site_settings_v2')
      localStorage.removeItem('cilek_site_settings_v3')
      localStorage.setItem('cilek_app_cache_version', CURRENT_VERSION)
    }
  } catch (_) {}
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
