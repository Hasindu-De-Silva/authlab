import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { Shield, Lock, Eye, EyeOff, Terminal, ChevronRight } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.username, form.password)
      toast.success(`Welcome back, ${form.username}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4">
      <div className="absolute inset-0 hex-pattern opacity-30" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl"
        style={{ background: 'radial-gradient(circle, #00ff88, transparent)' }} />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="glass-card neon-border-green rounded-2xl p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)' }}>
              <Shield className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <div className="text-white font-black text-xl">Auth<span className="text-neon-green">Lab</span></div>
              <div className="text-gray-500 text-xs font-mono">Secure Login</div>
            </div>
          </div>

          <h1 className="text-2xl font-black text-white mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm font-mono mb-8">
            Sign in to continue your security training
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">
                Username
              </label>
              <input
                id="login-username"
                type="text"
                className="input-cyber"
                placeholder="your_username"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-cyber pr-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="w-full btn-solid-green py-3 rounded-xl flex items-center justify-center gap-2 font-mono font-bold text-sm transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Sign In
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security note */}
          <div className="mt-6 p-3 rounded-lg" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }}>
            <div className="flex items-start gap-2">
              <Terminal className="w-3.5 h-3.5 text-neon-blue mt-0.5 flex-shrink-0" />
              <p className="text-xs font-mono text-gray-600 leading-relaxed">
                This login uses <span className="text-neon-blue">bcrypt</span> + proper <span className="text-neon-blue">JWT</span>.
                Unlike the vulnerable challenges, this endpoint is rate-limited.
              </p>
            </div>
          </div>

          <p className="text-center text-gray-600 text-sm font-mono mt-6">
            No account?{' '}
            <Link to="/register" className="text-neon-green hover:text-white transition-colors">
              Start hacking →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
