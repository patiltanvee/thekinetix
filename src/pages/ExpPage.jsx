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
    <div className="exp-page">

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
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: "'DM Mono', monospace", background: 'rgba(56, 189, 248, 0.1)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
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
          <ExpComp tab={tab} />
        </Suspense>
      </div>

    </div>
  )
}