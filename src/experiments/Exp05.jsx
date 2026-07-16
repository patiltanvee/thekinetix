// ─────────────────────────────────────────────────────────────
//  Exp05.jsx  —  Determination of Hall Coefficient
// ─────────────────────────────────────────────────────────────
import React, { useRef, useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════
const HALL_T      = 0.014      // semiconductor thickness (cm)
const HALL_E      = 1.6e-19    // electron charge (C)
const HALL_RH_SIM = 3.5        // simulated R(H) for n-type semiconductor (cm³/C)

// ═══════════════════════════════════════════════════════════════
//  DRAW FUNCTIONS  (pure — take canvas + params)
// ═══════════════════════════════════════════════════════════════
function drawHallSim(canvas, { B, Ip }) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const cx = W / 2, cy = H / 2

  ctx.fillStyle = '#080c14'
  ctx.fillRect(0, 0, W, H)

  // Semiconductor slab
  ctx.fillStyle = 'rgba(99,179,237,0.08)'
  ctx.strokeStyle = '#63b3ed'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(60, cy - 50, 340, 100, 8)
  ctx.fill(); ctx.stroke()

  // Slab label
  ctx.fillStyle = 'rgba(99,179,237,0.7)'
  ctx.font = '11px DM Sans,monospace'
  ctx.textAlign = 'center'
  ctx.fillText('n-type Semiconductor  (t = 0.014 cm)', cx, cy + 5)

  // Current arrows (both sides)
  ctx.strokeStyle = '#f6ad55'
  ctx.lineWidth = 2
  for (let i = 0; i < 3; i++) {
    const y = cy - 20 + i * 20
    // Left arrow (entering)
    ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(58, y); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(54, y - 4); ctx.lineTo(58, y); ctx.lineTo(54, y + 4); ctx.stroke()
    // Right arrow (exiting)
    ctx.beginPath(); ctx.moveTo(402, y); ctx.lineTo(440, y); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(436, y - 4); ctx.lineTo(440, y); ctx.lineTo(436, y + 4); ctx.stroke()
  }
  ctx.fillStyle = '#f6ad55'
  ctx.font = '9px DM Mono,monospace'
  ctx.textAlign = 'center'
  ctx.fillText(`I(p) = ${Ip.toFixed(1)} mA`, cx, H - 10)

  // Magnetic field symbol (⊗ = into page)
  ctx.fillStyle = 'rgba(79,209,197,0.7)'
  ctx.font = '13px sans-serif'
  for (let x = 90; x < 380; x += 40) {
    for (let y = cy - 30; y < cy + 42; y += 25) {
      ctx.fillText('\u2297', x, y)
    }
  }
  ctx.fillStyle = 'rgba(79,209,197,0.6)'
  ctx.font = '9px DM Mono,monospace'
  ctx.textAlign = 'center'
  ctx.fillText(`B = ${B} G`, cx, cy - 58)

  // Hall voltage: V(H) = R(H)·B·I(p) / (t × 10⁸)  [in volts]
  const VH = (HALL_RH_SIM * B * Ip) / (HALL_T * 1e8)

  // Hall voltage indicator arrow (top of slab)
  if (VH) {
    const deflect = Math.min(44, Math.abs(VH) * 55000)
    ctx.strokeStyle = '#fc8181'
    ctx.lineWidth = 1.5
    ctx.setLineDash([3, 2])
    ctx.beginPath()
    ctx.moveTo(cx, cy - 50)
    ctx.lineTo(cx, cy - 50 - deflect)
    ctx.stroke()
    ctx.setLineDash([])

    // Arrowhead
    ctx.beginPath()
    ctx.moveTo(cx - 4, cy - 50 - deflect + 7)
    ctx.lineTo(cx, cy - 50 - deflect)
    ctx.lineTo(cx + 4, cy - 50 - deflect + 7)
    ctx.stroke()

    ctx.fillStyle = '#fc8181'
    ctx.font = '9px DM Mono,monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`V(H) = ${(VH * 1000).toFixed(2)} mV`, cx, cy - 56 - deflect)
  }

  // Electron deflection annotation
  ctx.fillStyle = 'rgba(252,129,129,0.55)'
  ctx.font = '8px DM Sans,sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('↑ Hall field  (electrons deflect toward lower face)', cx, cy - 28)

  // Labels for + / − faces
  ctx.font = '11px sans-serif'; ctx.textAlign = 'left'
  ctx.fillStyle = '#fc8181'
  ctx.fillText('+', 44, cy - 55)
  ctx.fillStyle = '#68d391'
  ctx.fillText('−', 44, cy + 68)

  return VH
}

