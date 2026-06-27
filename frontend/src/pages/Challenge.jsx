import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getChallenge, getHint, submitAttack, validateDefender, completeChallenge } from '../api/challenges'
import AttackPanel from '../components/AttackPanel'
import DefenderMode from '../components/DefenderMode'
import InstructionsPanel from '../components/InstructionsPanel'
import { toast } from 'react-hot-toast'
import {
  ArrowLeft, Shield, Terminal, Code, Lightbulb,
  ChevronDown, ChevronUp, CheckCircle, Target, BookOpen, Zap
} from 'lucide-react'

const DIFF_CONFIG = {
  beginner:     { color: '#00ff88', rgb: '0,255,136',   bg: 'rgba(0,255,136,0.1)',   border: 'rgba(0,255,136,0.3)'   },
  intermediate: { color: '#ffd700', rgb: '255,215,0',   bg: 'rgba(255,215,0,0.1)',   border: 'rgba(255,215,0,0.3)'   },
  advanced:     { color: '#ff6b6b', rgb: '255,107,107', bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.3)' },
}

const MODES = [
  { id: 'instructions', label: 'Instructions', icon: BookOpen,  color: '#00d4ff' },
  { id: 'attack',       label: 'Attack',       icon: Target,    color: '#00ff88' },
  { id: 'defend',       label: 'Defend',       icon: Shield,    color: '#a855f7' },
]

