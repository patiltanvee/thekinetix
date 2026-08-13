import { useState, useEffect, useRef } from 'react'

export default function HeroSandbox() {
  const [mode, setMode] = useState('diffraction') // 'diffraction' | 'newton' | 'superposition'
  const [wavelength, setWavelength] = useState(632) // nm (He-Ne laser red)
  const [param, setParam] = useState(50) // general slider (slit width / curvature / freq)
  const [isPlaying, setIsPlaying] = useState(true)
  const canvasRef = useRef(null)

  // Map wavelength to approximate hex color
  const wavelengthToColor = (wl) => {
    if (wl < 440) return '#8b5cf6' // Violet
    if (wl < 490) return '#3b82f6' // Blue
    if (wl < 530) return '#2dd4bf' // Cyan-Teal
    if (wl < 580) return '#22c55e' // Green
    if (wl < 620) return '#eab308' // Yellow-Orange
    return '#ef4444' // Red
  }

  const laserColor = wavelengthToColor(wavelength)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let time = 0

    const render = () => {
      if (isPlaying) time += 0.04
      const w = (canvas.width = canvas.parentElement.offsetWidth || 500)
      const h = (canvas.height = canvas.parentElement.offsetHeight || 260)
      const cx = w / 2
      const cy = h / 2

      ctx.clearRect(0, 0, w, h)

      // Background grid in sandbox
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
      ctx.lineWidth = 1
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      if (mode === 'diffraction') {
        // Laser diffraction intensity pattern
        const slitWidth = (param / 100) * 1.5 + 0.5 // 0.5 to 2.0

        // Draw laser beam line
        ctx.strokeStyle = laserColor
        ctx.lineWidth = 4
        ctx.shadowBlur = 15
        ctx.shadowColor = laserColor
        ctx.beginPath()
        ctx.moveTo(20, cy)
        ctx.lineTo(cx - 30, cy)
        ctx.stroke()

        // Slit barrier
        ctx.shadowBlur = 0
        ctx.fillStyle = '#1e293b'
        ctx.fillRect(cx - 30, 20, 8, cy - 20)
        ctx.fillRect(cx - 30, cy + 20, 8, h - cy - 20)

        // Slit gap highlight
        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 2
        ctx.strokeRect(cx - 32, cy - 20, 12, 40)

        // Draw intensity pattern on screen
        const screenX = w - 40
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx.beginPath()
        ctx.moveTo(screenX, 20)
        ctx.lineTo(screenX, h - 20)
        ctx.stroke()

        // Draw intensity curve
        ctx.beginPath()
        ctx.strokeStyle = laserColor
        ctx.lineWidth = 2
        ctx.shadowBlur = 10
        ctx.shadowColor = laserColor

        for (let y = 20; y < h - 20; y++) {
          const dy = (y - cy) / 18
          const beta = dy === 0 ? 0.001 : dy * slitWidth * (600 / wavelength)
          const intensity = Math.pow(Math.sin(beta) / beta, 2)
          const plotX = screenX - intensity * 110

          if (y === 20) ctx.moveTo(plotX, y)
          else ctx.lineTo(plotX, y)

          // Light fringes on screen line
          ctx.fillStyle = laserColor
          ctx.globalAlpha = Math.min(1, intensity)
          ctx.fillRect(screenX + 2, y, 14, 1)
          ctx.globalAlpha = 1.0
        }
        ctx.stroke()

        // Waves spreading from slit
        ctx.lineWidth = 1.2
        for (let r = (time * 25) % 30; r < cx - 50; r += 28) {
          ctx.beginPath()
          ctx.arc(cx - 26, cy, r, -Math.PI / 3, Math.PI / 3)
          ctx.strokeStyle = laserColor
          ctx.globalAlpha = Math.max(0, 1 - r / (cx - 50))
          ctx.stroke()
        }
        ctx.globalAlpha = 1.0
      } else if (mode === 'newton') {
        // Newton's Rings Interference Pattern
        const R = (param / 100) * 120 + 40 // curvature
        const wlNorm = wavelength / 600

        // Draw rings
        for (let ring = 1; ring <= 8; ring++) {
          const r = Math.sqrt(ring * R * wlNorm) * 8 + Math.sin(time * 2) * 2
          ctx.beginPath()
          ctx.arc(cx, cy, r, 0, Math.PI * 2)
          ctx.strokeStyle = ring % 2 === 0 ? laserColor : 'rgba(15, 23, 42, 0.9)'
          ctx.lineWidth = ring % 2 === 0 ? 5 : 4
          ctx.shadowBlur = ring % 2 === 0 ? 12 : 0
          ctx.shadowColor = laserColor
          ctx.stroke()
        }

        // Central dark spot
        ctx.beginPath()
        ctx.arc(cx, cy, 6, 0, Math.PI * 2)
        ctx.fillStyle = '#090d16'
        ctx.shadowBlur = 0
        ctx.fill()

        // Radius crosshair indicators
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(cx - 130, cy)
        ctx.lineTo(cx + 130, cy)
        ctx.moveTo(cx, cy - 100)
        ctx.lineTo(cx, cy + 100)
        ctx.stroke()
      } else if (mode === 'superposition') {
        // Wave Superposition Animation
        const freq = (param / 100) * 0.08 + 0.02
        const amp = 35

        // Wave 1 (Cyan)
        ctx.beginPath()
        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 2
        for (let x = 20; x < w - 20; x++) {
          const y = cy - 40 + Math.sin((x * 0.03) + time * 3) * (amp * 0.7)
          if (x === 20) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()

        // Wave 2 (Teal)
        ctx.beginPath()
        ctx.strokeStyle = '#2dd4bf'
        ctx.lineWidth = 2
        for (let x = 20; x < w - 20; x++) {
          const y = cy + 40 + Math.sin((x * 0.03 * (freq * 20)) - time * 2) * (amp * 0.7)
          if (x === 20) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()

        // Superposed Result Wave (Laser Color / Bright Accent)
        ctx.beginPath()
        ctx.strokeStyle = laserColor
        ctx.lineWidth = 3
        ctx.shadowBlur = 12
        ctx.shadowColor = laserColor
        for (let x = 20; x < w - 20; x++) {
          const y1 = Math.sin((x * 0.03) + time * 3) * (amp * 0.7)
          const y2 = Math.sin((x * 0.03 * (freq * 20)) - time * 2) * (amp * 0.7)
          const yResult = cy + y1 + y2
          if (x === 20) ctx.moveTo(x, yResult)
          else ctx.lineTo(x, yResult)
        }
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      animId = requestAnimationFrame(render)
    }

    render()

    return () => cancelAnimationFrame(animId)
  }, [mode, wavelength, param, isPlaying, laserColor])

  return (
    <div className="sandbox-wrapper">
      {/* Sandbox Window Bar */}
      <div className="sandbox-header">
        <div className="sandbox-dots">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
          <span className="sandbox-title">TheKinetix Physics Engine · Real-Time Simulation Sandbox</span>
        </div>
        <div className="sandbox-status">
          <span className="live-pulse" />
          <span className="live-txt">INTERACTIVE CANVAS</span>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="sandbox-tabs">
        <button
          className={`sandbox-tab ${mode === 'diffraction' ? 'active' : ''}`}
          onClick={() => setMode('diffraction')}
        >
          🧪 Laser Diffraction
        </button>
        <button
          className={`sandbox-tab ${mode === 'newton' ? 'active' : ''}`}
          onClick={() => setMode('newton')}
        >
          ⭕ Newton's Rings
        </button>
        <button
          className={`sandbox-tab ${mode === 'superposition' ? 'active' : ''}`}
          onClick={() => setMode('superposition')}
        >
          🌊 Wave Interference
        </button>
      </div>

      {/* Canvas viewport */}
      <div className="sandbox-canvas-container">
        <canvas ref={canvasRef} className="sandbox-canvas" />

        {/* Floating telemetry widget */}
        <div className="sandbox-telemetry">
          <div className="tele-row">
            <span className="tele-label">Mode:</span>
            <span className="tele-val">{mode.toUpperCase()}</span>
          </div>
          <div className="tele-row">
            <span className="tele-label">Wavelength (λ):</span>
            <span className="tele-val" style={{ color: laserColor }}>
              {wavelength} nm
            </span>
          </div>
          <div className="tele-row">
            <span className="tele-label">Fringe Spacing (β):</span>
            <span className="tele-val">{(1.24 * (wavelength / 600)).toFixed(2)} mm</span>
          </div>
          <div className="tele-row">
            <span className="tele-label">Engine FPS:</span>
            <span className="tele-val text-success">60.0 FPS</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="sandbox-controls">
        <div className="control-group">
          <label>Laser Spectrum: <span style={{ color: laserColor, fontWeight: 600 }}>{wavelength} nm</span></label>
          <input
            type="range"
            min="400"
            max="700"
            value={wavelength}
            onChange={(e) => setWavelength(Number(e.target.value))}
            className="sandbox-slider"
          />
        </div>

        <div className="control-group">
          <label>
            {mode === 'diffraction' ? 'Slit Aperture' : mode === 'newton' ? 'Lens Curvature' : 'Wave Frequency'}
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={param}
            onChange={(e) => setParam(Number(e.target.value))}
            className="sandbox-slider"
          />
        </div>

        <button
          className="sandbox-play-btn"
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
        >
          {isPlaying ? '⏸ Pause Engine' : '▶ Resume Engine'}
        </button>
      </div>
    </div>
  )
}
