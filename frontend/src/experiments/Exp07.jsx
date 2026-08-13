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
              To study the <strong>reverse bias I-V characteristics</strong> of a photo-diode
              at two different light intensities (I₀ and I₁) and determine the output resistance.
            </p>
          </div>

          <div className="aim-card">
            <div className="aim-card-header">
              <div className="formulae-icon-wrapper">&lt;/&gt;</div>
              <h3 className="aim-card-title">Formulae</h3>
            </div>
            <div className="formula-block">
              <span className="formula-text">Slope = ΔI / ΔV &nbsp;&nbsp; (µA/V)</span>
              <span className="formula-subtext">REVERSE CHARACTERISTIC SLOPE</span>
              <div className="formula-detail">
                <b>ΔI</b> = change in reverse current (µA) &nbsp;|&nbsp;
                <b>ΔV</b> = change in reverse voltage (V)
              </div>
            </div>
            <div className="formula-block">
              <span className="formula-text">R_out = 1 / Slope = ΔV / ΔI &nbsp;&nbsp; (Ω)</span>
              <span className="formula-subtext">(DYNAMIC OUTPUT RESISTANCE IN MΩ)</span>
              <div className="formula-detail">
                High R_out indicates near-ideal current source behavior
              </div>
            </div>
            <div className="formula-block">
              <span className="formula-text">I_r = I_dark + I_photo × intensity</span>
              <span className="formula-subtext">(TOTAL REVERSE PHOTOCURRENT)</span>
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
              A <strong>photo-diode</strong> is a semiconductor device that converts light into
              electrical current. When operated in <strong>reverse bias</strong>, the depletion
              region widens, reducing capacitance and enabling fast response.
            </p>
            <p style={{ marginBottom: '12px' }}>
              In the dark, a tiny <strong>dark current</strong> flows due to thermally generated
              electron-hole pairs. When photons with energy greater than the bandgap strike the
              junction, they create additional electron-hole pairs, generating a
              <strong> photocurrent</strong> that adds to the dark current.
            </p>
            <p style={{ marginBottom: '8px' }}>Key features of the reverse-bias I-V curve:</p>
            <ul style={{ marginLeft: 20, fontSize: '0.9rem', color: '#475569', lineHeight: 1.8 }}>
              <li>Current is <strong>nearly constant</strong> regardless of voltage (flat curve)</li>
              <li>Higher light intensity → curve shifts <strong>upward</strong> (more current)</li>
              <li>Steep slope = low R_out; flat slope = high R_out (ideal current source)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* RIGHT — Setup Frame + Given Constants + Start Simulation Button */}
      <div>
        <div className="setup-header-label">Photo-Diode Setup</div>
        <div className="laptop-frame">
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

        <div className="constants-card">
          <div className="setup-header-label" style={{ textAlign: 'left', marginBottom: '8px' }}>Key Parameters</div>
          <div className="constants-list">
            <div className="constant-row">
              <span className="constant-symbol">Vr range</span>
              <span className="constant-value">0 – 5 V</span>
            </div>
            <div className="constant-row">
              <span className="constant-symbol">Ir range</span>
              <span className="constant-value">µA range</span>
            </div>
            <div className="constant-row">
              <span className="constant-symbol">R_out</span>
              <span className="constant-value">MΩ range</span>
            </div>
            <div className="constant-row">
              <span className="constant-symbol">Curve</span>
              <span className="constant-value">Nearly flat</span>
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
  const simRef   = useRef(null)
  const graphRef = useRef(null)

  // Sim state
  const [Vr,       setVr]       = useState(0)
  const [intLevel, setIntLevel] = useState(0)   // 0 = I₀, 1 = I₁
  const [intMult,  setIntMult]  = useState(3)

  // Observation table: 9 rows × 2 intensity columns
  const [i0Vals, setI0Vals] = useState(() => {
    try {
      const saved = localStorage.getItem('kinetix_exp07_sim_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.i0Vals) return parsed.i0Vals
      }
    } catch (e) {
      console.error(e)
    }
    return Array(9).fill('')
  })
  const [i1Vals, setI1Vals] = useState(() => {
    try {
      const saved = localStorage.getItem('kinetix_exp07_sim_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.i1Vals) return parsed.i1Vals
      }
    } catch (e) {
      console.error(e)
    }
    return Array(9).fill('')
  })

  // Results
  const [results,  setResults]  = useState(() => {
    try {
      const saved = localStorage.getItem('kinetix_exp07_sim_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.results) return parsed.results
      }
    } catch (e) {
      console.error(e)
    }
    return null
  })
  const [recRow,   setRecRow]   = useState(0)


  // Auto-save simulation data on change
  useEffect(() => {
    localStorage.setItem('kinetix_exp07_sim_data', JSON.stringify({
      i0Vals, i1Vals, results
    }))
  }, [i0Vals, i1Vals, results])

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
      {/* How to use Banner */}
      <div className="sim-howto-banner">
        <div className="sim-howto-header">
          <span>⚡ HOW TO USE</span>
        </div>
        <div className="sim-howto-grid">
          {[
            'Select intensity I₀ (dark) or I₁ (bright) using the buttons — the simulation shows that curve.',
            'Move the Vᵣ slider — the operating point (dot) tracks along the selected curve.',
            'Select a row, click 📌 Record — the current Iᵣ is auto-filled for the active intensity.',
            'Fill both I₀ and I₁ columns, click ⚡ Calculate — slopes, output resistance and graph are shown.',
          ].map((s, i) => (
            <div key={i} className="sim-howto-step">
              <span className="sim-howto-num">{String(i + 1).padStart(2, '0')}</span>
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
            I-V Characteristics Simulation
          </div>
          <div id="ivStage" className="sim-screen-container">
            <canvas ref={simRef} width={640} height={360}
                    style={{ borderRadius: 8, maxWidth: '100%', display: 'block', margin: '0 auto' }}/>
          </div>
          <div className="sim-readout-bar">
            <div>
              <span className="sim-readout-hint">REVERSE VOLTAGE</span> &nbsp;
              <span className="sim-readout-value">{Vr.toFixed(1)} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>V</span></span>
            </div>
            <div>
              <span className="sim-readout-hint">REVERSE CURRENT</span> &nbsp;
              <span className="sim-readout-value" style={{ color: intLevel === 0 ? '#63b3ed' : '#ef4444' }}>{curIr.toFixed(2)} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>µA</span></span>
            </div>
            <div>
              <span className="sim-readout-hint">INTENSITY</span> &nbsp;
              <span className="sim-readout-value" style={{ color: intLevel === 0 ? '#63b3ed' : '#d97706' }}>{intLevel === 0 ? 'I₀ (low)' : 'I₁ (high)'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Cards */}
        <div>
          <div className="sim-sidebar-card">
            <div className="sim-sidebar-title">⚙️ PARAMETERS</div>
            {/* Intensity buttons */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 8, fontWeight: 500 }}>Light Intensity</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { level: 0, label: 'I₀ — Dark/Low', color: '#2563eb', border: '#bfdbfe' },
                  { level: 1, label: 'I₁ — Bright',   color: '#d97706', border: '#fef3c7' },
                ].map(({ level, label, color, border }) => (
                  <button key={level}
                    style={{
                      flex: 1, padding: '8px 6px', borderRadius: 8, cursor: 'pointer',
                      fontFamily: "'DM Sans',sans-serif", fontSize: '0.78rem', fontWeight: 600,
                      transition: 'all 0.2s',
                      background: intLevel === level ? (level === 0 ? '#eff6ff' : '#fffbeb') : 'transparent',
                      border: `1px solid ${intLevel === level ? border : '#cbd5e1'}`,
                      color: intLevel === level ? color : '#64748b',
                    }}
                    onClick={() => setIntLevel(level)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="sim-param-row">
              <div className="sim-param-label"><span>Reverse Voltage Vᵣ</span><span className="sim-param-val">{Vr.toFixed(1)} V</span></div>
              <input type="range" min={0} max={4.5} step={0.1} value={Vr} onChange={e => setVr(parseFloat(e.target.value))} />
            </div>
            <div className="sim-param-row">
              <div className="sim-param-label"><span>Intensity Mult (I₁)</span><span className="sim-param-val">{intMult.toFixed(1)}×</span></div>
              <input type="range" min={1} max={6} step={0.5} value={intMult} onChange={e => setIntMult(parseFloat(e.target.value))} />
            </div>
          </div>

          <div className="sim-info-box">
            <div className="sim-info-title">Why the curve is flat</div>
            <div className="sim-info-desc">
              Photocurrent is nearly voltage-independent in reverse bias. The tiny slope indicates high <code>R_out</code>.
            </div>
          </div>

          <div className="sim-sidebar-card">
            <div className="sim-sidebar-title">
              <span>📌 RECORD READING</span>
              <span style={{ color: '#94a3b8' }}>↑</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ACTIVE RECORDING</div>
            <div className="sim-record-display">{curIr.toFixed(2)} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>µA</span></div>
            <div className="sim-record-selects">
              <select className="sim-select" style={{ gridColumn: 'span 2' }} value={recRow} onChange={e => setRecRow(+e.target.value)}>
                {VR_VALS.map((v, i) => (
                  <option key={v} value={i}>Row {i + 1} — Vᵣ = {v.toFixed(1)} V</option>
                ))}
              </select>
            </div>
            <button className="btn-record" onClick={recordReading}>
              <span style={{ color: '#ef4444' }}>📌</span> Record {intLevel === 0 ? 'I₀' : 'I₁'} Reading
            </button>
          </div>
        </div>
      </div>

      {/* Observation Table Card */}
      <div className="sim-table-card">
        <div className="sim-card-header-bar">
          <div className="sim-card-title">
            <span style={{ display: 'inline-flex', fontStyle: 'normal', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', fontSize: '0.85rem' }}>📄</span>
            Observation Table
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
                <th>Vᵣ (V) — I₀</th>
                <th>Iᵣ (µA) — I₀</th>
                <th>Vᵣ (V) — I₁</th>
                <th>Iᵣ (µA) — I₁</th>
              </tr>
            </thead>
            <tbody>
              {VR_VALS.map((v, i) => (
                <tr key={v}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: 700, color: '#2563eb' }}>{v.toFixed(1)}</td>
                  <td>
                    <input type="number" step="0.01" placeholder="µA" className="sim-table-input"
                           value={i0Vals[i]} onChange={e => setI0Vals(prev => { const n = [...prev]; n[i] = e.target.value; return n })}/>
                  </td>
                  <td style={{ fontWeight: 700, color: '#d97706' }}>{v.toFixed(1)}</td>
                  <td>
                    <input type="number" step="0.01" placeholder="µA" className="sim-table-input"
                           value={i1Vals[i]} onChange={e => setI1Vals(prev => { const n = [...prev]; n[i] = e.target.value; return n })}/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Graph Card */}
      <div className="sim-graph-card">
        <div className="sim-card-header-bar">
          <div className="sim-card-title">
            <span style={{ display: 'inline-flex', fontStyle: 'normal', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', fontSize: '0.85rem' }}>📈</span>
            Graph: Iᵣ vs Vᵣ for I₀ and I₁
          </div>
          <div className="sim-btn-group">
            <button className="btn-primary-action" style={{ background: '#0f172a' }} onClick={calcAll}>▶ Draw Graph</button>
          </div>
        </div>

        <div className="sim-graph-canvas-box">
          <canvas ref={graphRef} width={640} height={320} style={{ width: '100%', maxWidth: 640, display: 'block' }}/>
        </div>

        <div className="sim-results-grid">
          <div className="sim-graph-legend">
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>📊 Graph Interpretation</div>
            <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.8 }}>
              • Curve slope represents reverse dynamic conductance.<br/>
              • Output resistance: <code>R_out = 1 / slope</code>.<br/>
              • Vertical gap = photocurrent <code>I_photo</code> generated by light.
            </div>
          </div>

          <div className="sim-calc-box">
            <div className="sim-calc-title">Calculated R_out</div>
            {results && (
              <>
                <div className="sim-calc-formula" style={{ fontSize: '1rem', marginBottom: 4 }}>
                  Dark I₀: <strong>{results.rout0} Ω</strong>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#d97706', fontFamily: 'DM Mono, monospace' }}>
                  Bright I₁: {results.rout1} Ω
                </div>
              </>
            )}
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
// ═══════════════════════════════════════════════════════════════
//  TEST PANEL
// ═══════════════════════════════════════════════════════════════
function Test({ setTab }) {
  const [qi,      setQi]      = useState(0)
  const [answers, setAnswers] = useState(() => {
    try {
      const quizSaved = localStorage.getItem('kinetix_exp07_quiz_data')
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
      const quizSaved = localStorage.getItem('kinetix_exp07_quiz_data')
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
      const simSaved = localStorage.getItem('kinetix_exp07_sim_data')
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
    localStorage.setItem('kinetix_exp07_quiz_data', JSON.stringify({
      done: true,
      answers,
    }))
  }

  const handleRetake = () => {
    setQi(0)
    setAnswers(Array(QUESTIONS.length).fill(null))
    setDone(false)
    localStorage.removeItem('kinetix_exp07_quiz_data')
  }

  const recordedCount = simData ? (
    (simData.i0Vals?.filter(v => v !== '').length || 0) +
    (simData.i1Vals?.filter(v => v !== '').length || 0)
  ) : 0

  return (
    <div>
      <div className="test-hd">
        <h2>Test Your Knowledge</h2>
        <p>I-V Characteristics of Photo-Diode</p>
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
                    <span className="cert-title">Photo-Diode Certified</span>
                    <span className="cert-subtitle">Photocurrent & Output Resistance determined</span>
                  </div>
                </div>
                <div className="dash-results-grid">
                  <div className="dash-result-item">
                    <div className="dash-result-label">R_out (Low Int)</div>
                    <div className="dash-result-value" style={{ fontSize: '0.85rem', paddingTop: '4px' }}>
                      {parseFloat(simData.results?.rOut0).toFixed(2)} MΩ
                    </div>
                  </div>
                  <div className="dash-result-item">
                    <div className="dash-result-label">R_out (High Int)</div>
                    <div className="dash-result-value" style={{ fontSize: '0.85rem', paddingTop: '4px' }}>
                      {parseFloat(simData.results?.rOut1).toFixed(2)} MΩ
                    </div>
                  </div>
                  <div className="dash-result-item">
                    <div className="dash-result-label">Readings</div>
                    <div className="dash-result-value">{recordedCount}/18</div>
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
                  Test your understanding of reverse bias photocurrent, junction light absorption, and dynamic resistance calculations.
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
              <div className="fc-b" style={{transform: 'rotateY(180deg)', WebkitTransform: 'rotateY(180deg)'}}>
                {card.a.split('\n').map((line, i) => (
                  <React.Fragment key={i}>{line}<br /></React.Fragment>
                ))}
              </div>
            </div>
          </div>
          <div className="fc-hint">👆 Click to flip</div>
          <div className="fc-nav">
            <button className="btn-sm btn-dim" onClick={() => { setCardIdx(i => (i - 1 + FLASHCARDS.length) % FLASHCARDS.length); setFlipped(false) }}>← Prev</button>
            <span className="fc-ctr">{cardIdx + 1} / {FLASHCARDS.length}</span>
            <button className="btn-sm btn-dim" onClick={() => { setCardIdx(i => (i + 1) % FLASHCARDS.length); setFlipped(false) }}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
export default function Exp07({ tab, setTab }) {
  if (tab === 'theory')     return <Theory setTab={setTab} />
  if (tab === 'simulation') return <Simulation />
  if (tab === 'test')       return <Test setTab={setTab} />
  return null
}