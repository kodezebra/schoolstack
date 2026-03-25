import { Hono } from 'hono'
import { getDb } from '@/lib/db'
import { eq, desc, and, sql } from 'drizzle-orm'
import { exams, subjects, levels, students, examResults, academicYears, levelSubjects, examSets, staff } from '@/db/schema'
import { authMiddleware, requireRole } from '@/middleware/auth'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', authMiddleware)

const examSchema = z.object({
  title: z.string().min(1),
  type: z.enum(['test', 'midterm', 'final', 'assignment', 'quiz']),
  academicYearId: z.string().min(1),
  levelId: z.string().min(1),
  subjectId: z.string().min(1),
  termId: z.string().optional(),
  examSetId: z.string().optional(),
  examDate: z.string(),
  totalMarks: z.number().int().min(1).default(100),
  status: z.enum(['draft', 'published']).optional(),
})

app.get('/', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = getDb(c)
  const academicYearId = c.req.query('academicYearId')
  const levelId = c.req.query('levelId')
  const subjectId = c.req.query('subjectId')
  
  let conditions = []
  if (academicYearId) conditions.push(eq(exams.academicYearId, academicYearId))
  if (levelId) conditions.push(eq(exams.levelId, levelId))
  if (subjectId) conditions.push(eq(exams.subjectId, subjectId))
  
  const examList = await db.select()
    .from(exams)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(exams.examDate))
  
  const subjectIds = [...new Set(examList.map(e => e.subjectId))]
  const levelIds = [...new Set(examList.map(e => e.levelId))]
  
  const [subjectsList, levelsList] = await Promise.all([
    db.select().from(subjects).where(subjectIds.length ? sql`${subjects.id} IN ${subjectIds}` : undefined),
    db.select().from(levels).where(levelIds.length ? sql`${levels.id} IN ${levelIds}` : undefined),
  ])
  
  const subjectMap = Object.fromEntries(subjectsList.map(s => [s.id, s]))
  const levelMap = Object.fromEntries(levelsList.map(l => [l.id, l.name]))
  
  const examsWithDetails = examList.map(e => ({
    ...e,
    subjectName: subjectMap[e.subjectId]?.name || 'Unknown',
    levelName: levelMap[e.levelId] || 'Unknown',
  }))
  
  return c.json(examsWithDetails)
})

// =======================
// Exam Sets Routes
// =======================

const examSetSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  academicYearId: z.string().min(1),
  termId: z.string().optional(),
  levelId: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['draft', 'published', 'completed']).optional(),
})

app.get('/sets', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = getDb(c)
  const academicYearId = c.req.query('academicYearId')
  const levelId = c.req.query('levelId')
  
  let conditions = []
  if (academicYearId) conditions.push(eq(examSets.academicYearId, academicYearId))
  if (levelId) conditions.push(eq(examSets.levelId, levelId))
  
  const examSetList = await db.select()
    .from(examSets)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(examSets.createdAt))
  
  const levelIds = [...new Set(examSetList.map(e => e.levelId))]
  const levelsList = await db.select().from(levels).where(levelIds.length ? sql`${levels.id} IN ${levelIds}` : undefined)
  const levelMap = Object.fromEntries(levelsList.map(l => [l.id, l.name]))
  
  const examSetsWithDetails = await Promise.all(examSetList.map(async (set) => {
    const examCount = await db.select().from(exams).where(eq(exams.examSetId, set.id))
    return {
      ...set,
      levelName: levelMap[set.levelId] || 'Unknown',
      examCount: examCount.length,
    }
  }))
  
  return c.json(examSetsWithDetails)
})

app.get('/sets/:id', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  
  const examSet = await db.select().from(examSets).where(eq(examSets.id, id)).get()
  if (!examSet) return c.notFound()
  
  const [level, examsInSet] = await Promise.all([
    db.select().from(levels).where(eq(levels.id, examSet.levelId)).get(),
    db.select().from(exams).where(eq(exams.examSetId, id)),
  ])
  
  return c.json({ ...examSet, level, exams: examsInSet })
})

app.post('/sets', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const body = await c.req.json()
  const data = examSetSchema.parse(body)
  
  const [examSet] = await db.insert(examSets).values({
    name: data.name,
    description: data.description,
    academicYearId: data.academicYearId,
    termId: data.termId || null,
    levelId: data.levelId,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    status: data.status || 'draft',
  }).returning()
  
  return c.json(examSet, 201)
})

