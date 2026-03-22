import { Hono } from 'hono'
import { getDb } from '@/lib/db'
import { eq, desc, and, like, sql } from 'drizzle-orm'
import { students, levels, feePayments, feeStructures, feeOverrides, studentFees } from '@/db/schema'
import { authMiddleware, requireRole } from '@/middleware/auth'
import { generateNumber } from '@/lib/generateNumber'
import { deletePhoto } from '@/lib/storage'
import { getScopeForLevel } from '@/lib/fees'
import { createPhotoRoutes } from '@/lib/photoRoutes'
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
  const db = getDb(c)
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
  const db = getDb(c)
  const id = c.req.param('id')
  
  const student = await db.select().from(students).where(eq(students.id, id)).get()
  if (!student) return c.notFound()
  
  const level = await db.select().from(levels).where(eq(levels.id, student.levelId)).get()
  
  const payments = await db.select()
    .from(feePayments)
    .where(eq(feePayments.studentId, id))
    .orderBy(desc(feePayments.paymentDate))
  
  const feeIds = [...new Set(payments.map(p => p.feeStructureId).filter(Boolean))]
  const feeStructs = feeIds.length ? await db.select().from(feeStructures).where(sql`${feeStructures.id} IN ${feeIds}`) : []
  const feeMap = Object.fromEntries(feeStructs.map(f => [f.id, f]))
  
  const extraFeeIds = [...new Set(payments.map(p => p.extraFeeId).filter(Boolean))]
  const extraFeeStructs = extraFeeIds.length ? await db.select().from(studentFees).where(sql`${studentFees.id} IN ${extraFeeIds}`) : []
  const extraFeeMap = Object.fromEntries(extraFeeStructs.map(f => [f.id, f]))
  
  const paymentsWithFee = payments.map(p => ({
    ...p,
    feeTitle: p.feeStructureId ? feeMap[p.feeStructureId]?.title : extraFeeMap[p.extraFeeId || '']?.title || 'Unknown'
  }))
  
  return c.json({ ...student, level, payments: paymentsWithFee })
})

app.get('/:id/fees', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  
  const student = await db.select().from(students).where(eq(students.id, id)).get()
  if (!student) return c.notFound()
  
  const studentLevel = await db.select().from(levels).where(eq(levels.id, student.levelId)).get()
  const studentLevelName = studentLevel?.name || ''
  
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
    ? await db.select().from(feePayments).where(
        sql`${feePayments.feeStructureId} IN ${feeIds} AND ${feePayments.studentId} = ${id}`
      )
    : []
  
  const overrides = feeIds.length
    ? await db.select().from(feeOverrides).where(sql`${feeOverrides.feeStructureId} IN ${feeIds} AND ${feeOverrides.studentId} = ${id}`)
    : []
  
  const extraFees = await db.select()
    .from(studentFees)
    .where(and(
      eq(studentFees.studentId, id),
      eq(studentFees.status, 'active')
    ))
  
  const extraFeeIds = extraFees.map(f => f.id)
  const extraFeePayments = extraFeeIds.length
    ? await db.select().from(feePayments).where(sql`${feePayments.extraFeeId} IN ${extraFeeIds}`)
    : []
  
  const paymentsByFee: Record<string, typeof payments> = {}
  payments.forEach(p => {
    if (p.feeStructureId) {
      if (!paymentsByFee[p.feeStructureId]) {
        paymentsByFee[p.feeStructureId] = []
      }
      paymentsByFee[p.feeStructureId].push(p)
    }
  })
  
  const extraPaymentsByFee: Record<string, typeof extraFeePayments> = {}
  extraFeePayments.forEach(p => {
    if (p.extraFeeId) {
      if (!extraPaymentsByFee[p.extraFeeId]) {
        extraPaymentsByFee[p.extraFeeId] = []
      }
      extraPaymentsByFee[p.extraFeeId].push(p)
    }
  })
  
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
      type: 'base',
      paid,
      amountDue,
      balance,
      isPaid,
      hasOverride: !!override,
      overrideReason: override?.reason || null
    }
  })
  
  const extraFeesWithBalance = extraFees.map(f => {
    const feePaymentsList = extraPaymentsByFee[f.id] || []
    const paid = feePaymentsList.reduce((sum, p) => sum + p.amount, 0)
    const amountDue = f.amount
    const balance = amountDue - paid
    const isPaid = paid >= amountDue
    return {
      id: f.id,
      title: f.title,
      description: null,
      amount: f.amount,
      dueDate: null,
      scope: null,
      status: 'active',
      type: 'extra',
      isRecurring: f.isRecurring,
      paid,
      amountDue,
      balance,
      isPaid,
      hasOverride: false,
      overrideReason: null
    }
  })
  
  return c.json([...feesWithBalance, ...extraFeesWithBalance])
})

