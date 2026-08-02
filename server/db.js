import fs from 'fs'
import path from 'path'

const dataDir = path.resolve(process.cwd(), 'server', 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

const usersFile = path.join(dataDir, 'users.json')

function readUsers() {
  try {
    if (!fs.existsSync(usersFile)) return {}
    const raw = fs.readFileSync(usersFile, 'utf8')
    return JSON.parse(raw || '{}')
  } catch (err) {
    return {}
  }
}

function writeUsers(data) {
  fs.writeFileSync(usersFile, JSON.stringify(data, null, 2), 'utf8')
}

export function getUserById(id) {
  const users = readUsers()
  return users[id] || null
}

export function createUser({ id, password, role = 'student', name = '' }) {
  const users = readUsers()
  if (users[id]) return null
  const now = new Date().toISOString()
  users[id] = { id, password, role, name, created_at: now }
  writeUsers(users)
  return users[id]
}

// seed demo users
const seedUsers = [
  { id: 's.patil@thekinetix.edu', password: 'physics2026', role: 'student', name: 'S. Patil' },
  { id: 't.patil@thekinetix.edu', password: 'physics2026', role: 'faculty', name: 'T. Patil' }
]
const existingUsers = readUsers()
let changed = false
for (const u of seedUsers) {
  if (!existingUsers[u.id]) {
    existingUsers[u.id] = { ...u, created_at: new Date().toISOString() }
    changed = true
  }
}
if (changed) writeUsers(existingUsers)

export default null
