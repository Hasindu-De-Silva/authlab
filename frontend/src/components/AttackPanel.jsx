import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitAttack } from '../api/challenges'
import { toast } from 'react-hot-toast'
import { Send, RotateCcw, CheckCircle, XCircle, Terminal, Eye, EyeOff, BookOpen, AlertCircle } from 'lucide-react'

// Challenge-specific attack UI configs
const ATTACK_FORMS = {
  1: {
    title: 'Hash Cracker',
    description: 'The system stores passwords as MD5 hashes. Try to crack the hash below by submitting a plain-text password that matches.',
    fields: [
      { name: 'username', label: 'Username', placeholder: 'e.g. admin', type: 'text' },
      { name: 'password', label: 'Password Guess', placeholder: 'Try common passwords...', type: 'text' },
    ],
    target: { label: 'Target Hash (MD5)', value: '5f4dcc3b5aa765d61d8327deb882cf99' },
    hint: 'This is the MD5 hash of a very common password...',
  },
  2: {
    title: 'Brute Force Login',
    description: 'No rate limiting! The login endpoint accepts unlimited attempts. Try to brute force the admin account.',
    fields: [
      { name: 'username', label: 'Username', placeholder: 'admin', type: 'text' },
      { name: 'password', label: 'Password', placeholder: 'Try: password, 123456, admin...', type: 'text' },
    ],
    hint: 'Try "admin" as username with common passwords like "password123"',
  },
  3: {
    title: 'JWT Token Forge',
    description: 'The JWT is signed with a weak secret. Decode it, modify the payload, re-sign with "secret123" and submit.',
    fields: [
      { name: 'token', label: 'Forged JWT Token', placeholder: 'Paste your forged JWT here...', type: 'textarea' },
    ],
    target: {
      label: 'Sample JWT (weak secret: "secret123")',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imd1ZXN0Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MTk0MDAwMDB9.UGFzc3dvcmQxMjM'
    },
    hint: 'Use jwt.io to modify the payload: set role to "admin", re-sign with HS256 and secret "secret123"',
  },
  4: {
    title: 'OTP Bypass',
    description: 'The OTP is generated using a timestamp-based predictable algorithm. Predict the current OTP.',
    fields: [
      { name: 'username', label: 'Username', placeholder: 'victim@example.com', type: 'text' },
      { name: 'otp', label: 'Predicted OTP', placeholder: 'Enter your predicted 6-digit OTP', type: 'text' },
    ],
    hint: 'The OTP is: (current Unix timestamp / 30) % 1000000 — calculate it now!',
  },
  5: {
    title: 'Session Hijack',
    description: 'The session cookie is sent without HttpOnly or Secure flags. Intercept and replay the session.',
    fields: [
      { name: 'sessionId', label: 'Hijacked Session ID', placeholder: 'Paste intercepted session cookie value...', type: 'text' },
    ],
    target: { label: 'Exposed Cookie (from victim login)', value: 'SESSION=victim_sess_abc123def456; Path=/' },
    hint: 'Copy the SESSION value from the "Intercepted Cookie" above and submit it here',
  },
}

