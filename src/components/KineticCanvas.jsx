import { useEffect, useRef } from 'react'

export default function KineticCanvas({ density = 55 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId

    const parent = canvas.parentElement
    let width = 0
    let height = 0

    const resize = () => {
      if (!parent) return
      width = parent.offsetWidth || window.innerWidth
      height = parent.offsetHeight || window.innerHeight
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    // Particles array
    const numParticles = Math.min(Math.floor((width * height) / 16000), density)
    const particles = []

    // Floating Physics Symbols for Chaos Labs vibe
    const symbols = ['λ', 'ℏ', 'ΔE', 'B⃗', 'ν', '∇×E', 'ψ', 'c']
    const floatingSymbols = []

    for (let i = 0; i < 12; i++) {
      floatingSymbols.push({
        text: symbols[i % symbols.length],
        x: Math.random() * (width || 800),
        y: Math.random() * (height || 600),
        vy: -0.2 - Math.random() * 0.3,
        alpha: Math.random() * 0.35 + 0.15,
        size: Math.floor(Math.random() * 8) + 14
      })
    }

    const mouse = { x: -1000, y: -1000, radius: 180 }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }

    const handleMouseLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
    }

    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove)
      parent.addEventListener('mouseleave', handleMouseLeave)
    }

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * (width || 800),
        y: Math.random() * (height || 600),
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.4 ? '#38bdf8' : Math.random() > 0.5 ? '#3b82f6' : '#2dd4bf',
        alpha: Math.random() * 0.5 + 0.3
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw subtle physics grid lines
      const gridSize = 60
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.035)'
      ctx.lineWidth = 1
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Draw floating physics symbols
      floatingSymbols.forEach((s) => {
        s.y += s.vy
        if (s.y < -20) s.y = height + 20
        ctx.font = `${s.size}px 'DM Mono', monospace`
        ctx.fillStyle = '#38bdf8'
        ctx.globalAlpha = s.alpha
        ctx.fillText(s.text, s.x, s.y)
      })

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        // Mouse influence
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius
          p.x -= (dx / dist) * force * 1.8
          p.y -= (dy / dist) * force * 1.8
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.shadowBlur = 8
        ctx.shadowColor = p.color
        ctx.fill()
        ctx.shadowBlur = 0

        // Connected lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const pdx = p.x - p2.x
          const pdy = p.y - p2.y
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy)

          if (pdist < 120) {
            const lineAlpha = (1 - pdist / 120) * 0.25
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = '#38bdf8'
            ctx.globalAlpha = lineAlpha
            ctx.lineWidth = 0.85
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 1.0
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove)
        parent.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [density])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  )
}
