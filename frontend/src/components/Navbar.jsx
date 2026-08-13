// src/components/Navbar.jsx
import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const onHome    = location.pathname === '/'

  function goToExpList() {
    if (onHome) {
      document.getElementById('exp-list-section')
        ?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
      setTimeout(() =>
        document.getElementById('exp-list-section')
          ?.scrollIntoView({ behavior: 'smooth' }), 350)
    }
  }

  function goToRefs() {
    if (onHome) {
      document.getElementById('refs-section')
        ?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
      setTimeout(() =>
        document.getElementById('refs-section')
          ?.scrollIntoView({ behavior: 'smooth' }), 350)
    }
  }

  return (
    <nav className="navbar">
      <div className="nav-logo kinetix-brand-font" onClick={() => navigate('/')}>
        THEKINETIX
      </div>
      <div className="nav-right">
        <button className={`nav-pill ${onHome ? 'anv' : ''}`}
                onClick={() => navigate('/')}>Home</button>
        <button className="nav-pill"
                onClick={goToExpList}>Experiments</button>
        <button className="nav-pill"
                onClick={goToRefs}>References</button>
      </div>
    </nav>
  )
}