function ResponseViewer({ result, onGoInstructions }) {
  if (!result) {
    return (
      <div className="mt-4 rounded-xl p-4 flex items-start gap-3 cursor-pointer group"
        style={{ background: 'rgba(0,212,255,0.04)', border: '1px dashed rgba(0,212,255,0.2)' }}
        onClick={onGoInstructions}>
        <BookOpen className="w-4 h-4 text-neon-blue flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-neon-blue text-xs font-mono font-semibold mb-0.5">Not sure where to start?</div>
          <div className="text-gray-600 text-xs font-mono">Read the Instructions tab for a step-by-step guide ↗</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`terminal-window rounded-xl mt-4 overflow-hidden ${
      result.success ? 'border-neon-green/30' : 'border-red-500/30'
    }`} style={{ border: `1px solid ${result.success ? 'rgba(0,255,136,0.3)' : 'rgba(255,68,68,0.3)'}` }}>
      <div className="terminal-header">
        <div className={`terminal-dot ${result.success ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <div className="terminal-dot bg-yellow-500" />
        <div className="terminal-dot bg-gray-600" />
        <span className="ml-3 text-gray-500 text-xs font-mono">Server Response</span>
        <span className={`ml-auto text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
          result.success
            ? 'text-neon-green bg-neon-green/10 border border-neon-green/20'
            : 'text-red-400 bg-red-400/10 border border-red-400/20'
        }`}>
          HTTP {result.statusCode || (result.success ? '200 OK' : '401 Unauthorized')}
        </span>
      </div>
      <div className="p-4">
        {result.success ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-neon-green font-mono text-sm font-bold">
              <CheckCircle className="w-5 h-5" />
              ATTACK SUCCESSFUL
            </div>
            <p className="text-gray-300 font-mono text-xs leading-relaxed border-l-2 border-neon-green/30 pl-3">
              {result.message}
            </p>
            {result.data && (
              <div>
                <div className="text-xs font-mono text-gray-600 mb-1.5">Response data:</div>
                <pre className="text-xs text-gray-300 bg-dark-bg/60 rounded-lg p-3 overflow-auto code-scroll">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
            <div className="text-xs font-mono text-neon-green/60 border-t border-dark-border pt-2">
              → Switch to Defender Mode to learn how to fix this vulnerability
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-mono text-sm font-bold">
              <XCircle className="w-4 h-4" />
              {result.message || 'Attack failed — try a different approach'}
            </div>
            {result.hint && (
              <div className="mt-2 flex items-start gap-2 p-3 rounded-lg"
                style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)' }}>
                <AlertCircle className="w-3.5 h-3.5 text-neon-yellow flex-shrink-0 mt-0.5" />
                <span className="text-neon-yellow text-xs font-mono leading-relaxed">{result.hint}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AttackPanel({ challenge, onResult, solved, attackResult, onGoInstructions }) {
  const config = ATTACK_FORMS[challenge.id] || ATTACK_FORMS[1]
  const [fields, setFields] = useState({})
  const [loading, setLoading] = useState(false)
  const [showTarget, setShowTarget] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (solved) return
    setLoading(true)
    try {
      const res = await submitAttack(challenge.id, fields)
      onResult(res.data)
    } catch (err) {
      const errData = err.response?.data
      onResult({
        success: false,
        message: errData?.message || 'Attack failed. Try a different approach.',
        hint: errData?.hint,
        statusCode: err.response?.status,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFields({})
    onResult && onResult(null)
  }

  return (
    <div className="space-y-4">
      {/* Target info */}
      {config.target && (
        <div className="glass-card rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            onClick={() => setShowTarget(!showTarget)}
          >
            <span className="text-sm font-mono text-gray-400 flex items-center gap-2">
              <Eye className="w-4 h-4 text-neon-blue" />
              {config.target.label}
            </span>
            {showTarget ? <EyeOff className="w-4 h-4 text-gray-600" /> : <Eye className="w-4 h-4 text-gray-600" />}
          </button>
          {showTarget && (
            <div className="border-t border-dark-border p-4">
              <code className="text-neon-blue font-mono text-sm break-all leading-relaxed">
                {config.target.value}
              </code>
            </div>
          )}
        </div>
      )}

      {/* Attack form */}
      <div className="terminal-window rounded-xl overflow-hidden">
        <div className="terminal-header">
          <div className="terminal-dot bg-red-500" />
          <div className="terminal-dot bg-yellow-500" />
          <div className="terminal-dot bg-green-500" />
          <span className="ml-3 text-gray-400 text-sm font-mono font-semibold">{config.title}</span>
          {solved && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-neon-green font-mono">
              <CheckCircle className="w-3.5 h-3.5" />
              Solved
            </span>
          )}
        </div>

        <div className="p-5">
          <p className="text-gray-500 text-sm font-mono leading-relaxed mb-5 border-l-2 border-neon-green/30 pl-3">
            {config.description}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {config.fields.map(field => (
              <div key={field.name}>
                <label className="block text-xs font-mono text-gray-500 mb-1.5 uppercase tracking-wider">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    className="input-cyber resize-none h-24 code-scroll"
                    placeholder={field.placeholder}
                    value={fields[field.name] || ''}
                    onChange={e => setFields(prev => ({ ...prev, [field.name]: e.target.value }))}
                    disabled={solved}
                  />
                ) : (
                  <input
                    type={field.type}
                    className="input-cyber"
                    placeholder={field.placeholder}
                    value={fields[field.name] || ''}
                    onChange={e => setFields(prev => ({ ...prev, [field.name]: e.target.value }))}
                    disabled={solved}
                  />
                )}
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || solved}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono font-semibold text-sm transition-all duration-300 ${
                  solved
                    ? 'bg-neon-green/10 text-neon-green border border-neon-green/20 cursor-not-allowed'
                    : loading
                    ? 'bg-neon-green/20 text-neon-green cursor-wait'
                    : 'btn-solid-green hover:shadow-neon'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Attacking...
                  </>
                ) : solved ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Challenge Solved!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Launch Attack
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-lg font-mono text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-colors border border-dark-border"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Response */}
      <ResponseViewer result={attackResult} onGoInstructions={onGoInstructions} />
    </div>
  )
}
