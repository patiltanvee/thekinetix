// src/pages/Home.jsx
import { useState, useEffect } from 'react'
import { useNavigate }                 from 'react-router-dom'
import { EXPERIMENTS, QUOTES }         from '../data/experiments'

// ── Quotes strip ──────────────────────────────────────────────
function QuoteCarousel() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() =>
      setIdx(i => (i + 1) % QUOTES.length), 5000)
    return () => clearInterval(t)
  }, [])

  const q = QUOTES[idx]
  return (
    <div className="quotes-strip">
      <div className="quote-carousel">
        <div className="quote-icon">{q.icon}</div>
        <p className="quote-text">"{q.text}"</p>
        <div className="quote-attr">{q.author}</div>
      </div>
      <div className="quote-dots">
        {QUOTES.map((_, i) => (
          <div key={i}
               className={`qdot ${i === idx ? 'on' : ''}`}
               onClick={() => setIdx(i)} />
        ))}
      </div>
      <div className="quote-nav">
        <button className="qnav-btn"
          onClick={() => setIdx(i => (i - 1 + QUOTES.length) % QUOTES.length)}>←</button>
        <button className="qnav-btn"
          onClick={() => setIdx(i => (i + 1) % QUOTES.length)}>→</button>
      </div>
    </div>
  )
}

// ── Experiment card ───────────────────────────────────────────
function ExpCard({ exp }) {
  const navigate = useNavigate()
  return (
    <div className="exp-card" onClick={() => navigate(`/exp/${exp.id}`)}>
      <div className="card-num">Experiment No. {exp.num}</div>
      <div className="card-name">{exp.title}</div>
      <div className="card-desc">{exp.desc}</div>
      <div className="card-tags">
        {exp.tags.map(t => <span key={t} className="ctag">{t}</span>)}
      </div>
      <div className="card-footer">
        <span>Open Experiment</span>
        <span className="arrow">⟶</span>
      </div>
    </div>
  )
}

// ── Home page ─────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="home-page">

      {/* Hero — copy the text directly from the HTML hero section */}
      <section className="hero">
        <div className="hero-glow" /><div className="hero-glow2" />
        <div className="college-badge">
          <div className="dot" />SIES Graduate School of Technology
        </div>
        <h1 className="hero-title">TheKinetix</h1>
        <p className="hero-subtitle">Applied Physics Laboratory</p>
        <p className="hero-sub2">🔬 SIES GST · Applied Physics Lab</p>
        <div className="hero-divider" />
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-n">07</span>
            <span className="stat-l">Experiments</span>
          </div>
          <div className="sdiv" />
          <div className="stat">
            <span className="stat-n">3</span>
            <span className="stat-l">Topics</span>
          </div>
          <div className="sdiv" />
          <div className="stat">
            <span className="stat-n">∞</span>
            <span className="stat-l">Simulations</span>
          </div>
        </div>
        <button className="btn-enter"
          onClick={() => document.getElementById('exp-list-section')
            ?.scrollIntoView({ behavior: 'smooth' })}>
          Explore Experiments →
        </button>
      </section>

      {/* Quotes */}
      <QuoteCarousel />

      {/* Experiment list */}
      <div id="exp-list-section" className="section">
        <div className="sec-hd">
          <div>
            <div className="sec-title">Experiment <span>List</span></div>
            <div className="sec-sub">First Year Engineering · Applied Physics</div>
          </div>
          <span className="sec-count">07 Active</span>
        </div>
        <div className="exp-grid">
          {EXPERIMENTS.map(exp => <ExpCard key={exp.id} exp={exp} />)}
        </div>
      </div>

      {/* References */}
      <div className="refs-section" id="refs-section">
        <div className="sec-hd">
          <div>
            <div className="sec-title">Learning <span>Resources</span></div>
            <div className="sec-sub">Online Labs & Educational Platforms</div>
          </div>
        </div>
        <div className="refs-grid">
          <div className="ref-card">
            <div className="ref-icon">🧪</div>
            <div className="ref-title">Amrita Virtual Lab</div>
            <div className="ref-desc">Interactive virtual experiments in physics, chemistry, and biology with simulations and detailed procedures.</div>
          </div>
          <div className="ref-card">
            <div className="ref-icon">🔬</div>
            <div className="ref-title">PhET Simulations</div>
            <div className="ref-desc">Free interactive simulations for teaching physics, chemistry, biology, and Earth science concepts.</div>
          </div>
          <div className="ref-card">
            <div className="ref-icon">📚</div>
            <div className="ref-title">NPTEL Lectures</div>
            <div className="ref-desc">National Programme on Technology Enhanced Learning with video lectures on applied physics and experiments.</div>
          </div>
          <div className="ref-card">
            <div className="ref-icon">⚛️</div>
            <div className="ref-title">Khan Academy Physics</div>
            <div className="ref-desc">Comprehensive physics courses with video tutorials, practice problems, and conceptual explanations.</div>
          </div>
          <div className="ref-card">
            <div className="ref-icon">🌐</div>
            <div className="ref-title">MIT OpenCourseWare</div>
            <div className="ref-desc">Free course materials from MIT including physics experiments, lectures, and problem sets.</div>
          </div>
          <div className="ref-card">
            <div className="ref-icon">💻</div>
            <div className="ref-title">Labster Virtual Labs</div>
            <div className="ref-desc">Advanced virtual lab simulations for hands-on learning in physics, chemistry, and biology.</div>
          </div>
        </div>
      </div>

      <footer>
        © TheKinetix · SIES Graduate School of Technology
      </footer>
    </div>
  )
}