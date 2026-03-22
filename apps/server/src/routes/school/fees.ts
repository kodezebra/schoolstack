import { Hono } from 'hono'
import { getDb } from '@/lib/db'
import { eq, desc, and, sql, inArray } from 'drizzle-orm'
import { feeStructures, levels, students, feePayments, feeOverrides, studentFees } from '@/db/schema'
import { authMiddleware, requireRole } from '@/middleware/auth'
import { SCOPE_DISPLAY, SCOPE_OPTIONS, getScopeDisplay, getScopeForLevel } from '@/lib/fees'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', authMiddleware)

export { SCOPE_OPTIONS, getScopeDisplay }

const feeStructureSchema = z.object({
  levelId: z.string().optional().nullable(),
  academicYearId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  amount: z.number().int().min(0),
  dueDate: z.string().optional(),
  scope: z.enum(['all', 'preschool', 'lower_primary', 'upper_primary']).optional(),
  status: z.enum(['active', 'closed']).optional(),
})

app.get('/', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = getDb(c)
  const academicYearId = c.req.query('academicYearId')
  const levelId = c.req.query('levelId')
  
  let conditions = []
  if (academicYearId) conditions.push(eq(feeStructures.academicYearId, academicYearId))
  if (levelId) {
    if (levelId === 'global') {
      conditions.push(sql`${feeStructures.levelId} IS NULL`)
    } else {
      conditions.push(eq(feeStructures.levelId, levelId))
    }
  }
  
  const fees = await db.select()
    .from(feeStructures)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(feeStructures.createdAt))
  
  const levelIds = [...new Set(fees.map(f => f.levelId).filter(id => id !== null))] as string[]
  const levelsList = await db.select().from(levels).where(levelIds.length ? sql`${levels.id} IN ${levelIds}` : undefined)
  const levelMap = Object.fromEntries(levelsList.map(g => [g.id, g.name]))
  
  const feesWithLevel = fees.map(f => ({
    ...f,
    levelName: f.levelId ? (levelMap[f.levelId] || 'Unknown') : 'All Classes',
    scopeDisplay: f.levelId ? 'Specific Class' : (SCOPE_DISPLAY[f.scope || 'all'] || 'All Classes'),
  }))
  
  return c.json(feesWithLevel)
})

app.post('/', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const body = await c.req.json()
  const data = feeStructureSchema.parse(body)
  
  const [fee] = await db.insert(feeStructures).values({
    levelId: data.levelId,
    academicYearId: data.academicYearId,
    title: data.title,
    description: data.description,
    amount: data.amount,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    scope: data.scope || 'all',
    status: data.status || 'active',
  }).returning()
  
  return c.json(fee, 201)
})

app.patch('/:id', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const [fee] = await db.update(feeStructures)
    .set(body)
    .where(eq(feeStructures.id, id))
    .returning()
  
  if (!fee) return c.notFound()
  return c.json(fee)
})

app.delete('/:id', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  
  await db.delete(feeStructures).where(eq(feeStructures.id, id))
  return c.json({ success: true })
})

