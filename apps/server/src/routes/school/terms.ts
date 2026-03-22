import { Hono } from 'hono'
import { getDb } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'
import { terms, academicYears } from '@/db/schema'
import { authMiddleware, requireRole } from '@/middleware/auth'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', authMiddleware)

const termSchema = z.object({
  name: z.string().min(1),
  academicYearId: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(['upcoming', 'active', 'closed']).optional(),
})

app.get('/', requireRole('owner', 'admin', 'editor'), async (c) => {
  const db = getDb(c)
  const academicYearId = c.req.query('academicYearId')
  
  const conditions = academicYearId ? [eq(terms.academicYearId, academicYearId)] : []
  
  const termList = await db.select({
    id: terms.id,
    name: terms.name,
    academicYearId: terms.academicYearId,
    startDate: terms.startDate,
    endDate: terms.endDate,
    status: terms.status,
    createdAt: terms.createdAt,
    academicYearName: academicYears.name,
  }).from(terms)
    .leftJoin(academicYears, eq(terms.academicYearId, academicYears.id))
    .where(conditions.length > 0 ? conditions[0] : undefined)
    .orderBy(desc(terms.createdAt))
  
  return c.json(termList)
})

app.post('/', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const body = await c.req.json()
  const data = termSchema.parse(body)
  
  const [term] = await db.insert(terms).values({
    name: data.name,
    academicYearId: data.academicYearId,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    status: data.status || 'upcoming',
  }).returning()
  
  return c.json(term, 201)
})

app.patch('/:id', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const updateData: any = { ...body }
  if (body.startDate) updateData.startDate = new Date(body.startDate)
  if (body.endDate) updateData.endDate = new Date(body.endDate)
  
  const [term] = await db.update(terms)
    .set(updateData)
    .where(eq(terms.id, id))
    .returning()
  
  if (!term) return c.notFound()
  return c.json(term)
})

app.delete('/:id', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  
  await db.delete(terms).where(eq(terms.id, id))
  return c.json({ success: true })
})

export default app
