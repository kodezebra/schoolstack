import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, sql } from 'drizzle-orm'
import { users, sessions } from '../db/schema'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import { createId } from '@paralleldrive/cuid2'

const app = new Hono<{ Bindings: { DB: D1Database } }>()

// Helper: Simple Hash
async function hashPassword(password: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// BOOTSTRAP: Create first user only
app.post('/bootstrap', async (c) => {
  const db = drizzle(c.env.DB)
  
  // Check if any user exists
  const userCount = await db.select({ count: sql<number>`count(*)` }).from(users).get()
  
  if (userCount && userCount.count > 0) {
    return c.json({ error: 'Forbidden: Admin already exists' }, 403)
  }

  const { email, password, name } = await c.req.json()
  const passwordHash = await hashPassword(password)
  
  const [newUser] = await db.insert(users).values({
    email,
    passwordHash,
    name: name || 'Admin',
  }).returning()

  return c.json({ 
    message: 'Admin created successfully', 
    user: { id: newUser.id, email: newUser.email } 
  })
})

// SIGNUP (Optional: You might want to remove this if only one admin is allowed)
app.post('/signup', async (c) => {
  const db = drizzle(c.env.DB)
  const { email, password, name } = await c.req.json()

  const passwordHash = await hashPassword(password)
  
  try {
    const [newUser] = await db.insert(users).values({
      email,
      passwordHash,
      name,
    }).returning()
    return c.json({ id: newUser.id, email: newUser.email })
  } catch (e) {
    return c.json({ error: 'User already exists' }, 400)
  }
})

// LOGIN
app.post('/login', async (c) => {
  const db = drizzle(c.env.DB)
  const { email, password } = await c.req.json()

  const user = await db.select().from(users).where(eq(users.email, email as string)).get()
  if (!user) return c.json({ error: 'Invalid credentials' }, 401)

  const passwordHash = await hashPassword(password)
  if (user.passwordHash !== passwordHash) return c.json({ error: 'Invalid credentials' }, 401)

  // Create Session
  const sessionId = createId() + createId() // Extra long
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    expiresAt,
  })

  setCookie(c, 'session', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    path: '/',
    expires: expiresAt,
  })

  return c.json({ message: 'Logged in', user: { id: user.id, email: user.email, name: user.name } })
})

// LOGOUT
app.post('/logout', async (c) => {
  const db = drizzle(c.env.DB)
  const sessionId = getCookie(c, 'session')
  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId))
  }
  deleteCookie(c, 'session')
  return c.json({ message: 'Logged out' })
})

// GET ME
app.get('/me', async (c) => {
  const db = drizzle(c.env.DB)
  const sessionId = getCookie(c, 'session')
  if (!sessionId) return c.json(null)

  const session = await db.select().from(sessions).where(eq(sessions.id, sessionId as string)).get()
  if (!session || session.expiresAt < new Date()) return c.json(null)

  const user = await db.select().from(users).where(eq(users.id, session.userId as string)).get()
  if (!user) return c.json(null)

  return c.json({ id: user.id, email: user.email, name: user.name })
})

export default app
