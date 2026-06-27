import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ChallengeCard from '../components/ChallengeCard'
import { getChallenges, getProgress } from '../api/challenges'
import {
  Shield, Terminal, Zap, Lock, AlertTriangle, ChevronRight,
  Users, BookOpen, Award, TrendingUp
} from 'lucide-react'

const HERO_LINES = [
  '> Initializing AuthLab Security Sandbox...',
  '> Loading vulnerable authentication systems...',
  '> Sandboxing per-user attack sessions...',
  '> Challenges ready. Begin your attack.',
  '> Good luck, hacker. 🔓',
]

function TerminalHero() {
  const [lines, setLines] = useState([])
  const [currentLine, setCurrentLine] = useState(0)
  const [currentChar, setCurrentChar] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (currentLine >= HERO_LINES.length) { setDone(true); return }
    const line = HERO_LINES[currentLine]
    if (currentChar < line.length) {
      const t = setTimeout(() => {
        setLines(prev => {
          const copy = [...prev]
          copy[currentLine] = (copy[currentLine] || '') + line[currentChar]
          return copy
        })
        setCurrentChar(c => c + 1)
      }, 28)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setCurrentLine(l => l + 1)
        setCurrentChar(0)
      }, 350)
      return () => clearTimeout(t)
    }
  }, [currentLine, currentChar])

  return (
    <div className="terminal-window rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(0,229,255,0.2)', boxShadow: '0 0 40px rgba(0,229,255,0.06)' }}>
      <div className="terminal-header">
        <div className="terminal-dot bg-red-500" />
        <div className="terminal-dot bg-yellow-500" />
        <div className="terminal-dot" style={{ background: '#00e5ff' }} />
        <span className="ml-3 text-gray-500 text-xs font-mono">authlab ~ bash</span>
        <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded" style={{ color: '#00e5ff', background: 'rgba(0,229,255,0.08)' }}>LIVE</span>
      </div>
      <div className="p-5 min-h-[160px]">
        {lines.map((line, i) => (
          <div key={i} className={`font-mono text-sm mb-1`}>
            <span style={{ color: i === lines.length - 1 && !done ? '#00e5ff' : i < 4 ? '#2979ff' : '#00e5ff' }}>{line}</span>
            {i === currentLine && !done && (
              <span className="animate-pulse ml-0.5" style={{ color: '#00e5ff' }}>█</span>
            )}
          </div>
        ))}
        {done && (
          <div className="mt-3 flex items-center gap-2">
            <span className="font-mono text-sm" style={{ color: '#00e5ff' }}>$ </span>
            <span className="text-gray-300 font-mono text-sm cursor-blink">choose your target</span>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="glass-card p-5 rounded-xl flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `rgba(${color},0.1)`, border: `1px solid rgba(${color},0.3)` }}>
        <Icon className="w-6 h-6" style={{ color: `rgb(${color})` }} />
      </div>
      <div>
        <div className="text-2xl font-bold text-white font-mono">{value}</div>
        <div className="text-gray-500 text-sm mt-0.5">{label}</div>
      </div>
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [progress, setProgress] = useState({})
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [challRes] = await Promise.all([getChallenges()])
        setChallenges(challRes.data)
        if (user) {
          try {
            const progRes = await getProgress()
            setProgress(progRes.data || {})
          } catch {}
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const filtered = filter === 'all'
    ? challenges
    : challenges.filter(c => c.difficulty === filter)

  const solved = Object.values(progress).filter(Boolean).length

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hex-pattern opacity-50" />
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-5 blur-3xl"
          style={{ background: 'radial-gradient(circle, #00ff88, transparent)' }} />
        <div className="absolute bottom-0 left-20 w-64 h-64 rounded-full opacity-5 blur-3xl"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono"
                style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)' }}>
                <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                <span className="text-neon-green">Interactive Security Learning</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-black leading-tight">
                <span className="text-white">Break It.</span>
                <br />
                <span className="text-white">Fix It.</span>
                <br />
                <span className="text-neon-green glow-green">Learn It.</span>
              </h1>

              <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                Attack real, sandboxed authentication systems. Exploit MD5 hashing, bypass rate limits,
                forge JWT tokens — then learn exactly how to defend against each attack.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                {user ? (
                  <a href="#challenges" className="btn-solid-green flex items-center justify-center gap-2 rounded-xl py-3 px-6 text-base font-bold transition-all">
                    <Terminal className="w-5 h-5" />
                    Continue Hacking
                    <ChevronRight className="w-4 h-4" />
                  </a>
                ) : (
                  <>
                    <Link to="/register" className="btn-solid-green flex items-center justify-center gap-2 rounded-xl py-3 px-6 text-base font-bold transition-all">
                      <Zap className="w-5 h-5" />
                      Start for Free
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link to="/login" className="btn-neon-green flex items-center justify-center gap-2 rounded-xl py-3 px-6 text-base transition-all">
                      <Lock className="w-5 h-5" />
                      Sign In
                    </Link>
                  </>
                )}
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-6 pt-2">
                {[
                  { label: '5 Challenges', color: 'text-neon-green' },
                  { label: 'Real Exploits', color: 'text-neon-blue' },
                  { label: 'Defender Mode', color: 'text-neon-purple' },
                ].map(({ label, color }) => (
                  <div key={label} className={`flex items-center gap-1.5 text-sm font-mono ${color}`}>
                    <span>●</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Terminal */}
            <div className="animate-float">
              <TerminalHero />

              {/* Challenge preview cards */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { label: 'Hash Crack', icon: '🔓', color: '#00ff88' },
                  { label: 'Brute Force', icon: '⚡', color: '#00d4ff' },
                  { label: 'JWT Forge', icon: '🔑', color: '#a855f7' },
                ].map(({ label, icon, color }) => (
                  <div key={label} className="glass-card p-3 rounded-lg text-center"
                    style={{ borderColor: `${color}20` }}>
                    <div className="text-xl mb-1">{icon}</div>
                    <div className="text-xs font-mono" style={{ color }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      {user && (
        <section className="border-y border-dark-border bg-dark-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Award} value={`${solved}/${challenges.length}`} label="Challenges Solved" color="0,255,136" />
              <StatCard icon={TrendingUp} value={`${user.xp || 0} XP`} label="Experience Points" color="0,212,255" />
              <StatCard icon={BookOpen} value={challenges.length} label="Total Challenges" color="168,85,247" />
              <StatCard icon={Users} value="∞" label="Sandbox Sessions" color="255,215,0" />
            </div>
          </div>
        </section>
      )}

      {/* Challenges grid */}
      <section id="challenges" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-black text-white">
              Security <span className="text-neon-green glow-green">Challenges</span>
            </h2>
            <p className="text-gray-500 mt-1 font-mono text-sm">
              {challenges.length} vulnerabilities waiting to be exploited
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {['all', 'beginner', 'intermediate', 'advanced'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-200 ${
                  filter === f
                    ? 'bg-neon-green text-dark-bg'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-card rounded-xl h-56 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((challenge, i) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                solved={!!progress[challenge.id]}
                delay={i * 80}
              />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="border-t border-dark-border bg-dark-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-black text-center text-white mb-12">
            How <span className="text-neon-green glow-green">AuthLab</span> Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: '🎯',
                title: 'Choose a Challenge',
                desc: 'Pick a vulnerability — from basic MD5 hash cracking to JWT token forgery. Each challenge is isolated in its own sandbox.',
                color: '#00ff88',
              },
              {
                step: '02',
                icon: '⚡',
                title: 'Attack the System',
                desc: 'Use the built-in attack interface to exploit the vulnerability. Watch the system respond in real time as your attack succeeds.',
                color: '#00d4ff',
              },
              {
                step: '03',
                icon: '🛡️',
                title: 'Fix & Defend',
                desc: 'Switch to Defender Mode. Patch the vulnerable code, see a secure comparison, and understand exactly how to prevent the attack.',
                color: '#a855f7',
              },
            ].map(({ step, icon, title, desc, color }) => (
              <div key={step} className="glass-card p-6 rounded-xl relative group hover:scale-[1.02] transition-transform duration-300">
                <div className="text-5xl font-black font-mono mb-4 opacity-10 absolute top-4 right-6" style={{ color }}>
                  {step}
                </div>
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                <div className="mt-4 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="glass-card neon-border-green rounded-2xl p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 hex-pattern opacity-30" />
            <div className="relative">
              <Shield className="w-12 h-12 text-neon-green mx-auto mb-4 animate-float" />
              <h2 className="text-3xl font-black text-white mb-3">
                Ready to Start Hacking?
              </h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Create your free account and start exploiting vulnerabilities in seconds.
                No setup required.
              </p>
              <Link to="/register" className="inline-flex items-center gap-2 btn-solid-green rounded-xl py-3 px-8 text-base font-bold transition-all">
                <Terminal className="w-5 h-5" />
                Create Free Account
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-dark-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-neon-green" />
            <span className="text-gray-500 font-mono text-sm">AuthLab © 2025</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-600 font-mono text-xs">For educational purposes only. All attacks run in an isolated sandbox.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
