// ─────────────────────────────────────────────────────────────
//  Exp06.jsx  —  Study of Ultrasonic Distance Meter
// ─────────────────────────────────────────────────────────────
import React, { useRef, useEffect, useState, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════
const V_STANDARD = 330   // m/s  (standard velocity of sound in air)

// ═══════════════════════════════════════════════════════════════
//  DRAW FUNCTION  (pure — takes canvas + state)
// ═══════════════════════════════════════════════════════════════
function drawUltraCanvas(canvas, { D, V, pulseX, state, dispD, dispT }) {
  const ctx  = canvas.getContext('2d')
  const W    = canvas.width, H = canvas.height
  const meterX  = 60
  const wallFrac = 0.15 + (D / 3.0) * 0.7
  const wallX   = meterX + wallFrac * (W - meterX - 40)

  ctx.fillStyle = '#080c14'
  ctx.fillRect(0, 0, W, H)

  // Ground line
  ctx.strokeStyle = 'rgba(99,179,237,0.15)'; ctx.lineWidth = 0.8
  ctx.beginPath(); ctx.moveTo(0, H - 20); ctx.lineTo(W, H - 20); ctx.stroke()

  // Meter device
  ctx.fillStyle = 'rgba(99,179,237,0.12)'; ctx.strokeStyle = '#63b3ed'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.roundRect(meterX - 30, H / 2 - 30, 50, 60, 5); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#63b3ed'; ctx.font = '7px DM Sans,monospace'; ctx.textAlign = 'center'
  ctx.fillText('Meter', meterX - 5, H / 2 + 5)

  // Speaker nub on right side of meter
  ctx.fillStyle = '#63b3ed'
  ctx.beginPath(); ctx.arc(meterX + 22, H / 2, 6, 0, 2 * Math.PI); ctx.fill()

  // Wall
  ctx.fillStyle = 'rgba(79,209,197,0.15)'; ctx.strokeStyle = '#4fd1c5'; ctx.lineWidth = 1.5
  ctx.fillRect(wallX, H / 2 - 50, 12, 100)
  ctx.strokeRect(wallX, H / 2 - 50, 12, 100)
  ctx.fillStyle = '#4fd1c5'; ctx.textAlign = 'center'
  ctx.fillText('Wall', wallX + 6, H / 2 + 62)

  // Distance annotation
  ctx.strokeStyle = 'rgba(79,209,197,0.4)'; ctx.lineWidth = 0.8
  ctx.beginPath(); ctx.moveTo(meterX + 22, H / 2 + 35); ctx.lineTo(wallX, H / 2 + 35); ctx.stroke()
  ctx.fillStyle = 'rgba(79,209,197,0.7)'; ctx.font = '8px DM Mono,monospace'; ctx.textAlign = 'center'
  ctx.fillText(
    `D = ${D.toFixed(2)} m`,
    meterX + 22 + (wallX - meterX - 22) / 2,
    H / 2 + 48
  )

  // Ultrasonic pulse ball
  if (pulseX !== null && pulseX > 0) {
    const grad = ctx.createRadialGradient(pulseX, H / 2, 0, pulseX, H / 2, 16)
    grad.addColorStop(0, 'rgba(246,173,85,0.95)')
    grad.addColorStop(1, 'rgba(246,173,85,0)')
    ctx.beginPath(); ctx.arc(pulseX, H / 2, 16, 0, 2 * Math.PI)
    ctx.fillStyle = grad; ctx.fill()

    ctx.beginPath(); ctx.arc(pulseX, H / 2, 8, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(246,173,85,0.9)'; ctx.fill()

    // Ripple ring
    ctx.beginPath(); ctx.arc(pulseX, H / 2, 18, 0, 2 * Math.PI)
    ctx.strokeStyle = 'rgba(246,173,85,0.3)'; ctx.lineWidth = 2; ctx.stroke()

    ctx.fillStyle = '#f6ad55'; ctx.font = '7px DM Mono,monospace'; ctx.textAlign = 'center'
    ctx.fillText(state === 'going' ? '→ pulse' : '← echo', pulseX, H / 2 - 22)
  }

  // Digital display panel
  ctx.fillStyle = 'rgba(10,14,26,0.85)'; ctx.strokeStyle = 'rgba(99,179,237,0.25)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.roundRect(W - 128, 10, 118, 60, 6); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#63b3ed'; ctx.font = '9px DM Mono,monospace'; ctx.textAlign = 'left'
  ctx.fillText(`D = ${dispD}`, W - 120, 30)
  ctx.fillText(`T = ${dispT}`, W - 120, 48)

  // Equation reminder
  ctx.fillStyle = 'rgba(113,128,150,0.5)'; ctx.font = '7px DM Mono,monospace'; ctx.textAlign = 'center'
  ctx.fillText('2D = V × T', W / 2, H - 5)
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
          <p>To study the functioning of an <strong>ultrasonic distance meter</strong> and
          verify the time-of-flight principle at multiple known distances.</p>
        </div>

        <div className="ccard">
          <h3><span>📐</span> Formula</h3>
          <div className="formula-box">
            <span className="formula">2D = V × T</span>
          </div>
          <div className="fvars">
            <b>D</b> = actual distance from meter to object (m)<br/>
            <b>V</b> = velocity of ultrasonic waves in air = <b>330 m/s</b><br/>
            <b>T</b> = elapsed time for pulse round-trip (seconds)<br/>
            <b>T</b> = 2D / V &nbsp;(solving for elapsed time)
          </div>
          <div className="formula-box" style={{ marginTop: 12 }}>
            <span className="formula" style={{ fontSize: '1rem' }}>
              D (measured) = V × T / 2
            </span>
          </div>
        </div>

        <div className="ccard">
          <h3><span>📚</span> Theory</h3>
          <p>An <strong>ultrasonic distance meter</strong> operates on the
          <strong> time-of-flight (TOF)</strong> principle. The device emits a short burst
          of ultrasonic sound waves (frequency &gt; 20 kHz) toward an object.</p>
          <p>The pulse travels at the speed of sound V = 330 m/s through air, reflects off
          the surface (echo), and returns to the receiver. The meter measures the total
          elapsed time T for this round trip.</p>
          <p>Since the pulse covers the distance D twice (there and back), the total path is
          2D = V × T, giving <strong>D = VT/2</strong>.</p>
          <p>The meter computes and displays the distance digitally. In this experiment, we
          verify the meter's readings against actual measured distances and compute the
          accuracy.</p>
          <p style={{ marginBottom: 0 }}>
            <strong>Sources of error:</strong> temperature variations (V changes with T),
            humidity, non-flat reflective surfaces, and multiple echo paths.
          </p>
        </div>
      </div>

      {/* RIGHT — Diagram + Given */}
      <div>
        <div className="diag-card">
          <h4>Time-of-Flight Principle</h4>
          <svg viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg"
               style={{ width: '100%', maxWidth: 250 }}>
            <rect width="260" height="200" fill="#0f1829" rx="6"/>
            {/* Meter */}
            <rect x="20" y="70" width="44" height="60"
                  fill="rgba(99,179,237,0.12)" stroke="#63b3ed" strokeWidth="1.2" rx="4"/>
            <text x="42" y="103" fill="#63b3ed" fontSize="7"
                  textAnchor="middle" fontFamily="DM Sans,sans-serif">Meter</text>
            {/* Speaker */}
            <circle cx="64" cy="100" r="5" fill="rgba(99,179,237,0.5)"/>
            {/* Wall */}
            <rect x="200" y="60" width="10" height="80"
                  fill="rgba(79,209,197,0.15)" stroke="#4fd1c5" strokeWidth="1.2" rx="1"/>
            <text x="205" y="152" fill="#4fd1c5" fontSize="7"
                  textAnchor="middle" fontFamily="DM Sans,sans-serif">Wall</text>
            {/* Outgoing pulse */}
            <line x1="70" y1="90" x2="198" y2="90"
                  stroke="#f6ad55" strokeWidth="1.5" strokeDasharray="4,2"/>
            <polygon points="194,86 200,90 194,94" fill="#f6ad55"/>
            <text x="134" y="82" fill="#f6ad55" fontSize="7"
                  textAnchor="middle" fontFamily="DM Mono,sans-serif">→ pulse</text>
            {/* Returning echo */}
            <line x1="198" y1="110" x2="70" y2="110"
                  stroke="rgba(246,173,85,0.55)" strokeWidth="1.5" strokeDasharray="4,2"/>
            <polygon points="74,106 68,110 74,114" fill="rgba(246,173,85,0.55)"/>
            <text x="134" y="122" fill="rgba(246,173,85,0.6)" fontSize="7"
                  textAnchor="middle" fontFamily="DM Mono,sans-serif">← echo</text>
            {/* D annotation */}
            <line x1="64" y1="140" x2="200" y2="140"
                  stroke="#4fd1c5" strokeWidth="0.8"/>
            <text x="132" y="152" fill="#4fd1c5" fontSize="8"
                  textAnchor="middle" fontFamily="DM Mono,monospace">D</text>
            {/* 2D label */}
            <text x="132" y="170" fill="#f6ad55" fontSize="7"
                  textAnchor="middle" fontFamily="DM Mono,sans-serif">Total path = 2D</text>
            <text x="132" y="182" fill="#f6ad55" fontSize="7"
                  textAnchor="middle" fontFamily="DM Mono,sans-serif">T = 2D / V</text>
          </svg>
        </div>

        <div className="given-card">
          <h4>Given Constants</h4>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.77rem',
                        lineHeight: 2.1, color: 'var(--text-muted)' }}>
            <b style={{ color: 'var(--accent2)' }}>V</b> = 330 m/s (air)<br/>
            Measure 6 distances<br/>
            Compare actual vs meter
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
  const animRef   = useRef(null)

  const [D,      setD]      = useState(0.5)    // metres
  const [V,      setV]      = useState(V_STANDARD)
  const [state,  setState]  = useState('idle') // 'idle' | 'going' | 'echo'
  const [pulseX, setPulseX] = useState(null)
  const [dispD,  setDispD]  = useState('—')
  const [dispT,  setDispT]  = useState('—')

  // Table
  const [adVals, setAdVals] = useState(Array(6).fill(''))
  const [mdVals, setMdVals] = useState(Array(6).fill(''))
  const [results, setResults] = useState(null)
  const [recRow, setRecRow]   = useState(0)

  // Draw static scene whenever D/V changes (no pulse)
  useEffect(() => {
    if (canvasRef.current)
      drawUltraCanvas(canvasRef.current, { D, V, pulseX: null, state: 'idle', dispD, dispT })
  }, [D, V])

  // Emit pulse animation
  const emitPulse = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current)
      animRef.current = null
    }
    const cv = canvasRef.current; if (!cv) return
    const W        = cv.width
    const meterX   = 60
    const wallFrac = 0.15 + (D / 3.0) * 0.7
    const wallX    = meterX + wallFrac * (W - meterX - 40)
    const totalMs  = (2 * D / V) * 1000
    let startT     = null

    setDispD('...'); setDispT('...')

    function step(ts) {
      if (!startT) startT = ts
      const frac = (ts - startT) / totalMs
      let px
      if (frac <= 0.5) {
        px = (meterX + 22) + (frac * 2) * (wallX - meterX - 22)
        setState('going')
      } else {
        px = wallX - ((frac - 0.5) * 2) * (wallX - meterX - 22)
        setState('echo')
      }
      drawUltraCanvas(cv, { D, V, pulseX: px, state: frac <= 0.5 ? 'going' : 'echo',
                             dispD: '...', dispT: '...' })
      if (frac < 1) {
        animRef.current = requestAnimationFrame(step)
      } else {
        setState('idle')
        const T = (2 * D / V) * 1000
        setDispD(D.toFixed(3) + ' m')
        setDispT(T.toFixed(2) + ' ms')
        drawUltraCanvas(cv, { D, V, pulseX: null, state: 'idle',
                               dispD: D.toFixed(3) + ' m', dispT: T.toFixed(2) + ' ms' })
      }
    }
    animRef.current = requestAnimationFrame(step)
  }, [D, V])

  // Cleanup on unmount
  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current) }, [])

  // Computed T and error for each row
  const computedRows = adVals.map((adStr, i) => {
    const ad = parseFloat(adStr)
    const md = parseFloat(mdVals[i])
    if (isNaN(ad)) return { T: '—', err: '—' }
    const T = (2 * ad / V) * 1000
    return { T: T.toFixed(4), err: !isNaN(md) ? Math.abs(ad - md).toFixed(3) : '—', Tval: T }
  })

  // Record
  const recordReading = () => {
    setAdVals(prev => { const n = [...prev]; n[recRow] = D.toFixed(2); return n })
    setMdVals(prev => { const n = [...prev]; n[recRow] = D.toFixed(3); return n })
  }

  // Calculate
  const calcAll = () => {
    const errors = [], ads = []
    adVals.forEach((adStr, i) => {
      const ad = parseFloat(adStr), md = parseFloat(mdVals[i])
      if (!isNaN(ad) && !isNaN(md)) { errors.push(Math.abs(ad - md)); ads.push(ad) }
    })
    if (!errors.length) return
    const meanErr = errors.reduce((a, b) => a + b, 0) / errors.length
    const meanAd  = ads.reduce((a, b) => a + b, 0) / ads.length
    setResults({ meanErr: meanErr.toFixed(3), acc: (100 - meanErr / meanAd * 100).toFixed(1) })
  }

  const reset = () => {
    setAdVals(Array(6).fill(''))
    setMdVals(Array(6).fill(''))
    setResults(null)
  }

  return (
    <div>
      {/* How to use */}
      <div className="howto-card" style={{ marginBottom: 20 }}>
        <h4>💡 How to Use</h4>
        <div className="howto-steps">
          {[
            'Set a distance D using the slider — the wall moves in the simulation.',
            'Click ▶ Emit Pulse — watch the animated pulse travel to the wall and echo back.',
            'Select row, click 📌 Record — actual distance D and computed meter reading fill in.',
            'Enter D values for 6 different distances, click ⚡ Calculate to find mean error and accuracy.',
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
          <h3>🔊 Ultrasonic Distance Meter Simulation</h3>
          <canvas ref={canvasRef} width={460} height={200}
                  style={{ borderRadius: 8, maxWidth: '100%',
                           display: 'block', margin: '0 auto' }}/>
          <div className="sim-caption">
            Animated pulse travels to wall and echoes back — elapsed time T is computed
          </div>

          {/* Live readings */}
          <div style={{ marginTop: 12, display: 'flex', gap: 20, flexWrap: 'wrap',
                        padding: '10px 14px', background: 'var(--surface2)',
                        borderRadius: 8, border: '1px solid var(--border)' }}>
            {[
              { label: 'Distance D', val: D.toFixed(2) + ' m', color: 'var(--accent)' },
              { label: 'Elapsed Time T', val: ((2 * D / V) * 1000).toFixed(3) + ' ms', color: 'var(--accent2)' },
              { label: 'V (sound)', val: V + ' m/s', color: 'var(--accent3)' },
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

          <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-sm btn-accent" onClick={emitPulse}>▶ Emit Pulse</button>
            <button className="btn-sm btn-dim" onClick={() => {
              if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null }
              setState('idle'); setDispD('—'); setDispT('—')
              drawUltraCanvas(canvasRef.current, { D, V, pulseX: null, state: 'idle', dispD: '—', dispT: '—' })
            }}>↺ Reset</button>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ctrl-card">
            <h4>⚙️ Parameters</h4>
            <div className="slider-row">
              <div className="slabel">
                <span>Distance D (m)</span>
                <span className="sval">{D.toFixed(2)} m</span>
              </div>
              <input type="range" min={0.1} max={3.0} step={0.05} value={D}
                     onChange={e => setD(parseFloat(e.target.value))}/>
            </div>
            <div className="slider-row" style={{ marginBottom: 0 }}>
              <div className="slabel">
                <span>Sound Velocity V (m/s)</span>
                <span className="sval">{V} m/s</span>
              </div>
              <input type="range" min={300} max={360} step={1} value={V}
                     onChange={e => setV(+e.target.value)}/>
            </div>
          </div>

          <div className="ctrl-card" style={{ background: 'rgba(79,209,197,0.03)',
                                               borderColor: 'rgba(79,209,197,0.15)' }}>
            <h4 style={{ color: 'var(--accent2)' }}>📡 Time of Flight</h4>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <div style={{ fontFamily: "'DM Mono',monospace", color: 'var(--accent)',
                             marginBottom: 8, fontSize: '0.88rem' }}>
                T = 2D / V = {((2 * D / V) * 1000).toFixed(3)} ms
              </div>
              Pulse travels {D.toFixed(2)} m to wall,<br/>
              then {D.toFixed(2)} m back = {(D * 2).toFixed(2)} m total.<br/>
              At V = {V} m/s → T = {((2 * D / V) * 1000).toFixed(3)} ms
            </div>
          </div>

          <div className="ctrl-card" style={{ background: 'rgba(99,179,237,0.03)' }}>
            <h4 style={{ color: 'var(--accent2)' }}>📌 Record Reading</h4>
            <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginBottom: 10 }}>
              D = <strong style={{ color: 'var(--accent)' }}>{D.toFixed(2)} m</strong> &nbsp;
              T = <strong style={{ color: 'var(--accent2)' }}>
                {((2 * D / V) * 1000).toFixed(3)} ms
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
              📌 Record Distance
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
            <button className="btn-sm btn-accent" onClick={calcAll}>⚡ Calculate</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Sr.</th>
                <th>Actual Distance D (m)</th>
                <th>Meter Reading D_m (m)</th>
                <th>Elapsed Time T = 2D/V (ms)</th>
                <th>Error |D − D_m| (m)</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }, (_, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <input type="number" step="0.01" placeholder="actual m"
                           value={adVals[i]}
                           onChange={e => setAdVals(prev => {
                             const n = [...prev]; n[i] = e.target.value; return n
                           })}/>
                  </td>
                  <td>
                    <input type="number" step="0.001" placeholder="meter m"
                           value={mdVals[i]}
                           onChange={e => setMdVals(prev => {
                             const n = [...prev]; n[i] = e.target.value; return n
                           })}/>
                  </td>
                  <td className="auto">{computedRows[i].T}</td>
                  <td className="auto">{computedRows[i].err}</td>
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
              <div className="calc-label">Mean Absolute Error</div>
              <div>
                <span className="calc-val">{results.meanErr}</span>
                <span className="calc-unit">m</span>
              </div>
            </div>
            <div className="calc-item">
              <div className="calc-label">Accuracy</div>
              <div>
                <span className="calc-val teal">{results.acc}</span>
                <span className="calc-unit">%</span>
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
    q: 'What is the operating principle of an ultrasonic distance meter?',
    opts: ['Laser triangulation', 'Time-of-flight: T = 2D/V', 'Doppler shift measurement', 'Capacitance change'],
    ans: 1,
    exp: 'The meter emits an ultrasonic pulse, waits for the echo, measures total time T, and computes D = VT/2. The pulse travels to the object and back, so we divide by 2.',
  },
  {
    q: 'Velocity of ultrasonic waves in air used in this experiment is:',
    opts: ['3×10⁸ m/s', '1500 m/s', '330 m/s', '340 m/s'],
    ans: 2,
    exp: 'The experiment uses V = 330 m/s as the standard velocity of sound in air at room temperature (exact value varies with temperature at ~0.6 m/s per °C).',
  },
  {
    q: 'Why is T = 2D/V and not T = D/V?',
    opts: ['V is halved for ultrasonic waves', 'The pulse travels to the object AND back, covering 2D total distance', 'There are two reflections', 'The factor 2 is for averaging'],
    ans: 1,
    exp: 'The pulse travels from the meter to the object (D) and back (D), covering 2D total. So elapsed time T = 2D/V, giving D = VT/2.',
  },
  {
    q: 'What frequency range is "ultrasonic"?',
    opts: ['20 Hz to 20 kHz (audible)', 'Below 20 Hz (infrasonic)', 'Above 20 kHz', 'Above 100 MHz'],
    ans: 2,
    exp: 'Ultrasonic waves have frequencies above 20 kHz, beyond human hearing. Typical ultrasonic distance meters use 40–200 kHz.',
  },
  {
    q: 'If D doubles, what happens to elapsed time T?',
    opts: ['T halves', 'T stays the same', 'T doubles', 'T quadruples'],
    ans: 2,
    exp: 'T = 2D/V. V is constant, so T ∝ D. Doubling D doubles T. This linear relationship makes the device work predictably across distances.',
  },
]

