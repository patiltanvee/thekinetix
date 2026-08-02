import express from 'express'
import cors from 'cors'
import { getUserById, createUser } from './db.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.post('/api/auth/login', (req, res) => {
  const { id, password, role } = req.body || {}
  if (!id || !password) return res.status(400).json({ ok: false, error: 'Missing id or password' })

  const user = getUserById(id)
  if (!user || user.password !== password || (role && user.role !== role)) return res.status(401).json({ ok: false, error: 'Invalid credentials' })

  // Minimal demo token (do not use in production)
  return res.json({ ok: true, user: { id: user.id, role: user.role, name: user.name }, token: 'demo-token-123' })
})

// Signup / request access endpoint
app.post('/api/auth/signup', (req, res) => {
  const { id, password, role = 'student', name = '' } = req.body || {}
  if (!id || !password) return res.status(400).json({ ok: false, error: 'Missing id or password' })
  const existing = getUserById(id)
  if (existing) return res.status(409).json({ ok: false, error: 'User already exists' })
  const created = createUser({ id, password, role, name })
  if (!created) return res.status(500).json({ ok: false, error: 'Could not create user' })
  return res.json({ ok: true, user: { id: created.id, role: created.role, name: created.name } })
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Auth server running on http://localhost:${PORT}`)
})
