import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, Terminal, Trophy, LogOut, Menu, X, Lock, User } from 'lucide-react'

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

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: Terminal },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border shadow-2xl' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)' }}>
                <Shield className="w-5 h-5 text-neon-green" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-neon-green animate-pulse" />
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight">Auth</span>
              <span className="text-neon-green font-bold text-lg tracking-tight glow-green">Lab</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono transition-all duration-200 ${
                  isActive(to)
                    ? 'text-neon-green bg-neon-green/10 border border-neon-green/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
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
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)' }}>
                  <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                  <span className="text-neon-green font-mono text-sm font-semibold">{user.username}</span>
                  <span className="text-gray-500 text-xs font-mono ml-1">{user.xp || 0} XP</span>
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
                <Link to="/register" className="btn-solid-green px-4 py-2 rounded-lg text-sm font-mono font-bold transition-all duration-200">
                  <User className="w-4 h-4 inline mr-1.5" />
                  Start Hacking
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
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
        <div className="md:hidden border-t border-dark-border bg-dark-bg/98 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono transition-all ${
                  isActive(to) ? 'text-neon-green bg-neon-green/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
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
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-mono font-bold bg-neon-green text-dark-bg">
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
