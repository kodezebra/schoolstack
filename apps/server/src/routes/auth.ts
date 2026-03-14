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

// PATCH ME - Update profile
app.patch('/me', async (c) => {
  const db = drizzle(c.env.DB)
  const sessionId = getCookie(c, 'session')
  if (!sessionId) return c.json({ error: 'Unauthorized' }, 401)

  const session = await db.select().from(sessions).where(eq(sessions.id, sessionId as string)).get()
  if (!session || session.expiresAt < new Date()) return c.json({ error: 'Unauthorized' }, 401)

  const { name, email } = await c.req.json()
  
  // Validate email format if provided
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: 'Invalid email format' }, 400)
  }

  const updateData: any = {}
  if (name !== undefined) updateData.name = name
  if (email !== undefined) updateData.email = email

  if (Object.keys(updateData).length === 0) {
    return c.json({ error: 'No fields to update' }, 400)
  }

  try {
    const [updatedUser] = await db.update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, session.userId as string))
      .returning()

    return c.json({ id: updatedUser.id, email: updatedUser.email, name: updatedUser.name })
  } catch (e: any) {
    // Handle unique constraint violation for email
    if (e.message?.includes('UNIQUE') || e.message?.includes('duplicate')) {
      return c.json({ error: 'Email already in use' }, 409)
    }
    return c.json({ error: 'Failed to update profile' }, 500)
  }
})

// POST CHANGE PASSWORD
app.post('/change-password', async (c) => {
  const db = drizzle(c.env.DB)
  const sessionId = getCookie(c, 'session')
  if (!sessionId) return c.json({ error: 'Unauthorized' }, 401)

  const session = await db.select().from(sessions).where(eq(sessions.id, sessionId as string)).get()
  if (!session || session.expiresAt < new Date()) return c.json({ error: 'Unauthorized' }, 401)

  const { currentPassword, newPassword } = await c.req.json()

  if (!currentPassword || !newPassword) {
    return c.json({ error: 'Current and new password are required' }, 400)
  }

  if (newPassword.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters' }, 400)
  }

  const user = await db.select().from(users).where(eq(users.id, session.userId as string)).get()
  if (!user) return c.json({ error: 'User not found' }, 404)

  // Verify current password
  const currentPasswordHash = await hashPassword(currentPassword)
  if (user.passwordHash !== currentPasswordHash) {
    return c.json({ error: 'Current password is incorrect' }, 401)
  }

  // Update password
  const newPasswordHash = await hashPassword(newPassword)
  await db.update(users)
    .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
    .where(eq(users.id, session.userId as string))

  return c.json({ message: 'Password changed successfully' })
})

export default app
