# AuthLab 🔐

> **Interactive Authentication Security Learning Platform**

A web-based playground where students learn password and authentication security by attacking and defending real sandboxed login systems.

## What Is AuthLab?

AuthLab presents intentionally vulnerable authentication systems for you to exploit. Each challenge teaches one real-world auth flaw, then shows you exactly how to fix it with **Defender Mode**.

## 🎯 Challenges

| # | Challenge | Flaw | Difficulty | XP |
|---|-----------|------|-----------|-----|
| 1 | Crack the Hash | MD5 without salt | Beginner | 150 |
| 2 | Brute Force Login | No rate limiting | Beginner | 150 |
| 3 | Break the Token | Weak JWT secret | Intermediate | 250 |
| 4 | Bypass 2FA | Predictable OTP | Intermediate | 250 |
| 5 | Session Hijack | Insecure cookies | Advanced | 350 |

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite (via better-sqlite3)
- **Auth**: bcrypt (12 rounds) + JWT

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```
Backend runs at http://localhost:5000

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:3000

### Demo Account
- Username: `demo`
- Password: `demo1234`

## ⚠️ Security Disclaimer

The vulnerable endpoints in this app are **intentionally insecure** for educational purposes. They are sandboxed and isolated per user session. **Never deploy this publicly without proper network gating.**

## 📁 Structure

```
authlab/
├── frontend/        # React + Vite
│   └── src/
│       ├── components/  # Navbar, ChallengeCard, AttackPanel, DefenderMode
│       ├── pages/       # Home, Challenge, Login, Register, Leaderboard
│       ├── api/         # Axios client + challenge API
│       └── context/     # AuthContext
│
├── backend/         # Express.js
│   ├── routes/      # auth, challenges, progress, leaderboard
│   └── db/          # SQLite + schema + seed data
│
└── README.md
```

## 🏆 Scoring

XP is awarded on challenge completion. Hint usage reduces XP. Badges are earned at XP thresholds:
- 400 XP → Apprentice
- 800 XP → Defender  
- 1500 XP → Auth Master
- 2000 XP → Elite Hacker
