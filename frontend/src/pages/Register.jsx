import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { Shield, Zap, Eye, EyeOff, User, Mail, Lock, ChevronRight } from 'lucide-react'

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
    { label: 'Special char', pass: /[^a-zA-Z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length

  if (!password) return null

  const strengthColors = ['#ff4444', '#ff8800', '#ffd700', '#00ff88']
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? strengthColors[score - 1] : 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map(({ label, pass }) => (
            <span key={label} className={`text-xs font-mono ${pass ? 'text-neon-green' : 'text-gray-600'}`}>
              {pass ? '✓' : '○'} {label}
            </span>
          ))}
        </div>
        <span className="text-xs font-mono" style={{ color: strengthColors[score - 1] || '#666' }}>
          {password ? strengthLabels[score - 1] || 'Weak' : ''}
        </span>
      </div>
    </div>
  )
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      toast.success(`Welcome to AuthLab, ${form.username}! 🎉`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 hex-pattern opacity-30" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />

      <div className="relative w-full max-w-md">
        <div className="glass-card neon-border-purple rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
              <Shield className="w-5 h-5 text-neon-purple" />
            </div>
            <div>
              <div className="text-white font-black text-xl">Auth<span className="text-neon-green">Lab</span></div>
              <div className="text-gray-500 text-xs font-mono">Join the Platform</div>
            </div>
          </div>

          <h1 className="text-2xl font-black text-white mb-1">Create account</h1>
          <p className="text-gray-500 text-sm font-mono mb-8">
            Start exploiting vulnerabilities in seconds
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  id="register-username"
                  type="text"
                  className="input-cyber pl-10"
                  placeholder="h4x0r_pro"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_]+"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  id="register-email"
                  type="email"
                  className="input-cyber pl-10"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-cyber pl-10 pr-11"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">Confirm Password</label>
              <input
                id="register-confirm"
                type="password"
                className={`input-cyber ${
                  form.confirm && form.confirm !== form.password ? 'border-red-500/50' : ''
                }`}
                placeholder="Repeat password"
                value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                required
                autoComplete="new-password"
              />
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs text-red-400 font-mono mt-1">Passwords don't match</p>
              )}
            </div>

            <button
              type="submit"
              id="register-submit"
              disabled={loading || (form.confirm && form.confirm !== form.password)}
              className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-mono font-bold text-sm transition-all mt-2"
              style={{ background: '#a855f7', color: 'white', opacity: loading ? 0.8 : 1 }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Start Hacking
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm font-mono mt-6">
            Already hacking?{' '}
            <Link to="/login" className="text-neon-green hover:text-white transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
