import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, desc } from 'drizzle-orm'
import { academicYears } from '@/db/schema'
import { authMiddleware, requireRole } from '@/middleware/auth'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', authMiddleware)

const academicYearSchema = z.object({
  name: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(['active', 'closed']).optional(),
})

app.get('/', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const years = await db.select().from(academicYears).orderBy(desc(academicYears.isCurrent), desc(academicYears.createdAt))
  return c.json(years)
})

app.post('/', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  const data = academicYearSchema.parse(body)
  
  if (data.status === 'active' || data.status === undefined) {
    await db.update(academicYears).set({ isCurrent: false })
  }
  
  const [year] = await db.insert(academicYears).values({
    name: data.name,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    isCurrent: data.status === 'active' ? true : false,
    status: data.status || 'active',
  }).returning()
  
  return c.json(year, 201)
})

app.patch('/:id', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const body = await c.req.json()
  
  if (body.isCurrent) {
    await db.update(academicYears).set({ isCurrent: false })
  }
  
  const [year] = await db.update(academicYears)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(academicYears.id, id))
    .returning()
  
  if (!year) return c.notFound()
  return c.json(year)
})

app.delete('/:id', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  await db.delete(academicYears).where(eq(academicYears.id, id))
  return c.json({ success: true })
})

export default app
