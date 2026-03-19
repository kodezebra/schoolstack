import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, desc, and, like, sql, or } from 'drizzle-orm'
import { students, levels, feePayments, feeStructures, feeOverrides } from '@/db/schema'
import { authMiddleware, requireRole } from '@/middleware/auth'
import { generateNumber } from '@/lib/generateNumber'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
  ASSETS: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', authMiddleware)

const studentSchema = z.object({
  admissionNo: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  gender: z.enum(['male', 'female', 'other']),
  dob: z.string().optional(),
  levelId: z.string().min(1),
  rollNo: z.string().optional(),
  parentName: z.string().min(1),
  parentPhone: z.string().min(1),
  parentEmail: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  status: z.enum(['active', 'transferred', 'graduated', 'withdrawn']).optional(),
})

app.get('/', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = drizzle(c.env.DB)
  const levelId = c.req.query('levelId')
  const status = c.req.query('status') as 'active' | 'transferred' | 'graduated' | 'withdrawn' | undefined
  const search = c.req.query('search')
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = (page - 1) * limit
  
  let conditions: any[] = []
  if (levelId) conditions.push(eq(students.levelId, levelId))
  if (status) conditions.push(eq(students.status, status))
  if (search) conditions.push(like(students.firstName, `%${search}%`))
  
  const whereClause = conditions.length ? and(...conditions) : undefined
  
  const [studentList, totalResult] = await Promise.all([
    db.select()
      .from(students)
      .where(whereClause)
      .orderBy(desc(students.enrollmentDate))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` })
      .from(students)
      .where(whereClause)
  ])
  
  const total = totalResult[0]?.count || 0
  
  const levelIds = [...new Set(studentList.map(s => s.levelId))]
  const levelsList = await db.select().from(levels).where(levelIds.length ? sql`${levels.id} IN ${levelIds}` : undefined)
  const levelMap = Object.fromEntries(levelsList.map(g => [g.id, g.name]))
  
  const studentsWithLevel = studentList.map(s => ({
    ...s,
    levelName: levelMap[s.levelId] || 'Unknown'
  }))
  
  return c.json({
    data: studentsWithLevel,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
})

app.get('/:id', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  const student = await db.select().from(students).where(eq(students.id, id)).get()
  if (!student) return c.notFound()
  
  const level = await db.select().from(levels).where(eq(levels.id, student.levelId)).get()
  
  const payments = await db.select()
    .from(feePayments)
    .where(eq(feePayments.studentId, id))
    .orderBy(desc(feePayments.paymentDate))
  
  const feeIds = [...new Set(payments.map(p => p.feeStructureId))]
  const feeStructs = await db.select().from(feeStructures).where(feeIds.length ? sql`${feeStructures.id} IN ${feeIds}` : undefined)
  const feeMap = Object.fromEntries(feeStructs.map(f => [f.id, f]))
  
  const paymentsWithFee = payments.map(p => ({
    ...p,
    feeTitle: feeMap[p.feeStructureId]?.title || 'Unknown'
  }))
  
  return c.json({ ...student, level, payments: paymentsWithFee })
})

app.get('/:id/fees', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  const student = await db.select().from(students).where(eq(students.id, id)).get()
  if (!student) return c.notFound()
  
  const studentLevel = await db.select().from(levels).where(eq(levels.id, student.levelId)).get()
  const studentLevelName = studentLevel?.name || ''
  
  const scopeRules: Record<string, { contains: string[] }> = {
    preschool: { contains: ['day care', 'baby class', 'middle class', 'top class', 'nursery'] },
    lower_primary: { contains: ['primary 1', 'primary 2', 'primary 3'] },
    upper_primary: { contains: ['primary 4', 'primary 5', 'primary 6', 'primary 7'] },
  }
  
  const getScopeForLevel = (levelName: string): string | null => {
    const lower = levelName.toLowerCase()
    for (const [scope, rules] of Object.entries(scopeRules)) {
      if (rules.contains.some(term => lower.includes(term))) {
        return scope
      }
    }
    return null
  }
  
  const studentScope = getScopeForLevel(studentLevelName)
  
  const allFeeStructs = await db.select()
    .from(feeStructures)
    .where(eq(feeStructures.status, 'active'))
  
  const applicableFees = allFeeStructs.filter(fee => {
    if (fee.scope === 'all') return true
    if (fee.scope === studentScope) return true
    if (fee.levelId === student.levelId) return true
    return false
  })
  
  const feeIds = applicableFees.map(f => f.id)
  
  const payments = feeIds.length 
    ? await db.select().from(feePayments).where(sql`${feePayments.feeStructureId} IN ${feeIds}`)
    : []
  
  const overrides = feeIds.length
    ? await db.select().from(feeOverrides).where(sql`${feeOverrides.feeStructureId} IN ${feeIds} AND ${feeOverrides.studentId} = ${id}`)
    : []
  
  const paymentsByFee = Object.groupBy(payments, p => p.feeStructureId)
  const overrideMap = new Map(overrides.map(o => [o.feeStructureId, o]))
  
  const feesWithBalance = applicableFees.map(f => {
    const feePaymentsList = paymentsByFee[f.id] || []
    const paid = feePaymentsList.reduce((sum, p) => sum + p.amount, 0)
    const override = overrideMap.get(f.id)
    const amountDue = override?.overrideAmount ?? f.amount
    const balance = amountDue - paid
    const isPaid = paid >= amountDue
    return {
      ...f,
      paid,
      amountDue,
      balance,
      isPaid,
      hasOverride: !!override,
      overrideReason: override?.reason || null
    }
  })
  
  return c.json(feesWithBalance)
})

app.post('/', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  const data = studentSchema.parse(body)
  
  const admissionNo = data.admissionNo || await generateNumber(db, 'student')
  
  const [student] = await db.insert(students).values({
    admissionNo,
    firstName: data.firstName,
    lastName: data.lastName,
    gender: data.gender,
    dob: data.dob ? new Date(data.dob) : undefined,
    levelId: data.levelId,
    rollNo: data.rollNo,
    parentName: data.parentName,
    parentPhone: data.parentPhone,
    parentEmail: data.parentEmail || undefined,
    address: data.address,
    enrollmentDate: new Date(),
  }).returning()
  
  return c.json(student, 201)
})

app.patch('/:id', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const [student] = await db.update(students)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(students.id, id))
    .returning()
  
  if (!student) return c.notFound()
  return c.json(student)
})

app.delete('/:id', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  const student = await db.select().from(students).where(eq(students.id, id)).get()
  if (!student) return c.notFound()

  // Clean up photo if exists
  if (student.photo) {
    let key = student.photo
    if (student.photo.includes('/assets/')) {
      key = student.photo.split('/assets/')[1]
    }
    try {
      await c.env.ASSETS.delete(key)
    } catch (err) {
      console.error('Failed to delete photo from storage:', err)
    }
  }

  await db.delete(students).where(eq(students.id, id))
  
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
  
  const key = `photos/students/${id}.jpg`
  
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
  
  const [updated] = await db.update(students)
    .set({ photo: url, updatedAt: new Date() })
    .where(eq(students.id, id))
    .returning()
  
  if (!updated) return c.notFound()
  
  return c.json({ photo: url, success: true })
})

app.delete('/:id/photo', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  const student = await db.select().from(students).where(eq(students.id, id)).get()
  if (!student) return c.notFound()
  
  if (student.photo) {
    // Extract key from full URL if needed
    let key = student.photo
    if (student.photo.includes('/assets/')) {
      key = student.photo.split('/assets/')[1]
    }
    await c.env.ASSETS.delete(key)
  }
  
  const [updated] = await db.update(students)
    .set({ photo: null, updatedAt: new Date() })
    .where(eq(students.id, id))
    .returning()
  
  return c.json({ success: true })
})

export default app
