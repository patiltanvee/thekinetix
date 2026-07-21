import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import ScrollTop from './components/ScrollTop'
import ExpPage from './pages/ExpPage'
import LandingPage from './pages/LandingPage'
import TheKinetixLogin from './components/TheKinetixLogin'

export default function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kinetix_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    try {
      localStorage.setItem('kinetix_user', JSON.stringify(userData))
    } catch (e) {
      console.error(e)
    }
  }

  const handleLogout = () => {
    setUser(null)
    try {
      localStorage.removeItem('kinetix_user')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      <Routes>
        {/* Main synchronized landing page */}
        <Route 
          path="/" 
          element={
            <LandingPage 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              user={user}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogout}
            />
          } 
        />
        
        {/* Interactive Experiment Workspace (Protected) */}
        <Route 
          path="/exp/:id" 
          element={
            user ? (
              <ExpPage user={user} onLogout={handleLogout} />
            ) : (
              <ProtectedExpGate onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />

        {/* Login Page */}
        <Route 
          path="/login" 
          element={
            <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <TheKinetixLogin 
                onBack={() => window.location.href = '/'} 
                onLoginSuccess={(u) => {
                  handleLoginSuccess(u)
                  window.location.href = '/'
                }} 
              />
            </div>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ScrollTop />
    </>
  )
}

function ProtectedExpGate({ onLoginSuccess }) {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <TheKinetixLogin 
        onBack={() => navigate('/')} 
        onLoginSuccess={(u) => {
          onLoginSuccess(u)
        }} 
      />
    </div>
  )
}