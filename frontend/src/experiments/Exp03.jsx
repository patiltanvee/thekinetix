// ─────────────────────────────────────────────────────────────
//  Exp03.jsx  —  Wavelength of Laser via Diffraction Grating
// ─────────────────────────────────────────────────────────────
import React, { useRef, useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════
const LIGHT_SOURCES = [
  { nm: 632, label: '🔴 He-Ne Laser — 632 nm' },
  { nm: 589, label: '🟡 Sodium — 589 nm' },
  { nm: 532, label: '🟢 Green Laser — 532 nm' },
  { nm: 405, label: '🟣 Violet — 405 nm' },
]

// 6 rows: 3 different L values × orders n=1 and n=2
const ROW_ORDERS = [1, 2, 1, 2, 1, 2]

function wlRGB(nm) {
  let r, g, b
  if      (nm < 440) { r = (440-nm)/60; g = 0; b = 1 }
  else if (nm < 490) { r = 0; g = (nm-440)/50; b = 1 }
  else if (nm < 510) { r = 0; g = 1; b = (510-nm)/20 }
  else if (nm < 580) { r = (nm-510)/70; g = 1; b = 0 }
  else if (nm < 645) { r = 1; g = (645-nm)/65; b = 0 }
  else               { r = 1; g = 0; b = 0 }
  const f = nm < 420 ? 0.4 + 0.6*(nm-380)/40 : 1
  return { r: Math.round(r*f*255), g: Math.round(g*f*255), b: Math.round(b*f*255) }
}

// ═══════════════════════════════════════════════════════════════
//  DRAW FUNCTION  (pure — takes canvas + state params)
// ═══════════════════════════════════════════════════════════════
function drawDiffraction(canvas, { D, N, lambda, caliperSeparation, activeOrder }) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height, cy = H / 2
  ctx.fillStyle = '#0a1020'
  ctx.fillRect(0, 0, W, H)

  const rgb       = wlRGB(lambda)
  const lCm       = lambda * 1e-7
  const gratingX  = 120
  const screenX   = W - 60
  const pixPerCm  = (screenX - gratingX) / D

  // Screen bar
  ctx.fillStyle = 'rgba(99,179,237,0.08)'
  ctx.fillRect(screenX - 2, 20, 4, H - 40)
  ctx.fillStyle = 'rgba(99,179,237,0.5)'
  ctx.font = '8px DM Mono,monospace'
  ctx.textAlign = 'center'
  ctx.fillText('Screen', screenX, 14)

  // Grating lines
  for (let i = 0; i < 8; i++) {
    ctx.strokeStyle = 'rgba(99,179,237,0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(gratingX + (i % 2) * 2, cy - 30)
    ctx.lineTo(gratingX + (i % 2) * 2, cy + 30)
    ctx.stroke()
  }
  ctx.fillStyle = 'rgba(99,179,237,0.5)'
  ctx.fillText('Grating', gratingX, cy + 42)
  ctx.fillStyle = 'rgba(79,209,197,0.6)'
  ctx.fillText(`N=${N}/cm`, gratingX, cy + 52)

  // Laser beam
  ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.8)`
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(gratingX, cy); ctx.stroke()

  // Laser source label
  ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.7)`
  ctx.font = '7px DM Mono,monospace'; ctx.textAlign = 'left'
  ctx.fillText('Laser', 4, cy - 4)

  // Compute diffraction orders
  const orders = [0, 1, 2]
  const dots = []
  orders.forEach(n => {
    const sinT = n * N * lCm
    if (sinT >= 1) return
    const tanT  = sinT / Math.sqrt(1 - sinT * sinT)
    const xCm   = D * tanT
    const xPx   = xCm * pixPerCm
    const intensity = n === 0 ? 1 : n === 1 ? 0.85 : 0.5
    dots.push({ n, xPx, xCm, sinT, intensity, upper: cy - xPx, lower: cy + xPx })
  })

  // Draw diffracted beams + dots
  dots.forEach(d => {
    if (d.n > 0) {
      ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${d.intensity * 0.4})`
      ctx.lineWidth = 1; ctx.setLineDash([3, 3])
      ctx.beginPath(); ctx.moveTo(gratingX, cy); ctx.lineTo(screenX, d.upper); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(gratingX, cy); ctx.lineTo(screenX, d.lower); ctx.stroke()
      ctx.setLineDash([])
    }
    ;[d.upper, d.lower].forEach((y, i) => {
      if (d.n === 0 && i === 1) return
      const ys   = d.n === 0 ? cy : y
      const grad = ctx.createRadialGradient(screenX, ys, 0, screenX, ys, 10)
      grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${d.intensity})`)
      grad.addColorStop(1, 'transparent')
      ctx.beginPath(); ctx.arc(screenX, ys, 10, 0, 2 * Math.PI)
      ctx.fillStyle = grad; ctx.fill()
    })
  })

  // Draw manual calipers
  const caliperHalfPx = (caliperSeparation / 2) * pixPerCm
  ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.8
  // Upper jaw
  ctx.beginPath()
  ctx.moveTo(screenX - 18, cy - caliperHalfPx)
  ctx.lineTo(screenX + 18, cy - caliperHalfPx)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(screenX - 18, cy - caliperHalfPx - 4)
  ctx.lineTo(screenX - 18, cy - caliperHalfPx + 4)
  ctx.moveTo(screenX + 18, cy - caliperHalfPx - 4)
  ctx.lineTo(screenX + 18, cy - caliperHalfPx + 4)
  ctx.stroke()

  // Lower jaw
  ctx.beginPath()
  ctx.moveTo(screenX - 18, cy + caliperHalfPx)
  ctx.lineTo(screenX + 18, cy + caliperHalfPx)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(screenX - 18, cy + caliperHalfPx - 4)
  ctx.lineTo(screenX - 18, cy + caliperHalfPx + 4)
  ctx.moveTo(screenX + 18, cy + caliperHalfPx - 4)
  ctx.lineTo(screenX + 18, cy + caliperHalfPx + 4)
  ctx.stroke()

  // Connector scale line
  ctx.strokeStyle = 'rgba(251,191,36,0.35)'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(screenX + 22, cy - caliperHalfPx); ctx.lineTo(screenX + 22, cy + caliperHalfPx); ctx.stroke()

  // Digital reading next to connector
  ctx.fillStyle = '#fbbf24'; ctx.font = '8px DM Mono,monospace'; ctx.textAlign = 'left'
  ctx.fillText(`${caliperSeparation.toFixed(3)} cm`, screenX + 28, cy + 3)

  // Draw magnified insets
  const zoomScale = 2.5
  const drawMagnifier = (destX, destY, targetY, label) => {
    const r = 40
    ctx.save()
    ctx.shadowColor = 'rgba(251,191,36,0.15)'
    ctx.shadowBlur = 6
    ctx.beginPath()
    ctx.arc(destX, destY, r, 0, 2 * Math.PI)
    ctx.fillStyle = '#050a14'
    ctx.fill()
    ctx.shadowColor = 'transparent'
    ctx.strokeStyle = 'rgba(251,191,36,0.7)'
    ctx.lineWidth = 1.8
    ctx.stroke()
    ctx.clip()

    // Grid inside zoom
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 0.5
    ctx.beginPath()
    for (let xo = -r; xo <= r; xo += 10) {
      ctx.moveTo(destX + xo, destY - r); ctx.lineTo(destX + xo, destY + r)
    }
    for (let yo = -r; yo <= r; yo += 10) {
      ctx.moveTo(destX - r, destY + yo); ctx.lineTo(destX + r, destY + yo)
    }
    ctx.stroke()

    // Screen line inside zoom
    ctx.strokeStyle = 'rgba(99,179,237,0.15)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(destX, destY - r); ctx.lineTo(destX, destY + r); ctx.stroke()

    // Draw spots relative to targetY
    dots.forEach(d => {
      const yZoomU = destY + (d.upper - targetY) * zoomScale
      if (Math.abs(yZoomU - destY) < r + 20) {
        const grad = ctx.createRadialGradient(destX, yZoomU, 0, destX, yZoomU, 8 * zoomScale)
        grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${d.intensity})`)
        grad.addColorStop(1, 'transparent')
        ctx.beginPath(); ctx.arc(destX, yZoomU, 8 * zoomScale, 0, 2 * Math.PI)
        ctx.fillStyle = grad; ctx.fill()
      }
      if (d.n > 0) {
        const yZoomL = destY + (d.lower - targetY) * zoomScale
        if (Math.abs(yZoomL - destY) < r + 20) {
          const grad = ctx.createRadialGradient(destX, yZoomL, 0, destX, yZoomL, 8 * zoomScale)
          grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${d.intensity})`)
          grad.addColorStop(1, 'transparent')
          ctx.beginPath(); ctx.arc(destX, yZoomL, 8 * zoomScale, 0, 2 * Math.PI)
          ctx.fillStyle = grad; ctx.fill()
        }
      }
    })

    // Draw caliper jaw line (always centered in viewport since we center on caliper y)
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.8
    ctx.beginPath()
    ctx.moveTo(destX - 22, destY)
    ctx.lineTo(destX + 22, destY)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(destX - 22, destY - 3)
    ctx.lineTo(destX - 22, destY + 3)
    ctx.moveTo(destX + 22, destY - 3)
    ctx.lineTo(destX + 22, destY + 3)
    ctx.stroke()

    ctx.restore()

    // Glass glare arc
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(destX, destY, r - 2, -Math.PI / 3, Math.PI / 6); ctx.stroke()

    // Label
    ctx.fillStyle = 'rgba(148,163,184,0.95)'
    ctx.font = '7.5px DM Mono,monospace'
    ctx.textAlign = 'center'
    ctx.fillText(label, destX, destY - r - 6)
  }

  drawMagnifier(200, 75, cy - caliperHalfPx, '🔎 UPPER JAW ZOOM')
  drawMagnifier(200, H - 75, cy + caliperHalfPx, '🔎 LOWER JAW ZOOM')

  // Info labels
  ctx.fillStyle = 'rgba(113,128,150,0.7)'; ctx.font = '8px DM Mono,monospace'; ctx.textAlign = 'left'
  ctx.fillText(`λ=${lambda}nm`, 20, 16)
  ctx.fillText(`D=${D}cm`,      20, 26)

  // Order labels
  dots.forEach(d => {
    if (d.n === 0) {
      ctx.fillStyle = 'rgba(246,173,85,0.8)'; ctx.font = '7px DM Mono,monospace'; ctx.textAlign = 'left'
      ctx.fillText('n=0', screenX - 28, cy - 6)
    } else {
      ctx.fillStyle = 'rgba(246,173,85,0.7)'; ctx.textAlign = 'left'
      ctx.fillText(`n=${d.n}`, screenX - 28, d.upper + 4)
      ctx.fillText(`n=${d.n}`, screenX - 28, d.lower + 4)
    }
  })

  // Return the actual exact target separation for order calculation
  const targetDot = dots.find(d => d.n === activeOrder)
  return targetDot ? targetDot.xCm * 2 : 0
}

