// ─────────────────────────────────────────────────────────────
//  Exp04.jsx  —  Numerical Aperture of an Optical Fibre
// ─────────────────────────────────────────────────────────────
import React, { useRef, useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════
const D_VALS = [5, 10, 15, 20]   // fixed distance values in mm

// ═══════════════════════════════════════════════════════════════
function drawSpot(canvas, { d, NA, bright }) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const cx = W / 2, cy = H / 2

  // Graph paper background
  ctx.fillStyle = '#f5f5e8'
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = 'rgba(100,180,100,0.3)'; ctx.lineWidth = 0.5
  for (let x = 0; x < W; x += 10) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }
  for (let y = 0; y < H; y += 10) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }
  ctx.strokeStyle = 'rgba(100,180,100,0.6)'; ctx.lineWidth = 0.8
  for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }
  for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }

  // Compute spot radius: r = d × tan(arcsin(NA))
  const theta = Math.asin(Math.min(0.999, NA))
  const rMm   = d * Math.tan(theta)
  const pxPerMm = 7
  const rPx   = rMm * pxPerMm

  // Illuminated spot (radial gradient = Gaussian profile)
  const alpha = bright * 0.92
  const grad  = ctx.createRadialGradient(cx, cy, 0, cx, cy, rPx * 1.2)
  grad.addColorStop(0,    `rgba(255,220,100,${alpha})`)
  grad.addColorStop(0.5,  `rgba(255,180,50,${alpha * 0.7})`)
  grad.addColorStop(0.85, `rgba(255,150,20,${alpha * 0.3})`)
  grad.addColorStop(1,    'transparent')
  ctx.beginPath(); ctx.arc(cx, cy, rPx * 1.3, 0, 2 * Math.PI)
  ctx.fillStyle = grad; ctx.fill()

  // Dashed circle outline of spot
  ctx.beginPath(); ctx.arc(cx, cy, rPx, 0, 2 * Math.PI)
  ctx.strokeStyle = 'rgba(180,80,20,0.6)'; ctx.lineWidth = 1.5
  ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([])

  // MR — horizontal diameter (blue)
  ctx.strokeStyle = 'rgba(30,60,180,0.7)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(cx - rPx, cy); ctx.lineTo(cx + rPx, cy); ctx.stroke()
  ctx.fillStyle = 'rgba(30,60,180,0.85)'; ctx.font = '9px DM Mono,monospace'; ctx.textAlign = 'left'
  ctx.fillText(`MR = ${(rMm * 2).toFixed(1)} mm`, cx + rPx + 4, cy + 4)

  // PN — vertical diameter (red)
  ctx.strokeStyle = 'rgba(180,30,30,0.7)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(cx, cy - rPx); ctx.lineTo(cx, cy + rPx); ctx.stroke()
  ctx.fillStyle = 'rgba(180,30,30,0.85)'; ctx.textAlign = 'center'
  ctx.fillText(`PN = ${(rMm * 2).toFixed(1)} mm`, cx, cy - rPx - 6)

  // Center cross
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 0.8
  ctx.beginPath(); ctx.moveTo(cx-4,cy); ctx.lineTo(cx+4,cy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx,cy-4); ctx.lineTo(cx,cy+4); ctx.stroke()

  // Info strip
  ctx.fillStyle = 'rgba(30,40,60,0.75)'; ctx.font = '8px DM Mono,monospace'; ctx.textAlign = 'left'
  ctx.fillText(`d=${d}mm  NA=${NA.toFixed(2)}  r=${rMm.toFixed(2)}mm`, 8, 14)

  return rMm
}

