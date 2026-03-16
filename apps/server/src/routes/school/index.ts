import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, desc, and, like, sql } from 'drizzle-orm'
import { 
  academicYears, 
  grades, 
  students, 
  staff, 
  feeStructures, 
  feePayments 
} from '@/db/schema'
import { authMiddleware, requireRole } from '@/middleware/auth'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// =======================
// Dashboard Stats (Public within school)
// =======================
app.get('/', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = drizzle(c.env.DB)
  
  const [studentsResult, staffResult, currentYear] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(students).where(eq(students.status, 'active' as any)),
    db.select({ count: sql<number>`count(*)` }).from(staff).where(eq(staff.status, 'active' as any)),
    db.select().from(academicYears).where(eq(academicYears.isCurrent, true)).get(),
  ])
  
  const totalStudents = studentsResult[0]?.count || 0
  const totalStaff = staffResult[0]?.count || 0
  
  let totalFeesDue = 0
  let totalCollected = 0
  
  if (currentYear) {
    const feesResult = await db.select({ 
      total: sql<number>`coalesce(sum(${feeStructures.amount}), 0)` 
    }).from(feeStructures).where(eq(feeStructures.academicYearId, currentYear.id))
    totalFeesDue = feesResult[0]?.total || 0
    
    const collectedResult = await db.select({
      collected: sql<number>`coalesce(sum(${feePayments.amount}), 0)`
    })
    .from(feePayments)
    .innerJoin(feeStructures, eq(feePayments.feeStructureId, feeStructures.id))
    .where(eq(feeStructures.academicYearId, currentYear.id))
    totalCollected = collectedResult[0]?.collected || 0
  }
  
  return c.json({
    totalStudents,
    totalStaff,
    totalFeesDue,
    totalCollected,
    currentYear
  })
})

// =======================
// Academic Years
// =======================
const academicYearSchema = z.object({
  name: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(['active', 'closed']).optional(),
})

app.get('/academic-years', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const years = await db.select().from(academicYears).orderBy(desc(academicYears.isCurrent), desc(academicYears.createdAt))
  return c.json(years)
})

app.post('/academic-years', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  const data = academicYearSchema.parse(body)
  
  // If setting as current, unset other current years
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

app.patch('/academic-years/:id', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const body = await c.req.json()
  
  // If setting as current, unset other current years
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

app.delete('/academic-years/:id', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  await db.delete(academicYears).where(eq(academicYears.id, id))
  return c.json({ success: true })
})

// =======================
// Grades
// =======================
const gradeSchema = z.object({
  name: z.string().min(1),
  order: z.number().optional(),
  academicYearId: z.string().min(1),
})

app.get('/grades', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = drizzle(c.env.DB)
  const academicYearId = c.req.query('academicYearId')
  
  const where = academicYearId 
    ? eq(grades.academicYearId, academicYearId)
    : undefined
    
  const gradeList = await db.select().from(grades).where(where).orderBy(grades.order)
  return c.json(gradeList)
})

app.post('/grades', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  const data = gradeSchema.parse(body)
  
  const [grade] = await db.insert(grades).values({
    name: data.name,
    order: data.order || 0,
    academicYearId: data.academicYearId,
  }).returning()
  
  return c.json(grade, 201)
})

app.patch('/grades/:id', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const [grade] = await db.update(grades)
    .set(body)
    .where(eq(grades.id, id))
    .returning()
  
  if (!grade) return c.notFound()
  return c.json(grade)
})

app.delete('/grades/:id', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  await db.delete(grades).where(eq(grades.id, id))
  return c.json({ success: true })
})

// =======================
// Students
// =======================
const studentSchema = z.object({
  admissionNo: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  gender: z.enum(['male', 'female', 'other']),
  dob: z.string().optional(),
  gradeId: z.string().min(1),
  rollNo: z.string().optional(),
  parentName: z.string().min(1),
  parentPhone: z.string().min(1),
  parentEmail: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  status: z.enum(['active', 'transferred', 'graduated', 'withdrawn']).optional(),
})

