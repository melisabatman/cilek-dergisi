import React, { useEffect, useRef } from 'react'

/**
 * Pixel Sparkle Trail (Y2K Aesthetic)
 * Fare hareket ettikçe imlecin ardından minik pixel pembe kıvılcım yıldızları bırakır.
 */
export default function PixelSparkleTrail() {
  const canvasRef = useRef(null)

  useEffect(() => {
    // Sadece fare (mouse/trackpad) kullanan cihazlarda çalışsın, dokunmatikte batarya/performans yemez
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const sparkles = []
    const colors = ['#FF2E93', '#FFAFD7', '#FFFFFF', '#BE2625', '#FF69B4']
    let lastTime = 0
    let animId

    // 5-kanatlı pixel yıldız (★) çizimi
    const drawPixelStar = (context, x, y, size, color, alpha) => {
      context.save()
      context.globalAlpha = Math.max(0, Math.min(1, alpha))
      context.fillStyle = color
      const s = Math.max(1, Math.round(size))
      const px = Math.round(x)
      const py = Math.round(y)

      // Merkez gövde
      context.fillRect(px - s, py - s, s * 2, s * 2)

      // 1. Üst kanat (tepe noktası)
      context.fillRect(px, Math.round(py - s * 2.2), s, Math.round(s * 1.4))

      // 2. Sol üst kanat
      context.fillRect(Math.round(px - s * 2.2), Math.round(py - s * 0.5), Math.round(s * 1.4), s)

      // 3. Sağ üst kanat
      context.fillRect(Math.round(px + s * 1.0), Math.round(py - s * 0.5), Math.round(s * 1.4), s)

      // 4. Sol alt kanat
      context.fillRect(Math.round(px - s * 1.6), Math.round(py + s * 1.2), Math.round(s * 1.1), Math.round(s * 1.1))

      // 5. Sağ alt kanat
      context.fillRect(Math.round(px + s * 0.7), Math.round(py + s * 1.2), Math.round(s * 1.1), Math.round(s * 1.1))

      // Beyaz kıvılcım çekirdeği
      context.fillStyle = '#FFFFFF'
      context.fillRect(px, py, s, s)
      context.restore()
    }

    const onMouseMove = (e) => {
      const now = performance.now()
      if (now - lastTime < 35) return // Aşırı sık üretimi sınırla (~30fps spark)
      lastTime = now

      // Fare pozisyonundan hafif rastgele sapma ile 1-2 kıvılcım üret
      const count = Math.random() > 0.4 ? 2 : 1
      for (let i = 0; i < count; i++) {
        sparkles.push({
          x: e.clientX + (Math.random() * 8 - 4),
          y: e.clientY + (Math.random() * 8 - 4),
          size: Math.random() * 1.8 + 1.2,
          vx: (Math.random() - 0.5) * 0.8,
          vy: Math.random() * 0.6 + 0.3, // Hafifçe aşağı süzülme
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          decay: Math.random() * 0.035 + 0.025,
        })
      }
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = sparkles.length - 1; i >= 0; i--) {
        const sp = sparkles[i]
        sp.x += sp.vx
        sp.y += sp.vy
        sp.alpha -= sp.decay

        if (sp.alpha <= 0) {
          sparkles.splice(i, 1)
        } else {
          drawPixelStar(ctx, sp.x, sp.y, sp.size, sp.color, sp.alpha)
        }
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pixel-sparkle-trail-canvas"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 999999,
      }}
    />
  )
}

