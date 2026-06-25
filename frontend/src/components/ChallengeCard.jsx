import { useNavigate } from 'react-router-dom'
import { Lock, CheckCircle, Clock, Zap, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const DIFFICULTY_CONFIG = {
  beginner: { label: 'Beginner', class: 'badge-beginner', glowColor: '0,255,136' },
  intermediate: { label: 'Intermediate', class: 'badge-intermediate', glowColor: '255,215,0' },
  advanced: { label: 'Advanced', class: 'badge-advanced', glowColor: '255,107,107' },
}

const CATEGORY_ICONS = {
  hashing: '🔓',
  bruteforce: '⚡',
  jwt: '🔑',
  otp: '📱',
  session: '🍪',
}

export default function ChallengeCard({ challenge, solved, delay = 0 }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const diff = DIFFICULTY_CONFIG[challenge.difficulty] || DIFFICULTY_CONFIG.beginner

  const handleClick = () => {
    if (!user) {
      navigate('/login')
    } else {
      navigate(`/challenge/${challenge.id}`)
    }
  }

  return (
    <div
      className={`glass-card rounded-xl p-5 cursor-pointer group transition-all duration-300 relative overflow-hidden
        hover:scale-[1.02] hover:shadow-2xl
        ${solved ? 'status-solved' : ''}
      `}
      style={{
        animationDelay: `${delay}ms`,
        borderColor: solved ? 'rgba(0,255,136,0.2)' : 'rgba(26,38,64,1)',
        boxShadow: solved
          ? `0 0 20px rgba(0,255,136,0.08), 0 4px 30px rgba(0,0,0,0.4)`
          : '0 4px 30px rgba(0,0,0,0.4)',
      }}
      onClick={handleClick}
    >
      {/* Solved overlay */}
      {solved && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-mono text-neon-green"
          style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)' }}>
          <CheckCircle className="w-3 h-3" />
          SOLVED
        </div>
      )}

      {/* Challenge number */}
      <div className="absolute top-3 left-3 text-xs font-mono text-gray-600">
        #{String(challenge.id).padStart(2, '0')}
      </div>

      {/* Content */}
      <div className="mt-6">
        <div className="text-4xl mb-3">
          {CATEGORY_ICONS[challenge.category] || '🔒'}
        </div>

        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-white font-bold text-lg leading-tight group-hover:text-neon-green transition-colors duration-200">
            {challenge.name}
          </h3>
        </div>

        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
          {challenge.description}
        </p>

        {/* Flaw tag */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-mono text-gray-600">Flaw:</span>
          <span className="text-xs font-mono text-neon-blue px-2 py-0.5 rounded"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            {challenge.flaw}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-dark-border">
          <div className="flex items-center gap-3">
            <span className={diff.class}>{diff.label}</span>
            <div className="flex items-center gap-1 text-xs font-mono text-gray-600">
              <Zap className="w-3 h-3 text-neon-yellow" />
              {challenge.xp} XP
            </div>
          </div>

          <div className={`flex items-center gap-1 text-xs font-mono transition-all duration-200
            ${solved ? 'text-neon-green' : 'text-gray-600 group-hover:text-neon-green group-hover:translate-x-1'}`}>
            {solved ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Complete
              </>
            ) : user ? (
              <>
                Attack
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                Login to Attack
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hover glow line */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 w-0 group-hover:w-full transition-all duration-500`}
        style={{ background: `linear-gradient(90deg, transparent, rgba(${diff.glowColor},0.7), transparent)` }} />
    </div>
  )
}
