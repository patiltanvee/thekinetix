// ─────────────────────────────────────────────────────────────
//  Exp07.jsx  —  I-V Characteristics of Photo-Diode
// ─────────────────────────────────────────────────────────────
import React, { useRef, useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS & MODEL
// ═══════════════════════════════════════════════════════════════
const I_DARK  = 0.5   // µA — dark current (base leakage)
const I_PHOTO = 5.0   // µA — photocurrent per unit intensity at I₁
const SLOPE   = 0.08  // µA/V — tiny slope (high output resistance)
const VR_VALS = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0]   // 9 fixed Vr steps

// Model: reverse current at (Vr, intLevel)
function getIr(Vr, intLevel, intMult = 3) {
  const Iphoto = intLevel === 0
    ? I_DARK
    : (I_DARK + I_PHOTO * intMult)
  return Iphoto + SLOPE * Vr    // µA (magnitude; flows in reverse)
}

// ═══════════════════════════════════════════════════════════════
//  DRAW FUNCTIONS  (pure — take canvas + params)
// ═══════════════════════════════════════════════════════════════
function drawIV(canvas, { Vr, intLevel, intMult, showDot }) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const pad = { l: 58, r: 20, t: 22, b: 50 }

  ctx.fillStyle = '#0a1020'
  ctx.fillRect(0, 0, W, H)

  const Vmax = 5, Imax = 30
  const px = v => pad.l + (v / Vmax) * (W - pad.l - pad.r)
  const py = i => H - pad.b - (i / Imax) * (H - pad.t - pad.b)

  // Grid
  ctx.strokeStyle = 'rgba(99,179,237,0.07)'; ctx.lineWidth = 0.7
  ;[1, 2, 3, 4, 5].forEach(v => {
    ctx.beginPath(); ctx.moveTo(px(v), pad.t); ctx.lineTo(px(v), H - pad.b); ctx.stroke()
  })
  ;[5, 10, 15, 20, 25].forEach(i => {
    ctx.beginPath(); ctx.moveTo(pad.l, py(i)); ctx.lineTo(W - pad.r, py(i)); ctx.stroke()
  })

  // Axes
  ctx.strokeStyle = 'rgba(99,179,237,0.3)'; ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, H - pad.b); ctx.lineTo(W - pad.r, H - pad.b)
  ctx.stroke()

  // Axis labels
  ctx.fillStyle = 'rgba(113,128,150,0.85)'; ctx.font = '9px DM Mono,monospace'; ctx.textAlign = 'center'
  ;[0, 1, 2, 3, 4, 5].forEach(v => ctx.fillText(v.toFixed(0), px(v), H - pad.b + 12))
  ctx.fillText('Vᵣ  (Volts)', W / 2, H - 5)
  ctx.save(); ctx.rotate(-Math.PI / 2); ctx.fillText('Iᵣ  (µA)', -(H / 2), 15); ctx.restore()
  ctx.textAlign = 'right'
  ;[5, 10, 15, 20, 25].forEach(i => ctx.fillText(i.toFixed(0), pad.l - 5, py(i) + 3))

  // I₀ curve (dark / low intensity)
  ctx.strokeStyle = 'rgba(99,179,237,0.85)'; ctx.lineWidth = 2.5
  ctx.beginPath()
  for (let v = 0; v <= 5; v += 0.04) {
    const i = getIr(v, 0, intMult)
    v === 0 ? ctx.moveTo(px(v), py(i)) : ctx.lineTo(px(v), py(i))
  }
  ctx.stroke()
  ctx.fillStyle = '#63b3ed'; ctx.font = '9px DM Sans,sans-serif'; ctx.textAlign = 'left'
  ctx.fillText('I₀  (low intensity)', pad.l + 5, py(getIr(0, 0, intMult)) - 7)

  // I₁ curve (bright / high intensity)
  ctx.strokeStyle = 'rgba(246,173,85,0.85)'; ctx.lineWidth = 2.5
  ctx.beginPath()
  for (let v = 0; v <= 5; v += 0.04) {
    const i = getIr(v, 1, intMult)
    v === 0 ? ctx.moveTo(px(v), py(i)) : ctx.lineTo(px(v), py(i))
  }
  ctx.stroke()
  ctx.fillStyle = '#f6ad55'
  ctx.fillText('I₁  (high intensity)', pad.l + 5, py(getIr(0, 1, intMult)) - 7)

  // Vertical separation arrow (ΔI at Vr=2)
  const v0 = 2.5
  const i0 = getIr(v0, 0, intMult), i1 = getIr(v0, 1, intMult)
  ctx.strokeStyle = 'rgba(104,211,145,0.5)'; ctx.lineWidth = 1; ctx.setLineDash([2, 3])
  ctx.beginPath(); ctx.moveTo(px(v0) + 10, py(i0)); ctx.lineTo(px(v0) + 10, py(i1)); ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = 'rgba(104,211,145,0.75)'; ctx.font = '8px DM Mono,monospace'; ctx.textAlign = 'left'
  ctx.fillText('ΔI_photo', px(v0) + 14, py((i0 + i1) / 2))

  // Operating point dot
  if (showDot) {
    const curIr = getIr(Vr, intLevel, intMult)
    ctx.beginPath(); ctx.arc(px(Vr), py(curIr), 6, 0, 2 * Math.PI)
    ctx.fillStyle = intLevel === 0 ? '#63b3ed' : '#f6ad55'; ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5; ctx.stroke()
    // Dotted lines to axes
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 0.8; ctx.setLineDash([3, 3])
    ctx.beginPath(); ctx.moveTo(px(Vr), py(curIr)); ctx.lineTo(px(Vr), H - pad.b); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(px(Vr), py(curIr)); ctx.lineTo(pad.l, py(curIr)); ctx.stroke()
    ctx.setLineDash([])
  }
}

