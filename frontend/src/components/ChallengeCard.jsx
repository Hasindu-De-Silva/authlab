import { useNavigate } from 'react-router-dom'
import { CheckCircle, ChevronRight, Lock, Zap, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const DIFF_CONFIG = {
  beginner:     { label: 'Beginner',     color: '#00ff88', rgb: '0,255,136',   barColor: '#00ff88' },
  intermediate: { label: 'Intermediate', color: '#ffd700', rgb: '255,215,0',   barColor: '#ffd700' },
  advanced:     { label: 'Advanced',     color: '#ff6b6b', rgb: '255,107,107', barColor: '#ff6b6b' },
}

const CATEGORY_META = {
  hashing:    { icon: '🔓', label: 'Hash Cracking',   color: '#00ff88', rgb: '0,255,136'   },
  bruteforce: { icon: '⚡', label: 'Brute Force',     color: '#00d4ff', rgb: '0,212,255'   },
  jwt:        { icon: '🔑', label: 'JWT Forgery',     color: '#a855f7', rgb: '168,85,247'  },
  otp:        { icon: '📱', label: '2FA Bypass',      color: '#ffd700', rgb: '255,215,0'   },
  session:    { icon: '🍪', label: 'Session Hijack',  color: '#ff6b6b', rgb: '255,107,107' },
}

export default function ChallengeCard({ challenge, solved, delay = 0 }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const diff = DIFF_CONFIG[challenge.difficulty] || DIFF_CONFIG.beginner
  const cat  = CATEGORY_META[challenge.category]  || { icon: '🔒', label: 'Security', color: '#00ff88', rgb: '0,255,136' }

  const handleClick = () => navigate(user ? `/challenge/${challenge.id}` : '/login')

  return (
    <div
      onClick={handleClick}
      className="glass-card rounded-xl cursor-pointer group relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        animationDelay: `${delay}ms`,
        borderColor: solved ? 'rgba(0,255,136,0.25)' : 'rgba(26,38,64,1)',
        boxShadow: solved
          ? '0 0 25px rgba(0,255,136,0.08), 0 8px 32px rgba(0,0,0,0.4)'
          : '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Glow bg on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
        style={{ background: `radial-gradient(circle at 50% 0%, rgba(${cat.rgb},0.06) 0%, transparent 70%)` }} />

      {/* Top accent bar */}
      <div className="h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-t-xl"
        style={{ background: `linear-gradient(90deg, ${cat.color}, ${diff.color})` }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          {/* Category icon */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: `rgba(${cat.rgb},0.1)`, border: `1px solid rgba(${cat.rgb},0.2)` }}>
            {cat.icon}
          </div>

          {/* Challenge number + solved badge */}
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-xs font-mono text-gray-600 font-bold">
              #{String(challenge.id).padStart(2, '0')}
            </span>
            {solved ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono text-neon-green"
                style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.25)' }}>
                <CheckCircle className="w-3 h-3" />
                Solved
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase"
                style={{ color: diff.color, background: `rgba(${diff.rgb},0.1)`, border: `1px solid rgba(${diff.rgb},0.25)` }}>
                {diff.label}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-white font-bold text-lg leading-tight mb-1 group-hover:text-neon-green transition-colors duration-200">
          {challenge.name}
        </h3>

        {/* Category label */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xs font-mono font-semibold" style={{ color: cat.color }}>{cat.label}</span>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
          {challenge.description}
        </p>

        {/* Flaw chip */}
        <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={{ background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.18)' }}>
          <Shield className="w-3 h-3 text-neon-blue" />
          <span className="text-xs font-mono text-neon-blue">{challenge.flaw}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-dark-border">
          <div className="flex items-center gap-1.5 text-xs font-mono text-neon-yellow">
            <Zap className="w-3.5 h-3.5" />
            <span className="font-bold">{challenge.xp}</span>
            <span className="text-gray-600">XP</span>
          </div>

          <div className={`flex items-center gap-1.5 text-xs font-mono transition-all duration-200
            ${solved
              ? 'text-neon-green'
              : 'text-gray-600 group-hover:text-neon-green group-hover:translate-x-0.5'
            }`}>
            {solved ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Completed
              </>
            ) : user ? (
              <>
                Start Challenge
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" />
                Login to Start
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