app.get('/students', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = drizzle(c.env.DB)
  const gradeId = c.req.query('gradeId')
  const status = c.req.query('status') as 'active' | 'transferred' | 'graduated' | 'withdrawn' | undefined
  const search = c.req.query('search')
  
  let conditions: any[] = []
  if (gradeId) conditions.push(eq(students.gradeId, gradeId))
  if (status) conditions.push(eq(students.status, status))
  if (search) conditions.push(like(students.firstName, `%${search}%`))
  
  const studentList = await db.select()
    .from(students)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(students.enrollmentDate))
  
  // Get grade names
  const gradeIds = [...new Set(studentList.map(s => s.gradeId))]
  const gradesList = await db.select().from(grades).where(gradeIds.length ? sql`${grades.id} IN ${gradeIds}` : undefined)
  const gradeMap = Object.fromEntries(gradesList.map(g => [g.id, g.name]))
  
  const studentsWithGrade = studentList.map(s => ({
    ...s,
    gradeName: gradeMap[s.gradeId] || 'Unknown'
  }))
  
  return c.json(studentsWithGrade)
})

app.get('/students/:id', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  const student = await db.select().from(students).where(eq(students.id, id)).get()
  if (!student) return c.notFound()
  
  // Get grade
  const grade = await db.select().from(grades).where(eq(grades.id, student.gradeId)).get()
  
  // Get payment history
  const payments = await db.select()
    .from(feePayments)
    .where(eq(feePayments.studentId, id))
    .orderBy(desc(feePayments.paymentDate))
  
  // Get fee structures
  const feeIds = [...new Set(payments.map(p => p.feeStructureId))]
  const feeStructs = await db.select().from(feeStructures).where(feeIds.length ? sql`${feeStructures.id} IN ${feeIds}` : undefined)
  const feeMap = Object.fromEntries(feeStructs.map(f => [f.id, f]))
  
  const paymentsWithFee = payments.map(p => ({
    ...p,
    feeTitle: feeMap[p.feeStructureId]?.title || 'Unknown'
  }))
  
  return c.json({ ...student, grade, payments: paymentsWithFee })
})

app.post('/students', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  const data = studentSchema.parse(body)
  
  const [student] = await db.insert(students).values({
    admissionNo: data.admissionNo,
    firstName: data.firstName,
    lastName: data.lastName,
    gender: data.gender,
    dob: data.dob ? new Date(data.dob) : undefined,
    gradeId: data.gradeId,
    rollNo: data.rollNo,
    parentName: data.parentName,
    parentPhone: data.parentPhone,
    parentEmail: data.parentEmail || undefined,
    address: data.address,
    enrollmentDate: new Date(),
  }).returning()
  
  return c.json(student, 201)
})

