/**
 * AuthLab Database — Pure JavaScript file-based store
 * No native compilation needed. Persists to data.json.
 */
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')
const md5 = require('md5')

const DATA_FILE = path.join(__dirname, 'data.json')

// ── Default data ─────────────────────────────────────────────────
const defaultData = {
  users: [],
  user_progress: [],
  nextUserId: 1,
  nextProgressId: 1,
}

// ── Load / Save ──────────────────────────────────────────────────
function load() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    }
  } catch {}
  return { ...defaultData }
}

function save(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

let _data = load()

// ── Seed challenges (static, never changes) ──────────────────────
const CHALLENGES = [
  {
    id: 1, name: 'Crack the Hash',
    description: "The victim system stores passwords as unsalted MD5 hashes. You've obtained the hash database. Crack admin's password by finding a plaintext that produces the same MD5 hash.",
    category: 'hashing', difficulty: 'beginner',
    flaw: 'MD5 Password Hashing (No Salt)',
    learning: 'Why MD5 is catastrophically insecure for passwords and how bcrypt solves it',
    xp: 150,
    hints: [
      'MD5 is a message digest algorithm, not a password hash.',
      'Try the word "password" — it\'s the most common password ever used.',
      'The MD5 of "password" is 5f4dcc3b5aa765d61d8327deb882cf99',
    ],
  },
  {
    id: 2, name: 'Brute Force Login',
    description: 'This login endpoint has absolutely no rate limiting or account lockout. Hammer it with common passwords until you get in. A real attacker would use a wordlist — just try a few.',
    category: 'bruteforce', difficulty: 'beginner',
    flaw: 'No Rate Limiting / No Account Lockout',
    learning: 'Implementing rate limiting, account lockout, and progressive delays',
    xp: 150,
    hints: [
      "There's no lockout — just keep trying.",
      'Try username "admin" with common passwords.',
      'Password is "password123"',
    ],
  },
  {
    id: 3, name: 'Break the Token',
    description: 'The JWT is signed with the weak secret "secret123". Decode the given token, modify your role to "admin", re-sign it with the same secret, and submit the forged token.',
    category: 'jwt', difficulty: 'intermediate',
    flaw: 'Weak JWT Secret (HS256)',
    learning: 'Why JWT secrets must be cryptographically random and how RS256 eliminates the problem',
    xp: 250,
    hints: [
      'Decode the JWT at jwt.io. What\'s in the payload?',
      'Change "role": "user" to "role": "admin" in the payload.',
      'Re-sign with HS256 algorithm and secret "secret123"',
    ],
  },
  {
    id: 4, name: 'Bypass 2FA',
    description: 'The OTP is generated using a predictable timestamp-based formula: Math.floor(Date.now()/1000/30) % 1000000. Calculate the current OTP right now and submit it to bypass 2FA.',
    category: 'otp', difficulty: 'intermediate',
    flaw: 'Predictable OTP Generation (No Per-User Secret)',
    learning: 'TOTP standard (RFC 6238) with per-user HMAC secrets vs timestamp-only OTPs',
    xp: 250,
    hints: [
      'The OTP formula is public: Math.floor(Date.now()/1000/30) % 1000000.',
      `Current Unix timestamp is roughly ${Math.floor(Date.now()/1000)}.`,
      `Current OTP: ${String(Math.floor(Date.now()/1000/30) % 1000000).padStart(6,'0')}`,
    ],
  },
  {
    id: 5, name: 'Session Hijack',
    description: "The victim just logged in and their session cookie has no HttpOnly or Secure flags. The intercepted session value is shown. Replay it to hijack their session.",
    category: 'session', difficulty: 'advanced',
    flaw: 'Insecure Session Cookie (No HttpOnly, No Secure)',
    learning: 'Cookie security flags: HttpOnly, Secure, SameSite=Strict, and session invalidation',
    xp: 350,
    hints: [
      'The cookie has no HttpOnly flag — JavaScript can freely read it.',
      'The intercepted session value is: victim_sess_abc123def456',
      'Submit "victim_sess_abc123def456" as the session ID to hijack the session.',
    ],
  },
]

// ── Victim users (static) ─────────────────────────────────────────
const VICTIM_USERS = [
  { id: 1, username: 'admin', email: 'admin@target.com', password_plain: 'password123', password_md5: md5('password'), session_id: 'victim_sess_abc123def456' },
  { id: 2, username: 'alice', email: 'alice@target.com', password_plain: 'iloveyou', password_md5: md5('iloveyou'), session_id: 'victim_sess_xyz789' },
  { id: 3, username: 'bob', email: 'bob@target.com', password_plain: 'qwerty123', password_md5: md5('qwerty123'), session_id: 'sess_bob_987654' },
]

// ── Seed demo user if needed ──────────────────────────────────────
function ensureDemo() {
  if (!_data.users.find(u => u.username === 'demo')) {
    const hash = bcrypt.hashSync('demo1234', 12)
    _data.users.push({ id: _data.nextUserId++, username: 'demo', email: 'demo@authlab.com', password_hash: hash, xp: 0, created_at: new Date().toISOString() })
    save(_data)
    console.log('✅ Demo user created (username: demo, password: demo1234)')
  }
}

ensureDemo()
console.log('✅ AuthLab database ready at', DATA_FILE)

// ── DB API ────────────────────────────────────────────────────────
const db = {
  // Challenges
  getChallenges: () => CHALLENGES.map(({ hints, ...c }) => c),
  getChallenge: (id) => CHALLENGES.find(c => c.id === id),
  getVictimByUsername: (username) => VICTIM_USERS.find(v => v.username === username),
  getVictimBySession: (sessionId) => VICTIM_USERS.find(v => v.session_id === sessionId),

  // Users
  getUserByUsername: (username) => _data.users.find(u => u.username === username),
  getUserByEmail: (email) => _data.users.find(u => u.email === email),
  getUserById: (id) => _data.users.find(u => u.id === id),
  createUser: (username, email, password_hash) => {
    const user = { id: _data.nextUserId++, username, email, password_hash, xp: 0, created_at: new Date().toISOString() }
    _data.users.push(user)
    save(_data)
    return user
  },
  addXp: (userId, amount) => {
    const user = _data.users.find(u => u.id === userId)
    if (user) { user.xp += amount; save(_data) }
  },

  // Progress
  getProgress: (userId) => _data.user_progress.filter(p => p.user_id === userId),
  isChallengeSolved: (userId, challengeId) => _data.user_progress.some(p => p.user_id === userId && p.challenge_id === challengeId),
  completeChallenge: (userId, challengeId, hintsUsed) => {
    if (db.isChallengeSolved(userId, challengeId)) return false
    _data.user_progress.push({
      id: _data.nextProgressId++,
      user_id: userId,
      challenge_id: challengeId,
      hints_used: hintsUsed,
      solved_at: new Date().toISOString(),
    })
    save(_data)
    return true
  },

  // Leaderboard
  getLeaderboard: () => {
    const sorted = [..._data.users].sort((a, b) => b.xp - a.xp).slice(0, 50)
    return sorted.map((u, i) => ({
      rank: i + 1,
      username: u.username,
      xp: u.xp,
      solved: _data.user_progress.filter(p => p.user_id === u.id).length,
      badge: u.xp >= 2000 ? 'Elite Hacker' : u.xp >= 1500 ? 'Auth Master' : u.xp >= 800 ? 'Defender' : u.xp >= 400 ? 'Apprentice' : 'Novice',
    }))
  },
}

module.exports = db