function drawHallGraph(canvas, pairs) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const pad = { l: 60, r: 24, t: 24, b: 50 }

  ctx.fillStyle = '#0f1829'
  ctx.fillRect(0, 0, W, H)

  if (pairs.length < 2) {
    ctx.fillStyle = 'rgba(107,127,153,0.5)'
    ctx.font = '12px DM Sans,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Fill table and click Calculate to draw graph', W / 2, H / 2)
    return
  }

  const xMax = Math.max(...pairs.map(p => p.x)) * 1.2
  const yMax = Math.max(...pairs.map(p => p.y)) * 1.2

  const px = x => pad.l + (x / xMax) * (W - pad.l - pad.r)
  const py = y => H - pad.b - (y / yMax) * (H - pad.t - pad.b)

  // Grid
  ctx.strokeStyle = 'rgba(99,179,237,0.07)'; ctx.lineWidth = 0.8
  const xStep = xMax / 5
  for (let i = 1; i <= 5; i++) {
    const x = xStep * i
    ctx.beginPath(); ctx.moveTo(px(x), pad.t); ctx.lineTo(px(x), H - pad.b); ctx.stroke()
  }

  // Axes
  ctx.strokeStyle = 'rgba(99,179,237,0.3)'; ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, H - pad.b); ctx.lineTo(W - pad.r, H - pad.b)
  ctx.stroke()

  // Best-fit line through origin  (V = slope × I)
  const sxy = pairs.reduce((a, p) => a + p.x * p.y, 0)
  const sx2 = pairs.reduce((a, p) => a + p.x * p.x, 0)
  const slope = sxy / sx2

  ctx.strokeStyle = 'rgba(79,209,197,0.5)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4])
  ctx.beginPath()
  ctx.moveTo(px(0), py(0))
  ctx.lineTo(px(xMax * 0.95), py(slope * xMax * 0.95))
  ctx.stroke(); ctx.setLineDash([])

  // Data points
  pairs.forEach(p => {
    ctx.beginPath(); ctx.arc(px(p.x), py(p.y), 5, 0, 2 * Math.PI)
    ctx.fillStyle = '#63b3ed'; ctx.fill()
    ctx.strokeStyle = 'rgba(8,15,30,0.9)'; ctx.lineWidth = 1.5; ctx.stroke()
  })

  // Axis labels
  ctx.fillStyle = 'rgba(107,127,153,0.8)'; ctx.font = '10px DM Mono,monospace'; ctx.textAlign = 'center'
  for (let i = 1; i <= 5; i++) {
    ctx.fillText((xStep * i).toFixed(1), px(xStep * i), H - pad.b + 14)
  }
  ctx.fillText('I(p)  (mA)', W / 2, H - 6)
  ctx.save(); ctx.rotate(-Math.PI / 2); ctx.fillText('V(H)  (mV)', -(H / 2), 16); ctx.restore()

  // Slope label
  ctx.fillStyle = 'rgba(79,209,197,0.8)'; ctx.textAlign = 'left'
  ctx.font = '9px DM Mono,monospace'
  ctx.fillText(`slope = ${slope.toFixed(4)} mV/mA`, pad.l + 6, pad.t + 12)
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
          <p>To understand the <strong>Hall Effect</strong> and determine the Hall coefficient
          R(H) of a given semiconductor material.</p>
        </div>

        <div className="ccard">
          <h3><span>📐</span> Formula</h3>
          <div className="formula-box">
            <span className="formula">
              R(H) = (t × V(H) × 10⁻⁸) / (B × I(p)) &nbsp; cm³/C
            </span>
          </div>
          <div className="formula-box" style={{ marginTop: 10 }}>
            <span className="formula">n = 1 / (R(H) × e)</span>
          </div>
          <div className="fvars">
            <b>t</b> = thickness of semiconductor = 0.014 cm<br/>
            <b>V(H)</b> = Hall voltage (volts)<br/>
            <b>B</b> = magnetic field (Gauss)<br/>
            <b>I(p)</b> = probe current (mA)<br/>
            <b>e</b> = 1.6 × 10⁻¹⁹ C (electron charge)<br/>
            <b>n</b> = charge carrier density (/cm³)
          </div>
        </div>

        <div className="ccard">
          <h3><span>📚</span> Theory</h3>
          <p>When a current-carrying semiconductor is placed in a magnetic field perpendicular
          to the current direction, the charge carriers experience a
          <strong> Lorentz force</strong> (F = qv × B) that deflects them sideways —
          perpendicular to both the current and the magnetic field.</p>
          <p>This sideways deflection causes charge accumulation on one face of the
          semiconductor, creating a transverse electric field — the
          <strong> Hall voltage V(H)</strong>. At equilibrium, the Hall electric force
          balances the magnetic force: qE<sub>H</sub> = qv<sub>d</sub>B.</p>
          <p>The <strong>Hall coefficient</strong> R(H) = 1/ne characterises the material:
          its sign reveals the carrier type, and its magnitude gives the carrier density.</p>
          <p style={{ marginBottom: 0 }}>
            <strong>n-type semiconductor:</strong> electrons are majority carriers →
            R(H) is <em style={{ color: 'var(--danger)' }}>negative</em>.<br/>
            <strong>p-type semiconductor:</strong> holes are majority carriers →
            R(H) is <em style={{ color: 'var(--success)' }}>positive</em>.
          </p>
          <div className="formula-box" style={{ marginTop: 14 }}>
            <span className="formula" style={{ fontSize: '1rem' }}>
              V(H) = R(H) · B · I(p) / (t × 10⁸)
            </span>
            <div className="fvars">
              A graph of V(H) vs I(p) at constant B is linear through origin.<br/>
              slope = R(H) · B / (t × 10⁸) &nbsp;→&nbsp; R(H) = slope × t × 10⁸ / B
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Diagram + Given */}
      <div>
        <div className="diag-card">
          <h4>Hall Effect Setup</h4>
          <svg viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg"
               style={{ width: '100%', maxWidth: 250 }}>
            <rect width="260" height="220" fill="#0f1829" rx="6"/>
            <defs>
              <marker id="arr05" markerWidth="5" markerHeight="5"
                      refX="2.5" refY="2.5" orient="auto">
                <path d="M0,0 L5,2.5 L0,5 Z" fill="#f6ad55"/>
              </marker>
            </defs>
            {/* Slab */}
            <rect x="60" y="80" width="140" height="60"
                  fill="rgba(99,179,237,0.12)" stroke="#63b3ed" strokeWidth="1.5" rx="3"/>
            <text x="130" y="113" fill="#63b3ed" fontSize="8"
                  textAnchor="middle" fontFamily="DM Sans,sans-serif">Semiconductor</text>
            {/* Current arrows */}
            <line x1="18" y1="110" x2="58" y2="110" stroke="#f6ad55"
                  strokeWidth="2" markerEnd="url(#arr05)"/>
            <line x1="202" y1="110" x2="240" y2="110" stroke="#f6ad55"
                  strokeWidth="2" markerEnd="url(#arr05)"/>
            <text x="10" y="105" fill="#f6ad55" fontSize="7"
                  fontFamily="DM Mono,monospace">I(p)</text>
            {/* B field symbols */}
            {[82, 102, 122, 142, 162].map(x => (
              <text key={x} x={x} y="98" fill="#4fd1c5" fontSize="8">⊗</text>
            ))}
            <text x="110" y="76" fill="#4fd1c5" fontSize="7"
                  fontFamily="DM Sans,sans-serif">B (into page)</text>
            {/* Hall voltage */}
            <line x1="130" y1="62" x2="130" y2="78"
                  stroke="#fc8181" strokeWidth="1.5" strokeDasharray="2,2"/>
            <line x1="130" y1="142" x2="130" y2="158"
                  stroke="#fc8181" strokeWidth="1.5" strokeDasharray="2,2"/>
            <text x="138" y="68" fill="#fc8181" fontSize="7"
                  fontFamily="DM Mono,monospace">V(H)</text>
            {/* + / - */}
            <text x="122" y="60" fill="#fc8181" fontSize="10" fontWeight="bold">+</text>
            <text x="122" y="170" fill="#68d391" fontSize="10" fontWeight="bold">−</text>
            {/* Lorentz force label */}
            <text x="130" y="200" fill="#718096" fontSize="7"
                  textAnchor="middle" fontFamily="DM Sans,sans-serif">F = qv × B</text>
          </svg>
        </div>

        <div className="given-card">
          <h4>Given</h4>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.77rem',
                        lineHeight: 2.1, color: 'var(--text-muted)' }}>
            <b style={{ color: 'var(--accent2)' }}>t</b> = 0.014 cm<br/>
            <b style={{ color: 'var(--accent2)' }}>e</b> = 1.6 × 10⁻¹⁹ C<br/>
            <b style={{ color: 'var(--accent2)' }}>B</b> = set by I(m) on kit
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

  // Simulation params
  const [B,  setB]  = useState(2500)   // Gauss
  const [Ip, setIp] = useState(1.0)    // mA

  // Displayed V(H) from simulation
  const [vhDisplay, setVhDisplay] = useState(null)

  // Observation table: 6 rows
  const [ipVals, setIpVals] = useState(Array(6).fill(''))
  const [vhVals, setVhVals] = useState(Array(6).fill(''))

  // Results
  const [results, setResults] = useState(null)

  // Record target row
  const [recRow, setRecRow] = useState(0)

  // Redraw on param change
  useEffect(() => {
    if (!canvasRef.current) return
    const VH = drawHallSim(canvasRef.current, { B, Ip })
    setVhDisplay(VH)
  }, [B, Ip])

  // Draw empty graph on mount
  useEffect(() => {
    if (graphRef.current) drawHallGraph(graphRef.current, [])
  }, [])

  // Computed R(H) and n for each row
  const computedRows = ipVals.map((ipStr, i) => {
    const ip = parseFloat(ipStr)
    const vh = parseFloat(vhVals[i])
    if (isNaN(ip) || isNaN(vh)) return { rh: '—', n: '—' }
    const rh = (HALL_T * vh * 1e-8) / (B * ip)
    const n  = 1 / (rh * HALL_E)
    return { rh: rh.toExponential(3), n: n.toExponential(3), rhVal: rh }
  })

  // Record reading from simulation
  const recordReading = () => {
    if (vhDisplay === null) return
    setIpVals(prev => { const n = [...prev]; n[recRow] = Ip.toFixed(1); return n })
    setVhVals(prev => { const n = [...prev]; n[recRow] = vhDisplay.toFixed(4); return n })
  }

  // Calculate all
  const calcAll = () => {
    const valid = computedRows.filter(r => r.rhVal !== undefined)
    if (valid.length === 0) return

    const meanRH  = valid.reduce((a, r) => a + r.rhVal, 0) / valid.length
    const meanN   = 1 / (meanRH * HALL_E)

    // Build pairs for graph: {x: Ip (mA), y: V(H) (mV)}
    const pairs = ipVals.map((ip, i) => {
      const ipF = parseFloat(ip)
      const vhF = parseFloat(vhVals[i])
      if (isNaN(ipF) || isNaN(vhF)) return null
      return { x: ipF, y: vhF * 1000 }
    }).filter(Boolean)

    setResults({ rh: meanRH.toExponential(3), n: meanN.toExponential(3) })
    drawHallGraph(graphRef.current, pairs)
  }

  const reset = () => {
    setIpVals(Array(6).fill(''))
    setVhVals(Array(6).fill(''))
    setResults(null)
    drawHallGraph(graphRef.current, [])
  }

  return (
    <div>
      {/* How to use */}
      <div className="howto-card" style={{ marginBottom: 20 }}>
        <h4>💡 How to Use</h4>
        <div className="howto-steps">
          {[
            'Set magnetic current I(m) on the apparatus — the magnetic field B is fixed for the whole experiment.',
            'Vary probe current I(p) using the slider — the simulation shows the Hall voltage V(H) in real time.',
            'Select a row, click 📌 Record — the current I(p) and simulated V(H) are auto-filled.',
            'Click ⚡ Calculate All to compute R(H) and carrier density n for each row, then draw the V(H) vs I(p) graph.',
          ].map((s, i) => (
            <div key={i} className="hs">
              <span className="hs-num">{String(i + 1).padStart(2, '0')}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 268px',
                    gap: 20, alignItems: 'start', marginBottom: 24 }}>
        {/* Canvas */}
        <div className="sim-top">
          <h3>⚡ Hall Effect Simulation</h3>
          <canvas ref={canvasRef} width={460} height={260}
                  style={{ borderRadius: 8, maxWidth: '100%',
                           display: 'block', margin: '0 auto' }}/>
          <div className="sim-caption">
            Arrows show I(p) direction · ⊗ symbols = B field into page · dashed line = Hall voltage
          </div>
          {/* Live readings */}
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center',
                        gap: 24, padding: '10px 14px', background: 'var(--surface2)',
                        borderRadius: 8, border: '1px solid var(--border)', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Magnetic Field B
              </div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '1.3rem',
                            color: 'var(--accent)' }}>
                {B} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>G</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Probe Current I(p)
              </div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '1.3rem',
                            color: 'var(--accent3)' }}>
                {Ip.toFixed(1)} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>mA</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Hall Voltage V(H)
              </div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '1.3rem',
                            color: 'var(--danger)' }}>
                {vhDisplay !== null ? (vhDisplay * 1000).toFixed(3) : '—'}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> mV</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ctrl-card">
            <h4>⚙️ Parameters</h4>
            <div className="slider-row">
              <div className="slabel">
                <span>Magnetic Field B (Gauss)</span>
                <span className="sval">{B} G</span>
              </div>
              <input type="range" min={500} max={6000} step={100} value={B}
                     onChange={e => setB(+e.target.value)}/>
            </div>
            <div className="slider-row" style={{ marginBottom: 0 }}>
              <div className="slabel">
                <span>Probe Current I(p) (mA)</span>
                <span className="sval">{Ip.toFixed(1)} mA</span>
              </div>
              <input type="range" min={0.5} max={6.0} step={0.5} value={Ip}
                     onChange={e => setIp(parseFloat(e.target.value))}/>
            </div>
          </div>

          {/* Explanation of V(H) behaviour */}
          <div className="ctrl-card" style={{ background: 'rgba(79,209,197,0.03)',
                                               borderColor: 'rgba(79,209,197,0.15)' }}>
            <h4 style={{ color: 'var(--accent2)' }}>📡 What you observe</h4>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>
              <strong style={{ color: 'var(--text)' }}>Increasing I(p):</strong><br/>
              More current → more carriers → stronger Lorentz force → larger V(H).
              V(H) ∝ I(p) at constant B.
              <br/><br/>
              <strong style={{ color: 'var(--text)' }}>Increasing B:</strong><br/>
              Stronger field → greater deflection → larger V(H).
              V(H) ∝ B at constant I(p).
              <br/><br/>
              <strong style={{ color: 'var(--danger)' }}>Sign of V(H):</strong><br/>
              Negative here → n-type semiconductor (electrons are carriers).
            </div>
          </div>

          {/* Record reading */}
          <div className="ctrl-card" style={{ background: 'rgba(99,179,237,0.03)' }}>
            <h4 style={{ color: 'var(--accent2)' }}>📌 Record Reading</h4>
            <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginBottom: 10 }}>
              I(p) = <strong style={{ color: 'var(--accent3)' }}>{Ip.toFixed(1)} mA</strong> &nbsp;
              V(H) = <strong style={{ color: 'var(--danger)' }}>
                {vhDisplay !== null ? (vhDisplay * 1000).toFixed(3) : '—'} mV
              </strong>
            </div>
            <select value={recRow} onChange={e => setRecRow(+e.target.value)}
                    style={{ width: '100%', marginBottom: 8 }}>
              {Array.from({ length: 6 }, (_, i) => (
                <option key={i} value={i}>Row {i + 1}</option>
              ))}
            </select>
            <button className="btn-sm btn-accent"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={recordReading}>
              📌 Record I(p) and V(H)
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
                           fontWeight: 400, marginLeft: 8 }}>
              Magnetic field B = {B} Gauss (constant)
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
                <th>Probe Current I(p) (mA)</th>
                <th>Hall Voltage V(H) (volts)</th>
                <th>Hall Coefficient R(H) (cm³/C)</th>
                <th>Carrier Density n (/cm³)</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }, (_, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <input type="number" step="0.5" placeholder="mA"
                           value={ipVals[i]}
                           onChange={e => setIpVals(prev => {
                             const n = [...prev]; n[i] = e.target.value; return n
                           })}/>
                  </td>
                  <td>
                    <input type="number" step="0.0001" placeholder="volts"
                           value={vhVals[i]}
                           onChange={e => setVhVals(prev => {
                             const n = [...prev]; n[i] = e.target.value; return n
                           })}/>
                  </td>
                  <td className="auto">{computedRows[i].rh}</td>
                  <td className="auto">{computedRows[i].n}</td>
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
              <div className="calc-label">Hall Coefficient R(H)</div>
              <div>
                <span className="calc-val">{results.rh}</span>
                <span className="calc-unit">cm³/C</span>
              </div>
            </div>
            <div className="calc-item">
              <div className="calc-label">Carrier Density n</div>
              <div>
                <span className="calc-val teal">{results.n}</span>
                <span className="calc-unit">/cm³</span>
              </div>
            </div>
            <div className="calc-item">
              <div className="calc-label">Carrier Type</div>
              <div>
                <span className="calc-val"
                      style={{ fontSize: '1rem',
                               color: parseFloat(results.rh) < 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {parseFloat(results.rh) < 0 ? 'n-type (electrons)' : 'p-type (holes)'}
                </span>
              </div>
            </div>
            <div className="calc-item">
              <div className="calc-label">t (semiconductor thickness)</div>
              <div>
                <span className="calc-val"
                      style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
                  {HALL_T}
                </span>
                <span className="calc-unit">cm</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graph */}
      <div className="graph-wrap" style={{ marginTop: 20 }}>
        <div className="graph-hdr">
          <h3>📈 Graph: V(H) vs I(p) at constant B</h3>
          <button className="btn-sm btn-outline" onClick={calcAll}>▶ Draw Graph</button>
        </div>
        <canvas ref={graphRef} width={580} height={300}
                style={{ width: '100%', maxWidth: 580, display: 'block', margin: '0 auto' }}/>
        <div style={{ marginTop: 12, fontSize: '0.76rem', color: 'var(--text-muted)',
                      textAlign: 'center', lineHeight: 1.7 }}>
          Linear graph through origin confirms V(H) ∝ I(p).&nbsp;
          <strong style={{ color: 'var(--accent2)' }}>
            R(H) = slope × t × 10⁸ / B
          </strong>
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
    q: 'What is the Hall Effect?',
    opts: [
      'Light emission from semiconductors when current flows',
      'Transverse voltage developed in a current-carrying conductor placed in a magnetic field',
      'Resistance change in a material due to a magnetic field',
      'Magnetic field created by an electric current',
    ],
    ans: 1,
    exp: 'The Hall Effect is the development of a transverse (perpendicular) voltage across a conductor when a magnetic field is applied perpendicular to the direction of current flow.',
  },
  {
    q: 'The Hall coefficient R(H) has units of:',
    opts: ['Volt/Ampere', 'cm³/Coulomb', 'Gauss·cm', 'Coulomb/cm³'],
    ans: 1,
    exp: 'R(H) = V(H)·t / (B·I) has units (V·cm)/(G·A). Converting Gauss and Ampere gives cm³/Coulomb.',
  },
  {
    q: 'For a p-type semiconductor, R(H) is:',
    opts: ['Zero', 'Negative (electrons dominate)', 'Positive (holes dominate)', 'Infinite'],
    ans: 2,
    exp: 'In p-type, holes are majority carriers. They deflect in the same direction as conventional current, creating a Hall field opposite to n-type — giving positive R(H).',
  },
  {
    q: 'From R(H), the charge carrier density n is:',
    opts: ['n = R(H) × e', 'n = 1 / (R(H) · e)', 'n = R(H) / e', 'n = e / R(H)'],
    ans: 1,
    exp: 'n = 1/(R(H)·e) where e = 1.6×10⁻¹⁹ C. This is derived from R(H) = 1/ne for a simple one-carrier model.',
  },
  {
    q: 'What is the graph plotted in this experiment?',
    opts: ['B vs I(p)', 'V(H) vs B at constant I(p)', 'V(H) vs I(p) at constant B', 'R(H) vs temperature'],
    ans: 2,
    exp: 'V(H) vs I(p) at constant B gives a straight line through the origin with slope = R(H)·B/(t×10⁸). R(H) is determined from the slope.',
  },
  {
    q: 'If probe current I(p) doubles at constant B, Hall voltage V(H):',
    opts: ['Stays the same', 'Halves', 'Doubles', 'Quadruples'],
    ans: 2,
    exp: 'V(H) = R(H)·B·I(p)/(t×10⁸). Since everything else is constant, V(H) ∝ I(p). Doubling I(p) doubles V(H). This linear relationship is verified by the graph.',
  },
]

const FLASHCARDS = [
  {
    q: 'What is the formula for Hall coefficient R(H)?',
    a: 'R(H) = t × V(H) × 10⁻⁸ / (B × I(p))\nUnits: cm³/Coulomb\nt = semiconductor thickness = 0.014 cm',
  },
  {
    q: 'What does the sign of R(H) tell you about the semiconductor?',
    a: 'Positive R(H) → p-type semiconductor (holes are majority carriers)\nNegative R(H) → n-type semiconductor (electrons are majority carriers)',
  },
  {
    q: 'Formula for charge carrier density n:',
    a: 'n = 1 / (R(H) × e)\ne = 1.6 × 10⁻¹⁹ C\nHigher n = more charge carriers = more conductive material',
  },
  {
    q: 'What physical force causes the Hall voltage to appear?',
    a: 'Lorentz force: F = q(v × B)\nCharge carriers in current deflect sideways due to magnetic field B.\nAccumulation on one face creates a transverse electric field = Hall voltage V(H).',
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
        <p>Hall Coefficient &amp; Hall Effect</p>
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
export default function Exp05({ tab }) {
  if (tab === 'theory')     return <Theory />
  if (tab === 'simulation') return <Simulation />
  if (tab === 'test')       return <Test />
  return null
}