import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getChallenge, getHint, submitAttack, validateDefender, completeChallenge } from '../api/challenges'
import AttackPanel from '../components/AttackPanel'
import DefenderMode from '../components/DefenderMode'
import { toast } from 'react-hot-toast'
import {
  ArrowLeft, Shield, Terminal, Code, Lightbulb,
  ChevronDown, ChevronUp, CheckCircle, Target
} from 'lucide-react'

export default function Challenge() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [challenge, setChallenge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('attack') // 'attack' | 'defend'
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
      const res = await getHint(id, level)
      setHintsRevealed(prev => [...prev, level])
      toast(`💡 Hint ${level} revealed`, { icon: '💡' })
    } catch {}
  }

  const handleAttackResult = async (result) => {
    setAttackResult(result)
    if (result.success) {
      setSolved(true)
      try {
        await completeChallenge(id, { hintsUsed: hintsRevealed.length })
      } catch {}
      toast.success(`🎉 Challenge solved! +${challenge.xp} XP`, { duration: 5000 })
    }
  }

  if (loading) {
    return (
      <div className="pt-24 flex items-center justify-center min-h-screen">
        <div className="text-neon-green font-mono animate-pulse">Loading challenge...</div>
      </div>
    )
  }

  if (!challenge) return null

  const diffColors = {
    beginner: { text: 'text-neon-green', bg: 'rgba(0,255,136,0.1)', border: 'rgba(0,255,136,0.3)' },
    intermediate: { text: 'text-neon-yellow', bg: 'rgba(255,215,0,0.1)', border: 'rgba(255,215,0,0.3)' },
    advanced: { text: 'text-neon-red', bg: 'rgba(255,68,68,0.1)', border: 'rgba(255,68,68,0.3)' },
  }
  const dc = diffColors[challenge.difficulty] || diffColors.beginner

  return (
    <div className="pt-16 min-h-screen">
      {/* Header */}
      <div className="border-b border-dark-border bg-dark-card/50 backdrop-blur-xl sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-3 flex-1 flex-wrap">
              <span className="text-gray-600 font-mono text-sm">#{String(challenge.id).padStart(2, '0')}</span>
              <h1 className="text-white font-bold text-lg">{challenge.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold uppercase"
                style={{ color: dc.text.replace('text-', ''), background: dc.bg, border: `1px solid ${dc.border}` }}>
                {challenge.difficulty}
              </span>
              {solved && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-neon-green"
                  style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)' }}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  SOLVED
                </span>
              )}
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => setMode('attack')}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-mono transition-all ${
                  mode === 'attack'
                    ? 'bg-neon-green/10 text-neon-green border-r border-neon-green/20'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                Attack
              </button>
              <button
                onClick={() => setMode('defend')}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-mono transition-all ${
                  mode === 'defend'
                    ? 'bg-neon-purple/10 text-neon-purple'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Defend
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left sidebar — challenge info */}
          <div className="space-y-4">
            {/* Description */}
            <div className="glass-card rounded-xl p-5">
              <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-neon-green" />
                Challenge Brief
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">{challenge.description}</p>

              <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}>
                <div className="text-xs font-mono text-gray-500 mb-1">Auth Flaw</div>
                <div className="text-neon-blue font-mono text-sm font-semibold">{challenge.flaw}</div>
              </div>

              <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.15)' }}>
                <div className="text-xs font-mono text-gray-500 mb-1">You'll Learn</div>
                <div className="text-neon-purple font-mono text-sm">{challenge.learning}</div>
              </div>
            </div>

            {/* XP reward */}
            <div className="glass-card rounded-xl p-4 flex items-center gap-3">
              <div className="text-2xl">⚡</div>
              <div>
                <div className="text-white font-bold font-mono">{challenge.xp} XP</div>
                <div className="text-gray-600 text-xs">Reward for solving</div>
              </div>
              {solved && (
                <div className="ml-auto text-neon-green text-xs font-mono">+{challenge.xp} EARNED</div>
              )}
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
          </div>

          {/* Main panel */}
          <div className="lg:col-span-2">
            {mode === 'attack' ? (
              <AttackPanel
                challenge={challenge}
                onResult={handleAttackResult}
                solved={solved}
                attackResult={attackResult}
              />
            ) : (
              <DefenderMode challenge={challenge} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