function drawGraphCanvas(canvas, pairs0, pairs1) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const pad = { l: 60, r: 24, t: 24, b: 50 }

  ctx.fillStyle = '#0f1829'
  ctx.fillRect(0, 0, W, H)

  const allPts = [...pairs0, ...pairs1]
  if (!allPts.length) {
    ctx.fillStyle = 'rgba(107,127,153,0.5)'; ctx.font = '12px DM Sans,sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('Fill observation table and click Calculate to draw graph', W / 2, H / 2)
    return
  }

  const xMax = 4.5
  const yMax = Math.max(...allPts.map(p => p.i), 5) * 1.25
  const px = v => pad.l + (v / xMax) * (W - pad.l - pad.r)
  const py = i => H - pad.b - (i / yMax) * (H - pad.t - pad.b)

  // Grid
  ctx.strokeStyle = 'rgba(99,179,237,0.07)'; ctx.lineWidth = 0.8
  ;[1, 2, 3, 4].forEach(v => {
    ctx.beginPath(); ctx.moveTo(px(v), pad.t); ctx.lineTo(px(v), H - pad.b); ctx.stroke()
  })

  // Axes
  ctx.strokeStyle = 'rgba(99,179,237,0.3)'; ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, H - pad.b); ctx.lineTo(W - pad.r, H - pad.b)
  ctx.stroke()

  // Axis labels
  ctx.fillStyle = 'rgba(107,127,153,0.8)'; ctx.font = '9px DM Mono,monospace'; ctx.textAlign = 'center'
  ;[0, 1, 2, 3, 4].forEach(v => ctx.fillText(v.toFixed(0), px(v), H - pad.b + 14))
  ctx.fillText('Vᵣ  (Volts)', W / 2, H - 5)
  ctx.save(); ctx.rotate(-Math.PI / 2); ctx.fillText('Iᵣ  (µA)', -(H / 2), 16); ctx.restore()

  const drawCurve = (pts, col) => {
    if (pts.length < 2) return
    // Connect points
    ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.setLineDash([])
    ctx.beginPath()
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(px(p.v), py(p.i)) : ctx.lineTo(px(p.v), py(p.i)))
    ctx.stroke()
    // Dots
    pts.forEach(p => {
      ctx.beginPath(); ctx.arc(px(p.v), py(p.i), 4, 0, 2 * Math.PI)
      ctx.fillStyle = col; ctx.fill()
      ctx.strokeStyle = 'rgba(8,15,30,0.9)'; ctx.lineWidth = 1.2; ctx.stroke()
    })
  }

  drawCurve(pairs0, '#63b3ed')
  drawCurve(pairs1, '#f6ad55')

  // Legend
  ctx.font = '9px DM Sans,sans-serif'; ctx.textAlign = 'left'
  ctx.fillStyle = '#63b3ed'; ctx.fillRect(pad.l + 6, pad.t + 6, 10, 3)
  ctx.fillStyle = 'rgba(107,127,153,0.8)'; ctx.fillText('I₀  (dark/low)', pad.l + 20, pad.t + 10)
  ctx.fillStyle = '#f6ad55'; ctx.fillRect(pad.l + 6, pad.t + 16, 10, 3)
  ctx.fillStyle = 'rgba(107,127,153,0.8)'; ctx.fillText('I₁  (bright)', pad.l + 20, pad.t + 20)
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
          <p>To study the <strong>reverse bias I-V characteristics</strong> of a photo-diode
          at two different light intensities (I₀ and I₁) and determine the output resistance.</p>
        </div>

        <div className="ccard">
          <h3><span>📐</span> Formula</h3>
          <div className="formula-box">
            <span className="formula">Slope = ΔI / ΔV &nbsp;&nbsp; (µA/V)</span>
          </div>
          <div className="formula-box" style={{ marginTop: 10 }}>
            <span className="formula">R_out = 1 / Slope = ΔV / ΔI &nbsp;&nbsp; (Ω)</span>
          </div>
          <div className="fvars">
            <b>ΔI</b> = change in reverse current (µA)<br/>
            <b>ΔV</b> = change in reverse voltage (V)<br/>
            <b>R_out</b> = dynamic output resistance (MΩ range for photo-diodes)<br/>
            <b>I₀</b> = current at low/dark intensity &nbsp;|&nbsp;
            <b>I₁</b> = current at high intensity
          </div>
        </div>

        <div className="ccard">
          <h3><span>📚</span> Theory</h3>
          <p>A <strong>photo-diode</strong> is a semiconductor device that converts light into
          electrical current. When operated in <strong>reverse bias</strong>, the depletion
          region widens, reducing capacitance and enabling fast response.</p>
          <p>In the dark, a tiny <strong>dark current</strong> flows due to thermally generated
          electron-hole pairs. When photons with energy greater than the bandgap strike the
          junction, they create additional electron-hole pairs, generating a
          <strong> photocurrent</strong> that adds to the dark current.</p>
          <p>Key features of the reverse-bias I-V curve:</p>
          <ul style={{ marginLeft: 16, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 2 }}>
            <li>Current is <strong>nearly constant</strong> regardless of voltage (flat curve)</li>
            <li>Higher light intensity → curve shifts <strong>upward</strong> (more current)</li>
            <li>Steep slope = low R_out; flat slope = high R_out (ideal current source)</li>
          </ul>
          <div className="formula-box" style={{ marginTop: 12 }}>
            <span className="formula" style={{ fontSize: '1rem' }}>
              I_r = I_dark + I_photo × intensity
            </span>
            <div className="fvars">
              I_photo ∝ incident light intensity (linear relationship)
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Diagram */}
      <div>
        <div className="diag-card">
          <h4>Circuit &amp; I-V Sketch</h4>
          <svg viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg"
               style={{ width: '100%', maxWidth: 250 }}>
            <rect width="260" height="220" fill="#0f1829" rx="6"/>
            {/* DC source */}
            <circle cx="30" cy="120" r="16"
                    fill="rgba(99,179,237,0.1)" stroke="#63b3ed" strokeWidth="1"/>
            <text x="30" y="117" fill="#63b3ed" fontSize="8"
                  textAnchor="middle" fontFamily="DM Mono,sans-serif">+</text>
            <text x="30" y="127" fill="#63b3ed" fontSize="8"
                  textAnchor="middle" fontFamily="DM Mono,sans-serif">−</text>
            <text x="30" y="148" fill="#6b7f99" fontSize="6"
                  textAnchor="middle" fontFamily="DM Sans,sans-serif">DC 0-5V</text>
            {/* Wire top */}
            <line x1="30" y1="104" x2="30" y2="60" stroke="#63b3ed" strokeWidth="1.2"/>
            <line x1="30" y1="60" x2="180" y2="60" stroke="#63b3ed" strokeWidth="1.2"/>
            {/* Wire bottom */}
            <line x1="30" y1="136" x2="30" y2="180" stroke="#63b3ed" strokeWidth="1.2"/>
            <line x1="30" y1="180" x2="180" y2="180" stroke="#63b3ed" strokeWidth="1.2"/>
            {/* Voltmeter */}
            <circle cx="80" cy="120" r="12"
                    fill="rgba(79,209,197,0.1)" stroke="#4fd1c5" strokeWidth="1"/>
            <text x="80" y="124" fill="#4fd1c5" fontSize="8"
                  textAnchor="middle" fontFamily="DM Mono,sans-serif">V</text>
            <line x1="80" y1="108" x2="80" y2="60" stroke="#4fd1c5" strokeWidth="1"/>
            <line x1="80" y1="132" x2="80" y2="180" stroke="#4fd1c5" strokeWidth="1"/>
            {/* µA meter */}
            <circle cx="135" cy="60" r="12"
                    fill="rgba(246,173,85,0.1)" stroke="#f6ad55" strokeWidth="1"/>
            <text x="135" y="64" fill="#f6ad55" fontSize="7"
                  textAnchor="middle" fontFamily="DM Mono,sans-serif">µA</text>
            {/* Photo-diode symbol */}
            <polygon points="170,75 170,105 185,90"
                     fill="rgba(104,211,145,0.2)" stroke="#68d391" strokeWidth="1.3"/>
            <line x1="185" y1="75" x2="185" y2="105"
                  stroke="#68d391" strokeWidth="1.3"/>
            <line x1="170" y1="90" x2="155" y2="90"
                  stroke="#68d391" strokeWidth="1.2"/>
            <line x1="185" y1="90" x2="200" y2="90"
                  stroke="#68d391" strokeWidth="1.2"/>
            <line x1="200" y1="90" x2="200" y2="60"
                  stroke="#68d391" strokeWidth="1.2"/>
            <line x1="155" y1="90" x2="155" y2="180"
                  stroke="#68d391" strokeWidth="1.2"/>
            {/* Light rays */}
            <line x1="198" y1="110" x2="185" y2="95"
                  stroke="#f6e05e" strokeWidth="1.2" strokeDasharray="2,1"/>
            <line x1="205" y1="115" x2="185" y2="100"
                  stroke="#f6e05e" strokeWidth="1.2" strokeDasharray="2,1"/>
            <text x="210" y="120" fill="#f6e05e" fontSize="7"
                  fontFamily="DM Sans,sans-serif">hν</text>
            <text x="177" y="114" fill="#68d391" fontSize="6.5"
                  textAnchor="middle" fontFamily="DM Sans,sans-serif">PD</text>
            {/* I-V sketch */}
            <rect x="18" y="185" width="95" height="32"
                  fill="rgba(10,14,26,0.5)" stroke="var(--border)" strokeWidth="0.8" rx="2"/>
            <text x="65" y="195" fill="#6b7f99" fontSize="6"
                  textAnchor="middle" fontFamily="DM Sans,sans-serif">I-V sketch (reverse bias)</text>
            <line x1="24" y1="210" x2="108" y2="210"
                  stroke="rgba(99,179,237,0.3)" strokeWidth="0.7"/>
            <line x1="24" y1="198" x2="24" y2="214"
                  stroke="rgba(99,179,237,0.3)" strokeWidth="0.7"/>
            <path d="M25 207 Q50 207 108 206"
                  fill="none" stroke="#63b3ed" strokeWidth="1.2"/>
            <path d="M25 203 Q50 203 108 201"
                  fill="none" stroke="#f6ad55" strokeWidth="1.2"/>
            <text x="72" y="205" fill="#63b3ed" fontSize="5.5"
                  fontFamily="DM Mono,sans-serif">I₀</text>
            <text x="72" y="201" fill="#f6ad55" fontSize="5.5"
                  fontFamily="DM Mono,sans-serif">I₁</text>
          </svg>
        </div>

        <div className="given-card">
          <h4>Key Points</h4>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.77rem',
                        lineHeight: 2.0, color: 'var(--text-muted)' }}>
            Vr range: <b style={{ color: 'var(--accent2)' }}>0 – 5 V</b><br/>
            Ir range: <b style={{ color: 'var(--accent2)' }}>µA range</b><br/>
            R_out: <b style={{ color: 'var(--accent2)' }}>MΩ range</b><br/>
            Curve is <b style={{ color: 'var(--text)' }}>nearly flat</b>
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
  const simRef   = useRef(null)
  const graphRef = useRef(null)

  // Sim state
  const [Vr,       setVr]       = useState(0)
  const [intLevel, setIntLevel] = useState(0)   // 0 = I₀, 1 = I₁
  const [intMult,  setIntMult]  = useState(3)

  // Observation table: 9 rows × 2 intensity columns
  const [i0Vals, setI0Vals] = useState(Array(9).fill(''))
  const [i1Vals, setI1Vals] = useState(Array(9).fill(''))

  // Results
  const [results,  setResults]  = useState(null)
  const [recRow,   setRecRow]   = useState(0)

  // Live current reading
  const curIr = getIr(Vr, intLevel, intMult)

  // Redraw simulation
  useEffect(() => {
    if (simRef.current)
      drawIV(simRef.current, { Vr, intLevel, intMult, showDot: true })
  }, [Vr, intLevel, intMult])

  // Draw empty graph on mount
  useEffect(() => {
    if (graphRef.current) drawGraphCanvas(graphRef.current, [], [])
  }, [])

  // Record current reading into table
  const recordReading = () => {
    const val = curIr.toFixed(2)
    if (intLevel === 0) {
      setI0Vals(prev => { const n = [...prev]; n[recRow] = val; return n })
    } else {
      setI1Vals(prev => { const n = [...prev]; n[recRow] = val; return n })
    }
  }

  // Slope from linear regression
  const calcSlope = (vArr, iArr) => {
    const pts = vArr.map((v, i) => ({ v, i: parseFloat(iArr[i]) }))
      .filter(p => !isNaN(p.i))
    if (pts.length < 2) return null
    const n = pts.length
    const sx = pts.reduce((a, p) => a + p.v, 0)
    const sy = pts.reduce((a, p) => a + p.i, 0)
    const sx2 = pts.reduce((a, p) => a + p.v * p.v, 0)
    const sxy = pts.reduce((a, p) => a + p.v * p.i, 0)
    return (n * sxy - sx * sy) / (n * sx2 - sx * sx)   // µA/V
  }

  // Calculate
  const calcAll = () => {
    const s0 = calcSlope(VR_VALS, i0Vals)
    const s1 = calcSlope(VR_VALS, i1Vals)

    const pairs0 = VR_VALS.map((v, i) => {
      const iv = parseFloat(i0Vals[i]); return isNaN(iv) ? null : { v, i: iv }
    }).filter(Boolean)
    const pairs1 = VR_VALS.map((v, i) => {
      const iv = parseFloat(i1Vals[i]); return isNaN(iv) ? null : { v, i: iv }
    }).filter(Boolean)

    drawGraphCanvas(graphRef.current, pairs0, pairs1)

    setResults({
      slope0: s0 ? (s0 * 1e-6).toExponential(3) : '—',
      rout0:  s0 ? (1e6 / s0).toExponential(3)  : '—',
      slope1: s1 ? (s1 * 1e-6).toExponential(3) : '—',
      rout1:  s1 ? (1e6 / s1).toExponential(3)  : '—',
    })
  }

  const reset = () => {
    setI0Vals(Array(9).fill(''))
    setI1Vals(Array(9).fill(''))
    setResults(null)
    if (graphRef.current) drawGraphCanvas(graphRef.current, [], [])
  }

  return (
    <div>
      {/* How to use */}
      <div className="howto-card" style={{ marginBottom: 20 }}>
        <h4>💡 How to Use</h4>
        <div className="howto-steps">
          {[
            'Select intensity I₀ (dark) or I₁ (bright) using the buttons — the simulation shows that curve.',
            'Move the Vᵣ slider — the operating point (dot) tracks along the selected curve.',
            'Select a row, click 📌 Record — the current Iᵣ is auto-filled for the active intensity.',
            'Fill both I₀ and I₁ columns, click ⚡ Calculate — slopes, output resistance and graph are shown.',
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
          <h3>📈 I-V Characteristics Simulation</h3>
          <canvas ref={simRef} width={460} height={260}
                  style={{ borderRadius: 8, maxWidth: '100%',
                           display: 'block', margin: '0 auto' }}/>
          <div className="sim-caption">
            Blue = I₀ (dark/low) &nbsp;|&nbsp; Orange = I₁ (bright) &nbsp;|&nbsp;
            Dot = current operating point
          </div>

          {/* Live reading strip */}
          <div style={{ marginTop: 12, display: 'flex', gap: 20, flexWrap: 'wrap',
                        padding: '10px 14px', background: 'var(--surface2)',
                        borderRadius: 8, border: '1px solid var(--border)' }}>
            {[
              { label: 'Reverse Voltage Vᵣ', val: Vr.toFixed(1) + ' V',   color: 'var(--accent)' },
              { label: 'Reverse Current Iᵣ', val: curIr.toFixed(2) + ' µA', color: intLevel === 0 ? '#63b3ed' : '#f6ad55' },
              { label: 'Intensity',           val: intLevel === 0 ? 'I₀ (low)' : 'I₁ (high)', color: intLevel === 0 ? '#63b3ed' : '#f6ad55' },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)',
                              textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {label}
                </div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '1.2rem', color }}>
                  {val}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ctrl-card">
            <h4>⚙️ Parameters</h4>

            {/* Intensity selector */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                Light Intensity
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { level: 0, label: 'I₀ — Dark/Low', color: '#63b3ed', border: 'rgba(99,179,237,0.4)' },
                  { level: 1, label: 'I₁ — Bright',   color: '#f6ad55', border: 'rgba(246,173,85,0.4)' },
                ].map(({ level, label, color, border }) => (
                  <button key={level}
                    style={{
                      flex: 1, padding: '8px 6px', borderRadius: 8, cursor: 'pointer',
                      fontFamily: "'DM Sans',sans-serif", fontSize: '0.78rem', fontWeight: 600,
                      transition: 'all 0.2s',
                      background: intLevel === level ? `rgba(${level === 0 ? '99,179,237' : '246,173,85'},0.12)` : 'transparent',
                      border: `1px solid ${intLevel === level ? border : 'var(--border)'}`,
                      color: intLevel === level ? color : 'var(--text-muted)',
                    }}
                    onClick={() => setIntLevel(level)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="slider-row">
              <div className="slabel">
                <span>Reverse Voltage Vᵣ</span>
                <span className="sval">{Vr.toFixed(1)} V</span>
              </div>
              <input type="range" min={0} max={4.5} step={0.1} value={Vr}
                     onChange={e => setVr(parseFloat(e.target.value))}/>
            </div>

            <div className="slider-row" style={{ marginBottom: 0 }}>
              <div className="slabel">
                <span>Intensity multiplier (I₁)</span>
                <span className="sval">{intMult.toFixed(1)}×</span>
              </div>
              <input type="range" min={1} max={6} step={0.5} value={intMult}
                     onChange={e => setIntMult(parseFloat(e.target.value))}/>
            </div>
          </div>

          {/* Explanation */}
          <div className="ctrl-card" style={{ background: 'rgba(79,209,197,0.03)',
                                               borderColor: 'rgba(79,209,197,0.15)' }}>
            <h4 style={{ color: 'var(--accent2)' }}>📡 Why the curve is flat</h4>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>
              In reverse bias, photocurrent is
              <strong style={{ color: 'var(--text)' }}> nearly voltage-independent</strong>
              — the device acts like a <em>current source</em>.<br/><br/>
              The tiny positive slope gives a very large R_out (MΩ), meaning almost no
              change in current with changing voltage.
              <br/><br/>
              <strong style={{ color: 'var(--danger)' }}>ΔI (between I₀ and I₁)</strong>
              = I_photo = light-generated current. This vertical shift is
              proportional to light intensity.
            </div>
          </div>

          {/* Record */}
          <div className="ctrl-card" style={{ background: 'rgba(99,179,237,0.03)' }}>
            <h4 style={{ color: 'var(--accent2)' }}>📌 Record Reading</h4>
            <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginBottom: 10 }}>
              Vᵣ = <strong style={{ color: 'var(--accent)' }}>{Vr.toFixed(1)} V</strong> &nbsp;
              Iᵣ = <strong style={{ color: intLevel === 0 ? '#63b3ed' : '#f6ad55' }}>
                {curIr.toFixed(2)} µA
              </strong>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <select value={recRow} onChange={e => setRecRow(+e.target.value)}
                      style={{ flex: 1 }}>
                {VR_VALS.map((v, i) => (
                  <option key={v} value={i}>Row {i + 1} — Vᵣ = {v.toFixed(1)} V</option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: 8 }}>
              Recording into: <strong style={{ color: intLevel === 0 ? '#63b3ed' : '#f6ad55' }}>
                {intLevel === 0 ? 'I₀ column' : 'I₁ column'}
              </strong>
            </div>
            <button className="btn-sm btn-accent"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={recordReading}>
              📌 Record Iᵣ
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
                <th style={{ color: '#63b3ed' }}>Vᵣ (V) — I₀</th>
                <th style={{ color: '#63b3ed' }}>Iᵣ (µA) — I₀</th>
                <th style={{ color: '#f6ad55' }}>Vᵣ (V) — I₁</th>
                <th style={{ color: '#f6ad55' }}>Iᵣ (µA) — I₁</th>
              </tr>
            </thead>
            <tbody>
              {VR_VALS.map((v, i) => (
                <tr key={v}>
                  <td>{i + 1}</td>
                  <td style={{ color: 'var(--text)', fontWeight: 600 }}>{v.toFixed(1)}</td>
                  <td>
                    <input type="number" step="0.01" placeholder="µA"
                           value={i0Vals[i]}
                           onChange={e => setI0Vals(prev => {
                             const n = [...prev]; n[i] = e.target.value; return n
                           })}/>
                  </td>
                  <td style={{ color: 'var(--text)', fontWeight: 600 }}>{v.toFixed(1)}</td>
                  <td>
                    <input type="number" step="0.01" placeholder="µA"
                           value={i1Vals[i]}
                           onChange={e => setI1Vals(prev => {
                             const n = [...prev]; n[i] = e.target.value; return n
                           })}/>
                  </td>
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
            {[
              { label: 'Slope ΔI/ΔV  (I₀)', val: results.slope0, unit: 'A/V' },
              { label: 'Output Resistance R_out  (I₀)', val: results.rout0, unit: 'Ω', teal: true },
              { label: 'Slope ΔI/ΔV  (I₁)', val: results.slope1, unit: 'A/V',
                style: { color: '#f6ad55' } },
              { label: 'Output Resistance R_out  (I₁)', val: results.rout1, unit: 'Ω',
                style: { color: 'var(--accent2)' } },
            ].map(({ label, val, unit, teal, style }) => (
              <div key={label} className="calc-item">
                <div className="calc-label">{label}</div>
                <div>
                  <span className={`calc-val${teal ? ' teal' : ''}`} style={style}>{val}</span>
                  <span className="calc-unit"> {unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graph */}
      <div className="graph-wrap" style={{ marginTop: 20 }}>
        <div className="graph-hdr">
          <h3>📈 Graph: Iᵣ vs Vᵣ for I₀ and I₁</h3>
          <button className="btn-sm btn-outline" onClick={calcAll}>▶ Draw Graph</button>
        </div>
        <canvas ref={graphRef} width={580} height={300}
                style={{ width: '100%', maxWidth: 580, display: 'block', margin: '0 auto' }}/>
        <div style={{ marginTop: 12, fontSize: '0.76rem', color: 'var(--text-muted)',
                      textAlign: 'center', lineHeight: 1.7 }}>
          Both curves are nearly flat (small slope) → very high R_out. &nbsp;
          <strong style={{ color: 'var(--accent2)' }}>
            R_out = 1 / slope = ΔV / ΔI
          </strong>. &nbsp;
          Vertical gap between curves = photocurrent ΔI_photo ∝ intensity.
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
    q: 'A photo-diode is operated in which bias condition for sensing light?',
    opts: ['Forward bias', 'Zero bias (open circuit)', 'Reverse bias', 'Alternating bias'],
    ans: 2,
    exp: 'Photo-diodes are operated in reverse bias for photodetection. This widens the depletion region, reduces capacitance, and gives fast response. Photocurrent adds to the small reverse leakage.',
  },
  {
    q: 'What happens to the reverse current when light intensity increases?',
    opts: ['Decreases', 'Stays constant', 'Increases proportionally', 'Becomes zero'],
    ans: 2,
    exp: 'Each photon with energy > bandgap creates one electron-hole pair. More photons = more pairs = more photocurrent. Iᵣ increases proportionally with light intensity.',
  },
  {
    q: 'The I-V curve of a photo-diode in reverse bias is approximately:',
    opts: ['Steeply rising', 'Flat (nearly horizontal) — current nearly independent of voltage', 'Exponentially increasing', 'Negative resistance region'],
    ans: 1,
    exp: 'In reverse bias, the photocurrent is nearly constant regardless of voltage — the device acts like a current source. This gives a flat, nearly horizontal I-V curve.',
  },
  {
    q: 'Output resistance R_out from the I-V curve is:',
    opts: ['R_out = ΔI/ΔV', 'R_out = ΔV/ΔI = 1/slope', 'R_out = Vᵣ/Iᵣ', 'R_out = ΔV × ΔI'],
    ans: 1,
    exp: 'R_out = ΔV/ΔI = 1/slope. Since the curve is nearly flat (very small slope), R_out is very large (MΩ range), confirming the photo-diode acts as a high-impedance current source.',
  },
  {
    q: 'At two intensities I₀ and I₁ (I₁ > I₀), the two I-V curves are:',
    opts: ['Identical', 'I₁ curve is higher (more current at same voltage)', 'I₁ curve is lower', 'They cross each other'],
    ans: 1,
    exp: 'Higher intensity I₁ generates more photocurrent, shifting the entire I-V curve upward. The vertical separation between curves is proportional to the intensity difference.',
  },
  {
    q: 'What does the slope ΔI/ΔV of the I-V curve represent?',
    opts: ['Output resistance', 'Dynamic conductance = 1/R_out', 'Power consumption', 'Current gain'],
    ans: 1,
    exp: 'ΔI/ΔV is the dynamic conductance at the operating point. Its reciprocal R_out = ΔV/ΔI. A very small slope → very large R_out → ideal current source behaviour.',
  },
]

const FLASHCARDS = [
  {
    q: 'What is output resistance of a photo-diode and how is it found?',
    a: 'R_out = 1/slope = ΔV/ΔI\nSlope = ΔI/ΔV from the reverse-bias I-V graph\nHigh R_out = good current source (flat curve, small slope)',
  },
  {
    q: 'Why does photocurrent increase linearly with light intensity?',
    a: 'Each photon creates one electron-hole pair at the junction\nMore photons = more carriers = more current\nI_photo ∝ intensity (linear relationship)',
  },
  {
    q: 'Difference between I₀ and I₁ curves in the photo-diode experiment:',
    a: 'I₀ = dark/low intensity → lower flat curve (only dark current)\nI₁ = bright/high intensity → higher flat curve\nVertical separation = ΔI_photo ∝ intensity difference',
  },
  {
    q: 'What is "dark current" in a photo-diode?',
    a: 'The tiny reverse leakage current flowing even in complete darkness\nCaused by thermally generated electron-hole pairs\nSets the minimum detectable signal (noise floor) of the detector',
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
        <p>I-V Characteristics of Photo-Diode</p>
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
              <div className="expl"><strong>Explanation:</strong> {q.exp}</div>
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
          <div className="score-lbl">{pct}% — {labels[Math.min(Math.floor(pct / 25), 4)]}</div>
          <button className="btn-sm btn-accent" onClick={() => {
            setQi(0); setAnswers(Array(QUESTIONS.length).fill(null)); setDone(false)
          }}>↺ Retake</button>
        </div>
      )}

      <div className="fc-section">
        <h3>⚡ Flashcards</h3>
        <div className={`flashcard ${flipped ? 'flipped' : ''}`}
             onClick={() => setFlipped(f => !f)}>
          <div className="fc-inner">
            <div className="fc-f">{card.q}</div>
            <div className="fc-b" style={{transform: 'rotateY(180deg)', WebkitTransform: 'rotateY(180deg)'}}>
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
export default function Exp07({ tab }) {
  if (tab === 'theory')     return <Theory />
  if (tab === 'simulation') return <Simulation />
  if (tab === 'test')       return <Test />
  return null
}