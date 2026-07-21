import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import KineticCanvas from '../components/KineticCanvas'
import PhysicsInMotion from '../components/PhysicsInMotion'
import References from './References'
import TheKinetixLogin from '../components/TheKinetixLogin'
import { EXPERIMENTS, QUOTES } from '../data/experiments'

function QuoteCarousel() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % QUOTES.length), 5000)
    return () => clearInterval(t)
  }, [])

  const q = QUOTES[idx]
  return (
    <div className="quotes-strip" style={{ margin: '60px 0 20px' }}>
      <div className="quote-carousel">
        <div className="quote-icon">{q.icon}</div>
        <p className="quote-text">"{q.text}"</p>
        <div className="quote-attr">{q.author}</div>
      </div>
      <div className="quote-dots">
        {QUOTES.map((_, i) => (
          <div key={i} className={`qdot ${i === idx ? 'on' : ''}`} onClick={() => setIdx(i)} />
        ))}
      </div>
    </div>
  )
}

export default function LandingPage({ searchQuery, setSearchQuery, user, onLoginSuccess, onLogout }) {
  const navigate = useNavigate()
  const [showDocDropdown, setShowDocDropdown] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginModalStep, setLoginModalStep] = useState('select')
  const [pendingExpId, setPendingExpId] = useState(null)

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const openLogin = (step = 'select') => {
    setLoginModalStep(step)
    setShowLoginModal(true)
  }

  const handleExpCardClick = (expId) => {
    if (!user) {
      setPendingExpId(expId)
      openLogin('select')
    } else {
      navigate(`/exp/${expId}`)
    }
  }

  const handleGetStartedClick = () => {
    if (!user) {
      openLogin('select')
    } else {
      scrollToSection('experiments')
    }
  }

  return (
    <div className="cl-root landing-full-container" style={{ width: '100%', minHeight: '100vh', background: 'var(--bg)', margin: 0, padding: 0 }}>
      {/* Main Container */}
      <div className="landing-main-panel" style={{ width: '100%', minHeight: '100vh', margin: 0, padding: 0 }}>
        
        {/* Sticky Header Navigation Bar */}
        <header className="cl-nav">
          <div className="cl-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <svg className="cl-logo-svg" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.38333 17.0072C8.03919 15.5229 7.84331 13.8161 7.84331 12.0002C7.84331 10.1844 8.03919 8.47643 8.38333 6.99212M8.38333 17.0072C9.12435 20.2033 10.5528 22.3677 12.1933 22.3677C13.8339 22.3677 15.2623 20.2033 16.0033 17.0072M8.38333 17.0072C4.60438 16.2123 1.93506 14.2701 1.93506 12.0002C1.93506 9.73038 4.60438 7.78702 8.38333 6.99212M8.38333 17.0072C10.3881 17.4289 14.0963 17.4084 16.0033 17.0072M16.0033 17.0072C16.3891 15.3435 16.9994 12.6915 19.2847 13.0848C20.0856 13.2227 20.6004 13.7886 20.5974 14.4822C20.5894 16.3878 17.3748 16.7187 16.0033 17.0072ZM8.38333 6.99212C9.12435 3.79609 10.5528 1.63167 12.1933 1.63167C13.8339 1.63167 15.2623 3.79609 16.0033 6.99212M8.38333 6.99212C10.3881 6.57041 14.0963 6.59098 16.0033 6.99212M16.0033 6.99212L16.0056 7.00174C16.3914 8.66604 17.0038 11.3071 19.2847 10.9145C20.0856 10.7766 20.6004 10.2108 20.5974 9.51713C20.5894 7.61159 17.3748 7.28061 16.0033 6.99212Z" stroke="currentColor" strokeWidth="1.7"></path>
            </svg>
            <span className="cl-brand-title">THEKINETIX</span>
          </div>

          <div className="cl-nav-links">
            {user && (
              <button className="cl-nav-item" onClick={() => scrollToSection('experiments')}>
                Experiments
              </button>
            )}
            <button className="cl-nav-item" onClick={() => scrollToSection('curriculum')}>
              Curriculum
            </button>

            {/* Documentation Dropdown containing References */}
            <div 
              className="cl-nav-dropdown-wrapper" 
              style={{ position: 'relative' }}
              onMouseEnter={() => setShowDocDropdown(true)}
              onMouseLeave={() => setShowDocDropdown(false)}
            >
              <button 
                className="cl-nav-item" 
                onClick={() => scrollToSection('documentation')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                Documentation
              </button>

              {showDocDropdown && (
                <div 
                  className="cl-dropdown-menu"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    background: '#090d1f',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: '8px',
                    padding: '8px',
                    minWidth: '220px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                    zIndex: 100
                  }}
                >
                  <button
                    onClick={() => { setShowDocDropdown(false); scrollToSection('documentation'); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#38bdf8',
                      fontSize: '0.78rem',
                      fontFamily: "'DM Mono', monospace",
                      cursor: 'pointer',
                      borderRadius: '6px',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(56, 189, 248, 0.15)'}
                    onMouseOut={(e) => e.target.style.background = 'transparent'}
                  >
                    🏛️ Academic References
                  </button>
                  <button
                    onClick={() => { setShowDocDropdown(false); scrollToSection('documentation'); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      fontSize: '0.78rem',
                      fontFamily: "'DM Mono', monospace",
                      cursor: 'pointer',
                      borderRadius: '6px',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => { e.target.style.background = 'rgba(56, 189, 248, 0.15)'; e.target.style.color = '#e2e8f0'; }}
                    onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#94a3b8'; }}
                  >
                    📖 Lab Manuals & Bibliography
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span 
                  style={{ 
                    fontFamily: "'DM Mono', monospace", 
                    fontSize: '0.78rem', 
                    color: '#38bdf8', 
                    background: 'rgba(56, 189, 248, 0.12)', 
                    border: '1px solid rgba(56, 189, 248, 0.3)', 
                    padding: '6px 12px', 
                    borderRadius: '20px' 
                  }}
                >
                  ⚡ {user.role === 'student' ? 'Student' : 'Faculty'}: {user.id}
                </span>
                {onLogout && (
                  <button 
                    className="cl-nav-item"
                    onClick={onLogout}
                    style={{ color: '#fc8181', borderColor: 'rgba(252, 129, 129, 0.3)' }}
                  >
                    Log Out
                  </button>
                )}
                <button className="cl-btn-primary" onClick={() => scrollToSection('experiments')}>
                  Explore Labs ↓
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  className="cl-nav-item" 
                  onClick={() => openLogin('select')}
                  style={{ color: '#38bdf8', fontWeight: 600 }}
                >
                  Sign In
                </button>
                <button 
                  className="cl-btn-primary" 
                  onClick={() => openLogin('signup')}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Chaos Labs Hero Stage */}
        <section className="cl-hero-section">
          <KineticCanvas density={60} />

          <div className="cl-hero-container">
            <div>
              <h1 className="cl-hero-h1">
                Physics<br />
                Through<br />
                <strong style={{ fontWeight: 800, color: '#38bdf8' }}>TheKinetix</strong>
              </h1>
            </div>

            <div>
              <p className="cl-hero-lead">
                TheKinetix turns complex, fragmented applied physics formulas into decision-ready, interactive virtual simulations for engineering students.
              </p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button 
                  className="cl-btn-primary" 
                  style={{ padding: '16px 36px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }} 
                  onClick={handleGetStartedClick}
                >
                  Get Started →
                </button>
                <button 
                  className="cl-nav-item" 
                  style={{ 
                    border: '1px solid rgba(56, 189, 248, 0.3)', 
                    borderRadius: '4px', 
                    padding: '16px 28px', 
                    fontSize: '0.82rem',
                    color: '#38bdf8' 
                  }} 
                  onClick={() => scrollToSection('documentation')}
                >
                  Read Documentation
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Project Capabilities Strip */}
        <section className="cl-metric-section">
          <div className="cl-metric-inner" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '24px', padding: '24px 20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="cl-giant-number" style={{ fontSize: '2.4rem' }}>07</div>
              <div className="cl-metric-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginTop: '4px' }}>Interactive Lab Modules</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="cl-giant-number" style={{ fontSize: '2.4rem', color: '#4fd1c5' }}>60 FPS</div>
              <div className="cl-metric-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginTop: '4px' }}>Real-Time Physics Canvas</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="cl-giant-number" style={{ fontSize: '2.4rem', color: '#f6ad55' }}>100%</div>
              <div className="cl-metric-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginTop: '4px' }}>Dynamic Parameter Control</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="cl-giant-number" style={{ fontSize: '2.4rem', color: '#a78bfa' }}>FE-101</div>
              <div className="cl-metric-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginTop: '4px' }}>Engineering Physics Standard</div>
            </div>
          </div>
        </section>

        {/* 6-Box Grid ("Build Physics Intelligence") */}
        <section id="curriculum" className="cl-grid-container" style={{ scrollMarginTop: '80px' }}>
          <div className="cl-section-hdr">
            <h2 className="cl-section-title">Build Physics Intelligence</h2>
          </div>

          <div className="cl-6grid">
            <div className="cl-cell">
              <div className="cl-cell-icon">🧪</div>
              <div>
                <div className="cl-cell-h">Understand Physics Vectors</div>
                <div className="cl-cell-p">Connect AI and vector activity to core physical experiments and engineering outcomes.</div>
              </div>
            </div>

            <div className="cl-cell">
              <div className="cl-cell-icon">📘</div>
              <div>
                <div className="cl-cell-h">Capture Lab Knowledge</div>
                <div className="cl-cell-p">Turn interactive observations into structured, institutional-grade calculation reports.</div>
              </div>
            </div>

            <div className="cl-cell">
              <div className="cl-cell-icon">📊</div>
              <div>
                <div className="cl-cell-h">Improve Vector Accuracy</div>
                <div className="cl-cell-p">Improve formula execution through real-time telemetry graph rendering and wavelength tuning.</div>
              </div>
            </div>

            <div className="cl-cell">
              <div className="cl-cell-icon">🎯</div>
              <div>
                <div className="cl-cell-h">Manage Labs at Scale</div>
                <div className="cl-cell-p">Track student lab progress and assessment performance across all 7 core modules.</div>
              </div>
            </div>

            <div className="cl-cell">
              <div className="cl-cell-icon">⚡</div>
              <div>
                <div className="cl-cell-h">Build Custom Experiments</div>
                <div className="cl-cell-p">Turn everyday physics lab exercises into interactive simulation models you own.</div>
              </div>
            </div>

            <div className="cl-cell">
              <div className="cl-cell-icon">🔒</div>
              <div>
                <div className="cl-cell-h">Verified Formulas</div>
                <div className="cl-cell-p">Verify theoretical calculations with automated circuit breakers and error metrics.</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Column Product Offerings */}
        <section className="cl-grid-container" style={{ borderTop: 'none' }}>
          <div className="cl-section-hdr">
            <h2 className="cl-section-title">Product Offerings</h2>
          </div>

          <div className="cl-products-grid">
            <div className="cl-product-card">
              <div>
                <div className="cl-picon">🧪</div>
                <div className="cl-cell-h" style={{ fontSize: '1.25rem' }}>Kinetix Physics AI</div>
                <div className="cl-cell-p">
                  Delivers real-time, institutional-grade physics intelligence with built-in parameter verification and vector execution layers.
                </div>
              </div>
              <button className="cl-pbtn" onClick={() => scrollToSection('experiments')}>Explore Experiments</button>
            </div>

            <div className="cl-product-card">
              <div>
                <div className="cl-picon">📊</div>
                <div className="cl-cell-h" style={{ fontSize: '1.25rem' }}>Telemetry & Analytics</div>
                <div className="cl-cell-p">
                  Delivers end-to-end simulation telemetry, model-based parameter tuning, and real-time fringe dashboards so students master physics.
                </div>
              </div>
              <button className="cl-pbtn" onClick={() => scrollToSection('documentation')}>View References</button>
            </div>

            <div className="cl-product-card">
              <div>
                <div className="cl-picon">🎯</div>
                <div className="cl-cell-h" style={{ fontSize: '1.25rem' }}>Physics Oracles</div>
                <div className="cl-cell-p">
                  A comprehensive risk-aware simulation stack that validates physical constant data in real time, detecting errors instantly.
                </div>
              </div>
              <button className="cl-pbtn" onClick={() => scrollToSection('experiments')}>Launch Oracles</button>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════
           DEEP SAPPHIRE BLUE SECTION WITH LIVE PHYSICS STAGE & 7 EXPERIMENTS
           ═════════════════════════════════════════════════════════════════ */}
        <section id="blue-section" className="blue-feature-section">
          <div className="blue-section-glow" />

          <div className="blue-container">
            <div className="blue-hdr">
              <span className="blue-tag">ENGINEERED FOR FIRST-YEAR STUDENTS</span>
              <h2 className="blue-title">
                Interactive <span>Physics in Motion</span> Centerpiece
              </h2>
              <p className="blue-desc">
                High-definition live interactive simulation stage featuring laser spectrum dispersion, 3D atomic orbitals, and wave ripples.
              </p>
            </div>

            {/* Live Interactive Physics Stage */}
            <PhysicsInMotion />

            {/* 7 Active Experiments Showcase - Visible only when logged in */}
            {user ? (
              <>
                <div id="experiments" className="exp-showcase-hdr" style={{ marginTop: '64px', scrollMarginTop: '80px' }}>
                  <div>
                    <h3 className="exp-showcase-title">
                      Interactive <span>Laboratory Modules</span>
                    </h3>
                    <div style={{ fontSize: '0.86rem', color: '#93c5fd', marginTop: '4px' }}>
                      First Year Engineering Applied Physics Curriculum — Click any module to launch simulation directly
                    </div>
                  </div>
                  <div className="exp-showcase-badge">07 ACTIVE SIMULATION MODULES</div>
                </div>

                <div className="exp-showcase-grid">
                  {EXPERIMENTS.map((exp) => (
                    <div
                      key={exp.id}
                      className="exp-showcase-card"
                      onClick={() => handleExpCardClick(exp.id)}
                    >
                      <div>
                        <div className="exp-top-row">
                          <span className="exp-code">EXP {exp.num}</span>
                          <span className="exp-tag-pill">{exp.tags[0]}</span>
                        </div>
                        <div className="exp-title-text">{exp.title}</div>
                        <div className="exp-desc-text">{exp.desc}</div>
                      </div>

                      <div className="exp-bottom-action">
                        <span>Launch Interactive Lab</span>
                        <span className="exp-arrow">→</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div 
                id="experiments" 
                style={{ 
                  marginTop: '64px', 
                  padding: '44px 28px', 
                  background: 'rgba(15, 24, 41, 0.65)', 
                  border: '1px solid rgba(56, 189, 248, 0.25)', 
                  borderRadius: '16px', 
                  textAlign: 'center', 
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)' 
                }}
              >
                <div style={{ fontSize: '2.4rem', marginBottom: '14px' }}>🔒</div>
                <h3 style={{ fontSize: '1.45rem', color: '#f8fafc', fontWeight: 700, margin: '0 0 10px', fontFamily: "'Space Grotesk', sans-serif" }}>
                  Institutional Virtual Physics Labs Locked
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.92rem', maxWidth: '540px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                  Sign in with your Student or Faculty workspace credentials to unlock all 07 interactive physics experiment modules and telemetry calculation engines.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <button className="cl-btn-primary" onClick={() => openLogin('select')} style={{ padding: '12px 28px', fontSize: '0.88rem' }}>
                    Sign In to Unlock Labs →
                  </button>
                  <button className="cl-nav-item" onClick={() => openLogin('signup')} style={{ border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '12px 24px', fontSize: '0.82rem' }}>
                    Request Access / Sign Up
                  </button>
                </div>
              </div>
            )}

            {/* Documentation & Academic References Section */}
            <section id="documentation" style={{ marginTop: '80px', scrollMarginTop: '80px', borderTop: '1px solid rgba(56, 189, 248, 0.2)', paddingTop: '40px' }}>
              <References searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </section>

            {/* Quotes Carousel */}
            <QuoteCarousel />

            <footer style={{ marginTop: '60px', padding: '24px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid rgba(56, 189, 248, 0.15)' }}>
              © 2026 TheKinetix · Applied Physics Laboratory Workspace · Department of Physics and Engineering
            </footer>
          </div>
        </section>

      </div>

      {/* ═════════════════════════════════════════════════════════════════
         CHAOS LABS STYLE LOGIN MODAL OVERLAY
         ═════════════════════════════════════════════════════════════════ */}
      {showLoginModal && (
        <div 
          className="cl-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(5, 9, 20, 0.45)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'clModalIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLoginModal(false)
          }}
        >
          <style>{`
            @keyframes clModalIn {
              from { opacity: 0; transform: scale(0.94) translateY(12px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
          <div style={{ width: '100%', maxWidth: '520px', position: 'relative' }}>
            <TheKinetixLogin 
              initialStep={loginModalStep}
              onBack={() => setShowLoginModal(false)}
              onLoginSuccess={(userData) => {
                if (onLoginSuccess) onLoginSuccess(userData)
                setShowLoginModal(false)
                if (pendingExpId) {
                  const target = pendingExpId
                  setPendingExpId(null)
                  navigate(`/exp/${target}`)
                } else {
                  scrollToSection('experiments')
                }
              }}
            />
          </div>
        </div>
      )}

    </div>
  )
}
