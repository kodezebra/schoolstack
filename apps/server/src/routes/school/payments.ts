import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, desc, and, sql } from 'drizzle-orm'
import { feePayments, students, feeStructures } from '@/db/schema'
import { authMiddleware, requireRole } from '@/middleware/auth'
import { generateNumber } from '@/lib/generateNumber'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', authMiddleware)

const paymentSchema = z.object({
  studentId: z.string().min(1),
  feeStructureId: z.string().min(1),
  amount: z.number().int().min(0),
  paymentDate: z.string().optional(),
  paymentMethod: z.enum(['cash', 'mobile_money', 'bank', 'school_pay']),
  transactionNo: z.string().optional(),
  receiptNo: z.string().optional(),
  notes: z.string().optional(),
})

app.get('/', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = drizzle(c.env.DB)
  const studentId = c.req.query('studentId')
  const feeStructureId = c.req.query('feeStructureId')
  
  let conditions = []
  if (studentId) conditions.push(eq(feePayments.studentId, studentId))
  if (feeStructureId) conditions.push(eq(feePayments.feeStructureId, feeStructureId))
  
  const payments = await db.select()
    .from(feePayments)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(feePayments.paymentDate))
  
  const studentIds = [...new Set(payments.map(p => p.studentId))]
  const studentsList = await db.select().from(students).where(studentIds.length ? sql`${students.id} IN ${studentIds}` : undefined)
  const studentMap = Object.fromEntries(studentsList.map(s => [s.id, { name: `${s.firstName} ${s.lastName}`, admissionNo: s.admissionNo }]))
  
  const feeIds = [...new Set(payments.map(p => p.feeStructureId))]
  const feesList = await db.select().from(feeStructures).where(feeIds.length ? sql`${feeStructures.id} IN ${feeIds}` : undefined)
  const feeMap = Object.fromEntries(feesList.map(f => [f.id, { title: f.title, amount: f.amount }]))
  
  const paymentsWithDetails = payments.map(p => ({
    ...p,
    studentName: studentMap[p.studentId]?.name || 'Unknown',
    admissionNo: studentMap[p.studentId]?.admissionNo || '',
    feeTitle: feeMap[p.feeStructureId]?.title || 'Unknown',
  }))
  
  return c.json(paymentsWithDetails)
})

app.post('/', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  const data = paymentSchema.parse(body)
  
  const receiptNo = data.receiptNo || await generateNumber(db, 'receipt')
  
  const [payment] = await db.insert(feePayments).values({
    studentId: data.studentId,
    feeStructureId: data.feeStructureId,
    amount: data.amount,
    paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
    paymentMethod: data.paymentMethod,
    transactionNo: data.transactionNo,
    receiptNo,
    notes: data.notes,
  }).returning()
  
  return c.json(payment, 201)
})

export default app
