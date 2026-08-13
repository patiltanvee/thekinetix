import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ScrollTop from './components/ScrollTop'
import ExpPage from './pages/ExpPage'
import LandingPage from './pages/LandingPage'
// import TheKinetixLogin from './components/TheKinetixLogin'

export default function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [user] = useState({ id: 'Explorer', role: 'student' })

  const handleLogout = () => {
    // Left empty for now
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
            />
          } 
        />
        
        {/* Interactive Experiment Workspace (Fully Open) */}
        <Route 
          path="/exp/:id" 
          element={
            <ExpPage user={user || { id: 'Explorer', role: 'student' }} onLogout={handleLogout} />
          } 
        />

        {/* Login Page (Commented out)
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
        */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ScrollTop />
    </>
  )
}

// function ProtectedExpGate({ onLoginSuccess }) {
//   const navigate = useNavigate()
//   return (
//     <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
//       <TheKinetixLogin 
//         onBack={() => navigate('/')} 
//         onLoginSuccess={(u) => {
//           onLoginSuccess(u)
//         }} 
//       />
//     </div>
//   )
// }