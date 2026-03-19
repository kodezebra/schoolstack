import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { generateNumber } from '@/lib/generateNumber'
import { authMiddleware, requireRole } from '@/middleware/auth'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', authMiddleware)

app.get('/', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const type = c.req.query('type') as 'student' | 'staff' | 'receipt'
  const role = c.req.query('role') as string | undefined

  if (!type) {
    return c.json({ error: 'type is required (student, staff, receipt)' }, 400)
  }

  if (type !== 'student' && type !== 'staff' && type !== 'receipt') {
    return c.json({ error: 'invalid type' }, 400)
  }

  const number = await generateNumber(db, type, role)
  return c.json({ number })
})

export default app