function drawGraph(canvas, pairs) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const pad = { l: 60, r: 24, t: 24, b: 50 }

  ctx.fillStyle = '#0f1829'; ctx.fillRect(0, 0, W, H)
  if (pairs.length < 2) {
    ctx.fillStyle = 'rgba(107,127,153,0.5)'; ctx.font = '12px DM Sans,sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('Enter observations and click Calculate to draw graph', W/2, H/2)
    return
  }

  const xMax = 25
  const yMax = Math.max(...pairs.map(p => p.r)) * 1.3
  const px = d => pad.l + (d / xMax) * (W - pad.l - pad.r)
  const py = r => H - pad.b - (r / yMax) * (H - pad.t - pad.b)

  // Grid
  ctx.strokeStyle = 'rgba(99,179,237,0.07)'; ctx.lineWidth = 0.8
  ;[5, 10, 15, 20].forEach(d => {
    ctx.beginPath(); ctx.moveTo(px(d), pad.t); ctx.lineTo(px(d), H - pad.b); ctx.stroke()
  })

  // Axes
  ctx.strokeStyle = 'rgba(99,179,237,0.3)'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, H-pad.b); ctx.lineTo(W-pad.r, H-pad.b); ctx.stroke()

  // Best-fit line through origin (r = slope × d)
  const sxy = pairs.reduce((a, p) => a + p.d * p.r, 0)
  const sx2 = pairs.reduce((a, p) => a + p.d * p.d, 0)
  const slope = sxy / sx2   // tanθ = r/d

  ctx.strokeStyle = 'rgba(79,209,197,0.5)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4])
  ctx.beginPath(); ctx.moveTo(px(0), py(0)); ctx.lineTo(px(24), py(slope * 24)); ctx.stroke()
  ctx.setLineDash([])

  // Data points
  pairs.forEach(p => {
    ctx.beginPath(); ctx.arc(px(p.d), py(p.r), 5, 0, 2*Math.PI)
    ctx.fillStyle = '#63b3ed'; ctx.fill()
    ctx.strokeStyle = 'rgba(8,15,30,0.9)'; ctx.lineWidth = 1.5; ctx.stroke()
  })

  // Labels
  ctx.fillStyle = 'rgba(107,127,153,0.8)'; ctx.font = '10px DM Mono,monospace'; ctx.textAlign = 'center'
  ;[5, 10, 15, 20].forEach(d => ctx.fillText(d, px(d), H - pad.b + 14))
  ctx.fillText('Distance d (mm)', W / 2, H - 6)
  ctx.save(); ctx.rotate(-Math.PI / 2); ctx.fillText('Spot radius r (mm)', -(H/2), 16); ctx.restore()

  // Slope label
  const naFromSlope = slope / Math.sqrt(1 + slope * slope)
  ctx.fillStyle = 'rgba(79,209,197,0.8)'; ctx.textAlign = 'left'
  ctx.fillText(`slope = tanθ = ${slope.toFixed(3)}`, pad.l + 6, pad.t + 12)
  ctx.fillText(`NA (from graph) = ${naFromSlope.toFixed(4)}`, pad.l + 6, pad.t + 24)
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
          <p>To determine the <strong>numerical aperture (NA)</strong> and acceptance angle
          of an optical fibre using the illuminated circular spot method.</p>
        </div>

        <div className="ccard">
          <h3><span>📐</span> Formula</h3>
          <div className="formula-box">
            <span className="formula">
              NA = sin θ = r / √(r² + d²)
            </span>
          </div>
          <div className="fvars">
            <b>NA</b> = Numerical Aperture (dimensionless)<br/>
            <b>θ</b> = Half-acceptance angle of the fibre<br/>
            <b>r</b> = Radius of illuminated spot on graph paper (mm)<br/>
            <b>d</b> = Distance from fibre tip to graph paper (mm)<br/>
            <b>r</b> = (MR + PN) / 4 &nbsp;&nbsp; (average of horizontal and vertical radii)
          </div>
          <div className="formula-box" style={{ marginTop: 12 }}>
            <span className="formula" style={{ fontSize: '1rem' }}>
              n = 1 / (R<sub>H</sub> × e)
            </span>
            <div className="fvars">n = charge carrier density (/cm³)</div>
          </div>
        </div>

        <div className="ccard">
          <h3><span>📚</span> Theory</h3>
          <p>Optical fibres are glass or plastic conduits as thin as human hair, designed to
          guide electromagnetic waves along their length. An optical fibre works on the
          principle of <strong>Total Internal Reflection (TIR)</strong>.</p>
          <p>An optical fibre consists of three parts: <strong>core</strong> (high refractive
          index n₁), <strong>cladding</strong> (lower refractive index n₂), and a protective
          coating. Light propagates through the core via TIR because n₁ &gt; n₂.</p>
          <p><strong>Numerical Aperture (NA)</strong> is the measure of the
          <strong> light-gathering capacity</strong> of the optical fibre. It defines the
          maximum acceptance cone — light entering within this cone undergoes TIR and propagates.
          A larger NA means more light is coupled in.</p>
          <div className="formula-box">
            <span className="formula" style={{ fontSize: '1rem' }}>
              NA = sin θ<sub>max</sub> = √(n₁² − n₂²)
            </span>
            <div className="fvars">
              n₁ = refractive index of core &nbsp;|&nbsp; n₂ = refractive index of cladding
            </div>
          </div>
          <p>In practice, the fibre tip is held at distance d from graph paper. The emergent
          cone illuminates a circular spot of radius r. Measuring r at different values of d
          gives NA = r/√(r²+d²). Since r = d·tanθ, a plot of r vs d is a straight line
          through origin with <strong>slope = tanθ</strong>.</p>
        </div>
      </div>

      {/* RIGHT — Diagram + Key Relations */}
      <div>
        <div className="diag-card">
          <h4>Numerical Aperture Setup</h4>
          <svg viewBox="0 0 280 240" xmlns="http://www.w3.org/2000/svg"
               style={{ width: '100%', maxWidth: 260 }}>
            <rect width="280" height="240" fill="#0f1829" rx="6"/>
            {/* Optical fibre */}
            <rect x="14" y="114" width="80" height="12"
                  fill="rgba(79,209,197,0.15)" stroke="#4fd1c5" strokeWidth="1.2" rx="2"/>
            <text x="54" y="144" fill="#4fd1c5" fontSize="6.5"
                  textAnchor="middle" fontFamily="DM Sans,sans-serif">Optical Fibre</text>
            {/* Cone of light */}
            <path d="M94 120 L200 80 L200 160 Z"
                  fill="rgba(246,173,85,0.07)" stroke="rgba(246,173,85,0.35)" strokeWidth="1"/>
            {/* Axis line */}
            <line x1="94" y1="120" x2="220" y2="120"
                  stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" strokeDasharray="3,2"/>
            {/* Screen */}
            <rect x="198" y="76" width="6" height="88"
                  fill="rgba(99,179,237,0.12)" stroke="#63b3ed" strokeWidth="1.2" rx="1"/>
            <text x="201" y="72" fill="#63b3ed" fontSize="6"
                  textAnchor="middle" fontFamily="DM Sans,sans-serif">Graph</text>
            <text x="201" y="79" fill="#63b3ed" fontSize="6"
                  textAnchor="middle" fontFamily="DM Sans,sans-serif">Paper</text>
            {/* Spot */}
            <ellipse cx="204" cy="120" rx="3" ry="40"
                     fill="rgba(246,173,85,0.25)" stroke="#f6ad55" strokeWidth="0.8"/>
            {/* r annotation */}
            <line x1="212" y1="120" x2="212" y2="160" stroke="#f6ad55" strokeWidth="0.8"/>
            <text x="220" y="143" fill="#f6ad55" fontSize="7.5"
                  fontFamily="DM Mono,monospace">r</text>
            {/* d annotation */}
            <line x1="94" y1="136" x2="200" y2="136" stroke="#4fd1c5" strokeWidth="0.8"/>
            <text x="147" y="148" fill="#4fd1c5" fontSize="7.5"
                  textAnchor="middle" fontFamily="DM Mono,monospace">d</text>
            {/* θ arc */}
            <path d="M110 120 A18 18 0 0 1 125 108"
                  fill="none" stroke="#f6e05e" strokeWidth="1"/>
            <text x="128" y="113" fill="#f6e05e" fontSize="8"
                  fontFamily="DM Mono,monospace">θ</text>
            {/* Labels */}
            <text x="240" y="82" fill="#718096" fontSize="6.5"
                  fontFamily="DM Sans,sans-serif">OA=h</text>
          </svg>
        </div>

        <div className="given-card">
          <h4>Key Relations</h4>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.77rem',
                        lineHeight: 2.1, color: 'var(--text-muted)' }}>
            <b style={{ color: 'var(--accent2)' }}>r</b> = (MR + PN) / 4<br/>
            <b style={{ color: 'var(--accent2)' }}>NA</b> = r / √(r²+d²)<br/>
            <b style={{ color: 'var(--accent2)' }}>θ</b> = sin⁻¹(NA) degrees<br/>
            <b style={{ color: 'var(--accent2)' }}>slope</b> = tanθ = r/d
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
  const graphRef  = useRef(null)

  const [d,      setD]      = useState(10)
  const [NA,     setNA]     = useState(0.48)
  const [bright, setBright] = useState(0.85)

  // Observation table
  const [mrVals, setMrVals] = useState(Array(4).fill(''))
  const [pnVals, setPnVals] = useState(Array(4).fill(''))

  // Results
  const [results, setResults] = useState(null)

  // Record target row
  const [recRow, setRecRow] = useState(0)

  // Simulated spot radius for display
  const [simR, setSimR] = useState(null)

  // Redraw on param change
  useEffect(() => {
    if (!canvasRef.current) return
    const rMm = drawSpot(canvasRef.current, { d, NA, bright })
    setSimR(rMm.toFixed(2))
  }, [d, NA, bright])

  // Draw empty graph on mount
  useEffect(() => {
    if (graphRef.current) drawGraph(graphRef.current, [])
  }, [])

  // Record simulated reading into table
  const recordReading = () => {
    const theta = Math.asin(Math.min(0.999, NA))
    const rMm   = d * Math.tan(theta)
    const diam  = (rMm * 2).toFixed(1)
    setMrVals(prev => { const n = [...prev]; n[recRow] = diam; return n })
    setPnVals(prev => { const n = [...prev]; n[recRow] = diam; return n })
  }

  // Computed r, √(r²+d²), NA for each row
  const computedRows = D_VALS.map((dv, i) => {
    const mr = parseFloat(mrVals[i])
    const pn = parseFloat(pnVals[i])
    if (isNaN(mr) || isNaN(pn)) return { r: '—', rd: '—', na: '—' }
    const r  = (mr + pn) / 4
    const rd = Math.sqrt(r*r + dv*dv)
    const na = r / rd
    return { r: r.toFixed(3), rd: rd.toFixed(3), na: na.toFixed(4), naVal: na, rVal: r }
  })

  // Calculate
  const calcAll = () => {
    const valid = computedRows.filter(row => row.naVal !== undefined)
    if (valid.length === 0) return
    const meanNA    = valid.reduce((a, r) => a + r.naVal, 0) / valid.length
    const thetaDeg  = Math.asin(meanNA) * 180 / Math.PI
    const pairs     = D_VALS.map((dv, i) => computedRows[i].rVal
      ? { d: dv, r: computedRows[i].rVal } : null).filter(Boolean)
    setResults({ meanNA: meanNA.toFixed(4), thetaDeg: thetaDeg.toFixed(2) })
    drawGraph(graphRef.current, pairs)
  }

  const reset = () => {
    setMrVals(Array(4).fill(''))
    setPnVals(Array(4).fill(''))
    setResults(null)
    if (graphRef.current) drawGraph(graphRef.current, [])
  }

  return (
    <div>
      {/* How to use */}
      <div className="howto-card" style={{ marginBottom: 20 }}>
        <h4>💡 How to Use</h4>
        <div className="howto-steps">
          {[
            'Adjust NA and distance d sliders — the circular spot on graph paper changes size in real time.',
            'Select the row (d = 5, 10, 15, 20 mm) and click 📌 Record to auto-fill MR and PN from simulation.',
            'You can also type MR (horizontal diameter) and PN (vertical diameter) measured manually.',
            'Click ⚡ Calculate All to compute r, NA for each row. The graph of r vs d is drawn automatically.',
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
          <h3>🔦 Optical Fibre Spot Simulation</h3>
          <canvas ref={canvasRef} width={460} height={280}
                  style={{ borderRadius: 8, maxWidth: '100%', display: 'block',
                           margin: '0 auto' }}/>
          <div className="sim-caption">
            Spot size changes with d and NA — MR (blue) = horizontal, PN (red) = vertical diameter
          </div>
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Simulated spot diameter: &nbsp;
            </span>
            <span style={{ fontFamily: "'DM Mono',monospace", color: 'var(--accent)' }}>
              {simR ? (parseFloat(simR) * 2).toFixed(2) : '—'} mm
            </span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ctrl-card">
            <h4>⚙️ Parameters</h4>
            {[
              { label: 'Distance d (mm)', val: d,      set: setD,      min: 5,   max: 30,  step: 1,    unit: `${d} mm` },
              { label: 'NA of Fibre',     val: NA,     set: setNA,     min: 0.2, max: 0.8, step: 0.01, unit: NA.toFixed(2) },
              { label: 'Brightness',      val: bright, set: setBright, min: 0.4, max: 1.0, step: 0.05, unit: bright.toFixed(2) },
            ].map(({ label, val, set, min, max, step, unit }) => (
              <div key={label} className="slider-row">
                <div className="slabel">
                  <span>{label}</span><span className="sval">{unit}</span>
                </div>
                <input type="range" min={min} max={max} step={step} value={val}
                       onChange={e => set(parseFloat(e.target.value))}/>
              </div>
            ))}
          </div>

          <div className="ctrl-card" style={{ background: 'rgba(99,179,237,0.03)' }}>
            <h4 style={{ color: 'var(--accent2)' }}>📏 Spot Reading</h4>
            <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              Simulated spot radius r:
            </div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '1.3rem',
                          color: 'var(--accent)', marginBottom: 4 }}>
              {simR ?? '—'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: 10 }}>mm</div>
            <select value={recRow} onChange={e => setRecRow(+e.target.value)}
                    style={{ width: '100%', marginBottom: 8 }}>
              {D_VALS.map((dv, i) => (
                <option key={dv} value={i}>Row {i+1} — d = {dv} mm</option>
              ))}
            </select>
            <button className="btn-sm btn-accent"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={recordReading}>
              📌 Record MR &amp; PN
            </button>
          </div>
        </div>
      </div>

      {/* Observation Table */}
      <div className="obs-wrap">
        <div className="obs-hd">
          <h3>📊 Observation Table</h3>
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
                <th>d (mm)</th>
                <th>MR — horizontal (mm)</th>
                <th>PN — vertical (mm)</th>
                <th>r = (MR+PN)/4 (mm)</th>
                <th>√(r²+d²) (mm)</th>
                <th>NA = r/√(r²+d²)</th>
              </tr>
            </thead>
            <tbody>
              {D_VALS.map((dv, i) => (
                <tr key={dv}>
                  <td>{i + 1}</td>
                  <td style={{ color: 'var(--text)', fontWeight: 600 }}>{dv}</td>
                  <td>
                    <input type="number" step="0.1" placeholder="MR mm"
                           value={mrVals[i]}
                           onChange={e => setMrVals(prev => {
                             const n = [...prev]; n[i] = e.target.value; return n
                           })}/>
                  </td>
                  <td>
                    <input type="number" step="0.1" placeholder="PN mm"
                           value={pnVals[i]}
                           onChange={e => setPnVals(prev => {
                             const n = [...prev]; n[i] = e.target.value; return n
                           })}/>
                  </td>
                  <td className="auto">{computedRows[i].r}</td>
                  <td className="auto">{computedRows[i].rd}</td>
                  <td className="auto">{computedRows[i].na}</td>
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
              <div className="calc-label">Mean Numerical Aperture</div>
              <div><span className="calc-val">{results.meanNA}</span></div>
            </div>
            <div className="calc-item">
              <div className="calc-label">Acceptance Angle θ</div>
              <div>
                <span className="calc-val teal">{results.thetaDeg}</span>
                <span className="calc-unit">°</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graph */}
      <div className="graph-wrap" style={{ marginTop: 20 }}>
        <div className="graph-hdr">
          <h3>📈 Graph: Spot Radius r (mm) vs Distance d (mm)</h3>
          <button className="btn-sm btn-outline" onClick={calcAll}>▶ Draw Graph</button>
        </div>
        <canvas ref={graphRef} width={580} height={300}
                style={{ width: '100%', maxWidth: 580, display: 'block', margin: '0 auto' }}/>
        <div style={{ marginTop: 12, fontSize: '0.76rem', color: 'var(--text-muted)',
                      textAlign: 'center', lineHeight: 1.7 }}>
          Since r = d·tanθ, slope = tanθ &nbsp;→&nbsp; <strong style={{ color: 'var(--accent2)' }}>
          NA = sinθ = slope / √(1 + slope²)</strong>
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
    q: 'What principle does an optical fibre work on?',
    opts: ['Refraction', 'Diffraction', 'Total Internal Reflection', 'Polarization'],
    ans: 2,
    exp: 'Optical fibres guide light by Total Internal Reflection (TIR). Light hitting the core-cladding interface at an angle greater than the critical angle is totally reflected back into the core.',
  },
  {
    q: 'For TIR to occur, the refractive index of the core must be:',
    opts: ['Less than cladding', 'Equal to cladding', 'Greater than cladding', 'Zero'],
    ans: 2,
    exp: 'TIR requires light to travel from a denser medium (core, n₁) to a less dense medium (cladding, n₂), so n₁ > n₂ is mandatory.',
  },
  {
    q: 'Numerical Aperture (NA) is a measure of:',
    opts: ["The fibre's attenuation per km", 'The light-gathering capacity of the fibre', 'The diameter of the fibre core', 'The refractive index of the cladding'],
    ans: 1,
    exp: 'NA defines the acceptance cone — how much light the fibre can accept. Higher NA = wider cone = more light coupled in.',
  },
  {
    q: 'If distance d doubles while NA is constant, spot radius r:',
    opts: ['Stays the same', 'Halves', 'Doubles', 'Quadruples'],
    ans: 2,
    exp: 'r = d·tan(arcsin(NA)). Since NA is constant, tanθ is constant. So r ∝ d — doubling d doubles r. This is why the r vs d graph is a straight line.',
  },
  {
    q: 'What is the formula for Numerical Aperture from spot measurements?',
    opts: ['NA = d/r', 'NA = r/d', 'NA = r/√(r²+d²)', 'NA = √(r²+d²)/r'],
    ans: 2,
    exp: 'NA = sinθ = r/√(r²+d²), from the right triangle with legs r (spot radius) and d (distance) and hypotenuse = √(r²+d²).',
  },
  {
    q: 'The graph of spot radius r vs distance d is expected to be:',
    opts: ['A parabola', 'A horizontal line', 'A straight line through the origin', 'An exponential curve'],
    ans: 2,
    exp: 'Since r = d·tanθ and tanθ is constant for a fixed NA fibre, r = d × constant. This is a linear relationship: a straight line through the origin.',
  },
]

