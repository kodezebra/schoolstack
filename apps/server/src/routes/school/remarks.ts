import { Hono } from 'hono'
import { getDb } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { studentTermRemarks, academicYears, terms } from '@/db/schema'
import { authMiddleware, requireRole } from '@/middleware/auth'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', authMiddleware)

app.get('/', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = getDb(c)
  const studentId = c.req.query('studentId')
  const academicYearId = c.req.query('academicYearId')
  const termId = c.req.query('termId')

  if (!studentId) {
    return c.json({ error: 'studentId is required' }, 400)
  }

  let conditions = [eq(studentTermRemarks.studentId, studentId)]
  if (academicYearId) conditions.push(eq(studentTermRemarks.academicYearId, academicYearId))
  if (termId) conditions.push(eq(studentTermRemarks.termId, termId))

  const remarks = await db.select().from(studentTermRemarks).where(and(...conditions))
  return c.json(remarks)
})

app.post('/', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = getDb(c)
  const body = await c.req.json()

  const schema = z.object({
    studentId: z.string().min(1),
    academicYearId: z.string().min(1),
    termId: z.string().optional(),
    remarks: z.string().min(1)
  })

  const data = schema.parse(body)

  const existing = await db.select().from(studentTermRemarks)
    .where(and(
      eq(studentTermRemarks.studentId, data.studentId),
      eq(studentTermRemarks.academicYearId, data.academicYearId),
      data.termId ? eq(studentTermRemarks.termId, data.termId) : eq(studentTermRemarks.termId, '')
    ))
    .get()

  if (existing) {
    const [updated] = await db.update(studentTermRemarks)
      .set({ remarks: data.remarks, updatedAt: new Date() })
      .where(eq(studentTermRemarks.id, existing.id))
      .returning()
    return c.json(updated)
  }

  const [created] = await db.insert(studentTermRemarks).values({
    studentId: data.studentId,
    academicYearId: data.academicYearId,
    termId: data.termId || null,
    remarks: data.remarks
  }).returning()

  return c.json(created, 201)
})

export default app