app.patch('/students/:id', requireRole('owner', 'admin'), async (c) => {
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

app.delete('/students/:id', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  // Soft delete - just mark as withdrawn
  const [student] = await db.update(students)
    .set({ status: 'withdrawn', updatedAt: new Date() })
    .where(eq(students.id, id))
    .returning()
  
  if (!student) return c.notFound()
  return c.json({ success: true })
})

// =======================
// Staff
// =======================
const staffSchema = z.object({
  employeeNo: z.string().min(1),
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

app.get('/staff', requireRole('owner', 'admin', 'teacher'), async (c) => {
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

app.get('/staff/:id', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  const staffMember = await db.select().from(staff).where(eq(staff.id, id)).get()
  if (!staffMember) return c.notFound()
  
  return c.json(staffMember)
})

app.post('/staff', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  const data = staffSchema.parse(body)
  
  const [staffMember] = await db.insert(staff).values({
    employeeNo: data.employeeNo,
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

app.patch('/staff/:id', requireRole('owner', 'admin'), async (c) => {
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

app.delete('/staff/:id', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  await db.delete(staff).where(eq(staff.id, id))
  return c.json({ success: true })
})

// =======================
// Fee Structures
// =======================
const feeStructureSchema = z.object({
  gradeId: z.string().min(1),
  academicYearId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  amount: z.number().int().min(0),
  dueDate: z.string().optional(),
  status: z.enum(['active', 'closed']).optional(),
})

app.get('/fees', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = drizzle(c.env.DB)
  const academicYearId = c.req.query('academicYearId')
  const gradeId = c.req.query('gradeId')
  
  let conditions = []
  if (academicYearId) conditions.push(eq(feeStructures.academicYearId, academicYearId))
  if (gradeId) conditions.push(eq(feeStructures.gradeId, gradeId))
  
  const fees = await db.select()
    .from(feeStructures)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(feeStructures.createdAt))
  
  // Get grade names
  const gradeIds = [...new Set(fees.map(f => f.gradeId))]
  const gradesList = await db.select().from(grades).where(gradeIds.length ? sql`${grades.id} IN ${gradeIds}` : undefined)
  const gradeMap = Object.fromEntries(gradesList.map(g => [g.id, g.name]))
  
  const feesWithGrade = fees.map(f => ({
    ...f,
    gradeName: gradeMap[f.gradeId] || 'Unknown'
  }))
  
  return c.json(feesWithGrade)
})

app.post('/fees', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  const data = feeStructureSchema.parse(body)
  
  const [fee] = await db.insert(feeStructures).values({
    gradeId: data.gradeId,
    academicYearId: data.academicYearId,
    title: data.title,
    description: data.description,
    amount: data.amount,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    status: data.status || 'active',
  }).returning()
  
  return c.json(fee, 201)
})

app.patch('/fees/:id', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const [fee] = await db.update(feeStructures)
    .set(body)
    .where(eq(feeStructures.id, id))
    .returning()
  
  if (!fee) return c.notFound()
  return c.json(fee)
})

app.delete('/fees/:id', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  await db.delete(feeStructures).where(eq(feeStructures.id, id))
  return c.json({ success: true })
})

// =======================
// Fee Payments
// =======================
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

app.get('/payments', requireRole('owner', 'admin', 'teacher'), async (c) => {
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
  
  // Get student and fee info
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

app.post('/payments', requireRole('owner', 'admin'), async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  const data = paymentSchema.parse(body)
  
  const [payment] = await db.insert(feePayments).values({
    studentId: data.studentId,
    feeStructureId: data.feeStructureId,
    amount: data.amount,
    paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
    paymentMethod: data.paymentMethod,
    transactionNo: data.transactionNo,
    receiptNo: data.receiptNo,
    notes: data.notes,
  }).returning()
  
  return c.json(payment, 201)
})

app.get('/students/:id/fees', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  const student = await db.select().from(students).where(eq(students.id, id)).get()
  if (!student) return c.notFound()
  
  // Get all active fee structures for student's grade
  const feeStructs = await db.select()
    .from(feeStructures)
    .where(and(
      eq(feeStructures.gradeId, student.gradeId),
      eq(feeStructures.status, 'active')
    ))
  
  // Get payments for each fee
  const feeIds = feeStructs.map(f => f.id)
  const payments = feeIds.length 
    ? await db.select().from(feePayments).where(sql`${feePayments.feeStructureId} IN ${feeIds}`)
    : []
  
  const paymentsByFee = Object.groupBy(payments, p => p.feeStructureId)
  
  const feesWithBalance = feeStructs.map(f => {
    const feePayments = paymentsByFee[f.id] || []
    const paid = feePayments.reduce((sum, p) => sum + p.amount, 0)
    return {
      ...f,
      paid,
      balance: f.amount - paid,
      isPaid: paid >= f.amount
    }
  })
  
  return c.json(feesWithBalance)
})

export default app
