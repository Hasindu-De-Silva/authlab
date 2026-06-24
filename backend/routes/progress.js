const express = require('express')
const db = require('../db/database')
const authRouter = require('./auth')

const router = express.Router()
const { requireAuth } = authRouter

// GET /api/progress
router.get('/', requireAuth, (req, res) => {
  const userId = req.user.userId
  const solved = db.getProgress(userId)
  const user = db.getUserById(userId)

  const progressMap = {}
  for (const row of solved) {
    progressMap[row.challenge_id] = { solved: true, solvedAt: row.solved_at, hintsUsed: row.hints_used }
  }

  res.json({ progress: progressMap, totalXp: user?.xp || 0, solved: solved.length })
})

module.exports = router
