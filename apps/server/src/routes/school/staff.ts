import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, desc, and } from 'drizzle-orm'
import { staff } from '@/db/schema'
import { authMiddleware, requireRole } from '@/middleware/auth'
import { generateNumber } from '@/lib/generateNumber'
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
  const db = drizzle(c.env.DB)
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
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  const staffMember = await db.select().from(staff).where(eq(staff.id, id)).get()
  if (!staffMember) return c.notFound()
  
  return c.json(staffMember)
})

app.post('/', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
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
  const db = drizzle(c.env.DB)
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
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  const staffMember = await db.select().from(staff).where(eq(staff.id, id)).get()
  if (!staffMember) return c.notFound()

  // Clean up photo if exists
  if (staffMember.photo) {
    let key = staffMember.photo
    if (staffMember.photo.includes('/assets/')) {
      key = staffMember.photo.split('/assets/')[1]
    }
    try {
      await c.env.ASSETS.delete(key)
    } catch (err) {
      console.error('Failed to delete photo from storage:', err)
    }
  }

  await db.delete(staff).where(eq(staff.id, id))
  
  return c.json({ success: true })
})

app.post('/:id/photo', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  const formData = await c.req.parseBody()
  const file = formData['photo'] as File | null
  
  if (!file) {
    return c.json({ error: 'No file provided' }, 400)
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return c.json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' }, 400)
  }
  
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    return c.json({ error: 'File too large. Maximum size is 2MB.' }, 400)
  }
  
  const key = `photos/staff/${id}.jpg`
  
  try {
    await c.env.ASSETS.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
      customMetadata: { originalName: file.name }
    })
  } catch (err) {
    console.error('R2 upload error:', err)
    return c.json({ error: 'Failed to upload file to storage' }, 500)
  }
  
  const origin = new URL(c.req.url).origin
  const url = `${origin}/api/assets/${key}`
  
  const [updated] = await db.update(staff)
    .set({ photo: url, updatedAt: new Date() })
    .where(eq(staff.id, id))
    .returning()
  
  if (!updated) return c.notFound()
  
  return c.json({ photo: url, success: true })
})

app.delete('/:id/photo', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  const staffMember = await db.select().from(staff).where(eq(staff.id, id)).get()
  if (!staffMember) return c.notFound()
  
  if (staffMember.photo) {
    // Extract key from full URL if needed
    let key = staffMember.photo
    if (staffMember.photo.includes('/assets/')) {
      key = staffMember.photo.split('/assets/')[1]
    }
    await c.env.ASSETS.delete(key)
  }
  
  const [updated] = await db.update(staff)
    .set({ photo: null, updatedAt: new Date() })
    .where(eq(staff.id, id))
    .returning()
  
  return c.json({ success: true })
})

export default app
