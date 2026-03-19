import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, sql } from 'drizzle-orm'
import { levels, staff } from '@/db/schema'
import { authMiddleware, requireRole } from '@/middleware/auth'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', authMiddleware)

const levelSchema = z.object({
  name: z.string().min(1),
  order: z.number().optional(),
  academicYearId: z.string().min(1),
  classTeacherId: z.string().optional().nullable(),
})

app.get('/', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = drizzle(c.env.DB)
  const academicYearId = c.req.query('academicYearId')
  
  const query = db.select({
    id: levels.id,
    name: levels.name,
    order: levels.order,
    academicYearId: levels.academicYearId,
    classTeacherId: levels.classTeacherId,
    createdAt: levels.createdAt,
    classTeacherName: sql<string>`${staff.firstName} || ' ' || ${staff.lastName}`
  })
    .from(levels)
    .leftJoin(staff, eq(levels.classTeacherId, staff.id))
  
  if (academicYearId) {
    query.where(eq(levels.academicYearId, academicYearId))
  }
  
  const levelList = await query.orderBy(levels.order)
  return c.json(levelList)
})

app.post('/', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  const data = levelSchema.parse(body)
  
  const [level] = await db.insert(levels).values({
    name: data.name,
    order: data.order || 0,
    academicYearId: data.academicYearId,
    classTeacherId: data.classTeacherId || null,
  }).returning()
  
  return c.json(level, 201)
})

app.patch('/:id', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const body = await c.req.json()
  const data = levelSchema.partial().parse(body) // Use partial to allow partial updates
  
  const [level] = await db.update(levels)
    .set({
      name: data.name,
      order: data.order,
      academicYearId: data.academicYearId,
      classTeacherId: data.classTeacherId,
    })
    .where(eq(levels.id, id))
    .returning()
  
  if (!level) return c.notFound()
  return c.json(level)
})

app.delete('/:id', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  await db.delete(levels).where(eq(levels.id, id))
  return c.json({ success: true })
})

export default app
