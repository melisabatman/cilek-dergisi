import React, { useEffect, useRef } from 'react'

/**
 * Pixel Sparkle Trail (Y2K / Indie Magazine Aesthetic)
 * Fare hareket ettikçe imlecin ardından canlı, parıldayan pixel yıldız ve kıvılcımlar bırakır.
 */
export default function PixelSparkleTrail() {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let dpr = window.devicePixelRatio || 1
    let width = (canvas.width = window.innerWidth * dpr)
    let height = (canvas.height = window.innerHeight * dpr)
    ctx.scale(dpr, dpr)

    const handleResize = () => {
      dpr = window.devicePixelRatio || 1
      width = canvas.width = window.innerWidth * dpr
      height = canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
    }
    window.addEventListener('resize', handleResize)

    const sparkles = []
    // Çilek kırmızısı, neon pembe, altın yıldız, parlak eflatun ve beyaz kıvılcım
    const colors = ['#BE2625', '#FF2E93', '#FF69B4', '#FFAFD7', '#FFD166', '#BE2625']
    let lastTime = 0
    let animId

    // 4-kanatlı parlak pixel yıldız (✦) çizimi
    const drawSparkleStar = (context, x, y, size, color, alpha) => {
      context.save()
      context.globalAlpha = Math.max(0, Math.min(1, alpha))
      context.fillStyle = color
      const s = Math.max(1.8, size)
      const px = Math.round(x)
      const py = Math.round(y)

      // Merkez çekirdek
      context.fillRect(px - s * 0.6, py - s * 0.6, s * 1.2, s * 1.2)

      // 4 ana kanat (Yukarı, Aşağı, Sol, Sağ)
      context.fillRect(px - s * 0.4, py - s * 2.2, s * 0.8, s * 1.6) // Tepe
      context.fillRect(px - s * 0.4, py + s * 0.6, s * 0.8, s * 1.6) // Dip
      context.fillRect(px - s * 2.2, py - s * 0.4, s * 1.6, s * 0.8) // Sol
      context.fillRect(px + s * 0.6, py - s * 0.4, s * 1.6, s * 0.8) // Sağ

      // Parlak beyaz ışıltı merkezi
      context.fillStyle = '#FFFFFF'
      context.fillRect(px - s * 0.3, py - s * 0.3, s * 0.6, s * 0.6)

      context.restore()
    }

    const onPointerMove = (e) => {
      const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX)
      const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY)
      if (clientX === undefined || clientY === undefined) return

      const now = performance.now()
      if (now - lastTime < 18) return // 60fps akıcı üretim
      lastTime = now

      // Fare imlecinin arkasında 1-3 parıltılı yıldız üret
      const count = Math.random() > 0.4 ? 2 : 1
      for (let i = 0; i < count; i++) {
        sparkles.push({
          x: clientX + (Math.random() * 12 - 6),
          y: clientY + (Math.random() * 12 - 6),
          size: Math.random() * 2.0 + 2.0, // 2px - 4px belirgin boyut
          vx: (Math.random() - 0.5) * 0.9,
          vy: Math.random() * 0.8 + 0.4, // Zarifçe aşağı süzülme
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          decay: Math.random() * 0.02 + 0.016, // Tatlı bir sönüş süresi (~50 frame)
        })
      }
    }

    window.addEventListener('mousemove', onPointerMove, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    const render = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      for (let i = sparkles.length - 1; i >= 0; i--) {
        const sp = sparkles[i]
        sp.x += sp.vx
        sp.y += sp.vy
        sp.alpha -= sp.decay

        if (sp.alpha <= 0) {
          sparkles.splice(i, 1)
        } else {
          drawSparkleStar(ctx, sp.x, sp.y, sp.size, sp.color, sp.alpha)
        }
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('pointermove', onPointerMove)
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

