import { Hono } from 'hono'
import { getDb } from '@/lib/db'
import { eq, sql } from 'drizzle-orm'
import { academicYears, students, staff, feeStructures, feePayments } from '@/db/schema'
import { authMiddleware, requireRole } from '@/middleware/auth'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', authMiddleware)

app.get('/', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = getDb(c)
  
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

export default app
