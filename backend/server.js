const express = require('express')
const cors = require('cors')
const path = require('path')

const db = require('./db/database')
const authRoutes = require('./routes/auth')
const challengeRoutes = require('./routes/challenges')
const progressRoutes = require('./routes/progress')
const leaderboardRoutes = require('./routes/leaderboard')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}))
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'AuthLab backend running 🔐', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/challenges', challengeRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/leaderboard', leaderboardRoutes)

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error', error: err.message })
})

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║        AuthLab Backend               ║
  ║  🔐 Security Education Platform      ║
  ║  Running on http://localhost:${PORT}    ║
  ╚══════════════════════════════════════╝
  `)
})
