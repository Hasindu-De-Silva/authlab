const express = require('express')
const jwt = require('jsonwebtoken')
const md5 = require('md5')
const db = require('../db/database')
const authRouter = require('./auth')

const router = express.Router()
const { requireAuth } = authRouter

// ── GET /api/challenges ──────────────────────────────────────────
router.get('/', (req, res) => {
  res.json(db.getChallenges())
})

// ── GET /api/challenges/:id ──────────────────────────────────────
router.get('/:id', (req, res) => {
  const challenge = db.getChallenge(parseInt(req.params.id))
  if (!challenge) return res.status(404).json({ message: 'Challenge not found' })
  res.json(challenge)
})

// ── POST /api/challenges/:id/hint ────────────────────────────────
router.post('/:id/hint', requireAuth, (req, res) => {
  const { level } = req.body
  const challenge = db.getChallenge(parseInt(req.params.id))
  if (!challenge) return res.status(404).json({ message: 'Challenge not found' })
  const hint = challenge.hints?.[(level || 1) - 1]
  if (!hint) return res.status(404).json({ message: 'No more hints' })
  res.json({ hint, level })
})

// ── POST /api/challenges/:id/attack ─────────────────────────────
router.post('/:id/attack', requireAuth, (req, res) => {
  const id = parseInt(req.params.id)

  switch (id) {
    // Challenge 1: Crack the Hash (MD5)
    case 1: {
      const { username, password } = req.body
      if (!username || !password)
        return res.status(400).json({ success: false, message: 'Username and password required' })
      const victim = db.getVictimByUsername(username)
      if (!victim)
        return res.json({ success: false, message: `User "${username}" not found.`, hint: 'Try: admin, alice, bob' })
      const inputHash = md5(password)
      if (inputHash === victim.password_md5) {
        return res.json({
          success: true,
          message: `🔓 Hash cracked! "${password}" → ${inputHash}. Matches stored hash for "${username}".`,
          data: { crackedPassword: password, hash: inputHash, username: victim.username, email: victim.email }
        })
      }
      return res.json({
        success: false,
        message: `MD5("${password}") = ${inputHash}  ✗  doesn't match.`,
        hint: 'Try common passwords: "password", "iloveyou", "qwerty123"',
        statusCode: 401,
      })
    }

    // Challenge 2: Brute Force — NO rate limit intentionally
    case 2: {
      const { username, password } = req.body
      if (!username || !password)
        return res.status(400).json({ success: false, message: 'Username and password required' })
      const victim = db.getVictimByUsername(username)
      if (!victim)
        return res.json({ success: false, message: `User "${username}" not found.` })
      if (password === victim.password_plain) {
        return res.json({
          success: true,
          message: `⚡ Brute force success! Password "${password}" accepted after unlimited attempts. No lockout triggered.`,
          data: { username: victim.username, password: victim.password_plain, email: victim.email }
        })
      }
      return res.json({
        success: false,
        message: `Wrong password. No lockout — keep trying! (HTTP 401)`,
        hint: `Hint: try "password123" for admin`,
        statusCode: 401,
      })
    }

    // Challenge 3: JWT Forgery
    case 3: {
      const { token } = req.body
      if (!token) return res.status(400).json({ success: false, message: 'JWT token required' })
      try {
        const payload = jwt.verify(token, 'secret123')
        if (payload.role === 'admin') {
          return res.json({
            success: true,
            message: `🔑 JWT forged! Token accepted. Role="${payload.role}". Admin access granted.`,
            data: { decoded: payload, adminAccess: true }
          })
        }
        return res.json({
          success: false,
          message: `Valid token, but role="${payload.role}" ≠ "admin". Modify payload and re-sign.`,
          hint: 'At jwt.io: set payload role to "admin", sign with HS256 + secret "secret123"',
        })
      } catch (e) {
        return res.json({
          success: false, statusCode: 401,
          message: `Invalid signature: ${e.message}`,
          hint: 'Use HS256 algorithm. Secret is exactly: secret123',
        })
      }
    }

    // Challenge 4: OTP Bypass
    case 4: {
      const { otp } = req.body
      if (!otp) return res.status(400).json({ success: false, message: 'OTP required' })
      const now = Math.floor(Date.now() / 1000)
      const currentOtp = String(Math.floor(now / 30) % 1000000).padStart(6, '0')
      const prevOtp = String(Math.floor((now - 30) / 30) % 1000000).padStart(6, '0')
      const nextOtp = String(Math.floor((now + 30) / 30) % 1000000).padStart(6, '0')
      if ([currentOtp, prevOtp, nextOtp].includes(otp)) {
        return res.json({
          success: true,
          message: `📱 OTP bypassed! ${otp} is correct. Formula: Math.floor(${now}/30) % 1000000. Any attacker knowing the algorithm can compute this.`,
          data: { usedOtp: otp, timestamp: now, algorithm: 'Math.floor(Date.now()/1000/30) % 1000000' }
        })
      }
      return res.json({
        success: false, statusCode: 401,
        message: `OTP ${otp} incorrect. OTPs change every 30s.`,
        hint: `Compute: Math.floor(${now}/30) % 1000000 = ${currentOtp}`,
      })
    }

    // Challenge 5: Session Hijack
    case 5: {
      const { sessionId } = req.body
      if (!sessionId) return res.status(400).json({ success: false, message: 'Session ID required' })
      const victim = db.getVictimBySession(sessionId)
      if (victim) {
        return res.json({
          success: true,
          message: `🍪 Session hijacked! "${sessionId}" belongs to ${victim.username} (${victim.email}). You are now them.`,
          data: { hijackedUser: victim.username, email: victim.email, sessionId }
        })
      }
      return res.json({
        success: false, statusCode: 401,
        message: `Session "${sessionId}" not found.`,
        hint: 'The victim session is: victim_sess_abc123def456',
      })
    }

    default:
      return res.status(404).json({ message: 'Challenge not found' })
  }
})

