import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, desc } from 'drizzle-orm'
import { users, sessions } from '../db/schema'
import { getCookie } from 'hono/cookie'
import { createId } from '@paralleldrive/cuid2'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Helper: Get current user from session
async function getCurrentUser(c: any) {
  const db = drizzle(c.env.DB)
  const sessionId = getCookie(c, 'session')
  if (!sessionId) return null

  const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get()
  if (!session || session.expiresAt < new Date()) return null

  const user = await db.select().from(users).where(eq(users.id, session.userId)).get()
  return user
}

// Middleware: Check if user is admin or owner
async function requireAdmin(c: any, next: any) {
  const user = await getCurrentUser(c)
  if (!user || !['owner', 'admin'].includes(user.role)) {
    return c.json({ error: 'Forbidden: Admin access required' }, 403)
  }
  await next()
}

// GET all users (admin + owner only)
app.use('/', requireAdmin)
app.get('/', async (c) => {
  const db = drizzle(c.env.DB)
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt))
  
  // Don't expose password hashes
  const safeUsers = allUsers.map(({ passwordHash, ...user }) => user)
  return c.json(safeUsers)
})

// POST create user (admin + owner only)
app.post('/', async (c) => {
  const db = drizzle(c.env.DB)
  const { email, password, name, role } = await c.req.json()

  // Validate role
  const validRoles = ['owner', 'admin', 'editor', 'viewer']
  if (role && !validRoles.includes(role)) {
    return c.json({ error: 'Invalid role' }, 400)
  }

  // Check if email already exists
  const existingUser = await db.select().from(users).where(eq(users.email, email)).get()
  if (existingUser) {
    return c.json({ error: 'Email already in use' }, 409)
  }

  // Hash password
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const passwordHash = Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  // Create user
  const [newUser] = await db.insert(users).values({
    email,
    passwordHash,
    name: name || email.split('@')[0],
    role: role || 'viewer',
  }).returning()

  // Don't expose password hash
  const { passwordHash: _, ...safeUser } = newUser
  return c.json(safeUser, 201)
})

// PATCH update user (admin + owner only)
app.patch('/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const currentUser = await getCurrentUser(c)
  const { name, email, role } = await c.req.json()

  // Check if user exists
  const targetUser = await db.select().from(users).where(eq(users.id, id)).get()
  if (!targetUser) {
    return c.json({ error: 'User not found' }, 404)
  }

  // Prevent self-demotion or role changes by non-owners
  if (id === currentUser?.id) {
    if (role && role !== currentUser.role) {
      return c.json({ error: 'Cannot change your own role' }, 400)
    }
  }

  // Only owner can assign owner role
  if (role === 'owner' && currentUser?.role !== 'owner') {
    return c.json({ error: 'Only owner can assign owner role' }, 403)
  }

  // Prevent deleting last owner
  if (targetUser.role === 'owner' && role && role !== 'owner') {
    const ownerCount = await db.select({ count: eq(users.role, 'owner') }).from(users).get()
    if (ownerCount && ownerCount.count <= 1) {
      return c.json({ error: 'Cannot remove the last owner' }, 400)
    }
  }

  const updateData: any = {}
  if (name !== undefined) updateData.name = name
  if (email !== undefined) {
    // Check email uniqueness
    const emailExists = await db.select().from(users).where(eq(users.email, email)).get()
    if (emailExists && emailExists.id !== id) {
      return c.json({ error: 'Email already in use' }, 409)
    }
    updateData.email = email
  }
  if (role !== undefined) updateData.role = role

  const [updatedUser] = await db.update(users)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning()

  // Don't expose password hash
  const { passwordHash: _, ...safeUser } = updatedUser
  return c.json(safeUser)
})

// DELETE user (admin + owner only)
app.delete('/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const currentUser = await getCurrentUser(c)

  // Prevent self-deletion
  if (id === currentUser?.id) {
    return c.json({ error: 'Cannot delete yourself' }, 400)
  }

  const targetUser = await db.select().from(users).where(eq(users.id, id)).get()
  if (!targetUser) {
    return c.json({ error: 'User not found' }, 404)
  }

  // Prevent deleting last owner
  if (targetUser.role === 'owner') {
    const ownerCount = await db.select({ count: eq(users.role, 'owner') }).from(users).get()
    if (ownerCount && ownerCount.count <= 1) {
      return c.json({ error: 'Cannot delete the last owner' }, 400)
    }
  }

  // Delete user's sessions first
  await db.delete(sessions).where(eq(sessions.userId, id))

  // Delete user
  await db.delete(users).where(eq(users.id, id))

  return c.json({ success: true })
})

export default app