const FLASHCARDS = [
  {
    q: 'What is the formula for Numerical Aperture?',
    a: 'NA = sinθ = r / √(r² + d²)\nwhere r = spot radius, d = distance from tip to paper\nθ = half-acceptance angle',
  },
  {
    q: 'What is the relationship between NA and acceptance cone?',
    a: 'NA = sinθ_max = √(n₁² - n₂²)\nHigher NA → wider acceptance cone → more light coupled in\nn₁ = core index, n₂ = cladding index',
  },
  {
    q: 'Why does the spot grow larger as d increases?',
    a: 'Spot radius r = d·tan(θ). Larger d → same cone covers more area.\nRelationship is linear: r ∝ d for constant NA.\nSame reason shadows grow with distance from a point source.',
  },
  {
    q: 'What does the slope of the r vs d graph represent?',
    a: 'slope = tan(θ)\nFrom slope: θ = arctan(slope)\nAnd: NA = sinθ = slope / √(1 + slope²)',
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
        <p>Numerical Aperture of Optical Fibre</p>
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
                <React.Fragment key={i}>{line}<br/></React.Fragment>
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
export default function Exp04({ tab }) {
  if (tab === 'theory')     return <Theory />
  if (tab === 'simulation') return <Simulation />
  if (tab === 'test')       return <Test />
  return null
}