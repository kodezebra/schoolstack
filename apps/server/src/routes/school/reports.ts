import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, and, sql, desc } from 'drizzle-orm'
import { 
  students, 
  exams, 
  examResults, 
  subjects, 
  levels, 
  terms, 
  gradeScales,
  academicYears,
  examSets,
  siteSettings
} from '@/db/schema'
import { authMiddleware, requireRole } from '@/middleware/auth'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', authMiddleware)

interface GradeConfig {
  grade: string
  minMarks: number
  maxMarks: number
  points: number
  color?: string
}

function getGrade(marks: number, gradeScale: GradeConfig[]): GradeConfig | null {
  for (const g of gradeScale) {
    if (marks >= g.minMarks && marks <= g.maxMarks) {
      return g
    }
  }
  return null
}

function calculateTotalAndAverage(results: { marks: number; totalMarks: number }[]) {
  const totalObtained = results.reduce((sum, r) => sum + r.marks, 0)
  const totalMax = results.reduce((sum, r) => sum + r.totalMarks, 0)
  const average = results.length > 0 ? (totalObtained / results.length) : 0
  return { totalObtained, totalMax, average: Math.round(average * 100) / 100 }
}

function getRankSuffix(rank: number): string {
  if (rank % 100 >= 11 && rank % 100 <= 13) return 'th'
  switch (rank % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

app.get('/class/:levelId', requireRole('owner', 'admin', 'editor'), async (c) => {
  const db = drizzle(c.env.DB)
  const levelId = c.req.param('levelId')
  const termId = c.req.query('termId')
  const examSetId = c.req.query('examSetId')
  const academicYearId = c.req.query('academicYearId')
  
  const level = await db.select().from(levels).where(eq(levels.id, levelId)).get()
  if (!level) return c.notFound()
  
  const academicYear = await db.select().from(academicYears).where(eq(academicYears.id, level.academicYearId)).get()
  
  let examConditions: any[] = [
    eq(exams.levelId, levelId),
    eq(exams.status, 'published')
  ]
  
  if (termId) {
    examConditions.push(eq(exams.termId, termId))
  }
  if (examSetId) {
    examConditions.push(eq(exams.examSetId, examSetId))
  }
  if (academicYearId) {
    examConditions.push(eq(exams.academicYearId, academicYearId))
  }
  
  const examList = await db.select().from(exams).where(and(...examConditions))
  
  const subjectIds = [...new Set(examList.map(e => e.subjectId))]
  const subjectList = await db.select().from(subjects).where(
    subjectIds.length ? sql`${subjects.id} IN ${subjectIds}` : undefined
  )
  
  const studentList = await db.select().from(students).where(
    and(
      eq(students.levelId, levelId),
      eq(students.status, 'active')
    )
  )
  
  const examIds = examList.map(e => e.id)
  let results: any[] = []
  
  if (examIds.length > 0) {
    results = await db.select().from(examResults).where(
      examIds.length ? sql`${examResults.examId} IN ${examIds}` : undefined
    )
  }
  
  const gradeScaleList = await db.select().from(gradeScales).where(eq(gradeScales.isDefault, true)).limit(1)
  const defaultGradeScale = gradeScaleList.length > 0 ? JSON.parse(gradeScaleList[0].grades as string) : [
    { grade: 'A', minMarks: 90, maxMarks: 100, points: 4.0, color: '#22c55e' },
    { grade: 'B', minMarks: 80, maxMarks: 89, points: 3.0, color: '#3b82f6' },
    { grade: 'C', minMarks: 70, maxMarks: 79, points: 2.0, color: '#f59e0b' },
    { grade: 'D', minMarks: 60, maxMarks: 69, points: 1.0, color: '#f97316' },
    { grade: 'F', minMarks: 0, maxMarks: 59, points: 0, color: '#ef4444' },
  ]
  
  const studentReports = studentList.map(student => {
    const studentResults = results.filter(r => r.studentId === student.id)
    
    const subjectResults = subjectList.map(subject => {
      const exam = examList.find(e => e.subjectId === subject.id)
      const result = studentResults.find(r => r.examId === exam?.id)
      
      const marks = result?.marks || 0
      const totalMarks = exam?.totalMarks || 100
      const percentage = totalMarks > 0 ? (marks / totalMarks) * 100 : 0
      const grade = getGrade(percentage, defaultGradeScale)
      
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        subjectCode: subject.code,
        examId: exam?.id,
        marks,
        totalMarks,
        percentage: Math.round(percentage * 100) / 100,
        grade: grade?.grade || '-',
        gradeColor: grade?.color || '#666',
        points: grade?.points || 0,
        notes: result?.notes || '',
      }
    })
    
    const filledResults = subjectResults.filter(r => r.examId !== undefined)
    const { totalObtained, totalMax, average } = calculateTotalAndAverage(filledResults)
    const overallGrade = getGrade(average, defaultGradeScale)
    
    return {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNo: student.admissionNo,
      rollNo: student.rollNo,
      gender: student.gender,
      subjects: subjectResults,
      summary: {
        totalObtained,
        totalMax,
        average: Math.round(average * 100) / 100,
        overallGrade: overallGrade?.grade || '-',
        overallGradeColor: overallGrade?.color || '#666',
        totalPoints: subjectResults.reduce((sum, r) => sum + r.points, 0),
        subjectCount: filledResults.length,
      }
    }
  })
  
  // Sort by average and assign ranks
  const sortedByAverage = [...studentReports].sort((a, b) => b.summary.average - a.summary.average)
  sortedByAverage.forEach((student: any, index: number) => {
    student.summary.rank = index + 1
    student.summary.rankSuffix = getRankSuffix(index + 1)
  })
  
  let termInfo = null
  if (termId) {
    termInfo = await db.select().from(terms).where(eq(terms.id, termId)).get()
  }
  
  // Get school settings
  const settings = await db.select().from(siteSettings).where(eq(siteSettings.id, 'default')).get()
  
  return c.json({
    school: {
      name: settings?.schoolName || 'KidzKave School',
      address: settings?.schoolAddress || '',
      phone: settings?.schoolPhone || '',
      email: settings?.schoolEmail || '',
      logoType: settings?.logoType || 'icon',
      logoIcon: settings?.logoIcon || 'graduation-cap',
    },
    level: { id: level.id, name: level.name },
    academicYear: academicYear ? { id: academicYear.id, name: academicYear.name } : null,
    term: termInfo,
    examSet: examSetId ? await db.select().from(examSets).where(eq(examSets.id, examSetId)).get() : null,
    subjects: subjectList,
    students: sortedByAverage,
    gradeScale: defaultGradeScale,
  })
})

app.get('/student/:studentId', requireRole('owner', 'admin', 'editor'), async (c) => {
  const db = drizzle(c.env.DB)
  const studentId = c.req.param('studentId')
  const termId = c.req.query('termId')
  const examSetId = c.req.query('examSetId')
  const academicYearId = c.req.query('academicYearId')
  
  const student = await db.select().from(students).where(eq(students.id, studentId)).get()
  if (!student) return c.notFound()
  
  const level = await db.select().from(levels).where(eq(levels.id, student.levelId)).get()
  const academicYear = level ? await db.select().from(academicYears).where(eq(academicYears.id, level.academicYearId)).get() : null
  
  let examConditions: any[] = [
    eq(exams.levelId, student.levelId),
    eq(exams.status, 'published')
  ]
  
  if (termId) {
    examConditions.push(eq(exams.termId, termId))
  }
  if (examSetId) {
    examConditions.push(eq(exams.examSetId, examSetId))
  }
  if (academicYearId) {
    examConditions.push(eq(exams.academicYearId, academicYearId))
  }
  
  const examList = await db.select().from(exams).where(and(...examConditions))
  
  const subjectIds = [...new Set(examList.map(e => e.subjectId))]
  const subjectList = await db.select().from(subjects).where(
    subjectIds.length ? sql`${subjects.id} IN ${subjectIds}` : undefined
  )
  
  const examIds = examList.map(e => e.id)
  let results: any[] = []
  
  if (examIds.length > 0) {
    results = await db.select().from(examResults).where(
      and(
        eq(examResults.studentId, studentId),
        examIds.length ? sql`${examResults.examId} IN ${examIds}` : undefined
      )
    )
  }
  
  const gradeScaleList = await db.select().from(gradeScales).where(eq(gradeScales.isDefault, true)).limit(1)
  const defaultGradeScale = gradeScaleList.length > 0 ? JSON.parse(gradeScaleList[0].grades as string) : [
    { grade: 'A', minMarks: 90, maxMarks: 100, points: 4.0, color: '#22c55e' },
    { grade: 'B', minMarks: 80, maxMarks: 89, points: 3.0, color: '#3b82f6' },
    { grade: 'C', minMarks: 70, maxMarks: 79, points: 2.0, color: '#f59e0b' },
    { grade: 'D', minMarks: 60, maxMarks: 69, points: 1.0, color: '#f97316' },
    { grade: 'F', minMarks: 0, maxMarks: 59, points: 0, color: '#ef4444' },
  ]
  
  const subjectResults = subjectList.map(subject => {
    const exam = examList.find(e => e.subjectId === subject.id)
    const result = results.find(r => r.examId === exam?.id)
    
    const marks = result?.marks || 0
    const totalMarks = exam?.totalMarks || 100
    const percentage = totalMarks > 0 ? (marks / totalMarks) * 100 : 0
    const grade = getGrade(percentage, defaultGradeScale)
    
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      examId: exam?.id,
      examTitle: exam?.title,
      marks,
      totalMarks,
      percentage: Math.round(percentage * 100) / 100,
      grade: grade?.grade || '-',
      gradeColor: grade?.color || '#666',
      points: grade?.points || 0,
      notes: result?.notes || '',
    }
  })
  
  const filledResults = subjectResults.filter(r => r.examId !== undefined)
  const { totalObtained, totalMax, average } = calculateTotalAndAverage(filledResults)
  const overallGrade = getGrade(average, defaultGradeScale)
  
  let termInfo = null
  if (termId) {
    termInfo = await db.select().from(terms).where(eq(terms.id, termId)).get()
  }
  
  // Get school settings
  const settings = await db.select().from(siteSettings).where(eq(siteSettings.id, 'default')).get()
  
  return c.json({
    school: {
      name: settings?.schoolName || 'KidzKave School',
      address: settings?.schoolAddress || '',
      phone: settings?.schoolPhone || '',
      email: settings?.schoolEmail || '',
      logoType: settings?.logoType || 'icon',
      logoIcon: settings?.logoIcon || 'graduation-cap',
    },
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      admissionNo: student.admissionNo,
      rollNo: student.rollNo,
      gender: student.gender,
      dob: student.dob,
    },
    level: level,
    academicYear: academicYear ? { id: academicYear.id, name: academicYear.name } : null,
    term: termInfo,
    subjects: subjectResults,
    summary: {
      totalObtained,
      totalMax,
      average: Math.round(average * 100) / 100,
      overallGrade: overallGrade?.grade || '-',
      overallGradeColor: overallGrade?.color || '#666',
      totalPoints: subjectResults.reduce((sum, r) => sum + r.points, 0),
      subjectCount: filledResults.length,
      totalExams: examList.length,
      completedExams: filledResults.length,
    },
    gradeScale: defaultGradeScale,
  })
})

export default app
