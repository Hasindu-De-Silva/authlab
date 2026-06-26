import { useState, useEffect } from 'react'
import { getLeaderboard } from '../api/challenges'
import { Trophy, Medal, Zap, Shield, TrendingUp } from 'lucide-react'

function RankBadge({ rank }) {
  if (rank === 1) return <div className="text-2xl">🥇</div>
  if (rank === 2) return <div className="text-2xl">🥈</div>
  if (rank === 3) return <div className="text-2xl">🥉</div>
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-bold text-gray-500"
      style={{ background: 'rgba(255,255,255,0.05)' }}>
      {rank}
    </div>
  )
}

export default function Leaderboard() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getLeaderboard()
        setData(res.data)
      } catch {
        // Fallback demo data
        setData([
          { rank: 1, username: 'h4x0r_pro', xp: 2500, solved: 5, badge: 'Elite Hacker' },
          { rank: 2, username: 'sec_ninja', xp: 2100, solved: 5, badge: 'Auth Master' },
          { rank: 3, username: 'byte_breaker', xp: 1800, solved: 4, badge: 'Defender' },
          { rank: 4, username: 'crypto_king', xp: 1500, solved: 4, badge: 'Defender' },
          { rank: 5, username: 'pentest_pro', xp: 1200, solved: 3, badge: 'Apprentice' },
          { rank: 6, username: 'vuln_hunter', xp: 1000, solved: 3, badge: 'Apprentice' },
          { rank: 7, username: 'jwt_jockey', xp: 800, solved: 2, badge: 'Novice' },
          { rank: 8, username: 'sql_slayer', xp: 600, solved: 2, badge: 'Novice' },
        ])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)' }}>
            <Trophy className="w-8 h-8 text-neon-yellow" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">
            <span className="text-neon-yellow glow-blue">Leaderboard</span>
          </h1>
          <p className="text-gray-500 font-mono">Top hackers ranked by XP earned</p>
        </div>

        {/* Top 3 podium */}
        {!loading && data.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd place */}
            <div className="glass-card rounded-xl p-5 text-center flex flex-col items-center justify-end mt-8"
              style={{ borderColor: 'rgba(192,192,192,0.3)' }}>
              <div className="text-3xl mb-2">🥈</div>
              <div className="font-mono font-bold text-white text-sm">{data[1].username}</div>
              <div className="text-gray-500 text-xs font-mono mt-1">{data[1].xp} XP</div>
              <div className="mt-2 h-16 w-full rounded-lg"
                style={{ background: 'linear-gradient(to top, rgba(192,192,192,0.2), transparent)' }} />
            </div>

            {/* 1st place */}
            <div className="glass-card rounded-xl p-5 text-center flex flex-col items-center"
              style={{ borderColor: 'rgba(255,215,0,0.4)', boxShadow: '0 0 30px rgba(255,215,0,0.15)' }}>
              <div className="text-4xl mb-2">🥇</div>
              <div className="font-mono font-bold text-neon-yellow text-base">{data[0].username}</div>
              <div className="text-gray-400 text-sm font-mono mt-1">{data[0].xp} XP</div>
              <div className="text-xs font-mono text-gray-600 mt-1">{data[0].solved}/5 solved</div>
              <div className="mt-2 h-24 w-full rounded-lg"
                style={{ background: 'linear-gradient(to top, rgba(255,215,0,0.15), transparent)' }} />
            </div>

            {/* 3rd place */}
            <div className="glass-card rounded-xl p-5 text-center flex flex-col items-center justify-end mt-12"
              style={{ borderColor: 'rgba(205,127,50,0.3)' }}>
              <div className="text-3xl mb-2">🥉</div>
              <div className="font-mono font-bold text-white text-sm">{data[2].username}</div>
              <div className="text-gray-500 text-xs font-mono mt-1">{data[2].xp} XP</div>
              <div className="mt-2 h-10 w-full rounded-lg"
                style={{ background: 'linear-gradient(to top, rgba(205,127,50,0.2), transparent)' }} />
            </div>
          </div>
        )}

        {/* Full table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="border-b border-dark-border px-6 py-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-neon-green" />
            <span className="text-white font-semibold font-mono text-sm">All Rankings</span>
          </div>

          {loading ? (
            <div className="p-8 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-dark-border">
              {data.map((entry) => (
                <div key={entry.rank}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors ${
                    entry.rank <= 3 ? 'bg-white/[0.02]' : ''
                  }`}>
                  <div className="flex-shrink-0 w-10 flex justify-center">
                    <RankBadge rank={entry.rank} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white truncate">{entry.username}</span>
                      {entry.badge && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)' }}>
                          {entry.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-mono text-gray-600 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {entry.solved || 0}/5 solved
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Zap className="w-4 h-4 text-neon-yellow" />
                    <span className="font-mono font-bold text-neon-yellow text-lg">{entry.xp}</span>
                    <span className="text-gray-600 text-xs font-mono">XP</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
