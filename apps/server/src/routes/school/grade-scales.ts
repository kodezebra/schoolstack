import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, desc } from 'drizzle-orm'
import { gradeScales, academicYears } from '@/db/schema'
import { authMiddleware, requireRole } from '@/middleware/auth'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', authMiddleware)

const gradeScaleSchema = z.object({
  name: z.string().min(1),
  academicYearId: z.string().optional(),
  grades: z.array(z.object({
    grade: z.string(),
    minMarks: z.number(),
    maxMarks: z.number(),
    points: z.number(),
    color: z.string().optional(),
  })),
  isDefault: z.boolean().optional(),
})

app.get('/', requireRole('owner', 'admin', 'editor'), async (c) => {
  const db = drizzle(c.env.DB)
  const academicYearId = c.req.query('academicYearId')
  
  const conditions = academicYearId ? [eq(gradeScales.academicYearId, academicYearId)] : []
  
  const scales = await db.select({
    id: gradeScales.id,
    name: gradeScales.name,
    academicYearId: gradeScales.academicYearId,
    grades: gradeScales.grades,
    isDefault: gradeScales.isDefault,
    createdAt: gradeScales.createdAt,
    academicYearName: academicYears.name,
  }).from(gradeScales)
    .leftJoin(academicYears, eq(gradeScales.academicYearId, academicYears.id))
    .where(conditions.length > 0 ? conditions[0] : undefined)
    .orderBy(desc(gradeScales.isDefault), desc(gradeScales.createdAt))
  
  const parsed = scales.map(s => ({
    ...s,
    grades: JSON.parse(s.grades as string)
  }))
  
  return c.json(parsed)
})

app.get('/:id', requireRole('owner', 'admin', 'editor'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  const scale = await db.select().from(gradeScales).where(eq(gradeScales.id, id)).get()
  
  if (!scale) return c.notFound()
  
  return c.json({
    ...scale,
    grades: JSON.parse(scale.grades)
  })
})

app.post('/', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  const data = gradeScaleSchema.parse(body)
  
  if (data.isDefault) {
    await db.update(gradeScales).set({ isDefault: false })
  }
  
  const [scale] = await db.insert(gradeScales).values({
    name: data.name,
    academicYearId: data.academicYearId || null,
    grades: JSON.stringify(data.grades),
    isDefault: data.isDefault || false,
  }).returning()
  
  return c.json({
    ...scale,
    grades: data.grades
  }, 201)
})

app.patch('/:id', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const updateData: any = { ...body }
  if (body.grades) {
    updateData.grades = JSON.stringify(body.grades)
  }
  
  if (body.isDefault) {
    await db.update(gradeScales).set({ isDefault: false })
  }
  
  const [scale] = await db.update(gradeScales)
    .set(updateData)
    .where(eq(gradeScales.id, id))
    .returning()
  
  if (!scale) return c.notFound()
  
  return c.json({
    ...scale,
    grades: JSON.parse(scale.grades)
  })
})

app.delete('/:id', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  await db.delete(gradeScales).where(eq(gradeScales.id, id))
  return c.json({ success: true })
})

export default app
