const express = require('express')
const db = require('../db/database')

const router = express.Router()

router.get('/', (req, res) => {
  res.json(db.getLeaderboard())
})

module.exports = router
