import { Hono } from 'hono'
import { getDb } from '@/lib/db'
import { eq, desc, and } from 'drizzle-orm'
import { staff } from '@/db/schema'
import { authMiddleware, requireRole } from '@/middleware/auth'
import { generateNumber } from '@/lib/generateNumber'
import { deletePhoto } from '@/lib/storage'
import { createPhotoRoutes } from '@/lib/photoRoutes'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
  ASSETS: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', authMiddleware)

const staffSchema = z.object({
  employeeNo: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['teacher', 'admin', 'counselor', 'principal']),
  department: z.string().optional(),
  qualifications: z.string().optional(),
  experience: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

app.get('/', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = getDb(c)
  const role = c.req.query('role') as 'teacher' | 'admin' | 'counselor' | 'principal' | undefined
  const status = c.req.query('status') as 'active' | 'inactive' | undefined
  
  let conditions: any[] = []
  if (role) conditions.push(eq(staff.role, role))
  if (status) conditions.push(eq(staff.status, status))
  
  const staffList = await db.select()
    .from(staff)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(staff.joinDate))
  
  return c.json(staffList)
})

app.get('/:id', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  
  const staffMember = await db.select().from(staff).where(eq(staff.id, id)).get()
  if (!staffMember) return c.notFound()
  
  return c.json(staffMember)
})

app.post('/', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const body = await c.req.json()
  const data = staffSchema.parse(body)
  
  const employeeNo = data.employeeNo || await generateNumber(db, 'staff', data.role)
  
  const [staffMember] = await db.insert(staff).values({
    employeeNo,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    role: data.role,
    department: data.department,
    qualifications: data.qualifications,
    experience: data.experience,
    joinDate: new Date(),
  }).returning()
  
  return c.json(staffMember, 201)
})

app.patch('/:id', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const [staffMember] = await db.update(staff)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(staff.id, id))
    .returning()
  
  if (!staffMember) return c.notFound()
  return c.json(staffMember)
})

app.delete('/:id', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  
  const staffMember = await db.select().from(staff).where(eq(staff.id, id)).get()
  if (!staffMember) return c.notFound()

  await deletePhoto(c.env.ASSETS, staffMember.photo || '')

  await db.delete(staff).where(eq(staff.id, id))
  
  return c.json({ success: true })
})

app.route('/', createPhotoRoutes(staff, 'staff', staff.id))

export default app
