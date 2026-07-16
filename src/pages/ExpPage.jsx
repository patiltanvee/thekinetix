// src/pages/ExpPage.jsx
import React, { useState, useEffect, lazy, Suspense } from 'react'
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

export default function ExpPage() {
  const { id }     = useParams()           // reads /exp/exp01 → id = 'exp01'
  const navigate   = useNavigate()
  const [tab, setTab] = useState('theory')

  const exp     = EXPERIMENTS.find(e => e.id === id)
  const ExpComp = expMap[id]

  // Reset to theory tab when switching experiments
  useEffect(() => { setTab('theory') }, [id])

  if (!exp || !ExpComp) return <p>Experiment not found</p>

  return (
    <div className="exp-page">

      {/* Header */}
      <div className="exp-hd">
        <div className="exp-hd-inner">

          {/* Breadcrumb — clicking goes back to home */}
          <div className="breadcrumb" onClick={() => navigate('/')}>
            🏠 Home / Experiments / {exp.title}
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