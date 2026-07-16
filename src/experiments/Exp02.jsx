// ─────────────────────────────────────────────────────────────
//  Exp02.jsx  —  Newton's Rings  (Radius of Curvature)
//  Paste this file into:  src/experiments/Exp02.jsx
// ─────────────────────────────────────────────────────────────
import React, { useRef, useEffect, useState, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════
const LAMBDA_MAP  = { 589: 5893e-8, 632: 6328e-8, 532: 5320e-8, 405: 4050e-8 }
const RING_SCALE  = 1.5    // cm per half-canvas
const BASE_READING = 7.500 // micrometer base
const RINGS       = [2, 4, 6, 8, 10]

const LIGHT_SOURCES = [
  { nm: 589, label: '🟡 Sodium — 589 nm (standard)' },
  { nm: 632, label: '🔴 HeNe Laser — 632 nm' },
  { nm: 532, label: '🟢 Green Laser — 532 nm' },
  { nm: 405, label: '🟣 Violet — 405 nm' },
]

function wavelengthToRGB(nm) {
  let r, g, b
  if      (nm < 440) { r = (440 - nm) / 60; g = 0; b = 1 }
  else if (nm < 490) { r = 0; g = (nm - 440) / 50; b = 1 }
  else if (nm < 510) { r = 0; g = 1; b = (510 - nm) / 20 }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; b = 0 }
  else if (nm < 645) { r = 1; g = (645 - nm) / 65; b = 0 }
  else               { r = 1; g = 0; b = 0 }
  const f = nm < 420 ? 0.4 + 0.6 * (nm - 380) / 40 : 1
  return {
    r: Math.round(r * f * 255),
    g: Math.round(g * f * 255),
    b: Math.round(b * f * 255),
  }
}

// ═══════════════════════════════════════════════════════════════
//  DRAW FUNCTIONS  (pure — no DOM)
// ═══════════════════════════════════════════════════════════════
function drawRingsCanvas(canvas, { R, bright, lambda, scopePos, rgb }) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2
  const lCm = LAMBDA_MAP[lambda] || 5893e-8

  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) / 2)
  bg.addColorStop(0, '#1a2744'); bg.addColorStop(1, '#070d1a')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  const img = ctx.createImageData(W, H)
  const d   = img.data
  const sX  = RING_SCALE / cx

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (x - cx) * sX, dy = (y - cy) * sX
      const r2 = dx * dx + dy * dy
      const t  = r2 / (2 * R)
      const phase = 2 * t / lCm
      const intensity = Math.pow(Math.sin(Math.PI * phase), 2)
      const fade = Math.max(0, 1 - Math.sqrt(r2) / 1.55)
      const v = intensity * fade * bright
      const i = 4 * (y * W + x)
      d[i]     = Math.min(255, rgb.r * v)
      d[i + 1] = Math.min(255, rgb.g * v)
      d[i + 2] = Math.min(255, rgb.b * v + 15 * v)
      d[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)

  // Center dot
  ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, 2 * Math.PI)
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fill()

  // Scope position line
  const scopePx = cx + (scopePos / RING_SCALE) * cx
  ctx.strokeStyle = 'rgba(99,179,237,0.25)'; ctx.lineWidth = 1
  ctx.setLineDash([3, 3])
  ctx.beginPath(); ctx.moveTo(scopePx, 0); ctx.lineTo(scopePx, H); ctx.stroke()
  ctx.setLineDash([])
}

