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
function drawHallSim(canvas, { B, Ip, tick }) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const cx = W / 2, cy = H / 2

  ctx.fillStyle = '#080c14'
  ctx.fillRect(0, 0, W, H)

  // 1. Draw Electromagnet Pole Pieces (Background)
  const poleW = 180
  const poleL = cx - poleW / 2
  
  // Top Pole (North)
  const topPoleGrad = ctx.createLinearGradient(poleL, 0, poleL + poleW, 0)
  topPoleGrad.addColorStop(0, '#1e293b')
  topPoleGrad.addColorStop(0.5, '#475569')
  topPoleGrad.addColorStop(1, '#1e293b')
  ctx.fillStyle = topPoleGrad
  ctx.fillRect(poleL, 10, poleW, 55)
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 1.5
  ctx.strokeRect(poleL, 10, poleW, 55)
  
  ctx.fillStyle = '#94a3b8'
  ctx.font = 'bold 9px Space Grotesk,sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('ELECTROMAGNET POLE (N)', cx, 28)

  // Bottom Pole (South)
  ctx.fillStyle = topPoleGrad
  ctx.fillRect(poleL, H - 65, poleW, 55)
  ctx.strokeRect(poleL, H - 65, poleW, 55)
  ctx.fillStyle = '#94a3b8'
  ctx.fillText('ELECTROMAGNET POLE (S)', cx, H - 47)

  // 2. Semiconductor slab (centered)
  const slabW = 400
  const slabL = cx - slabW / 2
  const slabR = cx + slabW / 2

  const slabGrad = ctx.createLinearGradient(slabL, cy - 45, slabL, cy + 45)
  slabGrad.addColorStop(0, 'rgba(30, 41, 59, 0.95)')
  slabGrad.addColorStop(1, 'rgba(15, 23, 42, 0.95)')
  ctx.fillStyle = slabGrad
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(slabL, cy - 45, slabW, 90, 8)
  ctx.fill(); ctx.stroke()

  // Slab label
  ctx.fillStyle = '#38bdf8'
  ctx.font = 'bold 10px Space Grotesk,sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('n-type Semiconductor Slab  (t = 0.014 cm)', cx, cy + 4)

  // 3. Voltmeter wires & probes
  // Top Probe contact (Negative)
  ctx.fillStyle = '#4ade80' // green contact
  ctx.beginPath(); ctx.arc(cx, cy - 45, 4, 0, 2 * Math.PI); ctx.fill()
  
  // Bottom Probe contact (Positive)
  ctx.fillStyle = '#fc5c5c' // red contact
  ctx.beginPath(); ctx.arc(cx, cy + 45, 4, 0, 2 * Math.PI); ctx.fill()

  // Wire paths to Voltmeter Box (placed on the top left)
  const vBoxX = 20, vBoxY = 15, vBoxW = 90, vBoxH = 45
  
  // Black wire (negative, top contact to voltmeter)
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx, cy - 45)
  ctx.bezierCurveTo(cx - 50, cy - 70, vBoxX + vBoxW - 10, vBoxY + vBoxH + 15, vBoxX + vBoxW - 20, vBoxY + vBoxH)
  ctx.stroke()

  // Red wire (positive, bottom contact to voltmeter)
  ctx.strokeStyle = '#ef4444'
  ctx.beginPath()
  ctx.moveTo(cx, cy + 45)
  ctx.bezierCurveTo(cx - 80, cy + 70, vBoxX + 20, vBoxY + vBoxH + 30, vBoxX + 20, vBoxY + vBoxH)
  ctx.stroke()

  // Voltmeter Box
  ctx.fillStyle = '#0f172a'
  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(vBoxX, vBoxY, vBoxW, vBoxH, 6)
  ctx.fill(); ctx.stroke()
  
  ctx.fillStyle = '#64748b'
  ctx.font = '7px DM Mono,monospace'
  ctx.textAlign = 'center'
  ctx.fillText('HALL VOLTAGE (mV)', vBoxX + vBoxW/2, vBoxY + 12)

  // Calculate VH value
  const VH = (HALL_RH_SIM * B * Ip) / (HALL_T * 1e8)
  const vhMillivolts = VH * 1000

  // Voltmeter digital display reading
  ctx.fillStyle = '#ef4444'
  ctx.font = 'bold 13px Courier New,monospace'
  ctx.fillText(vhMillivolts.toFixed(3), vBoxX + vBoxW/2, vBoxY + 31)

  // Current flow indication
  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 2
  for (let i = 0; i < 2; i++) {
    const y = cy - 20 + i * 40
    // Left lead (entering current)
    ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(slabL - 2, y); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(slabL - 8, y - 4); ctx.lineTo(slabL - 2, y); ctx.lineTo(slabL - 8, y + 4); ctx.stroke()
    // Right lead (exiting current)
    ctx.beginPath(); ctx.moveTo(slabR + 2, y); ctx.lineTo(W - 10, y); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(W - 16, y - 4); ctx.lineTo(W - 10, y); ctx.lineTo(W - 16, y + 4); ctx.stroke()
  }

  // Current labels
  ctx.fillStyle = '#f59e0b'
  ctx.font = '8px DM Mono,monospace'
  ctx.fillText(`Ip = ${Ip.toFixed(1)} mA`, slabL - 45, cy - 30)

  // Magnetic field (⊗ = into page)
  ctx.fillStyle = 'rgba(79, 209, 197, 0.4)'
  ctx.font = '12px sans-serif'
  for (let x = slabL + 25; x < slabR - 10; x += 50) {
    for (let y = cy - 25; y < cy + 30; y += 25) {
      ctx.fillText('\u2297', x, y)
    }
  }

  // 4. Particle Animation (Drifting Electrons)
  const numParticles = 20
  const speed = 0.5 + Ip * 0.6 // speed increases with current
  const deflection = (B / 5000) * 28 // max upward deflection of 28px

  ctx.fillStyle = '#60a5fa' // blue electron color
  for (let i = 0; i < numParticles; i++) {
    // Unique vertical lane (deterministic)
    const yStart = cy - 20 + (i * 9) % 40
    
    // Horizontal progress
    const progress = (((tick * speed) + i * (slabW / numParticles)) % slabW) / slabW
    
    // Electrons flow right-to-left
    const px = slabR - progress * slabW
    
    // Upward deflection curves parabolically
    const py = yStart - deflection * Math.pow(progress, 1.5)
    
    // Draw electron circle
    ctx.beginPath(); ctx.arc(px, py, 4.5, 0, 2 * Math.PI); ctx.fill()
    
    // Minus symbol inside
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 8px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('−', px, py + 2.5)
    ctx.fillStyle = '#60a5fa'
  }

  // 5. Charge Accumulation on boundaries
  const maxSigns = 8
  const signOpacity = Math.min(1.0, B / 3000)
  if (signOpacity > 0.05) {
    ctx.font = 'bold 10px sans-serif'
    ctx.textAlign = 'center'
    for (let i = 0; i < maxSigns; i++) {
      const sx = slabL + 30 + i * ((slabW - 60) / (maxSigns - 1))
      
      // Top face accumulates negative charge (-)
      ctx.fillStyle = `rgba(244, 63, 94, ${signOpacity})`
      ctx.fillText('−', sx, cy - 35)
      
      // Bottom face is left with positive charge (+)
      ctx.fillStyle = `rgba(74, 222, 128, ${signOpacity})`
      ctx.fillText('+', sx, cy + 40)
    }
  }

  // Hall field arrow indicator (bottom to top, positive to negative)
  if (B > 100) {
    ctx.strokeStyle = `rgba(96, 165, 250, ${signOpacity * 0.8})`
    ctx.lineWidth = 1.5
    
    ctx.beginPath()
    ctx.moveTo(cx + 80, cy + 25)
    ctx.lineTo(cx + 80, cy - 25)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(cx + 76, cy - 18)
    ctx.lineTo(cx + 80, cy - 25)
    ctx.lineTo(cx + 84, cy - 18)
    ctx.stroke()

    ctx.fillStyle = `rgba(96, 165, 250, ${signOpacity})`
    ctx.font = '8px Space Grotesk,sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('E(H) Hall Field', cx + 88, cy + 3)
  }

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
              To understand the <strong>Hall Effect</strong> and determine the Hall coefficient
              R(H) of a given semiconductor material.
            </p>
          </div>

          <div className="aim-card">
            <div className="aim-card-header">
              <div className="formulae-icon-wrapper">&lt;/&gt;</div>
              <h3 className="aim-card-title">Formulae</h3>
            </div>
            <div className="formula-block">
              <span className="formula-text">R(H) = (t × V(H) × 10⁻⁸) / (B × I(p))</span>
              <span className="formula-subtext">R(H) = HALL COEFFICIENT (CM³/C)</span>
              <div className="formula-detail">
                <b>t</b> = thickness of semiconductor = 0.014 cm &nbsp;|&nbsp;
                <b>V(H)</b> = Hall voltage (volts) &nbsp;|&nbsp;
                <b>B</b> = magnetic field (Gauss) &nbsp;|&nbsp;
                <b>I(p)</b> = probe current (mA)
              </div>
            </div>
            <div className="formula-block">
              <span className="formula-text">n = 1 / (R(H) × e)</span>
              <span className="formula-subtext">(CHARGE CARRIER DENSITY)</span>
              <div className="formula-detail">
                <b>e</b> = 1.6 × 10⁻¹⁹ C (electron charge)
              </div>
            </div>
            <div className="formula-block">
              <span className="formula-text">V(H) = R(H) · B · I(p) / (t × 10⁸)</span>
              <span className="formula-subtext">(TRANSVERSE HALL VOLTAGE)</span>
              <div className="formula-detail">
                R(H) = slope × t × 10⁸ / B &nbsp;|&nbsp; slope = V(H) vs I(p) slope
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
              When a current-carrying semiconductor is placed in a magnetic field perpendicular
              to the current direction, the charge carriers experience a
              <strong> Lorentz force</strong> (F = qv × B) that deflects them sideways —
              perpendicular to both the current and the magnetic field.
            </p>
            <p style={{ marginBottom: '12px' }}>
              This sideways deflection causes charge accumulation on one face of the
              semiconductor, creating a transverse electric field — the
              <strong> Hall voltage V(H)</strong>. At equilibrium, the Hall electric force
              balances the magnetic force: qE<sub>H</sub> = qv<sub>d</sub>B.
            </p>
            <p style={{ marginBottom: '12px' }}>
              The <strong>Hall coefficient</strong> R(H) = 1/ne characterises the material:
              its sign reveals the carrier type, and its magnitude gives the carrier density.
            </p>
            <p style={{ marginBottom: '12px' }}>
              <strong>n-type semiconductor:</strong> electrons are majority carriers →
              R(H) is <em style={{ color: 'var(--danger)' }}>negative</em>.
            </p>
            <p>
              <strong>p-type semiconductor:</strong> holes are majority carriers →
              R(H) is <em style={{ color: 'var(--success)' }}>positive</em>.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT — Setup Frame + Given Constants + Start Simulation Button */}
      <div>
        <div className="setup-header-label">Hall Effect Setup</div>
        <div className="laptop-frame">
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

        <div className="constants-card">
          <div className="setup-header-label" style={{ textAlign: 'left', marginBottom: '8px' }}>Given Constants</div>
          <div className="constants-list">
            <div className="constant-row">
              <span className="constant-symbol">t</span>
              <span className="constant-value">0.014 cm</span>
            </div>
            <div className="constant-row">
              <span className="constant-symbol">e</span>
              <span className="constant-value">1.6 × 10⁻¹⁹ C</span>
            </div>
            <div className="constant-row">
              <span className="constant-symbol">B</span>
              <span className="constant-value">set by kit current</span>
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
  const graphRef  = useRef(null)

  // Simulation params
  const [B,  setB]  = useState(2500)   // Gauss
  const [Ip, setIp] = useState(1.0)    // mA

  // Displayed V(H) from simulation (computed during render)
  const VH = (HALL_RH_SIM * B * Ip) / (HALL_T * 1e8)

  // Observation table: 6 rows
  const [ipVals, setIpVals] = useState(() => {
    try {
      const saved = localStorage.getItem('kinetix_exp05_sim_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.ipVals) return parsed.ipVals
      }
    } catch (e) {
      console.error(e)
    }
    return Array(6).fill('')
  })
  const [vhVals, setVhVals] = useState(() => {
    try {
      const saved = localStorage.getItem('kinetix_exp05_sim_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.vhVals) return parsed.vhVals
      }
    } catch (e) {
      console.error(e)
    }
    return Array(6).fill('')
  })

  // Results
  const [results, setResults] = useState(() => {
    try {
      const saved = localStorage.getItem('kinetix_exp05_sim_data')
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
    localStorage.setItem('kinetix_exp05_sim_data', JSON.stringify({
      ipVals, vhVals, results
    }))
  }, [ipVals, vhVals, results])

  // Record target row
  const [recRow, setRecRow] = useState(0)

  // Redraw on param change & start animation loop
  const animRef = useRef({ B, Ip, tick: 0 })

  useEffect(() => {
    animRef.current.B = B
    animRef.current.Ip = Ip
  }, [B, Ip])

  useEffect(() => {
    let animId
    const loop = () => {
      animRef.current.tick += 1
      if (canvasRef.current) {
        drawHallSim(canvasRef.current, {
          B: animRef.current.B,
          Ip: animRef.current.Ip,
          tick: animRef.current.tick
        })
      }
      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [])

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
    setIpVals(prev => { const n = [...prev]; n[recRow] = Ip.toFixed(1); return n })
    setVhVals(prev => { const n = [...prev]; n[recRow] = VH.toFixed(4); return n })
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
      {/* How to use Banner */}
      <div className="sim-howto-banner">
        <div className="sim-howto-header">
          <span>⚡ HOW TO USE</span>
        </div>
        <div className="sim-howto-grid">
          {[
            'Set magnetic field B (Gauss) on the apparatus — this remains fixed for the run.',
            'Vary probe current I(p) using the slider — the simulation shows the Hall voltage V(H) in real time.',
            'Select a row, click 📌 Record — the current I(p) and simulated V(H) are auto-filled.',
            'Click ⚡ Calculate All to compute R(H) and carrier density n for each row, then draw the V(H) vs I(p) graph.',
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
            Hall Effect Simulation Apparatus
          </div>
          <div id="hallStage" className="sim-screen-container">
            <canvas ref={canvasRef} width={640} height={300}
                    style={{ borderRadius: 8, maxWidth: '100%', display: 'block', margin: '0 auto' }}/>
          </div>
          <div className="sim-readout-bar">
            <div>
              <span className="sim-readout-hint">MAGNETIC FIELD</span> &nbsp;
              <span className="sim-readout-value">{B} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>G</span></span>
            </div>
            <div>
              <span className="sim-readout-hint">PROBE I(P)</span> &nbsp;
              <span className="sim-readout-value" style={{ color: '#2563eb' }}>{Ip.toFixed(1)} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>mA</span></span>
            </div>
            <div>
              <span className="sim-readout-hint">HALL V(H)</span> &nbsp;
              <span className="sim-readout-value" style={{ color: '#ef4444' }}>{(VH * 1000).toFixed(3)} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>mV</span></span>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Cards */}
        <div>
          <div className="sim-sidebar-card">
            <div className="sim-sidebar-title">⚙️ PARAMETERS</div>
            <div className="sim-param-row">
              <div className="sim-param-label"><span>Magnetic Field B (G)</span><span className="sim-param-val">{B} G</span></div>
              <input type="range" min={500} max={6000} step={100} value={B} onChange={e => setB(+e.target.value)} />
            </div>
            <div className="sim-param-row">
              <div className="sim-param-label"><span>Probe Current I(p)</span><span className="sim-param-val">{Ip.toFixed(1)} mA</span></div>
              <input type="range" min={0.5} max={6.0} step={0.5} value={Ip} onChange={e => setIp(parseFloat(e.target.value))} />
            </div>
          </div>

          <div className="sim-info-box">
            <div className="sim-info-title">Apparatus Observations</div>
            <div className="sim-info-desc">
              Hall voltage is proportional to probe current: <code>V(H) ∝ I(p)</code> and magnetic field: <code>V(H) ∝ B</code>.
            </div>
          </div>

          <div className="sim-sidebar-card">
            <div className="sim-sidebar-title">
              <span>📌 RECORD READING</span>
              <span style={{ color: '#94a3b8' }}>↑</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CURRENT READINGS</div>
            <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, margin: '8px 0 14px' }}>
              Ip: {Ip.toFixed(1)} mA | Vh: {(VH * 1000).toFixed(3)} mV
            </div>
            <div className="sim-record-selects">
              <select className="sim-select" style={{ gridColumn: 'span 2' }} value={recRow} onChange={e => setRecRow(+e.target.value)}>
                {Array.from({ length: 6 }, (_, i) => (
                  <option key={i} value={i}>Row {i + 1}</option>
                ))}
              </select>
            </div>
            <button className="btn-record" onClick={recordReading}>
              <span style={{ color: '#ef4444' }}>📌</span> Record Current &amp; V(H)
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
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>Magnetic Field B = {B} Gauss</span>
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
                <th>PROBE CURRENT I(P) (MA)</th>
                <th>HALL VOLTAGE V(H) (VOLTS)</th>
                <th>HALL COEFFICIENT R(H) (CM³/C)</th>
                <th>CARRIER DENSITY N (/CM³)</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }, (_, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <input type="number" step="0.5" placeholder="mA" className="sim-table-input"
                           value={ipVals[i]} onChange={e => setIpVals(prev => { const n = [...prev]; n[i] = e.target.value; return n })}/>
                  </td>
                  <td>
                    <input type="number" step="0.0001" placeholder="volts" className="sim-table-input"
                           value={vhVals[i]} onChange={e => setVhVals(prev => { const n = [...prev]; n[i] = e.target.value; return n })}/>
                  </td>
                  <td style={{ fontFamily: 'DM Mono, monospace', color: '#64748b' }}>{computedRows[i].rh}</td>
                  <td style={{ fontFamily: 'DM Mono, monospace', color: '#64748b' }}>{computedRows[i].n}</td>
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
            Graph: V(H) vs I(p) at constant B
          </div>
          <div className="sim-btn-group">
            <button className="btn-primary-action" style={{ background: '#0f172a' }} onClick={calcAll}>▶ Draw Graph</button>
          </div>
        </div>

        <div className="sim-graph-canvas-box">
          <canvas ref={graphRef} width={580} height={300} style={{ width: '100%', maxWidth: 580, display: 'block' }}/>
        </div>

        <div className="sim-results-grid">
          <div className="sim-graph-legend">
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>📊 Graph Confirms</div>
            <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.8 }}>
              • Relation: <code>V(H) ∝ I(p)</code> produces linear graph through origin.<br/>
              • Hall Coefficient: <code>R(H) = slope × t × 10⁸ / B</code><br/>
              • Carrier thickness <code>t</code>: <code>{HALL_T} cm</code>
            </div>
          </div>

          <div className="sim-calc-box">
            <div className="sim-calc-title">Calculated Properties</div>
            {results && (
              <>
                <div className="sim-calc-formula">R(H) = <strong>{results.rh} cm³/C</strong></div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2563eb', fontFamily: 'DM Mono, monospace', marginTop: 6 }}>
                  n = {results.n} /cm³
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
// ═══════════════════════════════════════════════════════════════
//  TEST PANEL
// ═══════════════════════════════════════════════════════════════
function Test({ setTab }) {
  const [qi,      setQi]      = useState(0)
  const [answers, setAnswers] = useState(() => {
    try {
      const quizSaved = localStorage.getItem('kinetix_exp05_quiz_data')
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
      const quizSaved = localStorage.getItem('kinetix_exp05_quiz_data')
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
      const simSaved = localStorage.getItem('kinetix_exp05_sim_data')
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
    localStorage.setItem('kinetix_exp05_quiz_data', JSON.stringify({
      done: true,
      answers,
    }))
  }

  const handleRetake = () => {
    setQi(0)
    setAnswers(Array(QUESTIONS.length).fill(null))
    setDone(false)
    localStorage.removeItem('kinetix_exp05_quiz_data')
  }

  const recordedCount = simData ? (
    (simData.ipVals?.filter(v => v !== '').length || 0) +
    (simData.vhVals?.filter(v => v !== '').length || 0)
  ) : 0

  return (
    <div>
      <div className="test-hd">
        <h2>Test Your Knowledge</h2>
        <p>Hall Coefficient &amp; Hall Effect</p>
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
                    <span className="cert-title">Hall Effect Certified</span>
                    <span className="cert-subtitle">Hall coefficient & carrier density determined</span>
                  </div>
                </div>
                <div className="dash-results-grid">
                  <div className="dash-result-item">
                    <div className="dash-result-label">Hall Coeff (R_H)</div>
                    <div className="dash-result-value" style={{ fontSize: '0.8rem', paddingTop: '4px' }}>
                      {simData.results?.rh}
                    </div>
                  </div>
                  <div className="dash-result-item">
                    <div className="dash-result-label">Carrier Density (n)</div>
                    <div className="dash-result-value" style={{ fontSize: '0.8rem', paddingTop: '4px' }}>
                      {simData.results?.n}
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
                  Test your understanding of the Hall effect principles, transverse electric fields, and charge carrier calculations.
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
export default function Exp05({ tab, setTab }) {
  if (tab === 'theory')     return <Theory setTab={setTab} />
  if (tab === 'simulation') return <Simulation />
  if (tab === 'test')       return <Test setTab={setTab} />
  return null
}