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
function drawDiffraction(canvas, { D, N, lambda, selectedOrder }) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height, cy = H / 2
  ctx.fillStyle = '#0a1020'
  ctx.fillRect(0, 0, W, H)

  const rgb       = wlRGB(lambda)
  const lCm       = lambda * 1e-7
  
  // Coordinate definitions for right-to-left layout
  const laserX    = 560
  const screenX   = 120
  const pixPerCm  = 5.0
  const gratingX  = screenX + D * pixPerCm // Movable grating based on D (L)

  // Draw bench rail baseline (optical bench)
  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(30, H - 40)
  ctx.lineTo(W - 30, H - 40)
  ctx.stroke()

  // Draw Screen stand and plate
  // Stand post to base
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(screenX - 4, H - 60, 8, 20)
  // Screen plate
  ctx.fillStyle = '#f1f5f9'
  ctx.fillRect(screenX - 2, 20, 4, H - 80)
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 1
  ctx.strokeRect(screenX - 2, 20, 4, H - 80)
  // Screen base plate
  ctx.fillStyle = '#0f172a'
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1.5
  ctx.fillRect(screenX - 25, H - 40, 50, 8)
  ctx.strokeRect(screenX - 25, H - 40, 50, 8)
  // Screen label
  ctx.fillStyle = 'rgba(99,179,237,0.5)'
  ctx.font = '8px DM Mono,monospace'
  ctx.textAlign = 'center'
  ctx.fillText('Screen', screenX, 12)

  // Draw Diffraction Grating stand and plate (movable)
  // Stand post
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(gratingX - 3, cy + 30, 6, H - 70 - cy)
  // Grating clip holder
  ctx.fillStyle = '#475569'
  ctx.fillRect(gratingX - 6, cy + 20, 12, 10)
  // Translucent Grating plate
  ctx.fillStyle = 'rgba(99,179,237,0.15)'
  ctx.strokeStyle = 'rgba(99,179,237,0.6)'
  ctx.lineWidth = 1.5
  ctx.fillRect(gratingX - 4, cy - 30, 8, 60)
  ctx.strokeRect(gratingX - 4, cy - 30, 8, 60)
  // Grating slits/rulings lines
  ctx.strokeStyle = 'rgba(99,179,237,0.35)'
  ctx.lineWidth = 0.5
  for (let gx = gratingX - 3; gx <= gratingX + 3; gx += 2) {
    ctx.beginPath()
    ctx.moveTo(gx, cy - 28)
    ctx.lineTo(gx, cy + 28)
    ctx.stroke()
  }
  // Grating base plate
  ctx.fillStyle = '#0f172a'
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1.5
  ctx.fillRect(gratingX - 25, H - 40, 50, 8)
  ctx.strokeRect(gratingX - 25, H - 40, 50, 8)
  // Grating labels
  ctx.fillStyle = 'rgba(99,179,237,0.6)'
  ctx.fillText('Grating', gratingX, cy + 45)
  ctx.fillStyle = 'rgba(79,209,197,0.6)'
  ctx.fillText(`N=${N}/cm`, gratingX, cy + 55)

  // Draw Laser source on the right
  // Stand post
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(laserX - 3, cy + 12, 6, H - 52 - cy)
  // Joint hinge/clamp
  ctx.beginPath()
  ctx.arc(laserX, cy + 12, 5, 0, 2 * Math.PI)
  ctx.fillStyle = '#475569'
  ctx.fill()
  // Laser stand base plate
  ctx.fillStyle = '#0f172a'
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1.5
  ctx.fillRect(laserX - 25, H - 40, 50, 8)
  ctx.strokeRect(laserX - 25, H - 40, 50, 8)
  // Laser cylinder body
  ctx.fillStyle = '#111827'
  ctx.strokeStyle = '#374151'
  ctx.lineWidth = 1
  ctx.fillRect(laserX - 25, cy - 10, 50, 20)
  ctx.strokeRect(laserX - 25, cy - 10, 50, 20)
  // Cooling fins
  ctx.fillStyle = '#1f2937'
  for (let fx = laserX - 15; fx <= laserX + 15; fx += 8) {
    ctx.fillRect(fx, cy - 12, 4, 24)
  }
  // Front nozzle/aperture
  ctx.fillStyle = '#4b5563'
  ctx.fillRect(laserX - 30, cy - 5, 5, 10)
  // Golden ring
  ctx.fillStyle = '#d97706'
  ctx.fillRect(laserX - 28, cy - 5, 1, 10)
  // Back cap
  ctx.fillStyle = '#374151'
  ctx.fillRect(laserX + 25, cy - 7, 4, 14)
  // Cord coming out of back cap
  ctx.strokeStyle = '#4b5563'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(laserX + 29, cy)
  ctx.bezierCurveTo(laserX + 45, cy, laserX + 50, cy + 30, laserX + 55, H - 40)
  ctx.stroke()
  // Laser label
  ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.85)`
  ctx.font = '8px DM Mono,monospace'
  ctx.textAlign = 'center'
  ctx.fillText('Laser', laserX, H - 46)

  // Compute diffraction orders up to selectedOrder (1, 2, or 3)
  const orders = []
  for (let o = 0; o <= selectedOrder; o++) {
    orders.push(o)
  }

  const dots = []
  orders.forEach(n => {
    const sinT = n * N * lCm
    if (sinT >= 1) return
    const tanT  = sinT / Math.sqrt(1 - sinT * sinT)
    const xCm   = D * tanT
    const xPx   = xCm * pixPerCm
    const intensity = n === 0 ? 1 : n === 1 ? 0.85 : n === 2 ? 0.6 : 0.4
    dots.push({ n, xPx, xCm, sinT, intensity, upper: cy - xPx, lower: cy + xPx })
  })

  // Laser beam (undiffracted collimated beam from laser to grating)
  ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.95)`
  ctx.lineWidth = 2
  ctx.shadowColor = `rgba(${rgb.r},${rgb.g},${rgb.b},0.8)`
  ctx.shadowBlur = 4
  ctx.beginPath()
  ctx.moveTo(laserX - 30, cy)
  ctx.lineTo(gratingX, cy)
  ctx.stroke()
  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'

  // Draw diffracted beams paths
  dots.forEach(d => {
    if (d.n > 0) {
      ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${d.intensity * 0.4})`
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath(); ctx.moveTo(gratingX, cy); ctx.lineTo(screenX, d.upper); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(gratingX, cy); ctx.lineTo(screenX, d.lower); ctx.stroke()
      ctx.setLineDash([])
    }
  })

  // Draw glowing spots on the screen
  dots.forEach(d => {
    ;[d.upper, d.lower].forEach((y, i) => {
      if (d.n === 0 && i === 1) return
      const ys   = d.n === 0 ? cy : y
      const grad = ctx.createRadialGradient(screenX, ys, 0, screenX, ys, 10)
      grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${d.intensity})`)
      grad.addColorStop(0.3, `rgba(${rgb.r},${rgb.g},${rgb.b},${d.intensity * 0.7})`)
      grad.addColorStop(1, 'transparent')
      ctx.beginPath(); ctx.arc(screenX, ys, 10, 0, 2 * Math.PI)
      ctx.fillStyle = grad; ctx.fill()
    })
  })

  // Draw Intensity Distribution Curve (to the left of screen)
  ctx.beginPath()
  let firstCurvePoint = true
  const maxCurveOffset = 45
  for (let y = 20; y <= H - 60; y++) {
    let intensitySum = 0
    dots.forEach(d => {
      const dyU = y - d.upper
      intensitySum += d.intensity * Math.exp(-(dyU * dyU) / (2 * 8 * 8))
      if (d.n > 0) {
        const dyL = y - d.lower
        intensitySum += d.intensity * Math.exp(-(dyL * dyL) / (2 * 8 * 8))
      }
    })
    const cx = screenX - 10 - intensitySum * maxCurveOffset
    if (firstCurvePoint) {
      ctx.moveTo(cx, y)
      firstCurvePoint = false
    } else {
      ctx.lineTo(cx, y)
    }
  }
  ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.85)`
  ctx.lineWidth = 1.8
  ctx.stroke()

  // Linear Gradient area fill for intensity curve
  ctx.lineTo(screenX - 10, H - 60)
  ctx.lineTo(screenX - 10, 20)
  ctx.closePath()
  const areaGrad = ctx.createLinearGradient(screenX - 60, 0, screenX - 10, 0)
  areaGrad.addColorStop(0, 'transparent')
  areaGrad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0.12)`)
  ctx.fillStyle = areaGrad
  ctx.fill()

  // Draw Pointer Lines and Labels for Diffraction Spots
  dots.forEach(d => {
    if (d.n === 0) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)'
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.moveTo(screenX + 5, cy)
      ctx.lineTo(screenX + 45, cy)
      ctx.stroke()

      ctx.fillStyle = 'rgba(148, 163, 184, 0.8)'
      ctx.beginPath(); ctx.arc(screenX + 5, cy, 1.5, 0, 2 * Math.PI); ctx.fill()

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
      ctx.font = '8px DM Mono,monospace'
      ctx.textAlign = 'left'
      ctx.fillText('Central Spot', screenX + 50, cy + 3)
    } else {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)'
      ctx.lineWidth = 0.8
      // Draw pointers for lower (symmetric) spots for clarity
      ctx.beginPath()
      ctx.moveTo(screenX + 5, d.lower)
      ctx.lineTo(screenX + 45, d.lower)
      ctx.stroke()

      ctx.fillStyle = 'rgba(148, 163, 184, 0.8)'
      ctx.beginPath(); ctx.arc(screenX + 5, d.lower, 1.5, 0, 2 * Math.PI); ctx.fill()

      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
      ctx.font = '7.5px DM Mono,monospace'
      ctx.textAlign = 'left'
      const labelText = d.n === 1 ? '1st Order Diffraction' : d.n === 2 ? '2nd Order Diffraction' : '3rd Order Diffraction'
      ctx.fillText(labelText, screenX + 50, d.lower + 3)
    }
  })

  // Draw dimension line for active order's spot (from central spot cy to lower spot cy + xPx)
  const activeDot = dots.find(d => d.n === selectedOrder)
  if (activeDot && activeDot.n > 0) {
    const ySpot = cy + activeDot.xPx
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 1.2

    // Horizontal extension lines (extended to the left of the screen)
    ctx.beginPath()
    ctx.moveTo(screenX - 35, cy)
    ctx.lineTo(screenX - 5, cy)
    ctx.moveTo(screenX - 35, ySpot)
    ctx.lineTo(screenX - 5, ySpot)
    ctx.stroke()

    // Vertical dimension line
    ctx.beginPath()
    ctx.moveTo(screenX - 28, cy)
    ctx.lineTo(screenX - 28, ySpot)
    ctx.stroke()

    // Draw small ticks/arrowheads at endpoints
    // Arrow pointing up at cy
    ctx.beginPath()
    ctx.moveTo(screenX - 31, cy + 4)
    ctx.lineTo(screenX - 28, cy)
    ctx.lineTo(screenX - 25, cy + 4)
    ctx.stroke()

    // Arrow pointing down at ySpot
    ctx.beginPath()
    ctx.moveTo(screenX - 31, ySpot - 4)
    ctx.lineTo(screenX - 28, ySpot)
    ctx.lineTo(screenX - 25, ySpot - 4)
    ctx.stroke()

    // Label for the dimension x in a white box with a clean, modern sans-serif font
    const text = `x = ${activeDot.xCm.toFixed(3)} cm`
    ctx.font = "bold 11px system-ui, -apple-system, sans-serif"
    const textWidth = ctx.measureText(text).width
    const boxWidth = textWidth + 10
    const boxHeight = 18
    const boxX = screenX - 38 - boxWidth
    const boxY = (cy + ySpot) / 2 - boxHeight / 2

    // Draw white background box
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight)
    
    // Draw box border
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 0.8
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)

    // Draw text inside box (centered vertically and horizontally within padding)
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'left'
    ctx.fillText(text, boxX + 5, boxY + 13)
  }

  // Info labels on the side
  ctx.fillStyle = 'rgba(113,128,150,0.7)'; ctx.font = '8px DM Mono,monospace'; ctx.textAlign = 'right'
  ctx.fillText(`λ=${lambda}nm`, W - 20, 16)
  ctx.fillText(`L=${D}cm`,      W - 20, 26)

  // Return the actual exact target separation for order calculation
  const targetDot = dots.find(d => d.n === selectedOrder)
  return targetDot ? targetDot.xCm : 0
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
              <strong> wavelength of a laser beam</strong> using a diffraction grating.
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
                <b>θ</b> = Angle of diffraction = tan⁻¹(x / L) &nbsp;|&nbsp;
                <b>n</b> = Order of diffraction (1, 2, 3) &nbsp;|&nbsp;
                <b>λ</b> = Wavelength of laser light (cm) &nbsp;|&nbsp;
                <b>x</b> = Distance from center spot to n-th order spot (cm) &nbsp;|&nbsp;
                <b>L</b> = Distance from grating to screen (cm)
              </div>
            </div>
            <div className="formula-block">
              <span className="formula-text">λ = sin θ / (nN)</span>
              <span className="formula-subtext">(WAVELENGTH OF LASER)</span>
              <div className="formula-detail">
                sin θ ≈ tan θ = x/L
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
              <strong> first-order, second-order, and third-order</strong> dots on each side. Higher orders are
              progressively dimmer.
            </p>
            <p>
              By measuring the separation distance x from the central spot to the n-th order spot and knowing the
              grating-screen distance L, we compute θ = tan⁻¹(x/L) and solve for λ.
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
            
            {/* Laser source on the right */}
            <rect x="230" y="118" width="38" height="24"
                  fill="rgba(252,129,129,0.18)" stroke="#fc8181" strokeWidth="1.2" rx="3"/>
            <text x="249" y="134" fill="#fc8181" fontSize="7"
                  textAnchor="middle" fontFamily="DM Sans,sans-serif">Laser</text>
            
            {/* Main Laser Beam */}
            <line x1="230" y1="130" x2="145" y2="130" stroke="#fc8181" strokeWidth="1.5"/>
            
            {/* Diffraction Grating in the middle */}
            <rect x="135" y="105" width="10" height="50"
                  fill="rgba(99,179,237,0.12)" stroke="#63b3ed" strokeWidth="1.2" rx="1"/>
            {[137, 140, 143].map(x => (
              <line key={x} x1={x} y1="108" x2={x} y2="152"
                    stroke="#63b3ed" strokeWidth="0.5" strokeDasharray="2,2"/>
            ))}
            <text x="140" y="170" fill="#63b3ed" fontSize="6.5"
                  textAnchor="middle" fontFamily="DM Sans,sans-serif">Grating</text>
            <text x="140" y="178" fill="#63b3ed" fontSize="6"
                  textAnchor="middle" fontFamily="DM Sans,sans-serif">N=1000 /cm</text>
            
            {/* Screen on the left */}
            <rect x="60" y="90" width="8" height="80"
                  fill="rgba(79,209,197,0.12)" stroke="#4fd1c5" strokeWidth="1.2" rx="1"/>
            <text x="64" y="84" fill="#4fd1c5" fontSize="6.5"
                  textAnchor="middle" fontFamily="DM Sans,sans-serif">Screen</text>
            
            {/* 0th order spot */}
            <circle cx="64" cy="130" r="3.5" fill="#fc8181"/>
            <text x="74" y="133" fill="#f6ad55" fontSize="6" fontFamily="DM Mono,sans-serif">n=0</text>
            
            {/* 1st order beams and spots */}
            <line x1="135" y1="130" x2="64" y2="105"
                  stroke="#fc8181" strokeWidth="1" strokeDasharray="3,2" opacity="0.7"/>
            <circle cx="64" cy="105" r="2.5" fill="#fc8181" opacity="0.8"/>
            <text x="74" y="108" fill="#f6ad55" fontSize="6" fontFamily="DM Mono,sans-serif">n=1</text>
            
            <line x1="135" y1="130" x2="64" y2="155"
                  stroke="#fc8181" strokeWidth="1" strokeDasharray="3,2" opacity="0.7"/>
            <circle cx="64" cy="155" r="2.5" fill="#fc8181" opacity="0.8"/>
            <text x="74" y="158" fill="#f6ad55" fontSize="6" fontFamily="DM Mono,sans-serif">n=1</text>
            
            {/* 2nd order beams and spots */}
            <line x1="135" y1="130" x2="64" y2="88"
                  stroke="#fc8181" strokeWidth="0.8" strokeDasharray="3,2" opacity="0.4"/>
            <circle cx="64" cy="88" r="1.8" fill="#fc8181" opacity="0.45"/>
            
            <line x1="135" y1="130" x2="64" y2="168"
                  stroke="#fc8181" strokeWidth="0.8" strokeDasharray="3,2" opacity="0.4"/>
            <circle cx="64" cy="168" r="1.8" fill="#fc8181" opacity="0.45"/>

            {/* Vertical Intensity Distribution Curve (left of screen) */}
            <path d="M 55,90 C 55,100 40,103 40,105 C 40,107 55,110 55,120 C 55,125 15,128 15,130 C 15,132 55,135 55,140 C 55,150 40,153 40,155 C 40,157 55,160 55,170" 
                  fill="none" stroke="#fc8181" strokeWidth="1" opacity="0.8"/>
            <path d="M 55,90 C 55,100 40,103 40,105 C 40,107 55,110 55,120 C 55,125 15,128 15,130 C 15,132 55,135 55,140 C 55,150 40,153 40,155 C 40,157 55,160 55,170 L 55,170 L 55,90 Z" 
                  fill="rgba(252,129,129,0.06)"/>

            {/* L annotation */}
            <line x1="135" y1="148" x2="68" y2="148" stroke="#4fd1c5" strokeWidth="0.8"/>
            <text x="101" y="158" fill="#4fd1c5" fontSize="7.5"
                  textAnchor="middle" fontFamily="DM Mono,monospace">L</text>
            
            {/* x annotation (center spot to upper first-order spot) */}
            <line x1="52" y1="130" x2="52" y2="105" stroke="#f6ad55" strokeWidth="0.8"/>
            <line x1="48" y1="130" x2="56" y2="130" stroke="#f6ad55" strokeWidth="0.8"/>
            <line x1="48" y1="105" x2="56" y2="105" stroke="#f6ad55" strokeWidth="0.8"/>
            <text x="38" y="121" fill="#f6ad55" fontSize="7.5" fontFamily="DM Mono,monospace">x</text>
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
              <span className="constant-symbol">λ (Laser)</span>
              <span className="constant-value">405 - 632 nm</span>
            </div>
            <div className="constant-row">
              <span className="constant-symbol">n</span>
              <span className="constant-value">1, 2, 3 (diffraction order)</span>
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
  const [selectedOrder, setSelectedOrder] = useState(1)
  const [lConfirmed, setLConfirmed] = useState(false)

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
  const [orderVals, setOrderVals] = useState(() => {
    try {
      const saved = localStorage.getItem('kinetix_exp03_sim_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.orderVals) return parsed.orderVals
      }
    } catch (e) {
      console.error(e)
    }
    return Array(6).fill('')
  })
  const [nGratingVals, setNGratingVals] = useState(() => {
    try {
      const saved = localStorage.getItem('kinetix_exp03_sim_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.nGratingVals) return parsed.nGratingVals
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
      lVals, xVals, orderVals, nGratingVals, results
    }))
  }, [lVals, xVals, orderVals, nGratingVals, results])

  // Record target row
  const [recRow, setRecRow] = useState(0)

  // Draw whenever params change
  useEffect(() => {
    if (!canvasRef.current) return
    drawDiffraction(canvasRef.current, { D, N, lambda, selectedOrder })
  }, [D, N, lambda, selectedOrder])

  // Compute exact current x for display and recording
  const lCm = lambda * 1e-7
  const sinT = selectedOrder * N * lCm
  let currentX = 0
  if (sinT < 1) {
    const tanT = sinT / Math.sqrt(1 - sinT * sinT)
    currentX = D * tanT
  }

  const recordReading = () => {
    setXVals(prev => {
      const n = [...prev]; n[recRow] = currentX.toFixed(3); return n
    })
    setLVals(prev => {
      const n = [...prev]; n[recRow] = D.toString(); return n
    })
    setOrderVals(prev => {
      const n = [...prev]; n[recRow] = selectedOrder.toString(); return n
    })
    setNGratingVals(prev => {
      const n = [...prev]; n[recRow] = N.toString(); return n
    })
    // Auto-advance row if possible
    if (recRow < 5) {
      setRecRow(recRow + 1)
    }
  }

  const computedRows = Array(6).fill().map((_, i) => {
    const L = parseFloat(lVals[i])
    const x = parseFloat(xVals[i])
    const order = parseFloat(orderVals[i])
    const N_val = parseFloat(nGratingVals[i])
    if (isNaN(L) || isNaN(x) || isNaN(order) || isNaN(N_val) || L <= 0 || N_val <= 0 || order <= 0) {
      return { theta: '—', sinT: '—', lam: '—' }
    }
    const theta = Math.atan(x / L) * 180 / Math.PI
    const sinT  = Math.sin(Math.atan(x / L))
    const lam   = sinT / (order * N_val)
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
    setOrderVals(Array(6).fill(''))
    setNGratingVals(Array(6).fill(''))
    setResults(null)
    setRecRow(0)
    setLConfirmed(false)
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
            'Adjust distance L (D) using the slider, then lock it to confirm.',
            'Select Grating lines N (lines/cm) using the slider once Distance L is locked.',
            'Choose the Diffraction Order / Spot Number (1, 2, or 3) to view the spots and visual measurement line (x).',
            'Select the target table row, then click 📌 Record Reading. Fill all rows and click ⚡ Calculate All.',
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
            <div className="sim-readout-hint">MEASURED DISTANCE (x)</div>
            <div className="sim-readout-value" style={{ color: '#fbbf24' }}>
              {currentX.toFixed(3)} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>cm</span>
            </div>
            <div className="sim-readout-hint">Distance from center spot to order {selectedOrder} spot</div>
          </div>
          <div className="sim-jump-bar">
            <span className="sim-jump-label">ASSISTANCE:</span>
            <button className="sim-jump-btn" onClick={() => { setD(38); setN(1000); setLambda(632); setSelectedOrder(1); setLConfirmed(false); }} style={{ background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.35)', color: '#3b82f6', cursor: 'pointer' }}>↺ Reset Parameters</button>
          </div>
        </div>

        {/* Right Column: Sidebar Cards */}
        <div>
          <div className="sim-sidebar-card">
            <div className="sim-sidebar-title">⚙️ PARAMETERS</div>
            <div className="sim-param-row" style={{ opacity: lConfirmed ? 0.75 : 1 }}>
              <div className="sim-param-label">
                <span style={{ fontWeight: 'bold', color: lConfirmed ? '#64748b' : '#3b82f6' }}>
                  Step 1: Distance L (D)
                </span>
                <span className="sim-param-val">{D} cm</span>
              </div>
              <input 
                type="range" 
                min={20} 
                max={70} 
                step={1} 
                value={D} 
                disabled={lConfirmed}
                onChange={e => setD(+e.target.value)}
              />
              {!lConfirmed ? (
                <button 
                  className="btn-primary-action" 
                  style={{ width: '100%', marginTop: 8, padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer' }}
                  onClick={() => setLConfirmed(true)}
                >
                  Confirm & Lock Distance L ({D} cm)
                </button>
              ) : (
                <button 
                  className="btn-secondary-action" 
                  style={{ width: '100%', marginTop: 8, padding: '4px 12px', fontSize: '0.75rem', cursor: 'pointer' }}
                  onClick={() => setLConfirmed(false)}
                >
                  Modify Distance L
                </button>
              )}
            </div>

            <div style={{ height: 1, background: '#334155', margin: '16px 0' }} />

            <div className="sim-param-row" style={{ opacity: lConfirmed ? 1 : 0.5 }}>
              <div className="sim-param-label">
                <span style={{ fontWeight: 'bold', color: lConfirmed ? '#10b981' : '#64748b' }}>
                  Step 2: N (lines/cm)
                </span>
                <span className="sim-param-val">{lConfirmed ? N : '—'}</span>
              </div>
              <input 
                type="range" 
                min={500} 
                max={2000} 
                step={100} 
                value={N} 
                disabled={!lConfirmed}
                onChange={e => setN(+e.target.value)}
              />
              {!lConfirmed && (
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4, fontStyle: 'italic' }}>
                  Please lock Distance L above to enable Grating lines N.
                </div>
              )}
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
            <div className="sim-sidebar-title">📌 MEASUREMENT & RECORD</div>
            
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Diffraction Order (n)
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3].map(orderNum => (
                  <button
                    key={orderNum}
                    className="sim-jump-btn"
                    style={{
                      flex: 1,
                      background: selectedOrder === orderNum ? 'var(--accent)' : 'var(--surface2)',
                      borderColor: selectedOrder === orderNum ? 'var(--accent)' : 'var(--border2)',
                      color: selectedOrder === orderNum ? '#ffffff' : 'var(--text-muted)',
                      fontWeight: selectedOrder === orderNum ? 'bold' : 'normal',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedOrder(orderNum)}
                  >
                    Order {orderNum} ({orderNum === 1 ? '3 dots' : orderNum === 2 ? '5 dots' : '7 dots'})
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Measured Distance (x)
              </div>
              <div className="sim-record-display" style={{ color: '#fbbf24', fontSize: '1.4rem', fontWeight: 'bold' }}>
                {currentX.toFixed(3)} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>cm</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                Distance from center spot to order {selectedOrder} spot
              </div>
            </div>

            <div className="sim-record-selects" style={{ marginBottom: 8 }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                Target Table Row
              </div>
              <select className="sim-select" style={{ width: '100%' }} value={recRow} onChange={e => setRecRow(+e.target.value)}>
                {Array(6).fill().map((_, i) => (
                  <option key={i} value={i}>
                    Row {i + 1} {lVals[i] ? `(L=${lVals[i]} cm, n=${orderVals[i]})` : '(Empty)'}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn-record" style={{ width: '100%', cursor: 'pointer' }} onClick={recordReading}>
              <span style={{ color: '#ef4444' }}>📌</span> Record Reading to Row {recRow + 1}
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
          </div>
          <div className="sim-btn-group">
            <button className="btn-secondary-action" onClick={reset}>↺ Reset Table</button>
            <button className="btn-primary-action" onClick={calcAll}>⚡ Calculate All</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="sim-styled-table">
            <thead>
              <tr>
                <th>SR.</th>
                <th>L (CM)</th>
                <th>N (LINES/CM)</th>
                <th>ORDER (n)</th>
                <th>x (CM)</th>
                <th>θ = tan⁻¹(x/L)</th>
                <th>sin θ</th>
                <th>λ = sin θ / nN (CM)</th>
              </tr>
            </thead>
            <tbody>
              {Array(6).fill().map((_, i) => (
                <tr key={i} className={recRow === i ? 'active-row' : ''} style={{ background: recRow === i ? 'rgba(59,130,246,0.05)' : '' }}>
                  <td>{i + 1}</td>
                  <td>
                    <input type="number" step="0.1" placeholder="L cm" className="sim-table-input"
                           value={lVals[i]} onChange={e => setLVals(prev => { const n = [...prev]; n[i] = e.target.value; return n })}/>
                  </td>
                  <td>
                    <input type="number" step="100" placeholder="N lines/cm" className="sim-table-input"
                           value={nGratingVals[i]} onChange={e => setNGratingVals(prev => { const n = [...prev]; n[i] = e.target.value; return n })}/>
                  </td>
                  <td>
                    <input type="number" min="1" max="3" placeholder="Order n" className="sim-table-input"
                           value={orderVals[i]} onChange={e => setOrderVals(prev => { const n = [...prev]; n[i] = e.target.value; return n })}/>
                  </td>
                  <td>
                    <input type="number" step="0.001" placeholder="x cm" className="sim-table-input"
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
                • Expected (Laser reference): <code>{lambda} nm</code>
              </div>
            </div>
            <div className="sim-calc-box">
              <div className="sim-calc-title">Calculated Wavelength</div>
              <div className="sim-calc-formula">λ = sin θ ÷ (n × N)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#2563eb', fontFamily: 'DM Mono, monospace', marginTop: 6 }}>
                {results.meanA} Å
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
    exp: 'sinθ = nNλ, so longer λ → larger θ → larger x = L·tanθ. The spots move further apart with increasing wavelength.',
  },
  {
    q: 'What approximation is used when sinθ ≈ tanθ in this experiment?',
    opts: ['The screen is very close to the grating', 'The diffraction angle θ is small (small angle approximation)', 'N is very large', 'λ is very small compared to slit width'],
    ans: 1,
    exp: 'For small angles, sinθ ≈ tanθ ≈ x/L. This approximation is valid when the screen is far enough that 1st order angles remain small.',
  },
]

const FLASHCARDS = [
  {
    q: 'What is the grating equation?',
    a: '(a+b) sinθ = nλ\nGrating element (a+b) = 1/N\nN = lines per cm on grating',
  },
  {
    q: 'How is the diffraction angle θ calculated experimentally?',
    a: 'θ = tan⁻¹(x / L)\nwhere x = distance from center spot to selected order spot\nL = grating to screen distance',
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
    a: 'λ = sinθ / (nN)\nwhere n = order, N = lines/cm\nsinθ = x / √(x² + L²) ≈ x / L for small angles',
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
    simData.lVals?.filter(v => v !== '').length || 0
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
                    <div className="dash-result-value">{recordedCount}/6</div>
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