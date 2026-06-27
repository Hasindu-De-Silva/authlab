import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, Terminal, Trophy, LogOut, Menu, X, Lock, User, Zap } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleLogout = () => { logout(); navigate('/'); setMobileOpen(false) }

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: Terminal },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'navbar-glass' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,229,255,0.12), rgba(41,121,255,0.12))',
                  border: '1px solid rgba(0,229,255,0.3)',
                  boxShadow: '0 0 16px rgba(0,229,255,0.1)'
                }}>
                <Shield className="w-5 h-5" style={{ color: '#00e5ff' }} />
              </div>
              {/* Live indicator dot */}
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ background: '#00e5ff', boxShadow: '0 0 8px #00e5ff' }} />
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight">Auth</span>
              <span className="font-bold text-lg tracking-tight gradient-text">Lab</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono transition-all duration-200 ${
                  isActive(to)
                    ? 'text-dark-bg font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                style={isActive(to) ? {
                  background: 'linear-gradient(135deg, #00e5ff, #2979ff)',
                  boxShadow: '0 0 18px rgba(0,229,255,0.3)',
                } : {}}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Auth section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* XP pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{
                    background: 'rgba(0,229,255,0.06)',
                    border: '1px solid rgba(0,229,255,0.18)'
                  }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00e5ff' }} />
                  <span className="font-mono text-sm font-semibold" style={{ color: '#00e5ff' }}>{user.username}</span>
                  <span className="text-gray-500 text-xs font-mono ml-1 flex items-center gap-0.5">
                    <Zap className="w-3 h-3 text-amber-400" />
                    {user.xp || 0}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 font-mono text-sm border border-transparent hover:border-red-400/20"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-mono text-gray-400 hover:text-white transition-colors duration-200">
                  <Lock className="w-4 h-4 inline mr-1.5" />
                  Login
                </Link>
                <Link to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-mono font-bold text-dark-bg transition-all duration-200 hover:brightness-110"
                  style={{
                    background: 'linear-gradient(135deg, #00e5ff, #2979ff)',
                    boxShadow: '0 0 16px rgba(0,229,255,0.25)',
                  }}>
                  <User className="w-4 h-4 inline mr-1.5" />
                  Start Hacking
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-dark-border backdrop-blur-xl"
          style={{ background: 'rgba(2,11,24,0.98)' }}>
          <div className="px-4 py-4 space-y-2">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono transition-all ${
                  isActive(to) ? 'font-semibold text-dark-bg' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                style={isActive(to) ? { background: 'linear-gradient(135deg, #00e5ff, #2979ff)' } : {}}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono text-red-400 hover:bg-red-400/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <div className="space-y-2 pt-2 border-t border-dark-border">
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono text-gray-400 hover:text-white hover:bg-white/5">
                  <Lock className="w-4 h-4" />
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-mono font-bold text-dark-bg"
                  style={{ background: 'linear-gradient(135deg, #00e5ff, #2979ff)' }}>
                  <User className="w-4 h-4" />
                  Start Hacking
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
