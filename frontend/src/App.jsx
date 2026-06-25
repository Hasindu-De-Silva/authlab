import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Challenge from './pages/Challenge'
import Leaderboard from './pages/Leaderboard'
import Login from './pages/Login'
import Register from './pages/Register'
import PrivateRoute from './components/PrivateRoute'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-dark-bg">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route
              path="/challenge/:id"
              element={
                <PrivateRoute>
                  <Challenge />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#0d1421',
                color: '#e5e7eb',
                border: '1px solid rgba(0,255,136,0.2)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13px',
              },
              success: {
                iconTheme: { primary: '#00ff88', secondary: '#0d1421' },
              },
              error: {
                iconTheme: { primary: '#ff4444', secondary: '#0d1421' },
              },
            }}
          />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
