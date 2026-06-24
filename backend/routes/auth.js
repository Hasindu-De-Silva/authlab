const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')
const db = require('../db/database')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'authlab-super-secure-jwt-secret-2025'

// Rate limit: 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// ── POST /api/auth/register ──────────────────────────────────────
router.post('/register', authLimiter, async (req, res) => {
  const { username, email, password } = req.body
  if (!username || !email || !password)
    return res.status(400).json({ message: 'All fields required' })
  if (username.length < 3 || username.length > 20)
    return res.status(400).json({ message: 'Username must be 3–20 characters' })
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return res.status(400).json({ message: 'Username: letters, numbers and _ only' })
  if (password.length < 8)
    return res.status(400).json({ message: 'Password must be at least 8 characters' })

  if (db.getUserByUsername(username) || db.getUserByEmail(email))
    return res.status(409).json({ message: 'Username or email already taken' })

  const hash = await bcrypt.hash(password, 12)
  const user = db.createUser(username, email, hash)
  const token = jwt.sign({ userId: user.id, username }, JWT_SECRET, { expiresIn: '7d' })
  res.status(201).json({ userId: user.id, username, xp: 0, token })
})

// ── POST /api/auth/login ─────────────────────────────────────────
router.post('/login', authLimiter, async (req, res) => {
  const { username, password } = req.body
  if (!username || !password)
    return res.status(400).json({ message: 'Username and password required' })

  const user = db.getUserByUsername(username)
  if (!user) {
    await bcrypt.compare(password, '$2b$12$placeholder.to.prevent.timing.attacks.xxxxx')
    return res.status(401).json({ message: 'Invalid credentials' })
  }
  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ userId: user.id, username: user.username, xp: user.xp, token })
})

// ── Middleware: verify JWT ───────────────────────────────────────
function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Authentication required' })
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

router.requireAuth = requireAuth
module.exports = router