const FLASHCARDS = [
  {
    q: 'Formula for ultrasonic distance measurement',
    a: '2D = V × T\nD = V × T / 2\nV = 330 m/s (in air)\nT = elapsed time for pulse round-trip (seconds)',
  },
  {
    q: 'What is the elapsed time T for D = 1 metre?',
    a: 'T = 2D/V = 2×1/330 = 0.00606 s = 6.06 ms\nThe meter measures this tiny time interval internally to compute D.',
  },
  {
    q: 'What are sources of error in the ultrasonic meter?',
    a: 'Temperature variation (V changes with T)\nHumidity affects sound speed\nNon-flat or absorbing surfaces give weak echoes\nMultiple reflections from nearby objects (multipath)',
  },
  {
    q: 'Why use ultrasonic waves instead of audible sound?',
    a: 'Ultrasonic (>20kHz) is inaudible — silent in use\nHigher frequency = shorter wavelength = better resolution\nMore directional beam — less interference from surroundings',
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
        <p>Ultrasonic Distance Meter</p>
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
          <button className="btn-sm btn-dim" onClick={() => { setCardIdx(i => (i - 1 + FLASHCARDS.length) % FLASHCARDS.length); setFlipped(false) }}>← Prev</button>
          <span className="fc-ctr">{cardIdx + 1} / {FLASHCARDS.length}</span>
          <button className="btn-sm btn-dim" onClick={() => { setCardIdx(i => (i + 1) % FLASHCARDS.length); setFlipped(false) }}>Next →</button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
export default function Exp06({ tab }) {
  if (tab === 'theory')     return <Theory />
  if (tab === 'simulation') return <Simulation />
  if (tab === 'test')       return <Test />
  return null
}