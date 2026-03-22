import { Hono } from 'hono'
import { getDb } from '@/lib/db'
import { eq, desc, sql } from 'drizzle-orm'
import { examResults, exams, subjects, students } from '@/db/schema'
import { authMiddleware, requireRole } from '@/middleware/auth'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', authMiddleware)

app.get('/student/:studentId', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = getDb(c)
  const studentId = c.req.param('studentId')
  
  const student = await db.select().from(students).where(eq(students.id, studentId)).get()
  if (!student) return c.notFound()
  
  const results = await db.select()
    .from(examResults)
    .where(eq(examResults.studentId, studentId))
    .orderBy(desc(examResults.createdAt))
  
  const examIds = [...new Set(results.map(r => r.examId))]
  const examList = await db.select().from(exams).where(examIds.length ? sql`${exams.id} IN ${examIds}` : undefined)
  const examMap = Object.fromEntries(examList.map(e => [e.id, e]))
  
  const subjectIds = [...new Set(examList.map(e => e.subjectId))]
  const subjectsList = await db.select().from(subjects).where(subjectIds.length ? sql`${subjects.id} IN ${subjectIds}` : undefined)
  const subjectMap = Object.fromEntries(subjectsList.map(s => [s.id, s]))
  
  const resultsWithExam = results.map(r => {
    const exam = examMap[r.examId]
    return {
      ...r,
      examTitle: exam?.title || 'Unknown',
      examType: exam?.type || 'Unknown',
      examDate: exam?.examDate,
      totalMarks: exam?.totalMarks || 100,
      subjectName: subjectMap[exam?.subjectId || '']?.name || 'Unknown',
    }
  })
  
  return c.json(resultsWithExam)
})

export default app