// ═══════════════════════════════════════════════════════════════
//  THEORY PANEL
// ═══════════════════════════════════════════════════════════════
function Theory({ setTab }) {
  return (
    <div className="theory-cols">
      {/* LEFT */}
      <div>
        <div className="aim-formulae-grid">
          <div className="aim-card">
            <div className="aim-card-header">
              <div className="aim-icon-wrapper">🎯</div>
              <h3 className="aim-card-title">Aim</h3>
            </div>
            <p className="aim-card-body">
              To determine the number of lines per cm on the grating surface and to find the
              <strong> wavelength of a He-Ne laser beam</strong> using a diffraction grating.
            </p>
          </div>

          <div className="aim-card">
            <div className="aim-card-header">
              <div className="formulae-icon-wrapper">&lt;/&gt;</div>
              <h3 className="aim-card-title">Formulae</h3>
            </div>
            <div className="formula-block">
              <span className="formula-text">N = sin θ / (nλ)</span>
              <span className="formula-subtext">N = NUMBER OF LINES PER CM ON GRATING</span>
              <div className="formula-detail">
                <b>θ</b> = Angle of diffraction = tan⁻¹(x / 2D) &nbsp;|&nbsp;
                <b>n</b> = Order of diffraction (1, 2, 3…) &nbsp;|&nbsp;
                <b>λ</b> = Wavelength of laser light (cm) &nbsp;|&nbsp;
                <b>x</b> = Distance between two n-th order spots (cm) &nbsp;|&nbsp;
                <b>D</b> = Distance from grating to screen (cm)
              </div>
            </div>
            <div className="formula-block">
              <span className="formula-text">λ = sin θ / (nN)</span>
              <span className="formula-subtext">(WAVELENGTH OF LASER)</span>
              <div className="formula-detail">
                sin θ ≈ tan θ = x/2D
              </div>
            </div>
            <div className="formula-block">
              <span className="formula-text">(a + b) sin θ = nλ</span>
              <span className="formula-subtext">(GRATING ELEMENT EQUATION)</span>
              <div className="formula-detail">
                Grating element (a+b) = 1/N
              </div>
            </div>
          </div>
        </div>

        <div className="aim-card">
          <div className="aim-card-header">
            <div className="theory-icon-wrapper">📚</div>
            <h3 className="aim-card-title">Theory</h3>
          </div>
          <div className="aim-card-body">
            <p style={{ marginBottom: '12px' }}>
              A <strong>diffraction grating</strong> consists of a large number of parallel slits
              of equal width separated by equal opaque spaces. It is constructed by ruling fine
              equidistant parallel lines on an optically flat glass plate with a diamond point.
            </p>
            <p style={{ marginBottom: '12px' }}>
              When a parallel beam of monochromatic laser light of wavelength λ is incident on
              N parallel slits (each of width 'a', separated by opaque distance 'b'), the grating
              equation for a plane transmission grating gives: <strong>(a + b) sin θ = nλ</strong>, where
              the grating element (a+b) = 1/N.
            </p>
            <p style={{ marginBottom: '12px' }}>
              The laser beam passing through the grating displays a pattern of bright dots on a
              screen — the <strong>zeroth order dot</strong> at the center (θ = 0) and symmetric
              <strong> first-order, second-order</strong> dots on each side. Higher orders are
              progressively dimmer.
            </p>
            <p>
              By measuring the separation x between symmetric n-th order dots and knowing the
              grating-screen distance D, we compute θ = tan⁻¹(x/2D) and solve for λ.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT — Setup Frame + Given Constants + Start Simulation Button */}
      <div>
        <div className="setup-header-label">Diffraction Grating Setup</div>
        <div className="laptop-frame">
          <svg viewBox="0 0 280 260" xmlns="http://www.w3.org/2000/svg"
               style={{ width: '100%', maxWidth: 260 }}>
            <rect width="280" height="260" fill="#0f1829" rx="6"/>
            {/* Laser source */}
            <rect x="12" y="118" width="38" height="24"
                  fill="rgba(252,129,129,0.18)" stroke="#fc8181" strokeWidth="1.2" rx="3"/>
            <text x="31" y="134" fill="#fc8181" fontSize="7"
                  textAnchor="middle" fontFamily="DM Sans,sans-serif">Laser</text>
            {/* Beam */}
            <line x1="50" y1="130" x2="100" y2="130" stroke="#fc8181" strokeWidth="1.5"/>
            {/* Grating */}
            <rect x="100" y="105" width="10" height="50"
                  fill="rgba(99,179,237,0.12)" stroke="#63b3ed" strokeWidth="1.2" rx="1"/>
            {[102, 105, 108].map(x => (
              <line key={x} x1={x} y1="108" x2={x} y2="152"
                    stroke="#63b3ed" strokeWidth="0.5" strokeDasharray="2,2"/>
            ))}
            <text x="105" y="170" fill="#63b3ed" fontSize="6.5"
                  textAnchor="middle" fontFamily="DM Sans,sans-serif">Grating</text>
            <text x="105" y="178" fill="#63b3ed" fontSize="6"
                  textAnchor="middle" fontFamily="DM Sans,sans-serif">N=1000 /cm</text>
            {/* Screen */}
            <rect x="210" y="90" width="8" height="80"
                  fill="rgba(79,209,197,0.12)" stroke="#4fd1c5" strokeWidth="1.2" rx="1"/>
            <text x="214" y="84" fill="#4fd1c5" fontSize="6.5"
                  textAnchor="middle" fontFamily="DM Sans,sans-serif">Screen</text>
            {/* 0th order */}
            <circle cx="214" cy="130" r="3.5" fill="#fc8181"/>
            <text x="224" y="133" fill="#f6ad55" fontSize="6" fontFamily="DM Mono,sans-serif">n=0</text>
            {/* 1st order */}
            <line x1="110" y1="130" x2="214" y2="105"
                  stroke="#fc8181" strokeWidth="1" strokeDasharray="3,2" opacity="0.7"/>
            <circle cx="214" cy="105" r="2.5" fill="#fc8181" opacity="0.8"/>
            <text x="224" y="108" fill="#f6ad55" fontSize="6" fontFamily="DM Mono,sans-serif">n=1</text>
            <line x1="110" y1="130" x2="214" y2="155"
                  stroke="#fc8181" strokeWidth="1" strokeDasharray="3,2" opacity="0.7"/>
            <circle cx="214" cy="155" r="2.5" fill="#fc8181" opacity="0.8"/>
            <text x="224" y="158" fill="#f6ad55" fontSize="6" fontFamily="DM Mono,sans-serif">n=1</text>
            {/* 2nd order */}
            <line x1="110" y1="130" x2="214" y2="88"
                  stroke="#fc8181" strokeWidth="0.8" strokeDasharray="3,2" opacity="0.4"/>
            <circle cx="214" cy="88" r="1.8" fill="#fc8181" opacity="0.45"/>
            <line x1="110" y1="130" x2="214" y2="168"
                  stroke="#fc8181" strokeWidth="0.8" strokeDasharray="3,2" opacity="0.4"/>
            <circle cx="214" cy="168" r="1.8" fill="#fc8181" opacity="0.45"/>
            {/* D annotation */}
            <line x1="110" y1="148" x2="210" y2="148" stroke="#4fd1c5" strokeWidth="0.8"/>
            <text x="160" y="158" fill="#4fd1c5" fontSize="7.5"
                  textAnchor="middle" fontFamily="DM Mono,monospace">D</text>
            {/* x annotation */}
            <line x1="222" y1="105" x2="222" y2="155" stroke="#f6ad55" strokeWidth="0.8"/>
            <text x="236" y="133" fill="#f6ad55" fontSize="7.5" fontFamily="DM Mono,monospace">x</text>
          </svg>
        </div>

        <div className="constants-card">
          <div className="setup-header-label" style={{ textAlign: 'left', marginBottom: '8px' }}>Given Constants</div>
          <div className="constants-list">
            <div className="constant-row">
              <span className="constant-symbol">N</span>
              <span className="constant-value">1000 lines/cm</span>
            </div>
            <div className="constant-row">
              <span className="constant-symbol">λ (He-Ne)</span>
              <span className="constant-value">~632 nm = 6328 Å</span>
            </div>
            <div className="constant-row">
              <span className="constant-symbol">n</span>
              <span className="constant-value">1, 2 (diffraction order)</span>
            </div>
          </div>
          <button className="btn-start-simulation" onClick={() => setTab('simulation')}>
            Start Simulation
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  SIMULATION PANEL
// ═══════════════════════════════════════════════════════════════
function Simulation() {
  const canvasRef = useRef(null)

  // Sim params
  const [D,      setD]      = useState(38)
  const [N,      setN]      = useState(1000)
  const [lambda, setLambda] = useState(632)

  // Caliper state (separation in cm)
  const [caliperSeparation, setCaliperSeparation] = useState(5.0)


  // Observation table: 6 rows
  const [lVals, setLVals] = useState(() => {
    try {
      const saved = localStorage.getItem('kinetix_exp03_sim_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.lVals) return parsed.lVals
      }
    } catch (e) {
      console.error(e)
    }
    return Array(6).fill('')
  })
  const [xVals, setXVals] = useState(() => {
    try {
      const saved = localStorage.getItem('kinetix_exp03_sim_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.xVals) return parsed.xVals
      }
    } catch (e) {
      console.error(e)
    }
    return Array(6).fill('')
  })

  // Results
  const [results, setResults] = useState(() => {
    try {
      const saved = localStorage.getItem('kinetix_exp03_sim_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.results) return parsed.results
      }
    } catch (e) {
      console.error(e)
    }
    return null
  })


  // Auto-save simulation data on change
  useEffect(() => {
    localStorage.setItem('kinetix_exp03_sim_data', JSON.stringify({
      lVals, xVals, results
    }))
  }, [lVals, xVals, results])

  // Record target row
  const [recRow, setRecRow] = useState(0)

  // Draw whenever params change
  useEffect(() => {
    if (!canvasRef.current) return
    const activeOrder = ROW_ORDERS[recRow]
    drawDiffraction(canvasRef.current, { D, N, lambda, caliperSeparation, activeOrder })
  }, [D, N, lambda, caliperSeparation, recRow])

  // Auto-align the caliper separation to exact spot positions
  const autoAlign = () => {
    const activeOrder = ROW_ORDERS[recRow]
    const lCm  = lambda * 1e-7
    const sinT = activeOrder * N * lCm
    if (sinT < 1) {
      const tanT = sinT / Math.sqrt(1 - sinT * sinT)
      const exactX = (D * tanT) * 2
      setCaliperSeparation(exactX)
    }
  }

  const recordReading = () => {
    setXVals(prev => {
      const n = [...prev]; n[recRow] = caliperSeparation.toFixed(3); return n
    })
    setLVals(prev => {
      const n = [...prev]; n[recRow] = D.toString(); return n
    })
  }

  const computedRows = ROW_ORDERS.map((order, i) => {
    const L = parseFloat(lVals[i])
    const x = parseFloat(xVals[i])
    if (isNaN(L) || isNaN(x) || L <= 0) return { theta: '—', sinT: '—', lam: '—' }
    const theta = Math.atan(x / (2 * L)) * 180 / Math.PI
    const sinT  = Math.sin(Math.atan(x / (2 * L)))
    const lam   = sinT / (order * N)
    return {
      theta: theta.toFixed(3) + '°',
      sinT:  sinT.toFixed(4),
      lam:   lam.toExponential(3),
      lamVal: lam,
    }
  })

  const calcAll = () => {
    const lams = computedRows.map(r => r.lamVal).filter(v => v && v > 0)
    if (lams.length === 0) return
    const mean = lams.reduce((a, b) => a + b, 0) / lams.length
    setResults({ meanCm: mean.toExponential(4), meanA: Math.round(mean * 1e8) })
  }

  const reset = () => {
    setLVals(Array(6).fill(''))
    setXVals(Array(6).fill(''))
    setResults(null)
  }

  return (
    <div>
      {/* How to use Banner */}
      <div className="sim-howto-banner">
        <div className="sim-howto-header">
          <span>⚡ HOW TO USE</span>
        </div>
        <div className="sim-howto-grid">
          {[
            'Adjust grating-screen distance D and grating lines N using sliders — watch dots move.',
            'Adjust the Caliper Separation slider (and Fine Tune buttons) to align the golden caliper lines exactly with the diffracted spots on the screen.',
            'Look at the Magnifier zooms to align the golden jaw lines perfectly with the center of the spots.',
            'Select the target row (n=1 or n=2), then click 📌 Record Caliper Read. Click ⚡ Calculate All once all rows are filled.',
          ].map((s, i) => (
            <div key={i} className="sim-howto-step">
              <span className="sim-howto-num">{String(i+1).padStart(2,'0')}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sim-main-grid">
        {/* Left Column: Live Simulation Card */}
        <div className="sim-live-card">
          <div className="sim-live-title">
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', fontSize: '0.85rem' }}>🎯</span>
            Diffraction Grating Pattern Simulation
          </div>
          <div id="diffStage" className="sim-screen-container">
            <canvas ref={canvasRef} width={640} height={360}
                    style={{ borderRadius: 8, maxWidth: '100%', display: 'block', margin: '0 auto', cursor: 'crosshair' }}/>
          </div>
          <div className="sim-readout-bar">
            <div className="sim-readout-hint">CALIPER POSITION READING</div>
            <div className="sim-readout-value" style={{ color: '#d97706' }}>
              {caliperSeparation.toFixed(3)} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>cm</span>
            </div>
            <div className="sim-readout-hint">Align caliper jaws with upper/lower spots of selected order</div>
          </div>
          <div className="sim-jump-bar">
            <span className="sim-jump-label">ASSISTANCE:</span>
            <button className="sim-jump-btn" onClick={autoAlign} style={{ background: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.35)', color: '#d97706' }}>⚡ Auto-Align Caliper</button>
            <button className="sim-jump-btn" onClick={() => setCaliperSeparation(5.0)}>↺ Reset Caliper</button>
          </div>
        </div>

        {/* Right Column: Sidebar Cards */}
        <div>
          <div className="sim-sidebar-card">
            <div className="sim-sidebar-title">⚙️ PARAMETERS</div>
            <div className="sim-param-row">
              <div className="sim-param-label"><span>Grating-Screen D (cm)</span><span className="sim-param-val">{D} cm</span></div>
              <input type="range" min={20} max={70} step={1} value={D} onChange={e => setD(+e.target.value)}/>
            </div>
            <div className="sim-param-row">
              <div className="sim-param-label"><span>N (lines/cm)</span><span className="sim-param-val">{N}</span></div>
              <input type="range" min={500} max={2000} step={100} value={N} onChange={e => setN(+e.target.value)}/>
            </div>
          </div>

          <div className="sim-info-box">
            <div className="sim-info-title">Laser Light Source</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <select className="sim-select" style={{ width: '100%' }} value={lambda} onChange={e => setLambda(+e.target.value)}>
                {LIGHT_SOURCES.map(ls => (
                  <option key={ls.nm} value={ls.nm}>{ls.label}</option>
                ))}
              </select>
              <div className="sim-info-desc" style={{ marginTop: 6, fontSize: '0.72rem' }}>
                {lambda === 632 && <><strong style={{ color: 'var(--danger)' }}>HeNe 632 nm</strong> — Standard red laser. 6328 Å used in calculations.</>}
                {lambda === 589 && <><strong style={{ color: '#d97706' }}>Sodium 589 nm</strong> — Yellow gas lamp wavelength.</>}
                {lambda === 532 && <><strong style={{ color: 'var(--success)' }}>Green 532 nm</strong> — High visibility, closer spacing than red.</>}
                {lambda === 405 && <><strong style={{ color: '#b794f4' }}>Violet 405 nm</strong> — Shortest wavelength, tightest dot spacing.</>}
              </div>
            </div>
          </div>

          <div className="sim-sidebar-card">
            <div className="sim-sidebar-title">📐 VERNIER CALIPER</div>
            <div className="sim-param-row">
              <div className="sim-param-label">
                <span>Caliper separation (x)</span>
                <span className="sim-param-val" style={{ color: '#fbbf24', fontWeight: 'bold' }}>{caliperSeparation.toFixed(3)} cm</span>
              </div>
              <input 
                type="range" 
                min="0.0" 
                max="40.0" 
                step="0.01" 
                value={caliperSeparation} 
                onChange={e => setCaliperSeparation(parseFloat(e.target.value))} 
              />
            </div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'space-between', marginBottom: 12 }}>
              <button className="sim-jump-btn" onClick={() => setCaliperSeparation(prev => Math.max(0, parseFloat((prev - 0.05).toFixed(3))))}>-0.05</button>
              <button className="sim-jump-btn" onClick={() => setCaliperSeparation(prev => Math.max(0, parseFloat((prev - 0.01).toFixed(3))))}>-0.01</button>
              <span style={{ fontSize: '10px', color: '#64748b', alignSelf: 'center' }}>Fine Tune</span>
              <button className="sim-jump-btn" onClick={() => setCaliperSeparation(prev => Math.min(40, parseFloat((prev + 0.01).toFixed(3))))}>+0.01</button>
              <button className="sim-jump-btn" onClick={() => setCaliperSeparation(prev => Math.min(40, parseFloat((prev + 0.05).toFixed(3))))}>+0.05</button>
            </div>
          </div>

          <div className="sim-sidebar-card">
            <div className="sim-sidebar-title">
              <span>📌 RECORD READING</span>
              <span style={{ color: '#94a3b8' }}>↑</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CALIPER READOUT</div>
            <div className="sim-record-display" style={{ color: '#fbbf24' }}>{caliperSeparation.toFixed(3)} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>cm</span></div>
            <div className="sim-record-selects">
              <select className="sim-select" style={{ gridColumn: 'span 2' }} value={recRow} onChange={e => setRecRow(+e.target.value)}>
                {ROW_ORDERS.map((n, i) => (
                  <option key={i} value={i}>
                    Row {i+1} (n={n})
                  </option>
                ))}
              </select>
            </div>
            <button className="btn-record" onClick={recordReading}>
              <span style={{ color: '#ef4444' }}>📌</span> Record Caliper Read
            </button>
          </div>
        </div>
      </div>

      {/* Observation Table Card */}
      <div className="sim-table-card">
        <div className="sim-card-header-bar">
          <div className="sim-card-title">
            <span style={{ display: 'inline-flex', fontStyle: 'normal', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', fontSize: '0.85rem' }}>📄</span>
            Observation Table &nbsp;
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>N = {N} lines/cm</span>
          </div>
          <div className="sim-btn-group">
            <button className="btn-secondary-action" onClick={reset}>↺ Reset</button>
            <button className="btn-primary-action" onClick={calcAll}>⚡ Calculate All</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="sim-styled-table">
            <thead>
              <tr>
                <th>SR.</th>
                <th>L (CM)</th>
                <th>ORDER (N)</th>
                <th>X (CM)</th>
                <th>θ = tan⁻¹(X/2L)</th>
                <th>sin θ</th>
                <th>λ = sin θ / nN (CM)</th>
              </tr>
            </thead>
            <tbody>
              {ROW_ORDERS.map((order, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <input type="number" step="0.1" placeholder="L cm" className="sim-table-input"
                           value={lVals[i]} onChange={e => setLVals(prev => { const n = [...prev]; n[i] = e.target.value; return n })}/>
                  </td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{order}</td>
                  <td>
                    <input type="number" step="0.01" placeholder="x cm" className="sim-table-input"
                           value={xVals[i]} onChange={e => setXVals(prev => { const n = [...prev]; n[i] = e.target.value; return n })}/>
                  </td>
                  <td style={{ fontFamily: 'DM Mono, monospace', color: '#64748b' }}>{computedRows[i].theta}</td>
                  <td style={{ fontFamily: 'DM Mono, monospace', color: '#64748b' }}>{computedRows[i].sinT}</td>
                  <td style={{ fontFamily: 'DM Mono, monospace', color: '#64748b' }}>{computedRows[i].lam}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Box */}
      {results && (
        <div className="sim-graph-card">
          <div className="sim-card-header-bar">
            <div className="sim-card-title">
              <span style={{ display: 'inline-flex', fontStyle: 'normal', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.85rem' }}>🧮</span>
              Calculated Results
            </div>
          </div>
          <div className="sim-results-grid">
            <div className="sim-graph-legend">
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Experimental Averages</div>
              <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.8 }}>
                • Mean Wavelength (cm): <code>{results.meanCm} cm</code><br/>
                • Wavelength in nanometres: <code>{(results.meanA / 10).toFixed(1)} nm</code><br/>
                • Expected (He-Ne / Sodium reference): <code>6328 Å / 5893 Å</code>
              </div>
            </div>
            <div className="sim-calc-box">
              <div className="sim-calc-title">Calculated Laser Wavelength</div>
              <div className="sim-calc-formula">λ = sin θ ÷ (n × N)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#2563eb', fontFamily: 'DM Mono, monospace', marginTop: 6 }}>
                {results.meanA} Å
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>N = {N} lines/cm</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  QUIZ DATA
// ═══════════════════════════════════════════════════════════════
const QUESTIONS = [
  {
    q: 'What is the grating equation for a plane transmission grating?',
    opts: ['nλ = d sinθ', '(a+b) sinθ = nλ', 'sinθ = nλ/N', 'Nλ = sinθ/n'],
    ans: 1,
    exp: 'The grating equation is (a+b)sinθ = nλ, where (a+b) is the grating element (1/N), n is diffraction order, and λ is wavelength.',
  },
  {
    q: 'What is the grating element (a+b) if N = 1000 lines/cm?',
    opts: ['0.001 cm', '0.01 cm', '0.1 cm', '1 cm'],
    ans: 0,
    exp: 'Grating element = 1/N = 1/1000 = 0.001 cm = 10 μm. This is the center-to-center spacing of adjacent slits.',
  },
  {
    q: 'Why does the zeroth-order dot appear at the center of the screen?',
    opts: ['Light is blocked there', 'sinθ = 0 for n=0 — the beam passes straight through undeviated', 'It is the brightest due to constructive interference', 'The grating absorbs all other wavelengths'],
    ans: 1,
    exp: 'For n=0, the grating equation gives sinθ = 0, so θ = 0 — the beam passes straight through undeviated regardless of wavelength.',
  },
  {
    q: 'Why does the 1st order appear brighter than the 2nd order?',
    opts: ['Higher order slits are smaller', 'Intensity decreases with increasing diffraction order — fewer photons reach higher angles', 'The screen is too far away', 'Higher orders are blocked by the apparatus'],
    ans: 1,
    exp: 'Diffraction efficiency drops with order. Most light stays in lower orders; only a fraction is diffracted to 2nd and higher orders, making them progressively dimmer.',
  },
  {
    q: 'If laser wavelength increases, what happens to the spot separation x?',
    opts: ['x decreases', 'x stays the same', 'x increases', 'x becomes zero'],
    ans: 2,
    exp: 'sinθ = nNλ, so longer λ → larger θ → larger x = 2D·tanθ. The spots move further apart with increasing wavelength.',
  },
  {
    q: 'What approximation is used when sinθ ≈ tanθ in this experiment?',
    opts: ['The screen is very close to the grating', 'The diffraction angle θ is small (small angle approximation)', 'N is very large', 'λ is very small compared to slit width'],
    ans: 1,
    exp: 'For small angles, sinθ ≈ tanθ ≈ x/2D. This approximation is valid when the screen is far enough that 1st order angles remain small.',
  },
]

const FLASHCARDS = [
  {
    q: 'What is the grating equation?',
    a: '(a+b) sinθ = nλ\nGrating element (a+b) = 1/N\nN = lines per cm on grating',
  },
  {
    q: 'How is the diffraction angle θ calculated experimentally?',
    a: 'θ = tan⁻¹(x / 2D)\nwhere x = distance between two symmetric n-th order dots\nD = grating to screen distance',
  },
  {
    q: 'Why must you never look directly into a laser source?',
    a: 'Laser light is coherent and highly collimated. Even low-power lasers can permanently damage the retina because all energy is focused to a tiny spot on the fovea.',
  },
  {
    q: 'What happens to dot spacing as diffraction order increases?',
    a: 'Higher orders are spaced further apart (x increases), but progressively dimmer because diffraction efficiency decreases with order.',
  },
  {
    q: 'What is the formula to find wavelength λ from experiment?',
    a: 'λ = sinθ / (nN)\nwhere n = order, N = lines/cm\nsinθ = x / √(x² + 4D²) ≈ x / 2D for small angles',
  },
]

// ═══════════════════════════════════════════════════════════════
//  TEST PANEL
// ═══════════════════════════════════════════════════════════════
function Test({ setTab }) {
  const [qi,      setQi]      = useState(0)
  const [answers, setAnswers] = useState(() => {
    try {
      const quizSaved = localStorage.getItem('kinetix_exp03_quiz_data')
      if (quizSaved) {
        const parsed = JSON.parse(quizSaved)
        if (parsed.answers) return parsed.answers
      }
    } catch (e) {
      console.error(e)
    }
    return Array(QUESTIONS.length).fill(null)
  })
  const [done,    setDone]    = useState(() => {
    try {
      const quizSaved = localStorage.getItem('kinetix_exp03_quiz_data')
      if (quizSaved) {
        const parsed = JSON.parse(quizSaved)
        if (parsed.done) return true
      }
    } catch (e) {
      console.error(e)
    }
    return false
  })
  const [cardIdx, setCardIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  // Load sim & quiz data from localStorage
  const [simData] = useState(() => {
    try {
      const simSaved = localStorage.getItem('kinetix_exp03_sim_data')
      if (simSaved) {
        const parsed = JSON.parse(simSaved)
        if (parsed.results) return parsed
      }
    } catch (e) {
      console.error(e)
    }
    return null
  })


  const score  = answers.filter((a, i) => a === QUESTIONS[i].ans).length
  const pct    = Math.round(score / QUESTIONS.length * 100)
  const labels = ['Study more 📖', 'Good effort! 🎯', 'Great job! 🌟', 'Excellent! 🏆', 'Perfect! 🎉']
  const q      = QUESTIONS[qi]
  const card   = FLASHCARDS[cardIdx]

  const handlePick = i => {
    if (answers[qi] !== null) return
    const newAnswers = [...answers]
    newAnswers[qi] = i
    setAnswers(newAnswers)
  }

  const handleFinish = () => {
    setDone(true)
    localStorage.setItem('kinetix_exp03_quiz_data', JSON.stringify({
      done: true,
      answers,
    }))
  }

  const handleRetake = () => {
    setQi(0)
    setAnswers(Array(QUESTIONS.length).fill(null))
    setDone(false)
    localStorage.removeItem('kinetix_exp03_quiz_data')
  }

  const recordedCount = simData ? (
    (simData.lVals?.filter(v => v !== '').length || 0) +
    (simData.xVals?.filter(v => v !== '').length || 0)
  ) : 0

  return (
    <div>
      <div className="test-hd">
        <h2>Test Your Knowledge</h2>
        <p>Diffraction Grating &amp; Laser Wavelength</p>
      </div>

      {/* Dashboard Section */}
      <div className="test-dashboard-grid">
        {/* Left: Experiment Status */}
        <div className={`dash-card ${simData ? 'completed' : 'pending'}`}>
          <div className="dash-card-header">
            <span className="dash-card-title">🔬 Experiment Status</span>
            <span className={`dash-badge ${simData ? 'completed' : 'pending'}`}>
              {simData ? 'Completed' : 'Pending'}
            </span>
          </div>
          <div className="dash-card-body">
            {simData ? (
              <>
                <div className="certificate-badge-box">
                  <span className="cert-icon">🎓</span>
                  <div className="cert-info">
                    <span className="cert-title">Laser Wavelength Certified</span>
                    <span className="cert-subtitle">Diffraction lines & wavelength determined</span>
                  </div>
                </div>
                <div className="dash-results-grid">
                  <div className="dash-result-item">
                    <div className="dash-result-label">λ (Wavelength)</div>
                    <div className="dash-result-value">
                      {simData.results?.meanA} Å
                    </div>
                  </div>
                  <div className="dash-result-item">
                    <div className="dash-result-label">λ (in cm)</div>
                    <div className="dash-result-value" style={{ fontSize: '0.8rem', paddingTop: '2px' }}>
                      {simData.results?.meanCm}
                    </div>
                  </div>
                  <div className="dash-result-item">
                    <div className="dash-result-label">Readings</div>
                    <div className="dash-result-value">{recordedCount}/12</div>
                  </div>
                </div>
                <button className="dash-btn dash-btn-secondary" onClick={() => setTab('simulation')}>
                  🔍 View Simulation
                </button>
              </>
            ) : (
              <>
                <p className="dash-status-text">
                  Complete the virtual apparatus readings and run the calculation in the 'Simulation & Results' tab to unlock your certificate and results summary.
                </p>
                <button className="dash-btn dash-btn-primary" onClick={() => setTab('simulation')}>
                  ⚡ Start Simulation
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right: Quiz Status */}
        <div className={`dash-card ${done ? 'completed' : 'pending'}`}>
          <div className="dash-card-header">
            <span className="dash-card-title">📝 Test Performance</span>
            <span className={`dash-badge ${done ? 'completed' : 'pending'}`}>
              {done ? 'Completed' : 'Pending'}
            </span>
          </div>
          <div className="dash-card-body">
            {done ? (
              <>
                <div className="quiz-score-display">
                  <div className="quiz-score-circle">{score}/{QUESTIONS.length}</div>
                  <div className="quiz-score-info">
                    <span className="quiz-score-label">{pct}% Score</span>
                    <span className="quiz-score-sub">{labels[Math.min(Math.floor(pct / 25), 4)]}</span>
                  </div>
                </div>
                <button className="dash-btn dash-btn-secondary" onClick={handleRetake}>
                  ↺ Retake Test
                </button>
              </>
            ) : (
              <>
                <p className="dash-status-text">
                  Test your understanding of laser diffraction, diffraction grating equations, and wavelength determination.
                </p>
                <button className="dash-btn dash-btn-primary" onClick={() => document.getElementById('quiz-section-anchor')?.scrollIntoView({ behavior: 'smooth' })}>
                  👇 Start Test Below
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quiz & Flashcards side-by-side grid */}
      <div className="quiz-flashcards-grid">
        {/* Quiz Area */}
        {!done && (
          <div id="quiz-section-anchor" style={{ scrollMarginTop: '80px' }}>
            <div className="prog-row">
              <div className="prog-bar">
                <div className="prog-fill" style={{ width: `${(qi / QUESTIONS.length) * 100}%` }} />
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
                            onClick={() => handlePick(i)}>
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
                      onClick={() => qi === QUESTIONS.length - 1 ? handleFinish() : setQi(q => q + 1)}>
                {qi === QUESTIONS.length - 1 ? 'See Results →' : 'Next →'}
              </button>
            </div>
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
                    onClick={() => {
                      setCardIdx(i => (i - 1 + FLASHCARDS.length) % FLASHCARDS.length)
                      setFlipped(false)
                    }}>← Prev</button>
            <span className="fc-ctr">{cardIdx + 1} / {FLASHCARDS.length}</span>
            <button className="btn-sm btn-dim"
                    onClick={() => {
                      setCardIdx(i => (i + 1) % FLASHCARDS.length)
                      setFlipped(false)
                    }}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
export default function Exp03({ tab, setTab }) {
  if (tab === 'theory')     return <Theory setTab={setTab} />
  if (tab === 'simulation') return <Simulation />
  if (tab === 'test')       return <Test setTab={setTab} />
  return null
}