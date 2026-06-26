import { useState } from 'react'
import { submitAttack } from '../api/challenges'
import { toast } from 'react-hot-toast'
import { Send, RotateCcw, CheckCircle, XCircle, Terminal, Eye, EyeOff } from 'lucide-react'

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

function ResponseViewer({ result }) {
  if (!result) return null

  return (
    <div className={`terminal-window rounded-xl mt-4 overflow-hidden border ${
      result.success
        ? 'border-neon-green/30'
        : 'border-red-500/30'
    }`}>
      <div className="terminal-header">
        <div className={`terminal-dot ${result.success ? 'bg-green-500' : 'bg-red-500'}`} />
        <div className="terminal-dot bg-yellow-500" />
        <div className="terminal-dot bg-gray-600" />
        <span className="ml-3 text-gray-500 text-xs font-mono">Server Response</span>
        <span className={`ml-auto text-xs font-mono px-2 py-0.5 rounded ${
          result.success ? 'text-neon-green bg-neon-green/10' : 'text-red-400 bg-red-400/10'
        }`}>
          {result.statusCode || (result.success ? 200 : 401)}
        </span>
      </div>
      <div className="p-4">
        {result.success ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-neon-green font-mono text-sm">
              <CheckCircle className="w-4 h-4" />
              <span className="font-bold">ATTACK SUCCESSFUL</span>
            </div>
            <div className="text-gray-400 font-mono text-xs mt-2 leading-relaxed">
              {result.message}
            </div>
            {result.data && (
              <pre className="mt-3 text-xs text-gray-300 bg-dark-bg/50 rounded-lg p-3 overflow-auto code-scroll">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-mono text-sm">
              <XCircle className="w-4 h-4" />
              <span className="font-bold">{result.message || 'Attack failed'}</span>
            </div>
            {result.hint && (
              <div className="mt-2 text-gray-500 font-mono text-xs">{result.hint}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AttackPanel({ challenge, onResult, solved, attackResult }) {
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
      <ResponseViewer result={attackResult} />
    </div>
  )
}
