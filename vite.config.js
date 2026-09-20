import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { handleUploadRequest } from './api/upload.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // .env ve .env.local dosyalarındaki tüm değişkenleri Node.js process.env'e yükler (sunucu tarafı)
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    base: '/',
    plugins: [
      react(),
      {
        name: 'vite-plugin-r2-upload',
        configureServer(server) {
          // Geliştirme sunucusunda /api/upload isteklerini karşılar
          server.middlewares.use(async (req, res, next) => {
            const parsedUrl = req.url ? req.url.split('?')[0] : ''
            if (parsedUrl === '/api/upload') {
              try {
                await handleUploadRequest(req, res)
              } catch (err) {
                console.error('[Vite /api/upload error]:', err)
                if (!res.headersSent) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: err.message }))
                }
              }
              return
            }
            next()
          })
        },
      },
    ],
    // envPrefix belirtilmediğinde sadece VITE_ ile başlayan değişkenler client bundle'ına sızabilir.
    // R2_SECRET_ACCESS_KEY ve R2_ACCESS_KEY_ID ASLA istemciye aktarılmaz.
  }
})
