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
function drawDiffraction(canvas, { D, N, lambda }) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height, cy = H / 2
  ctx.fillStyle = '#0a1020'
  ctx.fillRect(0, 0, W, H)

  const rgb       = wlRGB(lambda)
  const lCm       = lambda * 1e-7
  const gratingX  = 80
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

  // x measurement line for 1st order
  const d1 = dots.find(d => d.n === 1)
  let measuredX = null
  if (d1 && d1.upper > 0 && d1.lower < H) {
    ctx.strokeStyle = 'rgba(246,173,85,0.5)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(screenX + 12, d1.upper); ctx.lineTo(screenX + 12, d1.lower); ctx.stroke()
    // Arrow tips
    ctx.beginPath(); ctx.moveTo(screenX+8,d1.upper+6); ctx.lineTo(screenX+12,d1.upper); ctx.lineTo(screenX+16,d1.upper+6); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(screenX+8,d1.lower-6); ctx.lineTo(screenX+12,d1.lower); ctx.lineTo(screenX+16,d1.lower-6); ctx.stroke()
    measuredX = d1.xCm * 2
    ctx.fillStyle = '#f6ad55'; ctx.font = '8px DM Mono,monospace'; ctx.textAlign = 'left'
    ctx.fillText(`x=${measuredX.toFixed(2)}cm`, screenX + 16, cy)
  }

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

  return measuredX
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
          <p>To determine the number of lines per cm on the grating surface and to find the
          <strong> wavelength of a He-Ne laser beam</strong> using a diffraction grating.</p>
        </div>

        <div className="ccard">
          <h3><span>📐</span> Formula</h3>
          <div className="formula-box">
            <span className="formula">N = sin θ / (nλ)</span>
          </div>
          <div className="fvars">
            <b>N</b> = Number of lines per cm on grating<br/>
            <b>θ</b> = Angle of diffraction = tan⁻¹(x / 2D)<br/>
            <b>n</b> = Order of diffraction (1, 2, 3…)<br/>
            <b>λ</b> = Wavelength of laser light (cm)<br/>
            <b>x</b> = Distance between two n-th order spots (cm)<br/>
            <b>D</b> = Distance from grating to screen (cm)<br/>
            <b>(a+b)</b> = Grating element = 1/N
          </div>
          <div className="formula-box" style={{ marginTop: 12 }}>
            <span className="formula" style={{ fontSize: '1rem' }}>
              λ = sin θ / (nN) &nbsp;&nbsp;→&nbsp;&nbsp; sin θ ≈ tan θ = x/2D
            </span>
          </div>
        </div>

        <div className="ccard">
          <h3><span>📚</span> Theory</h3>
          <p>A <strong>diffraction grating</strong> consists of a large number of parallel slits
          of equal width separated by equal opaque spaces. It is constructed by ruling fine
          equidistant parallel lines on an optically flat glass plate with a diamond point.</p>
          <p>When a parallel beam of monochromatic laser light of wavelength λ is incident on
          N parallel slits (each of width 'a', separated by opaque distance 'b'), the grating
          equation for a plane transmission grating gives:</p>
          <div className="formula-box">
            <span className="formula">(a + b) sin θ = nλ</span>
            <div className="fvars">The grating element (a+b) = 1/N, where N = lines/cm</div>
          </div>
          <p>The laser beam passing through the grating displays a pattern of bright dots on a
          screen — the <strong>zeroth order dot</strong> at the center (θ = 0) and symmetric
          <strong> first-order, second-order</strong> dots on each side. Higher orders are
          progressively dimmer.</p>
          <p>By measuring the separation x between symmetric n-th order dots and knowing the
          grating-screen distance D, we compute θ = tan⁻¹(x/2D) and solve for λ.</p>
        </div>
      </div>

      {/* RIGHT — Diagram + Given */}
      <div>
        <div className="diag-card">
          <h4>Diffraction Grating Setup</h4>
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

        <div className="given-card">
          <h4>Given</h4>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.77rem',
                        lineHeight: 2.1, color: 'var(--text-muted)' }}>
            <b style={{ color: 'var(--accent2)' }}>N</b> = 1000 lines/cm (constant)<br/>
            <b style={{ color: 'var(--accent2)' }}>λ He-Ne</b> ≈ 632 nm = 6328 Å<br/>
            <b style={{ color: 'var(--accent2)' }}>n</b> = 1, 2 (order)
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
  const canvasRef = useRef(null)

  // Sim params
  const [D,      setD]      = useState(38)
  const [N,      setN]      = useState(1000)
  const [lambda, setLambda] = useState(632)

  // Live measured x from simulation
  const [measuredX, setMeasuredX] = useState(null)

  // Observation table: 6 rows
  const [lVals, setLVals] = useState(Array(6).fill(''))
  const [xVals, setXVals] = useState(Array(6).fill(''))

  // Results
  const [results, setResults] = useState(null)

  // Record target row
  const [recRow, setRecRow] = useState(0)

  // Draw whenever params change
  useEffect(() => {
    if (!canvasRef.current) return
    const mx = drawDiffraction(canvasRef.current, { D, N, lambda })
    setMeasuredX(mx)
  }, [D, N, lambda])

  // Jump to order — sets the measured x for that order
  const jumpToOrder = (n) => {
    const lCm  = lambda * 1e-7
    const sinT = n * N * lCm
    if (sinT < 1) {
      const tanT = sinT / Math.sqrt(1 - sinT * sinT)
      setMeasuredX((D * tanT) * 2)
    }
  }

  const resetSim = () => {
    setMeasuredX(null)
    // Redraw
    if (canvasRef.current) drawDiffraction(canvasRef.current, { D, N, lambda })
  }

  // Record reading into table
  const recordReading = () => {
    if (measuredX === null) return
    setXVals(prev => {
      const n = [...prev]; n[recRow] = measuredX.toFixed(3); return n
    })
  }

  // Compute row — θ, sinθ, λ
  const computedRows = ROW_ORDERS.map((order, i) => {
    const L = parseFloat(lVals[i])
    const x = parseFloat(xVals[i])
    if (isNaN(L) || isNaN(x) || L <= 0) return { theta: '—', sinT: '—', lam: '—' }
    const theta = Math.atan(x / L) * 180 / Math.PI
    const sinT  = Math.sin(Math.atan(x / L))
    const lam   = sinT / (order * N)
    return {
      theta: theta.toFixed(3) + '°',
      sinT:  sinT.toFixed(4),
      lam:   lam.toExponential(3),
      lamVal: lam,
    }
  })

  // Calculate all
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
      {/* How to use */}
      <div className="howto-card" style={{ marginBottom: 20 }}>
        <h4>💡 How to Use</h4>
        <div className="howto-steps">
          {[
            'Adjust grating-screen distance D and grating lines N using sliders — watch dots move.',
            'Use "1st Order" / "2nd Order" buttons to set the measured x for that order.',
            'Select the row to record into, click 📌 Record x — the x value fills in the table.',
            'Also type in L (grating-screen distance) for each row, then click ⚡ Calculate All.',
          ].map((s, i) => (
            <div key={i} className="hs">
              <span className="hs-num">{String(i+1).padStart(2,'0')}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px',
                    gap: 20, alignItems: 'start', marginBottom: 24 }}>
        {/* Canvas */}
        <div className="sim-top">
          <h3>🔴 Diffraction Grating Pattern Simulation</h3>
          <canvas ref={canvasRef} width={460} height={280}
                  style={{ borderRadius: 8, maxWidth: '100%', display: 'block',
                           margin: '0 auto', cursor: 'crosshair' }}/>
          <div className="sim-caption">
            Adjust D or N sliders — dots shift in real time
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6,
                        marginTop: 12, justifyContent: 'center' }}>
            <button className="btn-sm btn-accent" onClick={() => jumpToOrder(1)}>1st Order</button>
            <button className="btn-sm btn-accent" onClick={() => jumpToOrder(2)}>2nd Order</button>
            <button className="btn-sm btn-dim"    onClick={resetSim}>↺ Reset</button>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ctrl-card">
            <h4>⚙️ Parameters</h4>
            <div className="slider-row">
              <div className="slabel">
                <span>Grating-Screen D (cm)</span>
                <span className="sval">{D} cm</span>
              </div>
              <input type="range" min={20} max={70} step={1} value={D}
                     onChange={e => setD(+e.target.value)}/>
            </div>
            <div className="slider-row">
              <div className="slabel">
                <span>N (lines/cm)</span>
                <span className="sval">{N}</span>
              </div>
              <input type="range" min={500} max={2000} step={100} value={N}
                     onChange={e => setN(+e.target.value)}/>
            </div>
          </div>

          {/* Light source */}
          <div className="ctrl-card">
            <h4>💡 Light Source</h4>
            <select value={lambda} onChange={e => setLambda(+e.target.value)}>
              {LIGHT_SOURCES.map(ls => (
                <option key={ls.nm} value={ls.nm}>{ls.label}</option>
              ))}
            </select>
            <details style={{ marginTop: 10 }}>
              <summary style={{ fontSize: '0.78rem', color: 'var(--accent)',
                                cursor: 'pointer', userSelect: 'none' }}>
                How wavelength affects pattern
              </summary>
              <div style={{ marginTop: 10, fontSize: '0.76rem', color: 'var(--text-muted)',
                            lineHeight: 1.75, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <div style={{ fontFamily: "'DM Mono',monospace", color: 'var(--accent)',
                               marginBottom: 6 }}>
                  x = 2D·tan(θ) &nbsp;|&nbsp; sin θ = nNλ
                </div>
                Longer λ → wider spacing between orders. Shorter λ → dots closer to center.
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }}/>
                <strong style={{ color: 'var(--danger)' }}>He-Ne 632 nm</strong> — Standard red laser. 6328 Å used in standard calculations.<br/>
                <strong style={{ color: '#f6e05e' }}>Sodium 589 nm</strong> — Slightly shorter λ → dots shift slightly inward.<br/>
                <strong style={{ color: 'var(--success)' }}>Green 532 nm</strong> — High visibility, closer spacing than red.<br/>
                <strong style={{ color: '#b794f4' }}>Violet 405 nm</strong> — Shortest λ, tightest dot spacing.
              </div>
            </details>
          </div>

          {/* Record reading */}
          <div className="ctrl-card" style={{ background: 'rgba(99,179,237,0.03)' }}>
            <h4 style={{ color: 'var(--accent2)' }}>📍 Measured Reading</h4>
            <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginBottom: 8 }}>
              Current x (1st order span):
            </div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '1.4rem',
                          color: 'var(--accent)', marginBottom: 4 }}>
              {measuredX !== null ? measuredX.toFixed(3) : '—'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: 10 }}>
              cm (span of two n-th order dots)
            </div>
            <select value={recRow} onChange={e => setRecRow(+e.target.value)}
                    style={{ width: '100%', marginBottom: 8 }}>
              {ROW_ORDERS.map((n, i) => (
                <option key={i} value={i}>
                  Row {i+1} (n={n}) — L reading {Math.ceil((i/2)+1)}
                </option>
              ))}
            </select>
            <button className="btn-sm btn-accent"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={recordReading}>
              📌 Record x Reading
            </button>
          </div>
        </div>
      </div>

      {/* Observation Table */}
      <div className="obs-wrap">
        <div className="obs-hd">
          <h3>
            📊 Observation Table
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)',
                           fontWeight: 400, marginLeft: 6 }}>
              N = {N} lines/cm (constant)
            </span>
          </h3>
          <div className="obs-actions">
            <button className="btn-sm btn-dim" onClick={reset}>↺ Reset</button>
            <button className="btn-sm btn-accent" onClick={calcAll}>⚡ Calculate All</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Sr.</th>
                <th>L (cm)</th>
                <th>Order (n)</th>
                <th>x (cm)</th>
                <th>θ = tan⁻¹(x/L) °</th>
                <th>sin θ</th>
                <th>λ = sin θ / nN (cm)</th>
              </tr>
            </thead>
            <tbody>
              {ROW_ORDERS.map((order, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <input type="number" step="0.1" placeholder="L cm"
                           value={lVals[i]}
                           onChange={e => setLVals(prev => {
                             const n = [...prev]; n[i] = e.target.value; return n
                           })}/>
                  </td>
                  <td style={{ color: 'var(--text)', fontWeight: 600 }}>{order}</td>
                  <td>
                    <input type="number" step="0.01" placeholder="x cm"
                           value={xVals[i]}
                           onChange={e => setXVals(prev => {
                             const n = [...prev]; n[i] = e.target.value; return n
                           })}/>
                  </td>
                  <td className="auto">{computedRows[i].theta}</td>
                  <td className="auto">{computedRows[i].sinT}</td>
                  <td className="auto">{computedRows[i].lam}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="calc-wrap" style={{ marginTop: 20 }}>
          <h3>🧮 Results</h3>
          <div className="calc-grid">
            <div className="calc-item">
              <div className="calc-label">Mean Wavelength λ</div>
              <div>
                <span className="calc-val">{results.meanCm}</span>
                <span className="calc-unit">cm</span>
              </div>
            </div>
            <div className="calc-item">
              <div className="calc-label">In Ångströms (Å)</div>
              <div>
                <span className="calc-val teal">{results.meanA}</span>
                <span className="calc-unit">Å</span>
              </div>
            </div>
            <div className="calc-item">
              <div className="calc-label">In nanometres (nm)</div>
              <div>
                <span className="calc-val" style={{ color: 'var(--accent3)', fontSize: '1.4rem' }}>
                  {(results.meanA / 10).toFixed(1)}
                </span>
                <span className="calc-unit">nm</span>
              </div>
            </div>
            <div className="calc-item">
              <div className="calc-label">Expected (He-Ne)</div>
              <div>
                <span className="calc-val" style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                  6328
                </span>
                <span className="calc-unit">Å</span>
              </div>
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
        <p>Diffraction Grating &amp; Laser Wavelength</p>
      </div>

      {!done ? (
        <>
          <div className="prog-row">
            <div className="prog-bar">
              <div className="prog-fill"
                   style={{ width: `${(qi / QUESTIONS.length) * 100}%` }}/>
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
              <button className="btn-sm btn-dim"
                      onClick={() => setQi(q => q - 1)}>← Prev</button>
            )}
            <button className="btn-sm btn-accent"
                    onClick={() => qi === QUESTIONS.length - 1
                      ? setDone(true) : setQi(q => q + 1)}>
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
                <React.Fragment key={i}>{line}<br/></React.Fragment>
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
  )
}

// ═══════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
export default function Exp03({ tab }) {
  if (tab === 'theory')     return <Theory />
  if (tab === 'simulation') return <Simulation />
  if (tab === 'test')       return <Test />
  return null
}