app.get('/extra-fee-students', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = getDb(c)
  const title = c.req.query('title')
  const levelId = c.req.query('levelId')
  const search = c.req.query('search')
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '50')
  const offset = (page - 1) * limit

  if (!title) {
    return c.json({ error: 'title is required' }, 400)
  }

  let conditions: any[] = [
    eq(studentFees.title, title),
    eq(studentFees.status, 'active')
  ]
  if (levelId) conditions.push(eq(students.levelId, levelId))
  if (search) {
    conditions.push(
      sql`(${like(students.firstName, `%${search}%`)} OR ${like(students.lastName, `%${search}%`)} OR ${like(students.admissionNo, `%${search}%`)})`
    )
  }

  const whereClause = and(...conditions)

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(studentFees)
    .innerJoin(students, eq(studentFees.studentId, students.id))
    .where(whereClause)

  const total = totalResult?.count || 0

  const studentList = await db
    .select({
      id: students.id,
      admissionNo: students.admissionNo,
      firstName: students.firstName,
      lastName: students.lastName,
      levelId: students.levelId,
      levelName: levels.name,
      extraFeeId: studentFees.id,
      amount: studentFees.amount,
      isRecurring: studentFees.isRecurring,
    })
    .from(studentFees)
    .innerJoin(students, eq(studentFees.studentId, students.id))
    .leftJoin(levels, eq(students.levelId, levels.id))
    .where(whereClause)
    .orderBy(levels.order, students.lastName)
    .limit(limit)
    .offset(offset)

  return c.json({
    data: studentList,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
})

app.get('/extra-fee-counts', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = getDb(c)

  const counts = await db
    .select({
      title: studentFees.title,
      count: sql<number>`count(*)`,
    })
    .from(studentFees)
    .where(eq(studentFees.status, 'active'))
    .groupBy(studentFees.title)

  return c.json(counts)
})

app.post('/', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
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
  const db = getDb(c)
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
  const db = getDb(c)
  const id = c.req.param('id')
  
  const student = await db.select().from(students).where(eq(students.id, id)).get()
  if (!student) return c.notFound()

  await deletePhoto(c.env.ASSETS, student.photo || '')

  await db.delete(students).where(eq(students.id, id))
  
  return c.json({ success: true })
})

// Extra fees (add-on fees like transport, trips, etc.)
const extraFeeSchema = z.object({
  title: z.string().min(1),
  amount: z.number().int().min(0),
  isRecurring: z.boolean().default(true),
})

app.get('/:id/fees/extra', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  
  const student = await db.select().from(students).where(eq(students.id, id)).get()
  if (!student) return c.notFound()
  
  const fees = await db.select()
    .from(studentFees)
    .where(and(
      eq(studentFees.studentId, id),
      eq(studentFees.status, 'active')
    ))
    .orderBy(desc(studentFees.createdAt))
  
  return c.json(fees)
})

app.post('/:id/fees/extra', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  const body = await c.req.json()
  const data = extraFeeSchema.parse(body)
  
  const student = await db.select().from(students).where(eq(students.id, id)).get()
  if (!student) return c.notFound()
  
  const [fee] = await db.insert(studentFees).values({
    studentId: id,
    title: data.title,
    amount: data.amount,
    isRecurring: data.isRecurring,
  }).returning()
  
  return c.json(fee, 201)
})

app.patch('/:id/fees/extra/:feeId', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const { id, feeId } = c.req.param()
  const body = await c.req.json()
  
  const [fee] = await db.update(studentFees)
    .set({
      title: body.title,
      amount: body.amount,
      isRecurring: body.isRecurring,
    })
    .where(and(
      eq(studentFees.id, feeId),
      eq(studentFees.studentId, id)
    ))
    .returning()
  
  if (!fee) return c.notFound()
  return c.json(fee)
})

app.delete('/:id/fees/extra/:feeId', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const { id, feeId } = c.req.param()
  
  const [fee] = await db.update(studentFees)
    .set({ status: 'removed' })
    .where(and(
      eq(studentFees.id, feeId),
      eq(studentFees.studentId, id)
    ))
    .returning()
  
  if (!fee) return c.notFound()
  return c.json({ success: true })
})

app.route('/', createPhotoRoutes(students, 'students', students.id))

export default app
