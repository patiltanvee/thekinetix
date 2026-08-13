// src/pages/ExpPage.jsx
import { useState, lazy, Suspense } from 'react'
import { useParams, useNavigate }                      from 'react-router-dom'
import { EXPERIMENTS }                                 from '../data/experiments'

// Lazy load each experiment — only downloads when opened
const expMap = {
  exp01: lazy(() => import('../experiments/Exp01')),
  exp02: lazy(() => import('../experiments/Exp02')),
  exp03: lazy(() => import('../experiments/Exp03')),
  exp04: lazy(() => import('../experiments/Exp04')),
  exp05: lazy(() => import('../experiments/Exp05')),
  exp06: lazy(() => import('../experiments/Exp06')),
  exp07: lazy(() => import('../experiments/Exp07')),
}

export default function ExpPage({ user, onLogout }) {
  const { id }     = useParams()           // reads /exp/exp01 → id = 'exp01'
  const navigate   = useNavigate()
  const [tab, setTab] = useState('theory')
  const [prevId, setPrevId] = useState(id)

  if (prevId !== id) {
    setPrevId(id)
    setTab('theory')
  }

  const exp     = EXPERIMENTS.find(e => e.id === id)
  const ExpComp = expMap[id]

  if (!exp || !ExpComp) return <p>Experiment not found</p>

  return (
    <div className="exp-page" style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>

      {/* Sticky Header Navbar */}
      <header className="cl-nav cl-nav-light">
        <div className="cl-brand" onClick={() => navigate('/')}>
          <svg className="cl-logo-svg" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.38333 17.0072C8.03919 15.5229 7.84331 13.8161 7.84331 12.0002C7.84331 10.1844 8.03919 8.47643 8.38333 6.99212M8.38333 17.0072C9.12435 20.2033 10.5528 22.3677 12.1933 22.3677C13.8339 22.3677 15.2623 20.2033 16.0033 17.0072M8.38333 17.0072C4.60438 16.2123 1.93506 14.2701 1.93506 12.0002C1.93506 9.73038 4.60438 7.78702 8.38333 6.99212M8.38333 17.0072C10.3881 17.4289 14.0963 17.4084 16.0033 17.0072M16.0033 17.0072C16.3891 15.3435 16.9994 12.6915 19.2847 13.0848C20.0856 13.2227 20.6004 13.7886 20.5974 14.4822C20.5894 16.3878 17.3748 16.7187 16.0033 17.0072ZM8.38333 6.99212C9.12435 3.79609 10.5528 1.63167 12.1933 1.63167C13.8339 1.63167 15.2623 3.79609 16.0033 6.99212M8.38333 6.99212C10.3881 6.57041 14.0963 6.59098 16.0033 6.99212M16.0033 6.99212L16.0056 7.00174C16.3914 8.66604 17.0038 11.3071 19.2847 10.9145C20.0856 10.7766 20.6004 10.2108 20.5974 9.51713C20.5894 7.61159 17.3748 7.28061 16.0033 6.99212Z" stroke="currentColor" strokeWidth="1.7"></path>
          </svg>
          <span className="cl-brand-title kinetix-brand-font" style={{ color: '#0f172a' }}>THEKINETIX</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="cl-nav-item" onClick={() => navigate('/')} style={{ color: '#0f172a', fontWeight: 600 }}>
            ← Back to All Experiments
          </button>
        </div>
      </header>

      {/* Header */}
      <div className="exp-hd">
        <div className="exp-hd-inner">

          {/* Top Bar: Breadcrumb + User Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div className="breadcrumb" onClick={() => navigate('/')}>
              🏠 Home / Experiments / {exp.title}
            </div>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#2563eb', fontFamily: "'DM Mono', monospace", background: 'rgba(37, 99, 235, 0.08)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                  ⚡ {user.role === 'student' ? 'Student' : 'Faculty'}: {user.id}
                </span>
                {onLogout && (
                  <button 
                    onClick={onLogout}
                    style={{ background: 'transparent', border: '1px solid rgba(252, 129, 129, 0.3)', color: '#fc8181', fontSize: '0.72rem', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontFamily: "'DM Mono', monospace" }}
                  >
                    Log Out
                  </button>
                )}
              </div>
            )}
          </div>

          <h1 className="exp-heading">{exp.title}</h1>

          <div className="exp-meta">
            <span className="badge b-blue">Experiment No. {exp.num}</span>
            {exp.tags.map(t => (
              <span key={t} className="badge b-teal">{t}</span>
            ))}
          </div>

          {/* Tab bar */}
          <div className="tab-bar">
            {['theory', 'simulation', 'test'].map(t => (
              <button key={t}
                      className={`tbtn ${tab === t ? 'act' : ''}`}
                      onClick={() => setTab(t)}>
                {t === 'theory'     ? 'Theory & Aim'          : ''}
                {t === 'simulation' ? 'Simulation & Results'  : ''}
                {t === 'test'       ? 'Test & Flashcards'     : ''}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Content — passes the active tab down to the experiment */}
      <div className="exp-body">
        <Suspense fallback={<p style={{padding:'60px',textAlign:'center'}}>Loading...</p>}>
          <ExpComp tab={tab} setTab={setTab} />
        </Suspense>
      </div>

      {/* Floating Bottom Nav Bar for Mobile */}
      <div className="mobile-bottom-nav">
        <button className="mobile-nav-tab" onClick={() => navigate('/')}>
          <span className="mobile-nav-icon">🏠</span>
          <span className="mobile-nav-label">Home</span>
        </button>
        <button className={`mobile-nav-tab ${tab === 'theory' ? 'active' : ''}`} onClick={() => setTab('theory')}>
          <span className="mobile-nav-icon">📚</span>
          <span className="mobile-nav-label">Theory</span>
        </button>
        <button className={`mobile-nav-tab ${tab === 'simulation' ? 'active' : ''}`} onClick={() => setTab('simulation')}>
          <span className="mobile-nav-icon">🧪</span>
          <span className="mobile-nav-label">Simulation</span>
        </button>
        <button className={`mobile-nav-tab ${tab === 'test' ? 'active' : ''}`} onClick={() => setTab('test')}>
          <span className="mobile-nav-icon">📝</span>
          <span className="mobile-nav-label">Test</span>
        </button>
      </div>

    </div>
  )
}