app.patch('/sets/:id', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const updateData: any = { ...body }
  if (body.startDate) updateData.startDate = new Date(body.startDate)
  if (body.endDate) updateData.endDate = new Date(body.endDate)
  
  const [examSet] = await db.update(examSets)
    .set(updateData)
    .where(eq(examSets.id, id))
    .returning()
  
  if (!examSet) return c.notFound()
  return c.json(examSet)
})

app.delete('/sets/:id', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  
  // Remove examSetId from exams in this set
  await db.update(exams).set({ examSetId: null }).where(eq(exams.examSetId, id))
  
  await db.delete(examSets).where(eq(examSets.id, id))
  return c.json({ success: true })
})

// Bulk create exams from exam set
app.post('/sets/:id/exams', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const examSet = await db.select().from(examSets).where(eq(examSets.id, id)).get()
  if (!examSet) return c.json({ message: 'Exam set not found' }, 404)
  
  const { subjectIds, type, examDate, totalMarks, titleTemplate } = body
  
  if (!subjectIds || !Array.isArray(subjectIds) || subjectIds.length === 0) {
    return c.json({ message: 'No subjects selected' }, 400)
  }
  
  if (!examDate) {
    return c.json({ message: 'Exam date is required' }, 400)
  }
  
  const examsToCreate = subjectIds.map((subjectId: string) => ({
    title: titleTemplate?.replace('{subject}', '') || `Exam`,
    type: type || 'test',
    academicYearId: examSet.academicYearId,
    levelId: examSet.levelId,
    subjectId,
    termId: examSet.termId,
    examSetId: id,
    examDate: new Date(examDate),
    totalMarks: totalMarks || 100,
    status: 'draft' as const,
  }))
  
  const createdExams = await db.insert(exams).values(examsToCreate).returning()
  
  return c.json(createdExams, 201)
})

// =======================
// Level Subjects Routes
// =======================

const levelSubjectSchema = z.object({
  levelId: z.string().min(1),
  subjectId: z.string().min(1),
  teacherId: z.string().optional().nullable(),
})

app.get('/subjects/levels', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = getDb(c)
  const levelId = c.req.query('levelId')
  
  let query = db.select({
    id: levelSubjects.id,
    levelId: levelSubjects.levelId,
    subjectId: levelSubjects.subjectId,
    teacherId: levelSubjects.teacherId,
    createdAt: levelSubjects.createdAt,
    subjectName: subjects.name,
    subjectCode: subjects.code,
    teacherName: sql<string>`${staff.firstName} || ' ' || ${staff.lastName}`
  })
    .from(levelSubjects)
    .innerJoin(subjects, eq(levelSubjects.subjectId, subjects.id))
    .leftJoin(staff, eq(levelSubjects.teacherId, staff.id))
  
  if (levelId) {
    query.where(eq(levelSubjects.levelId, levelId))
  }
  
  const result = await query
  return c.json(result)
})

app.post('/subjects/levels', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const body = await c.req.json()
  const data = levelSubjectSchema.parse(body)
  
  // Check if already exists
  const existing = await db.select().from(levelSubjects)
    .where(and(eq(levelSubjects.levelId, data.levelId), eq(levelSubjects.subjectId, data.subjectId)))
    .get()
  
  if (existing) return c.json({ message: 'Subject already added to level' }, 400)
  
  const [levelSubject] = await db.insert(levelSubjects).values({
    levelId: data.levelId,
    subjectId: data.subjectId,
    teacherId: data.teacherId || null,
  }).returning()
  
  const subject = await db.select().from(subjects).where(eq(subjects.id, data.subjectId)).get()
  const teacher = data.teacherId ? await db.select().from(staff).where(eq(staff.id, data.teacherId)).get() : null
  
  return c.json({ ...levelSubject, subject, teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : null }, 201)
})

app.patch('/subjects/levels/:id', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  const body = await c.req.json()
  const data = levelSubjectSchema.partial().parse(body)
  
  const [levelSubject] = await db.update(levelSubjects)
    .set({ teacherId: data.teacherId })
    .where(eq(levelSubjects.id, id))
    .returning()
  
  if (!levelSubject) return c.notFound()
  
  const teacher = levelSubject.teacherId ? await db.select().from(staff).where(eq(staff.id, levelSubject.teacherId)).get() : null
  
  return c.json({ ...levelSubject, teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : null })
})