// ── POST /api/challenges/:id/defend ─────────────────────────────
router.post('/:id/defend', requireAuth, (req, res) => {
  const id = parseInt(req.params.id)
  const { code = '' } = req.body

  const validators = {
    1: (c) => {
      if (/bcrypt/i.test(c) && !/md5/i.test(c))
        return { correct: true, feedback: 'Excellent! bcrypt replaces MD5. It uses a unique salt per password and is intentionally slow — impossible to crack at scale.' }
      if (!/bcrypt/i.test(c))
        return { correct: false, feedback: 'Still not using bcrypt. Replace hashPassword() with BCryptPasswordEncoder.encode().' }
      return { correct: false, feedback: 'Remove all MD5 references and use bcrypt exclusively.' }
    },
    2: (c) => {
      if (/rateLimit|rateLimiter|attempt|lockout|429/i.test(c))
        return { correct: true, feedback: 'Great! Rate limiting protects against automated attacks. Add progressive delays and IP+username tracking for full protection.' }
      return { correct: false, feedback: 'No rate limiting found. Add attempt tracking, lockout after N failures, and progressive delays.' }
    },
    3: (c) => {
      const hasRS256 = /RS256|RSA|KeyPair|privateKey/i.test(c)
      const hasExpiry = /expir|setExpiration|expiresIn/i.test(c)
      if (hasRS256 && hasExpiry) return { correct: true, feedback: 'Perfect! RS256 uses asymmetric keys — no shared secret to steal. Expiration limits the damage window.' }
      if (!hasRS256) return { correct: false, feedback: 'Switch to RS256 with RSA key pair. No shared secret = nothing to brute-force offline.' }
      return { correct: false, feedback: 'Good algorithm! Add token expiration — tokens without expiry are valid forever.' }
    },
    4: (c) => {
      if (/secret|hmac|SHA|perUser|userId/i.test(c) && !/% 1000000/.test(c))
        return { correct: true, feedback: 'Correct! TOTP with per-user HMAC secrets means knowing the algorithm reveals nothing without the individual\'s secret key.' }
      if (!(/secret|hmac|SHA/i.test(c)))
        return { correct: false, feedback: 'Your OTP must derive from a per-user HMAC secret, not just the timestamp.' }
      return { correct: false, feedback: 'Remove the timestamp-only formula. Use HMAC-SHA1 with a unique user secret (RFC 6238 TOTP).' }
    },
    5: (c) => {
      const hasHttpOnly = /httpOnly|HttpOnly/i.test(c)
      const hasSecure = /\.secure|SameSite|setSecure/i.test(c)
      if (hasHttpOnly && hasSecure) return { correct: true, feedback: 'All three flags present: HttpOnly (no JS access), Secure (HTTPS only), SameSite=Strict (CSRF protection). Complete defense!' }
      if (!hasHttpOnly) return { correct: false, feedback: 'Missing HttpOnly! JavaScript can still steal the cookie via XSS.' }
      return { correct: false, feedback: 'Add Secure flag (HTTPS only) and SameSite=Strict (CSRF protection).' }
    },
  }

  const validator = validators[id]
  if (!validator) return res.status(404).json({ message: 'Challenge not found' })
  res.json(validator(code))
})

// ── POST /api/challenges/:id/complete ────────────────────────────
router.post('/:id/complete', requireAuth, (req, res) => {
  const challengeId = parseInt(req.params.id)
  const { hintsUsed = 0 } = req.body
  const userId = req.user.userId

  const challenge = db.getChallenge(challengeId)
  if (!challenge) return res.status(404).json({ message: 'Challenge not found' })

  if (db.isChallengeSolved(userId, challengeId))
    return res.json({ message: 'Already solved', xpAwarded: 0 })

  const xpPenalty = hintsUsed * 10
  const xpAwarded = Math.max(challenge.xp - xpPenalty, Math.floor(challenge.xp * 0.3))

  db.completeChallenge(userId, challengeId, hintsUsed)
  db.addXp(userId, xpAwarded)

  const user = db.getUserById(userId)
  res.json({ message: 'Challenge completed!', xpAwarded, totalXp: user?.xp || 0 })
})

module.exports = router