app.get('/balances', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = getDb(c)
  const academicYearId = c.req.query('academicYearId')
  const levelId = c.req.query('levelId')
  const status = c.req.query('status')

  const allLevels = await db.select().from(levels)
  const levelMap = Object.fromEntries(allLevels.map(l => [l.id, l.name]))

  const studentConditions = []
  if (levelId && levelId !== 'all') {
    studentConditions.push(eq(students.levelId, levelId))
  }
  studentConditions.push(eq(students.status, 'active'))

  const studentsList = await db.select().from(students).where(studentConditions.length ? and(...studentConditions) : undefined)

  const feeConditions = [eq(feeStructures.status, 'active')]
  if (academicYearId) {
    feeConditions.push(eq(feeStructures.academicYearId, academicYearId))
  }
  const allFeeStructures = await db.select().from(feeStructures).where(and(...feeConditions))

  const studentIds = studentsList.map(s => s.id)
  const allPayments = studentIds.length
    ? await db.select().from(feePayments).where(inArray(feePayments.studentId, studentIds))
    : []

  const allOverrides = studentIds.length
    ? await db.select().from(feeOverrides).where(inArray(feeOverrides.studentId, studentIds))
    : []

  const allExtraFees = studentIds.length
    ? await db.select().from(studentFees).where(and(
        inArray(studentFees.studentId, studentIds),
        eq(studentFees.status, 'active')
      ))
    : []

  const paymentsByStudent = Object.groupBy(allPayments, p => p.studentId)
  const overridesByStudent = Object.groupBy(allOverrides, o => o.studentId)
  const extraFeesByStudent = Object.groupBy(allExtraFees, f => f.studentId)

  const studentBalances = studentsList.map(student => {
    const studentLevelName = levelMap[student.levelId] || ''
    const studentScope = getScopeForLevel(studentLevelName)

    const applicableFees = allFeeStructures.filter(fee => {
      if (fee.scope === 'all') return true
      if (fee.scope === studentScope) return true
      if (fee.levelId === student.levelId) return true
      return false
    })

    const studentPayments = paymentsByStudent[student.id] || []
    const studentOverrides = overridesByStudent[student.id] || []
    const studentExtraFees = extraFeesByStudent[student.id] || []
    const overrideMap = new Map(studentOverrides.map(o => [o.feeStructureId, o]))

    let totalFees = 0
    let totalPaid = 0

    applicableFees.forEach(fee => {
      const override = overrideMap.get(fee.id)
      const amountDue = override?.overrideAmount ?? fee.amount
      totalFees += amountDue
      const feePayments = studentPayments.filter(p => p.feeStructureId === fee.id)
      totalPaid += feePayments.reduce((sum, p) => sum + p.amount, 0)
    })

    studentExtraFees.forEach(fee => {
      totalFees += fee.amount
      const extraFeePayments = studentPayments.filter(p => p.extraFeeId === fee.id)
      totalPaid += extraFeePayments.reduce((sum, p) => sum + p.amount, 0)
    })

    const balance = totalFees - totalPaid
    const isPaid = balance <= 0

    return {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNo: student.admissionNo,
      levelName: studentLevelName,
      levelId: student.levelId,
      totalFees,
      totalPaid,
      balance,
      isPaid,
    }
  })

  let filtered = studentBalances
  if (status === 'outstanding') {
    filtered = studentBalances.filter(s => s.balance > 0)
  } else if (status === 'paid') {
    filtered = studentBalances.filter(s => s.balance <= 0)
  }

  const totals = {
    totalFees: filtered.reduce((sum, s) => sum + s.totalFees, 0),
    totalPaid: filtered.reduce((sum, s) => sum + s.totalPaid, 0),
    totalOutstanding: filtered.reduce((sum, s) => sum + Math.max(0, s.balance), 0),
    totalStudents: filtered.length,
    paidStudents: filtered.filter(s => s.balance <= 0).length,
    outstandingStudents: filtered.filter(s => s.balance > 0).length,
  }

  return c.json({
    students: filtered,
    totals
  })
})

const overrideSchema = z.object({
  studentId: z.string().min(1),
  feeStructureId: z.string().min(1),
  overrideAmount: z.number().int().min(0),
  reason: z.string().optional(),
})

app.post('/overrides', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const body = await c.req.json()
  const data = overrideSchema.parse(body)
  
  const existing = await db.select().from(feeOverrides)
    .where(and(
      eq(feeOverrides.studentId, data.studentId),
      eq(feeOverrides.feeStructureId, data.feeStructureId)
    )).get()
  
  if (existing) {
    const [updated] = await db.update(feeOverrides)
      .set({
        overrideAmount: data.overrideAmount,
        reason: data.reason,
      })
      .where(eq(feeOverrides.id, existing.id))
      .returning()
    return c.json(updated)
  }
  
  const [created] = await db.insert(feeOverrides).values({
    studentId: data.studentId,
    feeStructureId: data.feeStructureId,
    overrideAmount: data.overrideAmount,
    reason: data.reason,
  }).returning()
  
  return c.json(created, 201)
})

app.delete('/overrides', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const studentId = c.req.query('studentId')
  const feeStructureId = c.req.query('feeStructureId')
  
  if (!studentId || !feeStructureId) {
    return c.json({ error: 'Missing studentId or feeStructureId' }, 400)
  }
  
  await db.delete(feeOverrides).where(and(
    eq(feeOverrides.studentId, studentId),
    eq(feeOverrides.feeStructureId, feeStructureId)
  ))
  return c.json({ success: true })
})

export default app
