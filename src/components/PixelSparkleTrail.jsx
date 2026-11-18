import React, { useEffect, useRef } from 'react'

/**
 * Pixel Sparkle Trail (Y2K / Indie Magazine Aesthetic)
 * Fare hareket ettikçe imlecin ardından tam olarak fare imlecinin küçük halini (pixel pembe yıldız) bırakır.
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

    // Fare imlecinin orijinal görselini minyatür kıvılcım olarak kullan
    const starImg = new Image()
    starImg.src = '/cursors/pixel-pink-star.png'

    const sparkles = []
    let lastTime = 0
    let animId

    const onPointerMove = (e) => {
      const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX)
      const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY)
      if (clientX === undefined || clientY === undefined) return

      const now = performance.now()
      if (now - lastTime < 24) return // ~40fps
      lastTime = now

      // Fare imlecinin arkasında 1-2 minyatür imleç yıldızı üret
      const count = Math.random() > 0.4 ? 2 : 1
      for (let i = 0; i < count; i++) {
        sparkles.push({
          x: clientX + (Math.random() * 10 - 5),
          y: clientY + (Math.random() * 10 - 5),
          size: Math.random() * 4 + 13, // 13px - 17px (imlecin sevimli minik hali)
          rotation: (Math.random() - 0.5) * 0.4,
          vRot: (Math.random() - 0.5) * 0.04,
          vx: (Math.random() - 0.5) * 0.8,
          vy: Math.random() * 0.7 + 0.4, // Aşağı doğru tatlı süzülme
          alpha: 1.0,
          decay: Math.random() * 0.022 + 0.016, // Zarif sönme süresi
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
        sp.rotation += sp.vRot
        sp.alpha -= sp.decay

        if (sp.alpha <= 0) {
          sparkles.splice(i, 1)
        } else {
          ctx.save()
          ctx.globalAlpha = Math.max(0, Math.min(1, sp.alpha))
          ctx.translate(sp.x, sp.y)
          ctx.rotate(sp.rotation)
          if (starImg.complete && starImg.naturalWidth > 0) {
            ctx.drawImage(starImg, -sp.size / 2, -sp.size / 2, sp.size, sp.size)
          } else {
            // Görsel henüz yüklenmediyse pembe piksel çekirdek
            ctx.fillStyle = '#FF2E93'
            ctx.fillRect(-sp.size / 4, -sp.size / 4, sp.size / 2, sp.size / 2)
          }
          ctx.restore()
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