app.delete('/subjects/levels/:id', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  
  await db.delete(levelSubjects).where(eq(levelSubjects.id, id))
  return c.json({ success: true })
})
// Bulk add subjects to level
app.post('/subjects/levels/bulk', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const body = await c.req.json()
  const { levelId, subjectIds } = body
  
  const existing = await db.select().from(levelSubjects).where(eq(levelSubjects.levelId, levelId))
  const existingSubjectIds = new Set(existing.map(e => e.subjectId))
  
  const newSubjects = subjectIds
    .filter((id: string) => !existingSubjectIds.has(id))
    .map((subjectId: string) => ({
      levelId,
      subjectId,
    }))
  
  if (newSubjects.length > 0) {
    await db.insert(levelSubjects).values(newSubjects)
  }
  
  return c.json({ success: true, added: newSubjects.length })
})

app.get('/:id', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  
  const exam = await db.select().from(exams).where(eq(exams.id, id)).get()
  if (!exam) return c.notFound()
  
  const [subject, level] = await Promise.all([
    db.select().from(subjects).where(eq(subjects.id, exam.subjectId)).get(),
    db.select().from(levels).where(eq(levels.id, exam.levelId)).get(),
  ])
  
  const results = await db.select().from(examResults).where(eq(examResults.examId, id))
  
  const studentIds = results.map(r => r.studentId)
  const studentsList = await db.select().from(students).where(studentIds.length ? sql`${students.id} IN ${studentIds}` : undefined)
  const studentMap = Object.fromEntries(studentsList.map(s => [s.id, { name: `${s.firstName} ${s.lastName}`, admissionNo: s.admissionNo }]))
  
  const resultsWithStudent = results.map(r => ({
    ...r,
    studentName: studentMap[r.studentId]?.name || 'Unknown',
    admissionNo: studentMap[r.studentId]?.admissionNo || '',
  }))
  
  return c.json({ ...exam, subject, level, results: resultsWithStudent })
})

app.post('/', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const body = await c.req.json()
  const data = examSchema.parse(body)
  
  const [exam] = await db.insert(exams).values({
    title: data.title,
    type: data.type,
    academicYearId: data.academicYearId,
    levelId: data.levelId,
    subjectId: data.subjectId,
    termId: data.termId || null,
    examSetId: data.examSetId || null,
    examDate: new Date(data.examDate),
    totalMarks: data.totalMarks,
    status: data.status || 'draft',
  }).returning()
  
  return c.json(exam, 201)
})

app.patch('/:id', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const updateData: any = { ...body }
  if (body.examDate) {
    updateData.examDate = new Date(body.examDate)
  }
  
  const [exam] = await db.update(exams)
    .set(updateData)
    .where(eq(exams.id, id))
    .returning()
  
  if (!exam) return c.notFound()
  return c.json(exam)
})

app.delete('/:id', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  
  await db.delete(exams).where(eq(exams.id, id))
  return c.json({ success: true })
})

// Results endpoints
app.get('/:id/results', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  
  const exam = await db.select().from(exams).where(eq(exams.id, id)).get()
  if (!exam) return c.notFound()
  
  const results = await db.select().from(examResults).where(eq(examResults.examId, id))
  
  const studentIds = results.map(r => r.studentId)
  const studentsList = await db.select().from(students).where(studentIds.length ? sql`${students.id} IN ${studentIds}` : undefined)
  const studentMap = Object.fromEntries(studentsList.map(s => [s.id, { name: `${s.firstName} ${s.lastName}`, admissionNo: s.admissionNo }]))
  
  const resultsWithStudent = results.map(r => ({
    ...r,
    studentName: studentMap[r.studentId]?.name || 'Unknown',
    admissionNo: studentMap[r.studentId]?.admissionNo || '',
  }))
  
  return c.json({ exam, results: resultsWithStudent })
})

app.post('/:id/results', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const exam = await db.select().from(exams).where(eq(exams.id, id)).get()
  if (!exam) return c.notFound()
  
  // Check if result already exists for this student
  const existing = await db.select()
    .from(examResults)
    .where(and(eq(examResults.examId, id), eq(examResults.studentId, body.studentId)))
    .get()
  
  if (existing) {
    const [result] = await db.update(examResults)
      .set({ marks: body.marks, notes: body.notes })
      .where(eq(examResults.id, existing.id))
      .returning()
    return c.json(result)
  }
  
  const [result] = await db.insert(examResults).values({
    examId: id,
    studentId: body.studentId,
    marks: body.marks,
    notes: body.notes,
  }).returning()
  
  return c.json(result, 201)
})

app.patch('/:id/results/:resultId', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const resultId = c.req.param('resultId')
  const body = await c.req.json()
  
  const [result] = await db.update(examResults)
    .set({ marks: body.marks, notes: body.notes })
    .where(eq(examResults.id, resultId))
    .returning()
  
  if (!result) return c.notFound()
  return c.json(result)
})

export default app