export default function Challenge() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [challenge, setChallenge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('instructions') // default → Instructions
  const [solved, setSolved] = useState(false)
  const [hintsRevealed, setHintsRevealed] = useState([])
  const [showHints, setShowHints] = useState(false)
  const [attackResult, setAttackResult] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getChallenge(id)
        setChallenge(res.data)
      } catch {
        toast.error('Challenge not found')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleRevealHint = async (level) => {
    if (hintsRevealed.includes(level)) return
    try {
      await getHint(id, level)
      setHintsRevealed(prev => [...prev, level])
      toast(`💡 Hint ${level} revealed`, { icon: '💡' })
    } catch {}
  }

  const handleAttackResult = async (result) => {
    setAttackResult(result)
    if (result && result.success) {
      setSolved(true)
      try { await completeChallenge(id, { hintsUsed: hintsRevealed.length }) } catch {}
      toast.success(`🎉 Challenge solved! +${challenge.xp} XP`, { duration: 5000 })
    }
  }

  if (loading) {
    return (
      <div className="pt-24 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neon-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-gray-500 font-mono text-sm">Loading challenge...</div>
        </div>
      </div>
    )
  }

  if (!challenge) return null

  const dc = DIFF_CONFIG[challenge.difficulty] || DIFF_CONFIG.beginner
  const catIcons = { hashing: '🔓', bruteforce: '⚡', jwt: '🔑', otp: '📱', session: '🍪' }

  return (
    <div className="pt-16 min-h-screen">
      {/* ── Sticky header ────────────────────────────────────────────── */}
      <div className="border-b border-dark-border bg-dark-card/80 backdrop-blur-xl sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top row */}
          <div className="flex items-center gap-3 py-3 flex-wrap">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-sm font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="w-px h-4 bg-dark-border" />

            <span className="text-xs font-mono text-gray-600">#{String(challenge.id).padStart(2, '0')}</span>
            <span className="text-xl">{catIcons[challenge.category] || '🔒'}</span>
            <h1 className="text-white font-bold text-base">{challenge.name}</h1>

            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase"
              style={{ color: dc.color, background: dc.bg, border: `1px solid ${dc.border}` }}>
              {challenge.difficulty}
            </span>

            {solved && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-neon-green ml-1"
                style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)' }}>
                <CheckCircle className="w-3.5 h-3.5" />
                SOLVED
              </span>
            )}

            <div className="ml-auto flex items-center gap-1.5 text-xs font-mono text-gray-600">
              <Zap className="w-3.5 h-3.5 text-neon-yellow" />
              {challenge.xp} XP
            </div>
          </div>

          {/* Mode tabs */}
          <div className="flex border-t border-dark-border">
            {MODES.map(({ id: modeId, label, icon: Icon, color }) => (
              <button
                key={modeId}
                onClick={() => setMode(modeId)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-mono font-semibold border-b-2 transition-all duration-200 ${
                  mode === modeId
                    ? 'border-current'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
                style={mode === modeId ? { color, borderColor: color } : {}}
              >
                <Icon className="w-4 h-4" />
                {label}
                {modeId === 'instructions' && mode !== 'instructions' && !solved && (
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
                )}
                {modeId === 'attack' && solved && (
                  <CheckCircle className="w-3.5 h-3.5 text-neon-green" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main layout ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left sidebar ─────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Challenge brief */}
            <div className="glass-card rounded-xl p-5">
              <h2 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                <Terminal className="w-4 h-4 text-neon-green" />
                Challenge Brief
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">{challenge.description}</p>

              <div className="mt-4 space-y-2">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}>
                  <div className="text-xs font-mono text-gray-500 mb-1">Auth Flaw</div>
                  <div className="text-neon-blue font-mono text-sm font-semibold">{challenge.flaw}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.15)' }}>
                  <div className="text-xs font-mono text-gray-500 mb-1">You'll Learn</div>
                  <div className="text-neon-purple font-mono text-xs leading-relaxed">{challenge.learning}</div>
                </div>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="glass-card rounded-xl p-4">
              <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3">Your Progress</div>
              <div className="flex items-center gap-3">
                {MODES.map(({ id: modeId, label, icon: Icon, color }) => (
                  <button
                    key={modeId}
                    onClick={() => setMode(modeId)}
                    className="flex-1 flex flex-col items-center gap-1.5 p-2.5 rounded-lg transition-all hover:bg-white/5"
                    style={mode === modeId ? { background: `rgba(${
                      color === '#00d4ff' ? '0,212,255' :
                      color === '#00ff88' ? '0,255,136' : '168,85,247'
                    },0.08)` } : {}}
                  >
                    <Icon className="w-4 h-4" style={{ color: mode === modeId ? color : '#6b7280' }} />
                    <span className="text-xs font-mono" style={{ color: mode === modeId ? color : '#6b7280' }}>
                      {label}
                    </span>
                    {modeId === 'attack' && solved && (
                      <div className="w-4 h-4 rounded-full bg-neon-green/20 flex items-center justify-center">
                        <CheckCircle className="w-2.5 h-2.5 text-neon-green" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Hints */}
            <div className="glass-card rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                onClick={() => setShowHints(!showHints)}
              >
                <span className="flex items-center gap-2 text-sm font-mono text-gray-300">
                  <Lightbulb className="w-4 h-4 text-neon-yellow" />
                  Hints ({hintsRevealed.length}/{challenge.hints?.length || 3} used)
                </span>
                {showHints ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>

              {showHints && (
                <div className="border-t border-dark-border p-4 space-y-2">
                  {(challenge.hints || []).map((hint, i) => (
                    <div key={i}>
                      {hintsRevealed.includes(i + 1) ? (
                        <div className="p-3 rounded-lg text-sm text-gray-300 font-mono"
                          style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)' }}>
                          <span className="text-neon-yellow text-xs block mb-1">Hint {i + 1}</span>
                          {hint}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRevealHint(i + 1)}
                          className="w-full text-left p-3 rounded-lg text-sm font-mono text-gray-600 hover:text-gray-400 transition-colors"
                          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          🔒 Reveal Hint {i + 1}
                          <span className="text-xs ml-2 text-gray-700">(-10 XP)</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* XP reward */}
            <div className="glass-card rounded-xl p-4 flex items-center gap-3">
              <div className="text-2xl">⚡</div>
              <div className="flex-1">
                <div className="text-white font-bold font-mono">{challenge.xp} XP</div>
                <div className="text-gray-600 text-xs">Base reward for solving</div>
              </div>
              {solved && (
                <div className="text-neon-green text-xs font-mono font-bold">EARNED ✓</div>
              )}
            </div>
          </div>

          {/* ── Main panel ───────────────────────────────────────── */}
          <div className="lg:col-span-2">
            {mode === 'instructions' && (
              <InstructionsPanel challenge={challenge} />
            )}
            {mode === 'attack' && (
              <AttackPanel
                challenge={challenge}
                onResult={handleAttackResult}
                solved={solved}
                attackResult={attackResult}
                onGoInstructions={() => setMode('instructions')}
              />
            )}
            {mode === 'defend' && (
              <DefenderMode challenge={challenge} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
