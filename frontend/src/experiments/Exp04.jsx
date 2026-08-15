// ─────────────────────────────────────────────────────────────
//  Exp04.jsx  —  Numerical Aperture of an Optical Fibre
// ─────────────────────────────────────────────────────────────
import React, { useRef, useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════
const D_VALS = [5, 10, 15, 20]   // fixed distance values in mm

// ═══════════════════════════════════════════════════════════════
function drawSpot(canvas, { d, NA, bright, mrCaliper, pnCaliper }) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const cx = W / 2, cy = H / 2

  // Graph paper background
  ctx.fillStyle = '#f5f5e8'
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = 'rgba(100,180,100,0.22)'; ctx.lineWidth = 0.5
  for (let x = 0; x < W; x += 10) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }
  for (let y = 0; y < H; y += 10) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }
  ctx.strokeStyle = 'rgba(100,180,100,0.45)'; ctx.lineWidth = 0.8
  for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }
  for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }

  // Compute actual spot radius: r = d × tan(arcsin(NA))
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
  ctx.strokeStyle = 'rgba(180,80,20,0.4)'; ctx.lineWidth = 1.2
  ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([])

  // Center cross
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 0.8
  ctx.beginPath(); ctx.moveTo(cx-4,cy); ctx.lineTo(cx+4,cy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx,cy-4); ctx.lineTo(cx,cy+4); ctx.stroke()

  // Draw Horizontal Caliper Jaws (Blue) for MR measurement
  const mrHalfPx = (mrCaliper / 2) * pxPerMm
  ctx.strokeStyle = 'rgba(30,60,180,0.8)'; ctx.lineWidth = 1.5
  // Left jaw
  ctx.beginPath()
  ctx.moveTo(cx - mrHalfPx, cy - 25); ctx.lineTo(cx - mrHalfPx, cy + 25)
  ctx.moveTo(cx - mrHalfPx - 4, cy - 25); ctx.lineTo(cx - mrHalfPx + 4, cy - 25)
  ctx.moveTo(cx - mrHalfPx - 4, cy + 25); ctx.lineTo(cx - mrHalfPx + 4, cy + 25)
  ctx.stroke()
  // Right jaw
  ctx.beginPath()
  ctx.moveTo(cx + mrHalfPx, cy - 25); ctx.lineTo(cx + mrHalfPx, cy + 25)
  ctx.moveTo(cx + mrHalfPx - 4, cy - 25); ctx.lineTo(cx + mrHalfPx + 4, cy - 25)
  ctx.moveTo(cx + mrHalfPx - 4, cy + 25); ctx.lineTo(cx + mrHalfPx + 4, cy + 25)
  ctx.stroke()
  // Connector line
  ctx.strokeStyle = 'rgba(30,60,180,0.3)'
  ctx.beginPath(); ctx.moveTo(cx - mrHalfPx, cy); ctx.lineTo(cx + mrHalfPx, cy); ctx.stroke()

  // Draw Vertical Caliper Jaws (Red) for PN measurement
  const pnHalfPx = (pnCaliper / 2) * pxPerMm
  ctx.strokeStyle = 'rgba(180,30,30,0.8)'; ctx.lineWidth = 1.5
  // Top jaw
  ctx.beginPath()
  ctx.moveTo(cx - 25, cy - pnHalfPx); ctx.lineTo(cx + 25, cy - pnHalfPx)
  ctx.moveTo(cx - 25, cy - pnHalfPx - 4); ctx.lineTo(cx - 25, cy - pnHalfPx + 4)
  ctx.moveTo(cx + 25, cy - pnHalfPx - 4); ctx.lineTo(cx + 25, cy - pnHalfPx + 4)
  ctx.stroke()
  // Bottom jaw
  ctx.beginPath()
  ctx.moveTo(cx - 25, cy + pnHalfPx); ctx.lineTo(cx + 25, cy + pnHalfPx)
  ctx.moveTo(cx - 25, cy + pnHalfPx - 4); ctx.lineTo(cx - 25, cy + pnHalfPx + 4)
  ctx.moveTo(cx + 25, cy + pnHalfPx - 4); ctx.lineTo(cx + 25, cy + pnHalfPx + 4)
  ctx.stroke()
  // Connector line
  ctx.strokeStyle = 'rgba(180,30,30,0.3)'
  ctx.beginPath(); ctx.moveTo(cx, cy - pnHalfPx); ctx.lineTo(cx, cy + pnHalfPx); ctx.stroke()

  // Draw Magnified Viewports (MR Left Edge & PN Top Edge)
  const zoomScale = 2.5
  const drawMagnifier = (destX, destY, targetX, targetY, isHorizontal, label) => {
    const r = 40
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.15)'
    ctx.shadowBlur = 6
    ctx.beginPath()
    ctx.arc(destX, destY, r, 0, 2 * Math.PI)
    ctx.fillStyle = '#f5f5e8'
    ctx.fill()
    ctx.shadowColor = 'transparent'
    ctx.strokeStyle = isHorizontal ? 'rgba(30,60,180,0.75)' : 'rgba(180,30,30,0.75)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.clip()

    // Grid inside zoom
    ctx.strokeStyle = 'rgba(100,180,100,0.15)'; ctx.lineWidth = 0.5
    ctx.beginPath()
    for (let xo = -r; xo <= r; xo += 10) {
      ctx.moveTo(destX + xo, destY - r); ctx.lineTo(destX + xo, destY + r)
    }
    for (let yo = -r; yo <= r; yo += 10) {
      ctx.moveTo(destX - r, destY + yo); ctx.lineTo(destX + r, destY + yo)
    }
    ctx.stroke()

    // Draw the spot centered relative to targetX, targetY
    const spotX_zoom = destX + (cx - targetX) * zoomScale
    const spotY_zoom = destY + (cy - targetY) * zoomScale
    const rPx_zoom = rPx * zoomScale

    const gradZoom = ctx.createRadialGradient(spotX_zoom, spotY_zoom, 0, spotX_zoom, spotY_zoom, rPx_zoom * 1.2)
    gradZoom.addColorStop(0,    `rgba(255,220,100,${alpha})`)
    gradZoom.addColorStop(0.5,  `rgba(255,180,50,${alpha * 0.7})`)
    gradZoom.addColorStop(0.85, `rgba(255,150,20,${alpha * 0.3})`)
    gradZoom.addColorStop(1,    'transparent')
    ctx.beginPath(); ctx.arc(spotX_zoom, spotY_zoom, rPx_zoom * 1.3, 0, 2 * Math.PI)
    ctx.fillStyle = gradZoom; ctx.fill()

    // Draw target caliper line
    ctx.lineWidth = 1.8
    if (isHorizontal) {
      // Horizontal measurement (MR) -> vertical caliper line at destX
      ctx.strokeStyle = 'rgba(30,60,180,0.9)'
      ctx.beginPath()
      ctx.moveTo(destX, destY - r); ctx.lineTo(destX, destY + r)
      ctx.stroke()
    } else {
      // Vertical measurement (PN) -> horizontal caliper line at destY
      ctx.strokeStyle = 'rgba(180,30,30,0.9)'
      ctx.beginPath()
      ctx.moveTo(destX - r, destY); ctx.lineTo(destX + r, destY)
      ctx.stroke()
    }

    ctx.restore()

    // Glass reflection arc
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(destX, destY, r - 2, -Math.PI / 3, Math.PI / 6); ctx.stroke()

    // Label
    ctx.fillStyle = 'rgba(74,85,104,0.95)'
    ctx.font = '7.5px DM Mono,monospace'
    ctx.textAlign = 'center'
    ctx.fillText(label, destX, destY - r - 6)
  }

  // Left zoom: target is left caliper jaw: cx - mrHalfPx, cy
  drawMagnifier(75, 75, cx - mrHalfPx, cy, true, '🔎 MR LEFT JAW ZOOM')
  // Top zoom: target is top caliper jaw: cx, cy - pnHalfPx
  drawMagnifier(75, H - 75, cx, cy - pnHalfPx, false, '🔎 PN TOP JAW ZOOM')

  // Info strip
  ctx.fillStyle = 'rgba(30,40,60,0.75)'; ctx.font = '8px DM Mono,monospace'; ctx.textAlign = 'left'
  ctx.fillText(`d=${d}mm  NA=${NA.toFixed(2)}  r=${rMm.toFixed(2)}mm`, 15, 14)

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
              To determine the <strong>numerical aperture (NA)</strong> and acceptance angle
              of an optical fibre using the illuminated circular spot method.
            </p>
          </div>

          <div className="aim-card">
            <div className="aim-card-header">
              <div className="formulae-icon-wrapper">&lt;/&gt;</div>
              <h3 className="aim-card-title">Formulae</h3>
            </div>
            <div className="formula-block">
              <span className="formula-text">NA = sin θ = r / √(r² + d²)</span>
              <span className="formula-subtext">NA = NUMERICAL APERTURE (LIGHT-GATHERING CAPACITY)</span>
              <div className="formula-detail">
                <b>θ</b> = Half-acceptance angle of the fibre &nbsp;|&nbsp;
                <b>r</b> = Radius of illuminated spot on graph paper (mm) &nbsp;|&nbsp;
                <b>d</b> = Distance from fibre tip to graph paper (mm) &nbsp;|&nbsp;
                <b>r</b> = (MR + PN) / 4 (average radius)
              </div>
            </div>
            <div className="formula-block">
              <span className="formula-text">NA = sin θ<sub>max</sub> = √(n₁² − n₂²)</span>
              <span className="formula-subtext">(THEORETICAL NUMERICAL APERTURE)</span>
              <div className="formula-detail">
                <b>n₁</b> = refractive index of core &nbsp;|&nbsp; <b>n₂</b> = refractive index of cladding
              </div>
            </div>
            <div className="formula-block">
              <span className="formula-text">slope = tan θ = r / d</span>
              <span className="formula-subtext">(FROM R VS D GRAPH)</span>
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
              Optical fibres are glass or plastic conduits as thin as human hair, designed to
              guide electromagnetic waves along their length. An optical fibre works on the
              principle of <strong>Total Internal Reflection (TIR)</strong>.
            </p>
            <p style={{ marginBottom: '12px' }}>
              An optical fibre consists of three parts: <strong>core</strong> (high refractive
              index n₁), <strong>cladding</strong> (lower refractive index n₂), and a protective
              coating. Light propagates through the core via TIR because n₁ &gt; n₂.
            </p>
            <p style={{ marginBottom: '12px' }}>
              <strong>Numerical Aperture (NA)</strong> is the measure of the
              <strong> light-gathering capacity</strong> of the optical fibre. It defines the
              maximum acceptance cone — light entering within this cone undergoes TIR and propagates.
              A larger NA means more light is coupled in.
            </p>
            <p>
              In practice, the fibre tip is held at distance d from graph paper. The emergent
              cone illuminates a circular spot of radius r. Measuring r at different values of d
              gives NA = r/√(r²+d²). Since r = d·tanθ, a plot of r vs d is a straight line
              through origin with <strong>slope = tanθ</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT — Setup Frame + Key Relations + Start Simulation Button */}
      <div>
        <div className="setup-header-label">Numerical Aperture Setup</div>
        <div className="laptop-frame">
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

        <div className="constants-card">
          <div className="setup-header-label" style={{ textAlign: 'left', marginBottom: '8px' }}>Key Relations</div>
          <div className="constants-list">
            <div className="constant-row">
              <span className="constant-symbol">r</span>
              <span className="constant-value">(MR + PN) / 4</span>
            </div>
            <div className="constant-row">
              <span className="constant-symbol">NA</span>
              <span className="constant-value">r / √(r²+d²)</span>
            </div>
            <div className="constant-row">
              <span className="constant-symbol">θ</span>
              <span className="constant-value">sin⁻¹(NA) deg</span>
            </div>
            <div className="constant-row">
              <span className="constant-symbol">slope</span>
              <span className="constant-value">tanθ = r/d</span>
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
//  PHYSICAL SETUP WORKBENCH COMPONENT (SVG-based)
// ═══════════════════════════════════════════════════════════════
function PhysicalSetup({ d, NA, isLightOn, setIsLightOn }) {
  // Map distance d (5 to 30) to screen horizontal X coordinate
  // tip is at x = 220. Scale: 6.0 pixels per mm.
  const screenX = 220 + d * 6.0
  const theta = Math.asin(Math.min(0.999, NA))
  const rMm = d * Math.tan(theta)
  // Spot radius on screen: scale is 1.6 px per mm
  const rPx = Math.min(60, rMm * 1.6)

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '580px', margin: '0 auto' }}>
      <svg
        viewBox="0 0 500 280"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          borderRadius: '12px',
          background: isLightOn ? '#f8fafc' : '#090d16',
          border: isLightOn ? '1px solid #e2e8f0' : '1px solid #1e293b',
          transition: 'all 0.4s ease',
          boxShadow: isLightOn ? 'inset 0 2px 4px rgba(0,0,0,0.02)' : 'inset 0 4px 20px rgba(0,0,0,0.5)'
        }}
      >
        <defs>
          {/* Laser beam / cone linear gradient */}
          <linearGradient id="laserConeGrad" x1="0" y1="0.5" x2="1" y2="0.5">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.85"/>
            <stop offset="25%" stopColor="#f97316" stopOpacity="0.55"/>
            <stop offset="85%" stopColor="#ea580c" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0.02"/>
          </linearGradient>

          {/* Glowing projected circle on tilted screen */}
          <radialGradient id="glowingSpot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95"/>
            <stop offset="35%" stopColor="#f97316" stopOpacity="0.8"/>
            <stop offset="75%" stopColor="#ea580c" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0"/>
          </radialGradient>

          {/* Glow filter */}
          <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Fiber core glow filter */}
          <filter id="fiberGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient room shadows (when lights are off) */}
        {!isLightOn && (
          <rect width="500" height="280" fill="rgba(15, 23, 42, 0.05)" />
        )}

        {/* WORKBENCH BASE */}
        <rect x="20" y="210" width="460" height="15" fill={isLightOn ? '#e2e8f0' : '#1e293b'} rx="3" />
        <rect x="30" y="206" width="440" height="4" fill={isLightOn ? '#94a3b8' : '#334155'} />

        {/* RULER / DISTANCE SCALE TICKS */}
        {Array.from({ length: 26 }).map((_, idx) => {
          const tickD = 5 + idx; // scale starting from 5mm to 30mm
          const tickX = 220 + tickD * 6.0;
          const isMajor = tickD % 5 === 0;
          return (
            <g key={idx}>
              <line
                x1={tickX}
                y1={210}
                x2={tickX}
                y2={isMajor ? 218 : 214}
                stroke={isLightOn ? '#64748b' : '#475569'}
                strokeWidth={isMajor ? 1.5 : 0.8}
              />
              {isMajor && (
                <text
                  x={tickX}
                  y={228}
                  fill={isLightOn ? '#475569' : '#94a3b8'}
                  fontSize="7.5"
                  fontWeight="600"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {tickD}
                </text>
              )}
            </g>
          )
        })}

        {/* HE-NE LASER SOURCE */}
        {/* Laser box */}
        <rect x="35" y="130" width="95" height="52" fill={isLightOn ? '#334155' : '#0f172a'} stroke={isLightOn ? '#1e293b' : '#334155'} strokeWidth="1.8" rx="4" />
        {/* Warning label */}
        <polygon points="50,147 57,147 53.5,141" fill="#eab308" />
        <rect x="62" y="141" width="16" height="5" fill="#ef4444" rx="0.5" />
        {/* Diode Indicator */}
        <circle cx="110" cy="144" r="2.5" fill={isLightOn ? '#ef4444' : '#22c55e'} filter={!isLightOn ? 'url(#laserGlow)' : ''} />
        {/* Laser Brand label */}
        <text x="82" y="172" fill={isLightOn ? '#cbd5e1' : '#64748b'} fontSize="7.5" fontWeight="bold" letterSpacing="0.05em" textAnchor="middle" fontFamily="sans-serif">He-Ne LASER</text>
        {/* Metal legs */}
        <rect x="50" y="182" width="8" height="24" fill={isLightOn ? '#64748b' : '#334155'} />
        <rect x="108" y="182" width="8" height="24" fill={isLightOn ? '#64748b' : '#334155'} />

        {/* LASER OUTPUT COUPLER */}
        <rect x="130" y="150" width="12" height="15" fill={isLightOn ? '#94a3b8' : '#475569'} rx="1" />
        <rect x="142" y="154" width="8" height="7" fill={isLightOn ? '#475569' : '#1e293b'} />

        {/* OPTICAL FIBER CABLE (Path representing a loop/bend) */}
        {/* Outer cladding (grey/semi-trans) */}
        <path
          d="M 148 157.5 C 190 157.5, 170 105, 200 105 C 212 105, 218 115, 222 135"
          fill="none"
          stroke={isLightOn ? '#94a3b8' : '#334155'}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Glowing core (only when laser is ON) */}
        {!isLightOn && (
          <path
            d="M 148 157.5 C 190 157.5, 170 105, 200 105 C 212 105, 218 115, 222 135"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="1.2"
            filter="url(#fiberGlow)"
            strokeLinecap="round"
          />
        )}

        {/* FIBER APERTURE STAND */}
        {/* Steel rod base */}
        <rect x="212" y="195" width="20" height="11" fill={isLightOn ? '#475569' : '#334155'} rx="1" />
        <rect x="218" y="135" width="8" height="60" fill={isLightOn ? '#64748b' : '#475569'} />
        {/* Holder Block / Clamp */}
        <rect x="214" y="132" width="16" height="10" fill={isLightOn ? '#334155' : '#1e293b'} rx="1.5" />
        {/* Steel Ferrule */}
        <rect x="220" y="135.5" width="12" height="3" fill={isLightOn ? '#cbd5e1' : '#64748b'} />
        {/* Tiny fiber launcher tip */}
        <rect x="232" y="136" width="3" height="2" fill="#e2e8f0" />

        {/* CONE OF LIGHT (Visible only when lights are off) */}
        {!isLightOn && (
          <polygon
            points={`235,137 ${screenX + 10},${125 - rPx} ${screenX + 10},${125 + rPx}`}
            fill="url(#laserConeGrad)"
          />
        )}

        {/* MOVABLE SCREEN STAND */}
        {/* Base */}
        <rect x={screenX - 12} y="195" width="24" height="11" fill={isLightOn ? '#475569' : '#334155'} rx="1" />
        {/* Vertical Post */}
        <rect x={screenX - 3} y="105" width="6" height="90" fill={isLightOn ? '#64748b' : '#475569'} />
        {/* Adjustment collar */}
        <rect x={screenX - 6} y="115" width="12" height="10" fill={isLightOn ? '#334155' : '#1e293b'} rx="1" />

        {/* SCREEN PAPER BACKPLATE (3D Perspective tilted) */}
        <polygon
          points={`${screenX},56 ${screenX+25},70 ${screenX+25},190 ${screenX},176`}
          fill={isLightOn ? '#1e293b' : '#0b0f19'}
          stroke={isLightOn ? '#334155' : '#1e293b'}
          strokeWidth="1.5"
        />
        {/* Graph Paper screen surface */}
        <polygon
          points={`${screenX-1},60 ${screenX+24},74 ${screenX+24},186 ${screenX-1},172`}
          fill={isLightOn ? '#fcfcf0' : '#141c2c'}
          stroke={isLightOn ? '#cbd5e1' : '#334155'}
          strokeWidth="0.8"
        />

        {/* PERSPECTIVE GRID LINES ON GRAPH PAPER SCREEN */}
        {/* Vertical lines */}
        {Array.from({ length: 6 }).map((_, idx) => {
          const gx = screenX - 1 + idx * 5
          const gy1 = 60 + idx * 2.8
          const gy2 = 172 + idx * 2.8
          return (
            <line
              key={`gl-v-${idx}`}
              x1={gx}
              y1={gy1}
              x2={gx}
              y2={gy2}
              stroke={isLightOn ? 'rgba(34, 197, 94, 0.16)' : 'rgba(34, 197, 94, 0.08)'}
              strokeWidth="0.8"
            />
          )
        })}
        {/* Horizontal lines */}
        {Array.from({ length: 11 }).map((_, idx) => {
          const yOff = idx * 11
          const gy1 = 60 + yOff
          const gy2 = 74 + yOff
          return (
            <line
              key={`gl-h-${idx}`}
              x1={screenX - 1}
              y1={gy1}
              x2={screenX + 24}
              y2={gy2}
              stroke={isLightOn ? 'rgba(34, 197, 94, 0.16)' : 'rgba(34, 197, 94, 0.08)'}
              strokeWidth="0.8"
            />
          )
        })}

        {/* GLOWING SPOT PROJECTED ON SCREEN (only when laser is ON) */}
        {!isLightOn && (
          <ellipse
            cx={screenX + 12}
            cy={123}
            rx={rPx * 0.45}
            ry={rPx}
            fill="url(#glowingSpot)"
            stroke="#f97316"
            strokeWidth="0.8"
            transform={`rotate(15, ${screenX + 12}, 123)`}
            filter="url(#laserGlow)"
          />
        )}

        {/* LABELS & ANNOTATIONS */}
        {/* Distance Dimension arrow */}
        <line
          x1={235}
          y1={190}
          x2={screenX}
          y2={190}
          stroke={isLightOn ? '#2563eb' : '#38bdf8'}
          strokeWidth="1"
          strokeDasharray="2,2"
        />
        <polygon points={`235,190 239,188 239,192`} fill={isLightOn ? '#2563eb' : '#38bdf8'} />
        <polygon points={`${screenX},190 ${screenX-4},188 ${screenX-4},192`} fill={isLightOn ? '#2563eb' : '#38bdf8'} />
        <text
          x={(235 + screenX) / 2}
          y={184}
          fill={isLightOn ? '#1e40af' : '#38bdf8'}
          fontSize="8"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="monospace"
        >
          d = {d} mm
        </text>

        {/* Spot Radius Dimension arrow */}
        {!isLightOn && (
          <g>
            <line
              x1={screenX + 32}
              y1={123 - rPx}
              x2={screenX + 32}
              y2={123 + rPx}
              stroke="#fb923c"
              strokeWidth="1.2"
            />
            <polygon points={`${screenX+32},${123 - rPx} ${screenX+30},${123 - rPx + 4} ${screenX+34},${123 - rPx + 4}`} fill="#fb923c" />
            <polygon points={`${screenX+32},${123 + rPx} ${screenX+30},${123 + rPx - 4} ${screenX+34},${123 + rPx - 4}`} fill="#fb923c" />
            <text
              x={screenX + 40}
              y="126"
              fill="#fb923c"
              fontSize="8"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="left"
            >
              2r = {(rMm * 2).toFixed(1)} mm
            </text>
          </g>
        )}
      </svg>

      {/* SETUP LABELS SUMMARY FOOTER */}
      <div
        style={{
          marginTop: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: isLightOn ? '#64748b' : '#94a3b8',
          fontFamily: 'monospace',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          padding: '0 4px',
          transition: 'color 0.4s ease'
        }}
      >
        <span>Laser Source: He-Ne (632.8 nm)</span>
        <span>Aperture Distance: {d} mm</span>
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
  const [isLightOn, setIsLightOn] = useState(true)

  // Caliper state (width/height in mm)
  const [mrCaliper, setMrCaliper] = useState(10.0)
  const [pnCaliper, setPnCaliper] = useState(10.0)

  // Observation table
  const [mrVals, setMrVals] = useState(() => {
    try {
      const saved = localStorage.getItem('kinetix_exp04_sim_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.mrVals) return parsed.mrVals
      }
    } catch (e) {
      console.error(e)
    }
    return Array(4).fill('')
  })
  const [pnVals, setPnVals] = useState(() => {
    try {
      const saved = localStorage.getItem('kinetix_exp04_sim_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.pnVals) return parsed.pnVals
      }
    } catch (e) {
      console.error(e)
    }
    return Array(4).fill('')
  })

  // Results
  const [results, setResults] = useState(() => {
    try {
      const saved = localStorage.getItem('kinetix_exp04_sim_data')
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
    localStorage.setItem('kinetix_exp04_sim_data', JSON.stringify({
      mrVals, pnVals, results
    }))
  }, [mrVals, pnVals, results])

  // Record target row
  const [recRow, setRecRow] = useState(0)


  // Redraw on param change
  useEffect(() => {
    if (!canvasRef.current || isLightOn) return
    drawSpot(canvasRef.current, { d, NA, bright, mrCaliper, pnCaliper })
  }, [d, NA, bright, mrCaliper, pnCaliper, isLightOn])

  // Draw empty graph on mount
  useEffect(() => {
    if (graphRef.current) drawGraph(graphRef.current, [])
  }, [])

  // Auto-align calipers to exact spot boundaries when distance or NA changes
  useEffect(() => {
    const theta = Math.asin(Math.min(0.999, NA))
    const rMm   = d * Math.tan(theta)
    const diam  = rMm * 2
    setMrCaliper(diam)
    setPnCaliper(diam)
  }, [d, NA])

  // Record simulated reading into table
  const recordReading = () => {
    setMrVals(prev => { const n = [...prev]; n[recRow] = mrCaliper.toFixed(1); return n })
    setPnVals(prev => { const n = [...prev]; n[recRow] = pnCaliper.toFixed(1); return n })
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
      {/* How to use Banner */}
      <div className="sim-howto-banner">
        <div className="sim-howto-header">
          <span>⚡ HOW TO USE</span>
        </div>
        <div className="sim-howto-grid">
          {[
            'Toggle the room lights off using the switch to project the He-Ne laser beam through the fiber.',
            'Adjust Distance d and NA of Fibre sliders — the spot size and the aligned caliper lines update dynamically in real time.',
            'Select the target row (d = 5, 10, 15, 20 mm) in the record panel on the left.',
            'Click 📌 Record Caliper Reads to record the automated measurement, then click ⚡ Calculate All to plot the graph and compute NA.',
          ].map((s, i) => (
            <div key={i} className="sim-howto-step">
              <span className="sim-howto-num">{String(i+1).padStart(2,'0')}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="exp04-sim-grid">
        {/* Left Column: Sidebar Controls */}
        <div>
          {/* Room Light Switch */}
          <button
            className={`dark-room-toggle ${!isLightOn ? 'active' : ''}`}
            onClick={() => setIsLightOn(!isLightOn)}
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {!isLightOn ? '💡 Turn On Room Light (Apparatus view)' : '🌑 Turn Off Room Light (Measurement view)'}
          </button>

          {/* PARAMETERS CARD */}
          <div className="sim-sidebar-card">
            <div className="sim-sidebar-title">⚙️ PARAMETERS</div>
            <div className="sim-param-row">
              <div className="sim-param-label"><span>Distance d (mm)</span><span className="sim-param-val">{d} mm</span></div>
              <input type="range" min="5" max="30" step="1" value={d} onChange={e => setD(+e.target.value)} />
            </div>
            <div className="sim-param-row">
              <div className="sim-param-label"><span>NA of Fibre</span><span className="sim-param-val">{NA.toFixed(2)}</span></div>
              <input type="range" min="0.2" max="0.8" step="0.01" value={NA} onChange={e => setNA(parseFloat(e.target.value))} />
            </div>
            <div className="sim-param-row">
              <div className="sim-param-label"><span>Brightness</span><span className="sim-param-val">{Math.round(bright * 100)}%</span></div>
              <input type="range" min="0.4" max="1.0" step="0.05" value={bright} onChange={e => setBright(parseFloat(e.target.value))} />
            </div>
          </div>

          {/* MEASUREMENT TOOLS CONTROLS (Only visible/active when room is dark) */}
          {!isLightOn ? (
            <>
              {/* RECORD READING */}
              <div className="sim-sidebar-card">
                <div className="sim-sidebar-title">
                  <span>📌 RECORD READING</span>
                  <span style={{ color: '#94a3b8' }}>↑</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AUTOMATIC READOUTS</div>
                <div className="sim-record-display" style={{ fontSize: '1rem', display: 'flex', gap: 12 }}>
                  <span style={{ color: '#1e3cbc' }}>MR: {mrCaliper.toFixed(1)} mm</span>
                  <span style={{ color: '#bc1e1e' }}>PN: {pnCaliper.toFixed(1)} mm</span>
                </div>
                <div className="sim-record-selects">
                  <select className="sim-select" style={{ gridColumn: 'span 2' }} value={recRow} onChange={e => {
                    const nextRow = +e.target.value
                    setRecRow(nextRow)
                    setD(D_VALS[nextRow])
                  }}>
                    {D_VALS.map((dv, i) => (
                      <option key={dv} value={i}>Row {i+1} — d = {dv} mm</option>
                    ))}
                  </select>
                </div>
                <button className="btn-record" onClick={recordReading}>
                  <span style={{ color: '#ef4444' }}>📌</span> Record Caliper Reads
                </button>
              </div>
            </>
          ) : (
            <div className="setup-placeholder">
              <span style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🌑</span>
              <strong style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#334155' }}>Measurement Inactive</strong>
              <p style={{ marginTop: '6px', fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>
                Caliper measurements and data recording are disabled in bright room light.<br/>
                <strong>Turn off room lights</strong> using the button above to begin measurements.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Visual Setup / Circle Diagram */}
        <div className={`sim-live-card ${!isLightOn ? 'dark-room' : ''}`}>
          <div className="sim-live-title">
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: !isLightOn ? 'rgba(56,189,248,0.1)' : 'rgba(59, 130, 246, 0.1)', color: !isLightOn ? '#38bdf8' : '#2563eb', fontSize: '0.85rem' }}>
              {!isLightOn ? '📐' : '🔬'}
            </span>
            {!isLightOn ? 'Optical Fibre Spot Measurement (Close-Up)' : 'Optical Fibre Setup Workbench'}
          </div>

          {isLightOn ? (
            <PhysicalSetup d={d} NA={NA} isLightOn={isLightOn} setIsLightOn={setIsLightOn} />
          ) : (
            <>
              <div id="spotStage" className="sim-screen-container" style={{ border: '1px solid #1e293b' }}>
                <canvas ref={canvasRef} width={640} height={360}
                        style={{ borderRadius: 8, maxWidth: '100%', display: 'block', margin: '0 auto' }}/>
              </div>
              <div className="sim-readout-bar" style={{ background: '#0b0f19', borderColor: '#1e293b', color: '#94a3b8', padding: '14px 20px' }}>
                <div className="sim-readout-hint" style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600 }}>AUTOMATED MEASUREMENT PROFILE</div>
                <div className="sim-readout-value" style={{ display: 'flex', gap: 16, marginTop: '4px', marginBottom: '4px' }}>
                  <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '1.05rem' }}>MR (Horizontal): {mrCaliper.toFixed(1)} mm</span>
                  <span style={{ color: '#f87171', fontWeight: 'bold', fontSize: '1.05rem' }}>PN (Vertical): {pnCaliper.toFixed(1)} mm</span>
                </div>
                <div className="sim-readout-hint" style={{ color: '#64748b', fontSize: '0.72rem' }}>Caliper lines are automatically aligned to the exact boundaries of the projected light spot.</div>
              </div>
            </>
          )}
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
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{dv}</td>
                  <td>
                    <input type="number" step="0.1" placeholder="MR mm" className="sim-table-input"
                           value={mrVals[i]} onChange={e => setMrVals(prev => { const n = [...prev]; n[i] = e.target.value; return n })}/>
                  </td>
                  <td>
                    <input type="number" step="0.1" placeholder="PN mm" className="sim-table-input"
                           value={pnVals[i]} onChange={e => setPnVals(prev => { const n = [...prev]; n[i] = e.target.value; return n })}/>
                  </td>
                  <td style={{ fontFamily: 'DM Mono, monospace', color: '#64748b' }}>{computedRows[i].r}</td>
                  <td style={{ fontFamily: 'DM Mono, monospace', color: '#64748b' }}>{computedRows[i].rd}</td>
                  <td style={{ fontFamily: 'DM Mono, monospace', color: '#64748b' }}>{computedRows[i].na}</td>
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
            Graph: Spot Radius r (mm) vs Distance d (mm)
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
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>📊 Graph Interpretation</div>
            <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.8 }}>
              • Relation: <code>r = d × tan θ</code><br/>
              • Slope of regression line: <code>Slope = tan θ</code><br/>
              • Experimental NA: <code>NA = sin θ = slope / √(1 + slope²)</code>
            </div>
          </div>

          <div className="sim-calc-box">
            <div className="sim-calc-title">Calculated Fibre Angle</div>
            {results && (
              <>
                <div className="sim-calc-formula">Acceptance Angle θ = <strong>{results.thetaDeg}°</strong></div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#2563eb', fontFamily: 'DM Mono, monospace', marginTop: 6 }}>
                  NA = {results.meanNA}
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
// ═══════════════════════════════════════════════════════════════
//  TEST PANEL
// ═══════════════════════════════════════════════════════════════
function Test({ setTab }) {
  const [qi,      setQi]      = useState(0)
  const [answers, setAnswers] = useState(() => {
    try {
      const quizSaved = localStorage.getItem('kinetix_exp04_quiz_data')
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
      const quizSaved = localStorage.getItem('kinetix_exp04_quiz_data')
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
      const simSaved = localStorage.getItem('kinetix_exp04_sim_data')
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
    localStorage.setItem('kinetix_exp04_quiz_data', JSON.stringify({
      done: true,
      answers,
    }))
  }

  const handleRetake = () => {
    setQi(0)
    setAnswers(Array(QUESTIONS.length).fill(null))
    setDone(false)
    localStorage.removeItem('kinetix_exp04_quiz_data')
  }

  const recordedCount = simData ? (
    (simData.mrVals?.filter(v => v !== '').length || 0) +
    (simData.pnVals?.filter(v => v !== '').length || 0)
  ) : 0

  return (
    <div>
      <div className="test-hd">
        <h2>Test Your Knowledge</h2>
        <p>Numerical Aperture of Optical Fibre</p>
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
                    <span className="cert-title">Optical Fibre Certified</span>
                    <span className="cert-subtitle">Numerical Aperture & acceptance angle determined</span>
                  </div>
                </div>
                <div className="dash-results-grid">
                  <div className="dash-result-item">
                    <div className="dash-result-label">Numerical Aperture</div>
                    <div className="dash-result-value">
                      {simData.results?.meanNA}
                    </div>
                  </div>
                  <div className="dash-result-item">
                    <div className="dash-result-label">Acceptance Angle</div>
                    <div className="dash-result-value">
                      {simData.results?.thetaDeg}°
                    </div>
                  </div>
                  <div className="dash-result-item">
                    <div className="dash-result-label">Readings</div>
                    <div className="dash-result-value">{recordedCount}/8</div>
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
                  Test your understanding of optical fibres, light propagation mechanisms, acceptance cones, and NA calculations.
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
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
export default function Exp04({ tab, setTab }) {
  if (tab === 'theory')     return <Theory setTab={setTab} />
  if (tab === 'simulation') return <Simulation />
  if (tab === 'test')       return <Test setTab={setTab} />
  return null
}