import { Hono } from 'hono'
import { getDb } from '@/lib/db'
import { eq, sql } from 'drizzle-orm'
import { users, sessions } from '@/db/schema'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import { createId } from '@paralleldrive/cuid2'
import { validatePhoto, uploadPhoto, deletePhoto, getPhotoPath } from '@/lib/storage'
import { authMiddleware, requireRole } from '@/middleware/auth'

type Bindings = {
  DB: D1Database
  ASSETS: R2Bucket
  FRONTEND_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

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
  const db = getDb(c)

  // Check if any user exists
  const existingUser = await db.select().from(users).limit(1).get()

  if (existingUser) {
    return c.json({ error: 'Forbidden: Admin already exists' }, 403)
  }

  const { email, password, name } = await c.req.json()
  const passwordHash = await hashPassword(password)

  const [newUser] = await db.insert(users).values({
    email,
    passwordHash,
    name: name || 'Admin',
    role: 'owner', // First user is owner
  }).returning()

  return c.json({
    message: 'Admin created successfully',
    user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }
  })
})

// SIGNUP (Optional: You might want to remove this if only one admin is allowed)
app.post('/signup', async (c) => {
  const db = getDb(c)
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
  const db = getDb(c)
  const { email, password } = await c.req.json()

  const user = await db.select().from(users).where(eq(users.email, email as string)).get()
  if (!user) return c.json({ error: 'Invalid credentials' }, 401)

  const passwordHash = await hashPassword(password)
  if (user.passwordHash !== passwordHash) return c.json({ error: 'Invalid credentials' }, 401)

  // Create Session
  const sessionId = createId() + createId() // Extra long
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    expiresAt,
  })

  const isProduction = c.env.FRONTEND_URL?.startsWith('https://')
  setCookie(c, 'session', sessionId, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
    path: '/',
    expires: expiresAt,
  })

  return c.json({ message: 'Logged in', user: { id: user.id, email: user.email, name: user.name, photo: user.photo } })
})

// LOGOUT
app.post('/logout', async (c) => {
  const db = getDb(c)
  const sessionId = getCookie(c, 'session')
  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId))
  }
  deleteCookie(c, 'session')
  return c.json({ message: 'Logged out' })
})

// GET ME
app.get('/me', async (c) => {
  const db = getDb(c)
  const sessionId = getCookie(c, 'session')
  if (!sessionId) return c.json(null)

  const session = await db.select().from(sessions).where(eq(sessions.id, sessionId as string)).get()
  if (!session || session.expiresAt < new Date()) return c.json(null)

  const user = await db.select().from(users).where(eq(users.id, session.userId as string)).get()
  if (!user) return c.json(null)

  return c.json({ id: user.id, email: user.email, name: user.name, role: user.role, photo: user.photo })
})

// PATCH ME - Update profile
app.patch('/me', async (c) => {
  const db = getDb(c)
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

    return c.json({ id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role, photo: updatedUser.photo })
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
  const db = getDb(c)
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

// Photo upload for user profile
app.post('/me/photo', authMiddleware, requireRole('owner', 'admin', 'editor'), async (c) => {
  const db = getDb(c)
  const sessionId = getCookie(c, 'session')
  if (!sessionId) return c.json({ error: 'Unauthorized' }, 401)

  const session = await db.select().from(sessions).where(eq(sessions.id, sessionId as string)).get()
  if (!session || session.expiresAt < new Date()) return c.json({ error: 'Unauthorized' }, 401)

  const formData = await c.req.parseBody()
  const file = formData['photo'] as File | null

  if (!file) {
    return c.json({ error: 'No file provided' }, 400)
  }

  const validation = validatePhoto(file)
  if (!validation.valid) {
    return c.json({ error: validation.error }, 400)
  }

  const path = getPhotoPath('users', session.userId as string)
  const result = await uploadPhoto(c.env.ASSETS, file, path, c.req.url)

  if (!result.success) {
    return c.json({ error: 'Failed to upload file to storage' }, 500)
  }

  const [updatedUser] = await db.update(users)
    .set({ photo: result.url, updatedAt: new Date() })
    .where(eq(users.id, session.userId as string))
    .returning()

  return c.json({ photo: result.url, success: true, user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, photo: updatedUser.photo } })
})

// Delete user profile photo
app.delete('/me/photo', authMiddleware, requireRole('owner', 'admin', 'editor'), async (c) => {
  const db = getDb(c)
  const sessionId = getCookie(c, 'session')
  if (!sessionId) return c.json({ error: 'Unauthorized' }, 401)

  const session = await db.select().from(sessions).where(eq(sessions.id, sessionId as string)).get()
  if (!session || session.expiresAt < new Date()) return c.json({ error: 'Unauthorized' }, 401)

  const user = await db.select().from(users).where(eq(users.id, session.userId as string)).get()
  if (!user) return c.json({ error: 'User not found' }, 404)

  await deletePhoto(c.env.ASSETS, user.photo || '')

  await db.update(users)
    .set({ photo: null, updatedAt: new Date() })
    .where(eq(users.id, session.userId as string))

  return c.json({ success: true })
})

export default app
