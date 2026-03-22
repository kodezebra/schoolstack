import { Hono } from 'hono'
import { getDb } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'
import { subjects, academicYears } from '@/db/schema'
import { authMiddleware, requireRole } from '@/middleware/auth'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', authMiddleware)

const subjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
})

app.get('/', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = getDb(c)
  const subjectList = await db.select().from(subjects).orderBy(desc(subjects.createdAt))
  return c.json(subjectList)
})

app.post('/', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const body = await c.req.json()
  const data = subjectSchema.parse(body)
  
  const [subject] = await db.insert(subjects).values({
    name: data.name,
    code: data.code,
  }).returning()
  
  return c.json(subject, 201)
})

app.patch('/:id', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const [subject] = await db.update(subjects)
    .set(body)
    .where(eq(subjects.id, id))
    .returning()
  
  if (!subject) return c.notFound()
  return c.json(subject)
})

app.delete('/:id', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  
  await db.delete(subjects).where(eq(subjects.id, id))
  return c.json({ success: true })
})

export default app