function drawZoomCanvas(canvas, { R, bright, lambda, scopePos, rgb, zoomLevel }) {
  const ctx = canvas.getContext('2d')
  const ZW = canvas.width, ZH = canvas.height
  const lCm   = LAMBDA_MAP[lambda] || 5893e-8
  const zScale = RING_SCALE / (zoomLevel * 40)

  ctx.fillStyle = '#0a1020'; ctx.fillRect(0, 0, ZW, ZH)
  const img = ctx.createImageData(ZW, ZH)
  const d   = img.data

  for (let y = 0; y < ZH; y++) {
    for (let x = 0; x < ZW; x++) {
      const dx = scopePos + (x - ZW / 2) * zScale
      const dy = (y - ZH / 2) * zScale
      const r2 = dx * dx + dy * dy
      const t  = r2 / (2 * R)
      const phase = 2 * t / lCm
      const intensity = Math.pow(Math.sin(Math.PI * phase), 2)
      const fade = Math.max(0.1, 1 - Math.sqrt(r2) / 1.6)
      const v = intensity * fade * Math.min(1, bright * 1.3)
      const i = 4 * (y * ZW + x)
      d[i]     = Math.min(255, rgb.r * v)
      d[i + 1] = Math.min(255, rgb.g * v)
      d[i + 2] = Math.min(255, rgb.b * v + 15 * v)
      d[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
}

function drawGraphCanvas(canvas, dn2vals) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const pl = { l: 58, r: 28, t: 22, b: 48 }

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#0f1829'; ctx.fillRect(0, 0, W, H)

  const xMax = RINGS[RINGS.length - 1] + 2
  const yMax = Math.max(...dn2vals, 0.05) * 1.25

  const px = n => pl.l + (n / xMax) * (W - pl.l - pl.r)
  const py = v => H - pl.b - (v / yMax) * (H - pl.t - pl.b)

  // Grid
  ctx.strokeStyle = 'rgba(99,179,237,0.07)'; ctx.lineWidth = 1
  RINGS.forEach(n => { ctx.beginPath(); ctx.moveTo(px(n), pl.t); ctx.lineTo(px(n), H - pl.b); ctx.stroke() })
  ;[0.1, 0.2, 0.3].forEach(v => {
    if (v < yMax) { ctx.beginPath(); ctx.moveTo(pl.l, py(v)); ctx.lineTo(W - pl.r, py(v)); ctx.stroke() }
  })

  // Axes
  ctx.strokeStyle = 'rgba(99,179,237,0.28)'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(pl.l, pl.t); ctx.lineTo(pl.l, H - pl.b); ctx.lineTo(W - pl.r, H - pl.b); ctx.stroke()

  // Labels
  ctx.fillStyle = 'rgba(107,127,153,0.9)'; ctx.font = '10px DM Mono,monospace'; ctx.textAlign = 'center'
  RINGS.forEach(n => ctx.fillText(n, px(n), H - pl.b + 14))
  ctx.fillText('Ring Number  n', W / 2, H - 5)
  ctx.save(); ctx.rotate(-Math.PI / 2); ctx.fillText('D²ₙ  (cm²)', -(H / 2), 13); ctx.restore()

  const hasData = dn2vals.some(v => v > 0)
  if (!hasData) {
    ctx.fillStyle = 'rgba(107,127,153,0.5)'; ctx.font = '13px DM Sans,sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('Enter observation data and click Calculate All', W / 2, H / 2)
    return null
  }

  // Linear regression
  const xs = RINGS, ys = dn2vals, n = xs.length
  const sx  = xs.reduce((a, b) => a + b, 0), sy = ys.reduce((a, b) => a + b, 0)
  const sx2 = xs.reduce((a, b) => a + b * b, 0), sxy = xs.reduce((a, v, i) => a + v * ys[i], 0)
  const slope     = (n * sxy - sx * sy) / (n * sx2 - sx * sx)
  const intercept = (sy - slope * sx) / n

  // Best-fit line
  ctx.strokeStyle = 'rgba(79,209,197,0.45)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4])
  ctx.beginPath()
  ctx.moveTo(px(0), py(intercept))
  ctx.lineTo(px(xMax * 0.92), py(intercept + slope * xMax * 0.92))
  ctx.stroke(); ctx.setLineDash([])

  // Slope triangle A–B–C
  const [n1, n2] = [4, 8]
  const [y1, y2] = [intercept + slope * n1, intercept + slope * n2]
  ctx.strokeStyle = 'rgba(246,173,85,0.45)'; ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(px(n1), py(y1)); ctx.lineTo(px(n2), py(y1)); ctx.lineTo(px(n2), py(y2))
  ctx.stroke()
  ctx.fillStyle = 'rgba(246,173,85,0.75)'; ctx.font = '10px DM Mono,monospace'; ctx.textAlign = 'left'
  ctx.fillText('A', px(n2) + 4, py(y2)); ctx.fillText('B', px(n2) + 4, py(y1))
  ctx.textAlign = 'right'; ctx.fillText('C', px(n1) - 4, py(y1))

  // Data points
  dn2vals.forEach((v, i) => {
    ctx.beginPath(); ctx.arc(px(RINGS[i]), py(v), 4.5, 0, 2 * Math.PI)
    ctx.fillStyle = '#63b3ed'; ctx.fill()
    ctx.strokeStyle = 'rgba(8,15,30,0.9)'; ctx.lineWidth = 1.5; ctx.stroke()
  })

  // Legend
  ctx.textAlign = 'left'; ctx.font = '9px DM Sans,sans-serif'
  ctx.fillStyle = '#63b3ed'; ctx.fillRect(pl.l + 6, pl.t + 6, 10, 3)
  ctx.fillStyle = 'rgba(107,127,153,0.8)'; ctx.fillText('Data points', pl.l + 20, pl.t + 10)
  ctx.fillStyle = 'rgba(79,209,197,0.5)'; ctx.fillRect(pl.l + 6, pl.t + 17, 10, 2)
  ctx.fillStyle = 'rgba(107,127,153,0.8)'; ctx.fillText('Best-fit line', pl.l + 20, pl.t + 21)

  return slope   // return slope so caller can compute R
}

// ═══════════════════════════════════════════════════════════════
//  THEORY PANEL
// ═══════════════════════════════════════════════════════════════
function Theory() {
  return (
    <div className="theory-cols">
      {/* LEFT */}
      <div>
        <div className="ccard">
          <h3><span>🎯</span> Aim</h3>
          <p>To determine the <strong>radius of curvature</strong> of a plano-convex lens
          by using Newton's Rings setup with monochromatic sodium light (λ = 5893 Å).</p>
        </div>

        <div className="ccard">
          <h3><span>📐</span> Formula</h3>
          <div className="formula-box">
            <span className="formula">
              R = (D²<sub>m+n</sub> − D²<sub>n</sub>) / (4mλ)
            </span>
          </div>
          <div className="fvars">
            <b>R</b> = Radius of curvature of the plano-convex lens<br/>
            <b>D<sub>m+n</sub></b> = Diameter of the (m+n)th dark ring (cm)<br/>
            <b>D<sub>n</sub></b> = Diameter of the nth dark ring (cm)<br/>
            <b>m</b> = Number of rings between the two measurements (m=2)<br/>
            <b>λ</b> = 5893 × 10⁻⁸ cm (sodium wavelength)
          </div>
        </div>

        <div className="ccard">
          <h3><span>📚</span> Theory</h3>
          <p>When a plano-convex lens rests on an optically flat glass plate, a thin air
          film of gradually increasing thickness forms between them — zero at the contact
          point and increasing outward.</p>
          <p>Monochromatic light incident normally produces <strong>thin film interference</strong>.
          Two reflected rays interfere: one from the lower surface of the lens and one from
          the upper surface of the flat plate. The ray at the denser glass surface suffers a
          phase change of <strong>π radians</strong> (λ/2 path difference).</p>
          <p>This produces concentric circular alternating bright and dark rings called
          <em style={{ color: 'var(--accent)' }}> Newton's Rings</em>.
          The dark centre arises because at t = 0 the π phase shift alone gives
          destructive interference.</p>
          <div className="formula-box">
            <span className="formula" style={{ fontSize: '1rem' }}>
              r² ≈ 2Rt &nbsp;⟹&nbsp; Path difference = 2t = r²/R
            </span>
          </div>
          <p><b>Dark fringes:</b> 2t = nλ ⟹ D²<sub>n</sub> = 4nλR</p>
          <p><b>Bright fringes:</b> 2t = (n + ½)λ ⟹ D²<sub>n</sub> = (2n+1)·2λR</p>
          <p>Since D²<sub>n</sub> = 4nλR, a plot of <b style={{ color: 'var(--accent)' }}>D²<sub>n</sub> vs n</b> gives
          a straight line with slope = 4λR, from which <b>R = slope / (4λ)</b>.</p>
        </div>
      </div>

      {/* RIGHT — Diagram + Constants */}
      <div>
        <div className="diag-card">
          <h4>Setup Diagram</h4>
          <svg viewBox="0 0 290 270" xmlns="http://www.w3.org/2000/svg"
               style={{ width: '100%', maxWidth: 270 }}>
            <rect width="290" height="270" fill="#0f1829" rx="8"/>
            <text x="6" y="70" fill="#6b7f99" fontSize="7.5" fontFamily="DM Sans,sans-serif">Light from</text>
            <text x="6" y="80" fill="#6b7f99" fontSize="7.5" fontFamily="DM Sans,sans-serif">Extended</text>
            <text x="6" y="90" fill="#6b7f99" fontSize="7.5" fontFamily="DM Sans,sans-serif">Source</text>
            <line x1="70" y1="80" x2="130" y2="80" stroke="#f6ad55" strokeWidth="1.8" strokeDasharray="4,2"/>
            <rect x="117" y="70" width="28" height="20" fill="rgba(99,179,237,0.14)" stroke="#63b3ed" strokeWidth="1" rx="2"/>
            <text x="148" y="79" fill="#63b3ed" fontSize="7" fontFamily="DM Sans,sans-serif">Beam</text>
            <text x="148" y="88" fill="#63b3ed" fontSize="7" fontFamily="DM Sans,sans-serif">Splitter</text>
            <line x1="131" y1="90" x2="131" y2="150" stroke="#63b3ed" strokeWidth="1.8"/>
            <rect x="117" y="26" width="28" height="44" fill="rgba(79,209,197,0.1)" stroke="#4fd1c5" strokeWidth="1" rx="3"/>
            <text x="148" y="47" fill="#4fd1c5" fontSize="7" fontFamily="DM Sans,sans-serif">Travelling</text>
            <text x="148" y="57" fill="#4fd1c5" fontSize="7" fontFamily="DM Sans,sans-serif">Microscope</text>
            <path d="M87 168 Q131 145 175 168" fill="rgba(99,179,237,0.1)" stroke="#63b3ed" strokeWidth="1.5"/>
            <ellipse cx="131" cy="168" rx="44" ry="8" fill="rgba(99,179,237,0.12)" stroke="#63b3ed" strokeWidth="1.5"/>
            <rect x="74" y="178" width="114" height="9" fill="rgba(79,209,197,0.12)" stroke="#4fd1c5" strokeWidth="1" rx="1"/>
            <text x="4" y="165" fill="#6b7f99" fontSize="7" fontFamily="DM Sans,sans-serif">Plano-convex</text>
            <text x="4" y="174" fill="#6b7f99" fontSize="7" fontFamily="DM Sans,sans-serif">lens</text>
            <text x="4" y="185" fill="#6b7f99" fontSize="7" fontFamily="DM Sans,sans-serif">Glass plate</text>
            <line x1="131" y1="148" x2="131" y2="118" stroke="#f6ad55" strokeWidth="1" strokeDasharray="3,2"/>
            <text x="135" y="135" fill="#f6ad55" fontSize="9" fontFamily="DM Mono,monospace">R</text>
            <line x1="87" y1="200" x2="175" y2="200" stroke="#4fd1c5" strokeWidth="1"/>
            <text x="112" y="212" fill="#4fd1c5" fontSize="8" fontFamily="DM Mono,monospace">D_m</text>
            {/* Rings top-view */}
            <g transform="translate(237,155)">
              {[32, 23, 15, 8].map((r, i) => (
                <React.Fragment key={r}>
                  <circle cx="0" cy="0" r={r} fill="none" stroke="#1a2840" strokeWidth={6 - i}/>
                  <circle cx="0" cy="0" r={r} fill="none" stroke="#63b3ed"
                          strokeWidth="0.8" opacity={0.5 + i * 0.12}/>
                </React.Fragment>
              ))}
              <circle cx="0" cy="0" r="2" fill="#1a2840"/>
              <text x="0" y="46" fill="#6b7f99" fontSize="7" textAnchor="middle"
                    fontFamily="DM Sans,sans-serif">Top View</text>
            </g>
          </svg>
        </div>

        <div className="given-card">
          <h4>Given Constants</h4>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.77rem',
                        lineHeight: 2.1, color: 'var(--text-muted)' }}>
            λ = 5893 Å = 5893×10⁻⁸ cm<br/>
            MSD value a = 0.05 cm<br/>
            Vernier divisions b = 50<br/>
            LC = a/b = <span style={{ color: 'var(--accent)' }}>0.001 cm</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  SIMULATION PANEL
// ═══════════════════════════════════════════════════════════════
function Simulation() {
  const ringsRef = useRef(null)
  const zoomRef  = useRef(null)
  const graphRef = useRef(null)

  // Sim params
  const [R,         setR]         = useState(100)
  const [bright,    setBright]    = useState(0.85)
  const [lambda,    setLambda]    = useState(589)
  const [zoomLevel, setZoomLevel] = useState(3)
  const [scopePos,  setScopePos]  = useState(0)

  // Drag state
  const dragging     = useRef(false)
  const dragStartX   = useRef(0)
  const dragStartPos = useRef(0)

  const rgb = wavelengthToRGB(lambda)

  // Redraw rings + zoom when params change
  useEffect(() => {
    if (ringsRef.current) drawRingsCanvas(ringsRef.current, { R, bright, lambda, scopePos, rgb })
    if (zoomRef.current)  drawZoomCanvas(zoomRef.current,  { R, bright, lambda, scopePos, rgb, zoomLevel })
  }, [R, bright, lambda, scopePos, zoomLevel])

  // Scope drag on the lens element
  const onLensDrag = useCallback(e => {
    e.preventDefault()
    dragging.current   = true
    dragStartX.current = e.clientX
    dragStartPos.current = scopePos
  }, [scopePos])

  useEffect(() => {
    const onMove = e => {
      if (!dragging.current) return
      const track = document.getElementById('scopeTrack02')
      const trackW = track ? track.offsetWidth : 460
      const dcm = (e.clientX - dragStartX.current) / trackW * 3.0
      setScopePos(p => Math.max(-1.5, Math.min(1.5, dragStartPos.current + dcm)))
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [])

  // Click anywhere on rings canvas → move scope
  const onCanvasClick = e => {
    const cv   = ringsRef.current
    const rect = cv.getBoundingClientRect()
    const frac = (e.clientX - rect.left) / cv.offsetWidth
    setScopePos(Math.max(-1.5, Math.min(1.5, -1.5 + frac * 3.0)))
  }

  // Jump to ring
  const jumpToRing = (n, side) => {
    const lCm = LAMBDA_MAP[lambda] || 5893e-8
    const r   = Math.sqrt(n * lCm * R)
    setScopePos(Math.max(-1.5, Math.min(1.5, side === 'L' ? -r : r)))
    setRecRing(RINGS.indexOf(n))
    setRecSide(side === 'L' ? 'L' : 'R')
  }

  const reading = BASE_READING + scopePos

  // Observation table state
  const [x1Vals, setX1Vals] = useState(Array(5).fill(''))
  const [x2Vals, setX2Vals] = useState(Array(5).fill(''))
  const [recRing, setRecRing] = useState(0)
  const [recSide, setRecSide] = useState('L')
  const [results, setResults] = useState(null)

  const recordReading = () => {
    const val = reading.toFixed(3)
    if (recSide === 'L') {
      setX1Vals(prev => { const n = [...prev]; n[recRing] = val; return n })
    } else {
      setX2Vals(prev => { const n = [...prev]; n[recRing] = val; return n })
    }
  }

  // Computed Dn and Dn2 values
  const dn2Vals = RINGS.map((_, i) => {
    const x1 = parseFloat(x1Vals[i]), x2 = parseFloat(x2Vals[i])
    if (isNaN(x1) || isNaN(x2)) return 0
    const dn = Math.abs(x2 - x1)
    return dn * dn
  })

  const dnVals = RINGS.map((_, i) => {
    const x1 = parseFloat(x1Vals[i]), x2 = parseFloat(x2Vals[i])
    if (isNaN(x1) || isNaN(x2)) return '—'
    return Math.abs(x2 - x1).toFixed(3)
  })

  const diffVals = RINGS.map((_, i) => {
    const j = i + 2
    if (j >= RINGS.length) return '—'
    if (!dn2Vals[i] || !dn2Vals[j]) return '—'
    return (dn2Vals[j] - dn2Vals[i]).toFixed(4)
  })

  // Calculate R
  const calcAll = () => {
    const lambda_cm = LAMBDA_MAP[lambda] || 5893e-8
    const m = 2
    const rVals = []
    for (let i = 0; i < dn2Vals.length - m; i++) {
      const diff = dn2Vals[i + m] - dn2Vals[i]
      if (diff > 0) rVals.push(diff / (4 * m * lambda_cm))
    }
    if (rVals.length === 0) return
    const avg = rVals.reduce((a, b) => a + b, 0) / rVals.length
    // Draw graph and get slope-based R
    const slope = drawGraphCanvas(graphRef.current, dn2Vals)
    const rGraph = slope ? slope / (4 * lambda_cm) : null
    setResults({ rFormula: rVals[0].toFixed(2), rAvg: avg.toFixed(2), rGraph: rGraph?.toFixed(2) })
  }

  const reset = () => {
    setX1Vals(Array(5).fill(''))
    setX2Vals(Array(5).fill(''))
    setResults(null)
    if (graphRef.current) drawGraphCanvas(graphRef.current, [0, 0, 0, 0, 0])
  }

  // Draw empty graph on mount
  useEffect(() => {
    if (graphRef.current) drawGraphCanvas(graphRef.current, [0, 0, 0, 0, 0])
  }, [])

  // Scope lens visual position
  const lensPct = ((scopePos + 1.5) / 3.0) * 100

  // Print handler
  const handlePrint = () => {
    window.print()
  }

  return (
    <div>
      {/* How to use */}
      <div className="howto-card" style={{ marginBottom: 20 }}>
        <h4>💡 How to Use</h4>
        <div className="howto-steps">
          {[
            'Drag the microscope lens (circle) left/right over the ring pattern — or click anywhere on rings to move scope.',
            'Use "Jump to ring" buttons to snap scope to the left/right edge of rings 2, 4, 6, 8, 10.',
            'Select ring number and side (X₁=Left / X₂=Right), click 📌 Record to fill the table.',
            'Click ⚡ Calculate All to compute Dₙ, D²ₙ, and R by formula. Then Draw Graph for slope-based R.',
          ].map((s, i) => (
            <div key={i} className="hs">
              <span className="hs-num">{String(i + 1).padStart(2, '0')}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px',
                    gap: 20, alignItems: 'start', marginBottom: 22 }}>
        {/* Canvas + scope track */}
        <div>
          <div className="sim-top">
            <h3>🔬 Newton's Rings Live Simulation</h3>
            {/* Rings canvas */}
            <div id="ringsStage" style={{ position: 'relative' }}>
              <canvas
                ref={ringsRef} width={460} height={320}
                style={{ borderRadius: 8, maxWidth: '100%', display: 'block',
                         margin: '0 auto', cursor: 'crosshair' }}
                onClick={onCanvasClick}
              />
              {/* Scope track overlay */}
              <div id="scopeTrack02" style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                pointerEvents: 'none',
              }}>
                <div style={{
                  position: 'absolute', top: 0, bottom: 0,
                  left: `calc(${lensPct}% - 120px)`,
                  width: 240,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', cursor: 'grab',
                  pointerEvents: 'all',
                }} onMouseDown={onLensDrag}>
                  {/* Tube */}
                  <div style={{
                    width: 36, height: '55%', borderRadius: '3px 3px 0 0',
                    background: 'linear-gradient(180deg,#2a3f5f,#1a2840)',
                    border: '1px solid rgba(99,179,237,0.3)',
                  }}/>
                  {/* Barrel */}
                  <div style={{
                    width: 56, height: 32, background: '#1e304a',
                    border: '1px solid rgba(99,179,237,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, borderRadius: 2,
                  }}>👁</div>
                  {/* Objective circle */}
                  <div style={{
                    width: 240, height: 240, borderRadius: '50%',
                    border: '2px solid rgba(99,179,237,0.6)',
                    background: '#050a14', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 0 12px rgba(99,179,237,0.25),inset 0 0 8px rgba(0,0,0,0.8)',
                    flexShrink: 0,
                  }}>
                    <canvas ref={zoomRef} width={240} height={240}
                      style={{ position: 'absolute', top: 0, left: 0,
                               width: '100%', height: '100%', borderRadius: '50%' }}/>
                    {/* Crosshair */}
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0,
                                  height: 1, background: 'rgba(255,50,50,0.7)', pointerEvents: 'none' }}/>
                    <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0,
                                  width: 1, background: 'rgba(255,50,50,0.7)', pointerEvents: 'none' }}/>
                  </div>
                  {/* Scale line */}
                  <div style={{ width: 1, flexGrow: 1, background: 'rgba(99,179,237,0.3)' }}/>
                </div>
              </div>

              {/* Ruler */}
              <div style={{
                height: 36, background: 'var(--surface2)',
                borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden',
              }}>
                {Array.from({ length: 31 }, (_, i) => {
                  const pct = (i / 30) * 100
                  const major = i % 5 === 0
                  return (
                    <div key={i} style={{
                      position: 'absolute', left: `${pct}%`, height: '100%',
                      transform: 'translateX(-50%)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                    }}>
                      <div style={{
                        width: 1, height: major ? 12 : 6,
                        background: major ? 'rgba(99,179,237,0.6)' : 'rgba(99,179,237,0.3)',
                      }}/>
                      {major && (
                        <span style={{
                          fontFamily: "'DM Mono',monospace", fontSize: '0.58rem',
                          color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap',
                        }}>
                          {(BASE_READING - 1.5 + (i / 30) * 3).toFixed(3)}
                        </span>
                      )}
                    </div>
                  )
                })}
                {/* Marker */}
                <div style={{
                  position: 'absolute', bottom: 0,
                  left: `${lensPct}%`, transform: 'translateX(-50%)',
                  fontFamily: "'DM Mono',monospace", fontSize: '0.62rem',
                  color: 'var(--accent)', background: 'rgba(99,179,237,0.12)',
                  padding: '1px 5px', borderRadius: 3, border: '1px solid rgba(99,179,237,0.3)',
                  whiteSpace: 'nowrap', transition: 'left 0.05s',
                }}>
                  {reading.toFixed(3)}
                </div>
              </div>
            </div>

            {/* Micrometer reading */}
            <div style={{
              padding: '12px 16px', display: 'flex', alignItems: 'center',
              gap: 16, borderTop: '1px solid var(--border)', background: 'var(--surface2)',
              flexWrap: 'wrap',
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Micrometer Reading
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '1.6rem',
                               fontWeight: 500, color: 'var(--accent)' }}>
                  {reading.toFixed(3)}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>cm</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                ← moving left decreases &nbsp;|&nbsp; moving right increases →
              </div>
            </div>

            {/* Jump to ring buttons */}
            <div style={{ padding: '10px 14px', display: 'flex', flexWrap: 'wrap',
                          gap: 5, alignItems: 'center', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: 8 }}>
                Jump to ring:
              </span>
              {RINGS.flatMap(n => ['L', 'R'].map(s => (
                <button key={`${n}${s}`}
                        style={{
                          fontSize: '0.7rem', fontWeight: 600, padding: '4px 9px',
                          borderRadius: 6, border: '1px solid var(--border)',
                          background: 'var(--surface2)', color: 'var(--accent)',
                          cursor: 'pointer', fontFamily: "'DM Mono',monospace",
                        }}
                        onClick={() => jumpToRing(n, s)}>
                  {n}{s}
                </button>
              )))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ctrl-card">
            <h4>⚙️ Parameters</h4>
            {[
              { label: 'Radius R (cm)',   val: R,         set: setR,         min: 50,  max: 300, step: 1,    unit: `${R} cm` },
              { label: 'Zoom / Magnif.', val: zoomLevel, set: setZoomLevel, min: 2,   max: 8,   step: 0.5,  unit: `${zoomLevel}×` },
              { label: 'Brightness',     val: bright,    set: setBright,    min: 0.3, max: 1.0, step: 0.05, unit: bright.toFixed(2) },
            ].map(({ label, val, set, min, max, step, unit }) => (
              <div key={label} className="slider-row">
                <div className="slabel"><span>{label}</span><span className="sval">{unit}</span></div>
                <input type="range" min={min} max={max} step={step} value={val}
                       onChange={e => set(parseFloat(e.target.value))} />
              </div>
            ))}
          </div>

          <div className="ctrl-card">
            <h4>💡 Light Source</h4>
            <select value={lambda}
                    onChange={e => setLambda(+e.target.value)}>
              {LIGHT_SOURCES.map(ls => (
                <option key={ls.nm} value={ls.nm}>{ls.label}</option>
              ))}
            </select>
            <div style={{
              marginTop: 10, background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '10px 13px', fontSize: '0.76rem',
              color: 'var(--text-muted)', lineHeight: 1.75,
            }}>
              {lambda === 589 && <><strong style={{ color: 'var(--accent2)' }}>Sodium 589 nm</strong> — Standard lab source. Clear yellow rings, well-separated. λ = 5893 Å used in all calculations.</>}
              {lambda === 632 && <><strong style={{ color: 'var(--danger)' }}>HeNe Laser 632 nm</strong> — Longer λ → wider ring spacing. Very sharp rings due to high coherence.</>}
              {lambda === 532 && <><strong style={{ color: 'var(--success)' }}>Green Laser 532 nm</strong> — High eye sensitivity. Ring spacing between sodium and red.</>}
              {lambda === 405 && <><strong style={{ color: '#b794f4' }}>Violet 405 nm</strong> — Shortest λ → tightest rings, most closely packed. Harder to resolve.</>}
            </div>
          </div>

          <div className="ctrl-card" style={{ background: 'rgba(99,179,237,0.03)' }}>
            <h4 style={{ color: 'var(--accent2)' }}>📍 Record Reading</h4>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
              Current reading:
            </div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '1.4rem',
                          color: 'var(--accent)', marginBottom: 10 }}>
              {reading.toFixed(3)} cm
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <select value={recRing} onChange={e => setRecRing(+e.target.value)} style={{ flex: 1 }}>
                {RINGS.map((n, i) => <option key={n} value={i}>Ring {n}</option>)}
              </select>
              <select value={recSide} onChange={e => setRecSide(e.target.value)} style={{ flex: 1 }}>
                <option value="L">Left (X₁)</option>
                <option value="R">Right (X₂)</option>
              </select>
            </div>
            <button className="btn-sm btn-accent"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={recordReading}>
              📌 Record This Reading
            </button>
          </div>
        </div>
      </div>

      {/* Observation Table */}
      <div className="obs-wrap">
        <div className="obs-hd">
          <h3>📊 Observation Table</h3>
          <div className="obs-actions">
            <button className="btn-sm btn-dim" onClick={handlePrint} title="Print table">🖨 Print</button>
            <button className="btn-sm btn-dim" onClick={reset}>↺ Reset</button>
            <button className="btn-sm btn-accent" onClick={calcAll}>⚡ Calculate All</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Sr.</th><th>Ring No. (n)</th>
                <th>Left X₁ (cm)</th><th>Right X₂ (cm)</th>
                <th>Dₙ = |X₂−X₁|</th><th>D²ₙ (cm²)</th>
                <th>(D²ₘ₊ₙ − D²ₙ) cm²</th>
              </tr>
            </thead>
            <tbody>
              {RINGS.map((n, i) => (
                <tr key={n}>
                  <td>{i + 1}</td>
                  <td style={{ color: 'var(--text)', fontWeight: 600 }}>{n}</td>
                  <td>
                    <input type="number" step="0.001" placeholder="X₁ cm"
                           value={x1Vals[i]}
                           onChange={e => setX1Vals(prev => {
                             const nv = [...prev]; nv[i] = e.target.value; return nv
                           })} />
                  </td>
                  <td>
                    <input type="number" step="0.001" placeholder="X₂ cm"
                           value={x2Vals[i]}
                           onChange={e => setX2Vals(prev => {
                             const nv = [...prev]; nv[i] = e.target.value; return nv
                           })} />
                  </td>
                  <td className="auto">{dnVals[i]}</td>
                  <td className="auto">
                    {dnVals[i] !== '—' ? (parseFloat(dnVals[i]) ** 2).toFixed(4) : '—'}
                  </td>
                  <td className="auto">{diffVals[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="calc-wrap" style={{ marginTop: 20 }}>
          <h3>🧮 Calculated Results</h3>
          <div className="calc-grid">
            <div className="calc-item">
              <div className="calc-label">Radius of Curvature (Formula)</div>
              <div><span className="calc-val">{results.rFormula}</span><span className="calc-unit">cm</span></div>
            </div>
            <div className="calc-item">
              <div className="calc-label">Radius of Curvature (Graph/Slope)</div>
              <div><span className="calc-val teal">{results.rGraph ?? '—'}</span><span className="calc-unit">cm</span></div>
            </div>
            <div className="calc-item">
              <div className="calc-label">Average R (all pairs)</div>
              <div><span className="calc-val" style={{ color: 'var(--accent3)' }}>{results.rAvg}</span><span className="calc-unit">cm</span></div>
            </div>
            <div className="calc-item">
              <div className="calc-label">Wavelength used</div>
              <div><span className="calc-val" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>5893 × 10⁻⁸</span><span className="calc-unit">cm</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Graph */}
      <div className="graph-wrap" style={{ marginTop: 20 }}>
        <div className="graph-hdr">
          <h3>📈 Graph: D²ₙ vs Ring Number (n)</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-sm btn-dim" onClick={handlePrint} title="Print graph">🖨 Print</button>
            <button className="btn-sm btn-outline" onClick={calcAll}>▶ Draw Graph</button>
          </div>
        </div>
        <canvas ref={graphRef} width={580} height={300}
                style={{ width: '100%', maxWidth: 580, display: 'block', margin: '0 auto' }}/>

        {/* Graph explanation */}
        <div style={{
          marginTop: 18, background: 'var(--surface2)',
          border: '1px solid var(--border)', borderRadius: 10, padding: '18px 22px',
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent)',
                        letterSpacing: '0.04em', marginBottom: 14 }}>
            📊 How to read this graph
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
                        gap: 12, marginBottom: 14 }}>
            {[
              { color: '#63b3ed', title: 'Data points (blue dots)', desc: 'Each dot is one ring: x = ring number n, y = D²ₙ in cm²' },
              { color: 'rgba(79,209,197,0.6)', title: 'Best-fit line (teal)', desc: 'Linear regression — should pass near origin. Deviation = measurement error.' },
              { color: 'rgba(246,173,85,0.7)', title: 'Slope triangle A–B–C', desc: 'Used to compute slope = AB/BC = ΔD²ₙ / Δn' },
              { color: 'var(--accent2)', title: 'Why it is linear', desc: 'D²ₙ = 4nλR → slope = 4λR → R = slope / (4λ). Steeper slope = larger R.' },
            ].map(({ color, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start',
                                        fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%',
                               background: color, flexShrink: 0, marginTop: 4 }}/>
                <div><strong style={{ color: 'var(--text)' }}>{title}</strong> — {desc}</div>
              </div>
            ))}
          </div>
          <div style={{
            fontFamily: "'DM Mono',monospace", fontSize: '0.8rem', color: 'var(--accent2)',
            background: 'rgba(79,209,197,0.06)', border: '1px solid rgba(79,209,197,0.15)',
            borderRadius: 8, padding: '10px 14px', textAlign: 'center',
          }}>
            R (from graph) = Slope ÷ (4 × λ) &nbsp;|&nbsp; λ = 5893 × 10⁻⁸ cm
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  QUIZ DATA
// ═══════════════════════════════════════════════════════════════
const QUESTIONS = [
  {
    q: "What type of fringe pattern is observed in Newton's Ring experiment?",
    opts: ['Straight parallel fringes', 'Concentric circular rings', 'Hyperbolic fringes', 'Elliptical rings'],
    ans: 1,
    exp: "Newton's Rings are concentric circular interference fringes due to the circular symmetry of the air wedge formed between the plano-convex lens and the flat glass plate.",
  },
  {
    q: "Why is the centre of Newton's Ring pattern always dark?",
    opts: ['Maximum constructive interference at centre', 'Phase change of π at glass surface gives path difference λ/2 at contact (t=0), causing destructive interference', 'Lens absorbs all light at centre', 'Reflection coefficient is zero at centre'],
    ans: 1,
    exp: 'At the centre, t = 0. The ray at the glass plate undergoes a phase change of π (half-wave loss), producing destructive interference even with zero film thickness.',
  },
  {
    q: 'The diameter Dₙ of the n-th dark ring is proportional to:',
    opts: ['n', 'n²', '√n', '1/√n'],
    ans: 2,
    exp: 'From D²ₙ = 4nλR, we get Dₙ ∝ √n. Ring spacing decreases as n increases — rings become closer together at higher orders.',
  },
  {
    q: '5893 Å expressed in cm is:',
    opts: ['5893 × 10⁻⁶ cm', '5893 × 10⁻⁸ cm', '5.893 × 10⁻⁵ cm', '5893 × 10⁻⁴ cm'],
    ans: 1,
    exp: '1 Ångström (Å) = 10⁻⁸ cm. Therefore 5893 Å = 5893 × 10⁻⁸ cm ≈ 589.3 nm.',
  },
  {
    q: "In R = (D²ₘ₊ₙ − D²ₙ)/(4mλ), what is 'm'?",
    opts: ['Order of the ring', 'Ring gap between the two chosen rings (e.g. rings 2 and 4 → m=2)', 'Mass of the lens', 'Magnification of eyepiece'],
    ans: 1,
    exp: "'m' is the number of rings skipped between the two rings selected for calculation. Using non-adjacent rings reduces errors in measurement.",
  },
  {
    q: "Newton's Rings are formed due to which phenomenon?",
    opts: ['Diffraction of light', 'Total internal reflection', 'Thin film interference of reflected monochromatic light', 'Polarization of light'],
    ans: 2,
    exp: "Newton's Rings are a thin film interference phenomenon. Light reflected from the two surfaces of the air wedge creates path differences that produce alternating constructive and destructive interference.",
  },
  {
    q: 'Why do outer rings appear more closely spaced than inner rings?',
    opts: ['Light intensity decreases outward', 'Since Dₙ ∝ √n, the increment ΔD decreases as n increases', 'Glass is thinner at edges', 'Due to diffraction at lens edge'],
    ans: 1,
    exp: 'Because Dₙ ∝ √n, the gap between successive rings decreases with increasing n — causing outer rings to appear progressively closer together.',
  },
  {
    q: 'If R is doubled while keeping λ constant, ring diameters:',
    opts: ['Double', 'Halve', 'Increase by √2', 'Quadruple'],
    ans: 2,
    exp: 'D²ₙ = 4nλR, so Dₙ = √(4nλR). Doubling R → Dₙ increases by √2. The rings spread outward.',
  },
]

const FLASHCARDS = [
  { q: "Formula for radius of curvature R in Newton's Ring experiment?", a: "R = (D²ₘ₊ₙ − D²ₙ) / (4mλ)\nDₙ = diameter of n-th ring, m = ring gap, λ = wavelength" },
  { q: "Why does a dark spot appear at the centre of Newton's Rings?", a: "At t = 0 (contact point), reflected ray at glass plate undergoes phase change of π, giving net path difference λ/2 → destructive interference → dark centre" },
  { q: 'What is the least count of the travelling microscope?', a: 'LC = a/b = 0.05/50 = 0.001 cm\na = smallest main scale division, b = total vernier divisions' },
  { q: 'Wavelength of sodium light used in the experiment?', a: 'λ = 5893 Å = 5893 × 10⁻⁸ cm ≈ 589.3 nm\n(yellow monochromatic sodium lamp)' },
  { q: 'How do you find R from the D²ₙ vs n graph?', a: 'D²ₙ = 4nλR → slope of graph = 4λR\nSo  R = slope / (4λ)\nPick two points on best-fit line → calculate slope → substitute' },
  { q: "Why are outer Newton's Rings more closely spaced?", a: 'Since Dₙ ∝ √n, the spacing ΔD decreases with increasing n. As n grows, consecutive √n values get closer → rings appear compressed outward' },
]

// ═══════════════════════════════════════════════════════════════
//  TEST PANEL
// ═══════════════════════════════════════════════════════════════
function Test() {
  const [qi,      setQi]      = useState(0)
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null))
  const [done,    setDone]    = useState(false)
  const [cardIdx, setCardIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const pick = i => {
    if (answers[qi] !== null) return
    setAnswers(prev => { const n = [...prev]; n[qi] = i; return n })
  }

  const score  = answers.filter((a, i) => a === QUESTIONS[i].ans).length
  const pct    = Math.round(score / QUESTIONS.length * 100)
  const labels = ['Study more 📖', 'Good effort! 🎯', 'Great job! 🌟', 'Excellent! 🏆', 'Perfect! 🎉']
  const q      = QUESTIONS[qi]
  const card   = FLASHCARDS[cardIdx]

  return (
    <div>
      <div className="test-hd">
        <h2>Test Your Knowledge</h2>
        <p>Newton's Ring Experiment</p>
      </div>

      {!done ? (
        <>
          <div className="prog-row">
            <div className="prog-bar">
              <div className="prog-fill" style={{ width: `${(qi / QUESTIONS.length) * 100}%` }}/>
            </div>
            <span className="prog-txt">{qi}/{QUESTIONS.length}</span>
          </div>

          <div className="qcard">
            <div className="q-num">Question {qi + 1} of {QUESTIONS.length}</div>
            <div className="q-text">{q.q}</div>
            <div className="opts">
              {q.opts.map((o, i) => {
                const a = answers[qi]
                let cls = 'opt'
                if (a !== null) {
                  if (i === q.ans) cls += ' correct'
                  else if (i === a) cls += ' wrong'
                }
                return (
                  <button key={i} className={cls} disabled={answers[qi] !== null}
                          onClick={() => pick(i)}>
                    <span className="opt-l">{'ABCD'[i]}</span>{o}
                  </button>
                )
              })}
            </div>
            {answers[qi] !== null && (
              <div className="expl">
                <strong>Explanation:</strong> {q.exp}
              </div>
            )}
          </div>

          <div className="q-actions">
            {qi > 0 && (
              <button className="btn-sm btn-dim" onClick={() => setQi(q => q - 1)}>← Prev</button>
            )}
            <button className="btn-sm btn-accent"
                    onClick={() => qi === QUESTIONS.length - 1 ? setDone(true) : setQi(q => q + 1)}>
              {qi === QUESTIONS.length - 1 ? 'See Results →' : 'Next →'}
            </button>
          </div>
        </>
      ) : (
        <div className="score-card">
          <span className="score-big">{score}/{QUESTIONS.length}</span>
          <div className="score-lbl">
            {pct}% — {labels[Math.min(Math.floor(pct / 25), 4)]}
          </div>
          <button className="btn-sm btn-accent" onClick={() => {
            setQi(0); setAnswers(Array(QUESTIONS.length).fill(null)); setDone(false)
          }}>↺ Retake</button>
        </div>
      )}

      {/* Flashcards */}
      <div className="fc-section">
        <h3>⚡ Flashcards</h3>
        <div className={`flashcard ${flipped ? 'flipped' : ''}`}
             onClick={() => setFlipped(f => !f)}>
          <div className="fc-inner">
            <div className="fc-f">{card.q}</div>
            <div className="fc-b">
              {card.a.split('\n').map((line, i) => (
                <React.Fragment key={i}>{line}<br /></React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div className="fc-hint">👆 Click to flip</div>
        <div className="fc-nav">
          <button className="btn-sm btn-dim"
                  onClick={() => { setCardIdx(i => (i - 1 + FLASHCARDS.length) % FLASHCARDS.length); setFlipped(false) }}>
            ← Prev
          </button>
          <span className="fc-ctr">{cardIdx + 1} / {FLASHCARDS.length}</span>
          <button className="btn-sm btn-dim"
                  onClick={() => { setCardIdx(i => (i + 1) % FLASHCARDS.length); setFlipped(false) }}>
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
export default function Exp02({ tab }) {
  if (tab === 'theory')     return <Theory />
  if (tab === 'simulation') return <Simulation />
  if (tab === 'test')       return <Test />
  return null
}