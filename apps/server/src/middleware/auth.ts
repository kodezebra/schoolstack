import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { users, sessions } from '@/db/schema'
import { getCookie } from 'hono/cookie'

export const authMiddleware = async (c: any, next: any) => {
  const db = drizzle(c.env.DB)
  const sessionId = getCookie(c, 'session')

  let user = null
  if (sessionId) {
    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .get()

    if (session && session.expiresAt > new Date()) {
      const dbUser = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .get()

      if (dbUser) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
        }
      }
    }
  }

  c.set('user', user)
  await next()
}

export const requireRole = (...allowedRoles: string[]) => {
  return async (c: any, next: any) => {
    const user = c.get('user')
    if (!user || !allowedRoles.includes(user.role)) {
      return c.json({ error: 'Forbidden' }, 403)
    }
    await next()
  }
}
