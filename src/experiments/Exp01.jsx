// ─────────────────────────────────────────────────────────────
//  Exp01.jsx  —  Wedge-Shaped Film  (Wire Thickness)
//  Paste this file into:  src/experiments/Exp01.jsx
// ─────────────────────────────────────────────────────────────
import React, { useRef, useEffect, useState, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════
const LAMBDA   = 5893e-8   // cm  (sodium wavelength)
const LC       = 0.001     // cm  (least count of microscope)
const BASE_POS = 6.300     // cm  (micrometer base reading)
const FRINGES  = [1, 3, 5, 7, 9, 11, 13, 'Hair']

// ═══════════════════════════════════════════════════════════════
//  DRAW FUNCTION  (pure — no DOM, takes ctx + state)
// ═══════════════════════════════════════════════════════════════
function drawWedgeCanvas(canvas, { wireT, plateL, bright, pos }) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const theta = (wireT * 1e-4) / plateL   // wedge angle (rad)

  ctx.fillStyle = '#080c14'
  ctx.fillRect(0, 0, W, H)

  // Pixel-level interference pattern
  const img = ctx.createImageData(W, H)
  const d   = img.data
  for (let x = 0; x < W; x++) {
    const xcm      = (x / W) * 3.0
    const phase    = 2 * (theta * xcm) / LAMBDA
    const intensity = Math.pow(Math.cos(Math.PI * phase), 2) * bright
    for (let y = 0; y < H; y++) {
      const vig = 1 - 0.4 * Math.pow((y - H / 2) / (H / 2), 2)
      const v   = intensity * vig
      const i   = 4 * (y * W + x)
      d[i]     = Math.round(253 * v)
      d[i + 1] = Math.round(224 * v * 0.88)
      d[i + 2] = Math.round(30  * v)
      d[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)

  // Red crosshair at current position
  const cpx = Math.max(0, Math.min(W - 1,
    ((pos - BASE_POS) / 3.0 + 0.5) * W
  ))
  ctx.strokeStyle = 'rgba(255,50,50,0.85)'
  ctx.lineWidth   = 1.5
  ctx.beginPath(); ctx.moveTo(cpx, 0); ctx.lineTo(cpx, H); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke()

  // Scale bar
  const cmPerPx = 3.0 / W
  ctx.fillStyle = 'rgba(253,224,30,0.4)'
  ctx.fillRect(10, H - 16, 50, 1.5)
  ctx.fillStyle = 'rgba(253,224,30,0.6)'
  ctx.font      = '8px DM Mono,monospace'
  ctx.fillText((50 * cmPerPx * 1000).toFixed(1) + 'mm', 12, H - 18)
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
          <p>To determine the <strong>thickness of a thin wire</strong> by measuring
          the fringe width of the interference pattern formed in a wedge-shaped
          air film between two flat glass plates.</p>
        </div>

        <div className="ccard">
          <h3><span>📐</span> Formulae</h3>
          <div className="formula-box">
            <span className="formula">β = (X₂ − X₁) / N</span>
            <div className="fvars">
              <b>β</b> = fringe width (cm) &nbsp;|&nbsp;
              <b>N</b> = number of fringes between X₁ and X₂
            </div>
          </div>
          <div className="formula-box" style={{ marginTop: 10 }}>
            <span className="formula">θ = λ / 2β &nbsp;&nbsp; (wedge angle)</span>
          </div>
          <div className="formula-box" style={{ marginTop: 10 }}>
            <span className="formula">t = λL / 2β &nbsp;&nbsp; (wire thickness)</span>
            <div className="fvars">
              <b>λ</b> = 5893 Å = 5893×10⁻⁸ cm &nbsp;|&nbsp;
              <b>L</b> = length from edge to wire (cm) &nbsp;|&nbsp;
              <b>β</b> = mean fringe width (cm)
            </div>
          </div>
        </div>

        <div className="ccard">
          <h3><span>📚</span> Theory</h3>
          <p>Two thin flat glass plates are joined at one edge with adhesive tape.
          A thin wire of thickness <strong>t</strong> is placed between them at
          the other edge, forming a <strong>wedge-shaped air film</strong> that
          increases uniformly in thickness from the taped edge to the wire edge.</p>
          <p>When monochromatic light (sodium lamp) is incident normally, it reflects
          from both surfaces of the air film. The two reflected rays interfere.
          The path difference is 2t_x (where t_x is film thickness at position x),
          plus a λ/2 shift at the lower surface.</p>
          <p>This produces <strong>parallel, equally-spaced dark and bright fringes</strong>.
          The fringe width β is constant, related to wedge angle θ by
          β = λ/2tanθ ≈ λ/2θ (since θ is very small).</p>
          <p>Knowing β and L (distance from closed edge to wire), the thickness is:
          <strong> t = Lλ/2β</strong></p>
        </div>
      </div>

      {/* RIGHT — Diagram + Constants */}
      <div>
        <div className="diag-card">
          <h4>Wedge Film Setup</h4>
          <svg viewBox="0 0 280 230" xmlns="http://www.w3.org/2000/svg"
               style={{ width: '100%', maxWidth: 260 }}>
            <rect width="280" height="230" fill="#0f1829" rx="6"/>
            {/* Glass plate 2 (top, wedge) */}
            <path d="M20 80 L230 60 L230 68 L20 90 Z"
                  fill="rgba(99,179,237,0.18)" stroke="#63b3ed" strokeWidth="1.2"/>
            <text x="60" y="72" fill="#63b3ed" fontSize="7"
                  fontFamily="DM Sans,sans-serif">Glass plate 2</text>
            {/* Glass plate 1 (bottom, flat) */}
            <rect x="20" y="100" width="210" height="10"
                  fill="rgba(79,209,197,0.15)" stroke="#4fd1c5" strokeWidth="1.2" rx="1"/>
            <text x="60" y="122" fill="#4fd1c5" fontSize="7"
                  fontFamily="DM Sans,sans-serif">Glass plate 1</text>
            {/* Tape at left */}
            <rect x="14" y="82" width="8" height="28"
                  fill="rgba(246,173,85,0.5)" stroke="#f6ad55" strokeWidth="1" rx="1"/>
            <text x="4" y="100" fill="#f6ad55" fontSize="6"
                  fontFamily="DM Sans,sans-serif">Tape</text>
            {/* Wire at right */}
            <circle cx="228" cy="90" r="5"
                    fill="rgba(252,129,129,0.6)" stroke="#fc8181" strokeWidth="1.2"/>
            <text x="235" y="84" fill="#fc8181" fontSize="7"
                  fontFamily="DM Sans,sans-serif">Wire</text>
            <text x="235" y="93" fill="#fc8181" fontSize="6"
                  fontFamily="DM Mono,monospace">t</text>
            {/* L annotation */}
            <line x1="20" y1="140" x2="228" y2="140" stroke="#4fd1c5" strokeWidth="0.8"/>
            <text x="120" y="152" fill="#4fd1c5" fontSize="7.5"
                  textAnchor="middle" fontFamily="DM Mono,monospace">L</text>
            {/* Fringe pattern */}
            <rect x="20" y="165" width="140" height="28"
                  fill="#0a1020" stroke="#718096" strokeWidth="0.8" rx="2"/>
            <text x="34" y="176" fill="#718096" fontSize="6"
                  fontFamily="DM Sans,sans-serif">Interference fringes</text>
            {[30,40,50,60,70,80,90,100].map(x => (
              <line key={x} x1={x} y1="180" x2={x} y2="190"
                    stroke="#f6e05e" strokeWidth="2"/>
            ))}
            {/* beta label */}
            <line x1="30" y1="196" x2="40" y2="196"
                  stroke="#f6ad55" strokeWidth="0.8"/>
            <text x="34" y="206" fill="#f6ad55" fontSize="7"
                  textAnchor="middle" fontFamily="DM Mono,monospace">β</text>
          </svg>
        </div>

        <div className="given-card">
          <h4>Given Constants</h4>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.77rem',
                        lineHeight: 2.1, color: 'var(--text-muted)' }}>
            <b style={{ color: 'var(--accent2)' }}>λ</b> = 5893 Å = 5893×10⁻⁸ cm<br/>
            <b style={{ color: 'var(--accent2)' }}>LC</b> = 0.001 cm<br/>
            <b style={{ color: 'var(--accent2)' }}>a</b> = 0.05 cm,&nbsp;
            <b style={{ color: 'var(--accent2)' }}>b</b> = 50
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

  // Simulation state
  const [wireT,  setWireT]  = useState(15)    // µm
  const [plateL, setPlateL] = useState(1.2)   // cm
  const [bright, setBright] = useState(0.85)
  const [pos,    setPos]    = useState(BASE_POS)
  const [hover,  setHover]  = useState(null)

  // Observation table
  const [msrVals, setMsrVals] = useState(Array(8).fill(''))
  const [vsdVals, setVsdVals] = useState(Array(8).fill(''))

  // Results
  const [results, setResults] = useState(null)

  // Drag state (refs — don't cause re-renders)
  const dragging    = useRef(false)
  const dragStartX  = useRef(0)
  const dragStartPos = useRef(BASE_POS)

  // Redraw whenever relevant state changes
  useEffect(() => {
    if (canvasRef.current)
      drawWedgeCanvas(canvasRef.current, { wireT, plateL, bright, pos })
  }, [wireT, plateL, bright, pos])

  // ── Drag handlers ──────────────────────────────────────────
  const clamp = v => Math.max(BASE_POS - 1.5, Math.min(BASE_POS + 1.5, v))

  const onMouseDown = useCallback(e => {
    e.preventDefault()
    dragging.current    = true
    dragStartX.current  = e.clientX
    dragStartPos.current = pos
  }, [pos])

  useEffect(() => {
    const onMove = e => {
      if (!dragging.current) return
      const cv  = canvasRef.current
      const dx  = e.clientX - dragStartX.current
      const dcm = (dx / (cv?.offsetWidth || 460)) * 3.0
      setPos(clamp(dragStartPos.current + dcm))
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [])

  const onMouseMove = e => {
    if (dragging.current) return
    const cv   = canvasRef.current
    const rect = cv.getBoundingClientRect()
    const frac = (e.clientX - rect.left) / cv.offsetWidth
    setHover((BASE_POS - 1.5 + frac * 3.0).toFixed(3))
  }

  const onClick = e => {
    const cv   = canvasRef.current
    const rect = cv.getBoundingClientRect()
    const frac = (e.clientX - rect.left) / cv.offsetWidth
    setPos(clamp(BASE_POS - 1.5 + frac * 3.0))
  }

  // ── Observation table helpers ───────────────────────────────
  const getTotal = i => {
    const msr = parseFloat(msrVals[i])
    const vsd = parseFloat(vsdVals[i])
    if (isNaN(msr) || isNaN(vsd)) return NaN
    return msr + vsd * LC
  }

  const recordReading = (rowIdx, col) => {
    if (col === 'msr') {
      setMsrVals(prev => {
        const n = [...prev]; n[rowIdx] = pos.toFixed(2); return n
      })
    } else {
      const vsd = Math.abs(Math.round((pos - Math.floor(pos * 20) / 20) * 1000) % 50)
      setVsdVals(prev => {
        const n = [...prev]; n[rowIdx] = String(vsd); return n
      })
    }
  }

  const [recRow, setRecRow] = useState(0)
  const [recCol, setRecCol] = useState('msr')

  // ── Calculate ───────────────────────────────────────────────
  const calculate = () => {
    const tots = FRINGES.map((_, i) => getTotal(i))
    const hairTot  = tots[7]
    const firstTot = tots[0]
    const L = (!isNaN(hairTot) && !isNaN(firstTot))
      ? Math.abs(hairTot - firstTot)
      : plateL

    const betas = []
    for (let i = 0; i < 6; i++) {
      if (!isNaN(tots[i]) && !isNaN(tots[i + 2])) {
        betas.push(Math.abs(tots[i + 2] - tots[i]) / 2)
      }
    }
    if (betas.length === 0) return

    const mean  = betas.reduce((a, b) => a + b, 0) / betas.length
    const theta = LAMBDA / (2 * mean)
    const t     = L * LAMBDA / (2 * mean)
    setResults({ mean, theta, t, L })
  }

  const reset = () => {
    setMsrVals(Array(8).fill(''))
    setVsdVals(Array(8).fill(''))
    setResults(null)
  }

  // ── Computed totals for table display ──────────────────────
  const tots = FRINGES.map((_, i) => {
    const msr = parseFloat(msrVals[i])
    const vsd = parseFloat(vsdVals[i])
    if (isNaN(msr) || isNaN(vsd)) return '—'
    return (msr + vsd * LC).toFixed(3)
  })
  const Ds = FRINGES.map((_, i) => {
    const t0 = parseFloat(tots[i])
    const t2 = parseFloat(tots[i + 2])
    if (isNaN(t0) || isNaN(t2) || i + 2 >= 8) return '—'
    return Math.abs(t2 - t0).toFixed(3)
  })
  const betas = Ds.map(d => (d === '—' ? '—' : (parseFloat(d) / 2).toFixed(4)))

  return (
    <div>
      {/* How to use */}
      <div className="howto-card" style={{ marginBottom: 20 }}>
        <h4>💡 How to Use</h4>
        <div className="howto-steps">
          {[
            'Drag the crosshair left/right over the fringe pattern — reading updates continuously.',
            'Hover (no click) shows a live position preview. Click or drag to lock the position.',
            'Select row and column (MSR / VSD), click 📌 Record to fill the table.',
            'Click ⚡ Calculate when table is filled to get fringe width β and wire thickness t.',
          ].map((s, i) => (
            <div key={i} className="hs">
              <span className="hs-num">{String(i + 1).padStart(2, '0')}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20,
                    alignItems: 'start', marginBottom: 22 }}>
        {/* Canvas */}
        <div className="sim-top">
          <h3>🔆 Wedge Film Fringe Pattern</h3>
          <canvas
            ref={canvasRef}
            width={460} height={200}
            style={{ borderRadius: 8, maxWidth: '100%', display: 'block',
                     margin: '0 auto', cursor: 'crosshair' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onClick={onClick}
          />
          <div className="sim-caption">
            Drag crosshair left/right — left = decrease reading · right = increase
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center',
                        gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Position:</span>
            <span style={{ fontFamily: "'DM Mono',monospace", color: 'var(--accent)',
                           fontSize: '1.1rem' }}>
              {pos.toFixed(3)} cm
            </span>
            {hover && (
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.75rem',
                             color: 'var(--text-dim)' }}>
                {hover} cm (hover)
              </span>
            )}
            {/* Fine nudge buttons */}
            <div style={{ display: 'flex', gap: 6 }}>
              {[[-0.01, '−0.01'], [0.01, '+0.01'], [-0.001, '−0.001'], [0.001, '+0.001']].map(([d, label]) => (
                <button key={label} className="btn-sm btn-dim"
                        onClick={() => setPos(p => clamp(p + d))}>
                  {d < 0 ? '←' : ''} {label} {d > 0 ? '→' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ctrl-card">
            <h4>⚙️ Parameters</h4>
            {[
              { label: 'Wire thickness t (µm)', val: wireT, set: v => setWireT(v),
                id: 'wT', min: 5, max: 40, step: 1, unit: `${wireT} µm` },
              { label: 'Plate length L (cm)', val: plateL, set: v => setPlateL(v),
                id: 'wL', min: 0.5, max: 3.0, step: 0.1, unit: `${plateL.toFixed(1)} cm` },
              { label: 'Brightness', val: bright, set: v => setBright(v),
                id: 'wBr', min: 0.3, max: 1.0, step: 0.05, unit: bright.toFixed(2) },
            ].map(({ label, val, set, id, min, max, step, unit }) => (
              <div key={id} className="slider-row">
                <div className="slabel">
                  <span>{label}</span>
                  <span className="sval">{unit}</span>
                </div>
                <input type="range" min={min} max={max} step={step}
                       value={val}
                       onChange={e => set(parseFloat(e.target.value))} />
              </div>
            ))}
          </div>

          <div className="ctrl-card" style={{ background: 'rgba(99,179,237,0.03)' }}>
            <h4 style={{ color: 'var(--accent2)' }}>📌 Record Reading</h4>
            <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginBottom: 8 }}>
              Current: <span style={{ fontFamily: "'DM Mono',monospace",
                                      color: 'var(--accent)' }}>{pos.toFixed(3)}</span> cm
            </div>
            <select value={recRow} onChange={e => setRecRow(+e.target.value)}
                    style={{ width: '100%', marginBottom: 8 }}>
              {FRINGES.map((fr, i) => (
                <option key={i} value={i}>Row {i + 1} — Fringe {fr}</option>
              ))}
            </select>
            <select value={recCol} onChange={e => setRecCol(e.target.value)}
                    style={{ width: '100%', marginBottom: 8 }}>
              <option value="msr">MSR (cm)</option>
              <option value="vsd">VSD</option>
            </select>
            <button className="btn-sm btn-accent"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => recordReading(recRow, recCol)}>
              📌 Record
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
            <button className="btn-sm btn-accent" onClick={calculate}>⚡ Calculate</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Obs.</th><th>Fringe No.</th>
                <th>MSR 'a' (cm)</th><th>VSD 'b'</th>
                <th>Total = a+(b×LC) cm</th>
                <th>D = dist betw. 2 fringes (cm)</th>
                <th>β = D/2 (cm)</th>
                <th>Mean β (cm)</th>
              </tr>
            </thead>
            <tbody>
              {FRINGES.map((fr, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td style={{ color: 'var(--text)', fontWeight: 600 }}>{fr}</td>
                  <td>
                    <input type="number" step="0.05" placeholder="MSR cm"
                           value={msrVals[i]}
                           onChange={e => setMsrVals(prev => {
                             const n = [...prev]; n[i] = e.target.value; return n
                           })} />
                  </td>
                  <td>
                    <input type="number" step="1" placeholder="VSD"
                           value={vsdVals[i]}
                           onChange={e => setVsdVals(prev => {
                             const n = [...prev]; n[i] = e.target.value; return n
                           })} />
                  </td>
                  <td className="auto">{tots[i]}</td>
                  <td className="auto">{Ds[i]}</td>
                  <td className="auto">{betas[i]}</td>
                  <td className="auto">
                    {i === 0 && results ? results.mean.toFixed(4) : ''}
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
              { label: 'Mean Fringe Width β', val: results.mean.toExponential(4), unit: 'cm' },
              { label: 'Wedge Angle θ = λ/2β', val: results.theta.toExponential(4), unit: 'rad', teal: true },
              { label: 'Wire Thickness t = Lλ/2β', val: results.t.toExponential(4), unit: 'cm',
                style: { color: 'var(--accent3)' } },
              { label: 'L (used)', val: results.L.toFixed(3), unit: 'cm',
                style: { fontSize: '1.1rem', color: 'var(--text-muted)' } },
            ].map(({ label, val, unit, teal, style }) => (
              <div key={label} className="calc-item">
                <div className="calc-label">{label}</div>
                <div>
                  <span className={`calc-val${teal ? ' teal' : ''}`} style={style}>{val}</span>
                  <span className="calc-unit">{unit}</span>
                </div>
              </div>
            ))}
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
    q: 'What shape of air film is formed between the two glass plates?',
    opts: ['Parallel film', 'Wedge-shaped air film', 'Circular film', 'Spherical film'],
    ans: 1,
    exp: 'A wedge-shaped air film forms because one edge is in contact (zero thickness) and the other edge has the wire of thickness t, creating a linearly increasing air gap.',
  },
  {
    q: 'Why are the fringes straight and parallel in the wedge experiment?',
    opts: ['Because light is white', 'Because thickness increases uniformly — lines of equal thickness are straight and parallel to the edge', 'Because the microscope is calibrated', 'Because sodium light has two wavelengths'],
    ans: 1,
    exp: 'Interference fringes are formed along lines of equal optical path difference (equal air thickness). Since the wedge is uniform, these lines are straight and parallel to the closed edge.',
  },
  {
    q: 'The formula for wire thickness is:',
    opts: ['t = λ/(2β)', 't = Lλ/β', 't = Lλ/(2β)', 't = 2Lβ/λ'],
    ans: 2,
    exp: 't = Lλ/2β. Here L is the length of the air film (to wire), λ is sodium wavelength, and β is the mean fringe width.',
  },
  {
    q: 'How is fringe width β calculated from the observation table?',
    opts: ['β = total range / number of fringes', 'β = D/2 where D = distance between alternate fringes', 'β = a + b×LC', 'Both A and B are equivalent'],
    ans: 3,
    exp: 'D is measured between every 2nd fringe (skipping one). β = D/2 gives the width of one fringe. The mean of all β values gives the best estimate.',
  },
  {
    q: 'Why use sodium light (monochromatic) rather than white light?',
    opts: ['White light fringes are invisible', 'Monochromatic light gives sharp, distinct, evenly spaced fringes; white light gives coloured fringes that are hard to measure', 'Sodium light is cheaper', 'White light causes diffraction'],
    ans: 1,
    exp: 'White light produces coloured fringes (each wavelength has different spacing), making them difficult to count and measure. Sodium light gives clear yellow fringes of uniform spacing.',
  },
  {
    q: 'In the observation table, what does the "Hair" reading represent?',
    opts: ['The reading at the glass plate edge', 'The microscope reading at the position of the thin wire', 'The reading at the zero fringe', 'The last bright fringe position'],
    ans: 1,
    exp: 'The "Hair" or wire reading is taken with the microscope crosshair positioned directly on the thin wire placed at the far edge of the glass plates. L = |Hair reading − First fringe reading|.',
  },
]

const FLASHCARDS = [
  { q: 'What is the formula for wire thickness in the wedge film experiment?', a: 't = Lλ / 2β\nL = length from closed edge to wire\nλ = 5893 Å = 5893×10⁻⁸ cm\nβ = mean fringe width (cm)' },
  { q: 'What is the fringe width β and how is it measured?', a: 'β = (X₂ − X₁) / N\nOr β = D/2 where D = distance between alternate fringes\nN = number of fringes in range X₂−X₁' },
  { q: 'What is the wedge angle θ and its formula?', a: 'θ = λ / 2β (in radians)\nSince θ is very small, tanθ ≈ θ\nThis gives t = Lλ/2β' },
  { q: 'What is the least count of the travelling microscope?', a: 'LC = a/b = 0.05/50 = 0.001 cm\nTotal reading = MSR + (VSD × LC)\n= a + (b × 0.001) cm' },
]

// ═══════════════════════════════════════════════════════════════
//  TEST PANEL  (Quiz + Flashcards)
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

  const score = answers.filter((a, i) => a === QUESTIONS[i].ans).length
  const pct   = Math.round(score / QUESTIONS.length * 100)
  const labels = ['Study more 📖', 'Good effort! 🎯', 'Great job! 🌟', 'Excellent! 🏆', 'Perfect! 🎉']

  const q = QUESTIONS[qi]
  const card = FLASHCARDS[cardIdx]

  return (
    <div>
      <div className="test-hd">
        <h2>Test Your Knowledge</h2>
        <p>Wedge Shaped Film — Wire Thickness</p>
      </div>

      {!done ? (
        <>
          {/* Progress */}
          <div className="prog-row">
            <div className="prog-bar">
              <div className="prog-fill"
                   style={{ width: `${(qi / QUESTIONS.length) * 100}%` }} />
            </div>
            <span className="prog-txt">{qi}/{QUESTIONS.length}</span>
          </div>

          {/* Question */}
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
export default function Exp01({ tab }) {
  if (tab === 'theory')     return <Theory />
  if (tab === 'simulation') return <Simulation />
  if (tab === 'test')       return <Test />
  return null
}