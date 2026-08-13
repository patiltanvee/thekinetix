import { useState, useEffect, useRef } from 'react'

export default function PhysicsInMotion() {
  const [activeTab, setActiveTab] = useState('prism') // 'prism' | 'orbitals' | 'ripples'
  const [laserPower, setLaserPower] = useState(85)
  const [prismAngle, setPrismAngle] = useState(60)
  const [isPlaying, setIsPlaying] = useState(true)
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let t = 0

    // Mouse interactive ripples for 'ripples' mode
    const mouse = { x: -1000, y: -1000, isDown: false }
    const ripplePoints = []

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      if (mouse.isDown && activeTab === 'ripples') {
        ripplePoints.push({ x: mouse.x, y: mouse.y, radius: 2, alpha: 1 })
      }
    }

    const handleMouseDown = () => {
      mouse.isDown = true
      if (activeTab === 'ripples' && mouse.x > 0) {
        ripplePoints.push({ x: mouse.x, y: mouse.y, radius: 2, alpha: 1 })
      }
    }

    const handleMouseUp = () => { mouse.isDown = false }

    const container = canvas.parentElement
    let w = container?.offsetWidth || 800
    let h = container?.offsetHeight || 480

    const handleResize = () => {
      if (!canvas || !container) return
      w = container.offsetWidth || 800
      h = container.offsetHeight || 480
      if (h < 300) h = 480
      canvas.width = w
      canvas.height = h
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mousedown', handleMouseDown)
      window.addEventListener('mouseup', handleMouseUp)
    }

    const render = () => {
      if (isPlaying) t += 0.03
      const cx = w / 2
      const cy = h / 2

      ctx.clearRect(0, 0, w, h)

      // Background grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)'
      ctx.lineWidth = 1
      const gridSize = 40
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      if (activeTab === 'prism') {
        // ── PRISM REFRACTION & SPECTRUM DISPERSION ──
        const pSize = 130 + (prismAngle - 60) * 0.5
        const px1 = cx, py1 = cy - pSize
        const px2 = cx - pSize * 0.9, py2 = cy + pSize * 0.7
        const px3 = cx + pSize * 0.9, py3 = cy + pSize * 0.7

        // Draw Glass Prism (Glassmorphism effect)
        ctx.beginPath()
        ctx.moveTo(px1, py1)
        ctx.lineTo(px2, py2)
        ctx.lineTo(px3, py3)
        ctx.closePath()
        ctx.fillStyle = 'rgba(30, 41, 59, 0.45)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)'
        ctx.lineWidth = 2
        ctx.shadowBlur = 16
        ctx.shadowColor = '#38bdf8'
        ctx.stroke()
        ctx.shadowBlur = 0

        // Incident White Laser Beam
        const laserStartY = cy + 40
        const incidentX = cx - pSize * 0.45
        const incidentY = cy + pSize * 0.15

        ctx.beginPath()
        ctx.moveTo(30, laserStartY)
        ctx.lineTo(incidentX, incidentY)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
        ctx.lineWidth = 4 * (laserPower / 80)
        ctx.shadowBlur = 18
        ctx.shadowColor = '#ffffff'
        ctx.stroke()

        // Incident beam animated photons
        for (let i = 0; i < 5; i++) {
          const progress = ((t * 1.5 + i * 0.2) % 1)
          const px = 30 + progress * (incidentX - 30)
          const py = laserStartY + progress * (incidentY - laserStartY)
          ctx.beginPath()
          ctx.arc(px, py, 3, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.fill()
        }

        // Refracted Beam inside Prism
        const refractX = cx + pSize * 0.3
        const refractY = cy + pSize * 0.2

        ctx.beginPath()
        ctx.moveTo(incidentX, incidentY)
        ctx.lineTo(refractX, refractY)
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.8)'
        ctx.lineWidth = 3
        ctx.stroke()

        // Spectrum Colors Dispersion out of Prism
        const spectrum = [
          { color: '#ef4444', label: 'Red (700nm)', offset: -35 },
          { color: '#f97316', label: 'Orange (620nm)', offset: -23 },
          { color: '#eab308', label: 'Yellow (580nm)', offset: -12 },
          { color: '#22c55e', label: 'Green (530nm)', offset: 0 },
          { color: '#38bdf8', label: 'Cyan (490nm)', offset: 12 },
          { color: '#3b82f6', label: 'Blue (450nm)', offset: 23 },
          { color: '#8b5cf6', label: 'Violet (400nm)', offset: 35 }
        ]

        const screenX = w - 60

        spectrum.forEach((s, idx) => {
          const targetY = cy + s.offset * 2.2 + Math.sin(t + idx) * 3

          // Ray beam line
          ctx.beginPath()
          ctx.moveTo(refractX, refractY)
          ctx.lineTo(screenX, targetY)
          ctx.strokeStyle = s.color
          ctx.lineWidth = 2.5
          ctx.shadowBlur = 10
          ctx.shadowColor = s.color
          ctx.stroke()

          // Animated spectrum photons
          const pProg = ((t * 1.8 + idx * 0.15) % 1)
          const spx = refractX + pProg * (screenX - refractX)
          const spy = refractY + pProg * (targetY - refractY)
          ctx.beginPath()
          ctx.arc(spx, spy, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = s.color
          ctx.fill()

          // Screen projection line
          ctx.fillStyle = s.color
          ctx.globalAlpha = 0.85
          ctx.fillRect(screenX, targetY - 4, 8, 8)
          ctx.globalAlpha = 1.0
        })

        // Normal Angle Vector Line
        ctx.setLineDash([4, 4])
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(incidentX - 30, incidentY - 40)
        ctx.lineTo(incidentX + 30, incidentY + 40)
        ctx.stroke()
        ctx.setLineDash([])

      } else if (activeTab === 'orbitals') {
        // ── 3D QUANTUM ATOMIC ORBITALS ──
        // Glowing Nucleus
        ctx.beginPath()
        ctx.arc(cx, cy, 14, 0, Math.PI * 2)
        ctx.fillStyle = '#ef4444'
        ctx.shadowBlur = 24
        ctx.shadowColor = '#ef4444'
        ctx.fill()

        ctx.beginPath()
        ctx.arc(cx - 3, cy - 3, 6, 0, Math.PI * 2)
        ctx.fillStyle = '#fbbf24'
        ctx.fill()

        // 3 Orbital Rings (Tilted in 3D perspective)
        const orbits = [
          { rx: 140, ry: 45, angle: t * 0.8, color: '#38bdf8' },
          { rx: 190, ry: 60, angle: -t * 0.6 + 1.2, color: '#2dd4bf' },
          { rx: 240, ry: 75, angle: t * 0.4 + 2.5, color: '#3b82f6' }
        ]

        orbits.forEach((orb, idx) => {
          ctx.save()
          ctx.translate(cx, cy)
          ctx.rotate((idx * Math.PI) / 3)

          // Ellipse Ring
          ctx.beginPath()
          ctx.ellipse(0, 0, orb.rx, orb.ry, 0, 0, Math.PI * 2)
          ctx.strokeStyle = orb.color
          ctx.globalAlpha = 0.45
          ctx.lineWidth = 1.5
          ctx.shadowBlur = 8
          ctx.shadowColor = orb.color
          ctx.stroke()

          // Electron Particle
          const ex = Math.cos(orb.angle) * orb.rx
          const ey = Math.sin(orb.angle) * orb.ry
          ctx.beginPath()
          ctx.arc(ex, ey, 6, 0, Math.PI * 2)
          ctx.fillStyle = orb.color
          ctx.globalAlpha = 1.0
          ctx.shadowBlur = 15
          ctx.shadowColor = orb.color
          ctx.fill()

          ctx.restore()
        })

        // Quantum Wave Emission Pulse
        const waveRadius = (t * 40) % 220
        ctx.beginPath()
        ctx.arc(cx, cy, waveRadius, 0, Math.PI * 2)
        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 1.2
        ctx.globalAlpha = Math.max(0, 1 - waveRadius / 220)
        ctx.stroke()
        ctx.globalAlpha = 1.0

      } else if (activeTab === 'ripples') {
        // ── 3D KINETIC WAVE RIPPLE SUPERPOSITION ──
        const numRows = 14
        const numCols = 24
        const spacingX = w / (numCols + 1)
        const spacingY = h / (numRows + 1)

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)'
        ctx.lineWidth = 1.2

        for (let r = 0; r < numRows; r++) {
          ctx.beginPath()
          for (let c = 0; c < numCols; c++) {
            const x = (c + 1) * spacingX
            const baseY = (r + 1) * spacingY

            // Wave offset calculation
            let waveHeight = Math.sin(c * 0.4 + t * 3) * 12 + Math.cos(r * 0.4 + t * 2) * 10

            // Add interactive mouse ripple points
            ripplePoints.forEach((p) => {
              const dx = x - p.x
              const dy = baseY - p.y
              const dist = Math.sqrt(dx * dx + dy * dy)
              if (dist < 150) {
                waveHeight += Math.sin(dist * 0.1 - p.radius * 0.2) * 18 * p.alpha
              }
            })

            const y = baseY + waveHeight

            if (c === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)

            // Draw glowing node point
            ctx.fillStyle = c % 2 === 0 ? '#38bdf8' : '#2dd4bf'
            ctx.shadowBlur = 6
            ctx.shadowColor = '#38bdf8'
            ctx.fillRect(x - 2, y - 2, 4, 4)
            ctx.shadowBlur = 0
          }
          ctx.stroke()
        }

        // Update ripple animations
        for (let i = ripplePoints.length - 1; i >= 0; i--) {
          const p = ripplePoints[i]
          p.radius += 1.5
          p.alpha -= 0.015
          if (p.alpha <= 0) ripplePoints.splice(i, 1)
        }
      }

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mousedown', handleMouseDown)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [activeTab, laserPower, prismAngle, isPlaying])

  return (
    <div className="pim-stage-container">
      {/* Stage Control Header */}
      <div className="pim-header">
        <div className="pim-badge">
          <span className="live-dot" />
          <span>PHYSICS IN MOTION ENGINE · v2.4</span>
        </div>

        <div className="pim-tabs">
          <button
            className={`pim-tab ${activeTab === 'prism' ? 'active' : ''}`}
            onClick={() => setActiveTab('prism')}
          >
            🌈 Prism Dispersion
          </button>
          <button
            className={`pim-tab ${activeTab === 'orbitals' ? 'active' : ''}`}
            onClick={() => setActiveTab('orbitals')}
          >
            ⚛️ Quantum Orbitals
          </button>
          <button
            className={`pim-tab ${activeTab === 'ripples' ? 'active' : ''}`}
            onClick={() => setActiveTab('ripples')}
          >
            🌊 3D Wave Ripples
          </button>
        </div>
      </div>

      {/* Main Animation Viewport */}
      <div className="pim-viewport">
        <canvas ref={canvasRef} className="pim-canvas" />

        {/* High-Clarity Telemetry HUD */}
        <div className="pim-hud">
          <div className="hud-title">REAL-TIME TELEMETRY</div>
          <div className="hud-row">
            <span>Refractive Index (n):</span>
            <span className="hud-val">1.517 (Crown Glass)</span>
          </div>
          <div className="hud-row">
            <span>Photon Energy (E):</span>
            <span className="hud-val" style={{ color: '#38bdf8' }}>
              {(2.1 + (laserPower / 100) * 1.0).toFixed(2)} eV
            </span>
          </div>
          <div className="hud-row">
            <span>Frequency (ν):</span>
            <span className="hud-val">5.40 × 10¹⁴ Hz</span>
          </div>
          <div className="hud-row">
            <span>Status:</span>
            <span className="hud-val text-success">RENDER ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="pim-footer">
        <div className="pim-control">
          <label>Laser Intensity / Power: <strong>{laserPower}%</strong></label>
          <input
            type="range"
            min="20"
            max="100"
            value={laserPower}
            onChange={(e) => setLaserPower(Number(e.target.value))}
            className="sandbox-slider"
          />
        </div>

        <div className="pim-control">
          <label>Prism Angle / Phase: <strong>{prismAngle}°</strong></label>
          <input
            type="range"
            min="30"
            max="90"
            value={prismAngle}
            onChange={(e) => setPrismAngle(Number(e.target.value))}
            className="sandbox-slider"
          />
        </div>

        <button
          className="pim-play-btn"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? '⏸ Pause Motion' : '▶ Play Motion'}
        </button>
      </div>
    </div>
  )
}
