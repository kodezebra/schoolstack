import { Hono } from 'hono'
import { getDb } from '@/lib/db'
import { eq, and, sql, inArray } from 'drizzle-orm'
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
  siteSettings,
  feeStructures,
  feePayments,
  feeOverrides,
  studentFees,
  studentTermRemarks
} from '@/db/schema'
import { authMiddleware, requireRole } from '@/middleware/auth'
import { getGrade, calculateTotalAndAverage, getRankSuffix, DEFAULT_GRADE_SCALE, calculateAggregate, calculateDivision, REPORT_CARD_THEMES } from '@/lib/grades'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', authMiddleware)

app.get('/fees', requireRole('owner', 'admin', 'teacher'), async (c) => {
  const db = getDb(c)
  const academicYearId = c.req.query('academicYearId')

  const feeConditions = [eq(feeStructures.status, 'active')]
  if (academicYearId) {
    feeConditions.push(eq(feeStructures.academicYearId, academicYearId))
  }
  const allFeeStructures = await db.select().from(feeStructures).where(and(...feeConditions))

  const studentsList = await db.select().from(students).where(eq(students.status, 'active'))
  const studentIds = studentsList.map(s => s.id)

  const allPayments = studentIds.length
    ? await db.select().from(feePayments).where(inArray(feePayments.studentId, studentIds))
    : []

  const allOverrides = studentIds.length
    ? await db.select().from(feeOverrides).where(inArray(feeOverrides.studentId, studentIds))
    : []

  const extraFees = studentIds.length
    ? await db.select().from(studentFees).where(and(
        inArray(studentFees.studentId, studentIds),
        eq(studentFees.status, 'active')
      ))
    : []

  const paymentsByStudent = Object.groupBy(allPayments, p => p.studentId)
  const overridesByStudent = Object.groupBy(allOverrides, o => o.studentId)
  const extraFeesByStudent = Object.groupBy(extraFees, f => f.studentId)

  let outstandingCount = 0

  for (const student of studentsList) {
    const studentOverrides = overridesByStudent[student.id] || []
    const studentExtraFees = extraFeesByStudent[student.id] || []
    const studentPayments = paymentsByStudent[student.id] || []
    const overrideMap = new Map(studentOverrides.map(o => [o.feeStructureId, o]))

    let totalFees = 0
    let totalPaid = 0

    for (const fee of allFeeStructures) {
      const override = overrideMap.get(fee.id)
      const amountDue = override?.overrideAmount ?? fee.amount
      totalFees += amountDue
      const feePayments = studentPayments.filter(p => p.feeStructureId === fee.id)
      totalPaid += feePayments.reduce((sum, p) => sum + p.amount, 0)
    }

    for (const extraFee of studentExtraFees) {
      totalFees += extraFee.amount
      const extraFeePayments = studentPayments.filter(p => p.extraFeeId === extraFee.id)
      totalPaid += extraFeePayments.reduce((sum, p) => sum + p.amount, 0)
    }

    if (totalFees - totalPaid > 0) {
      outstandingCount++
    }
  }

  return c.json({ outstandingCount })
})

app.get('/class/:levelId', requireRole('owner', 'admin', 'editor'), async (c) => {
  const db = getDb(c)
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
  
  const examIds = examList.map(e => e.id)
  const subjectIds = [...new Set(examList.map(e => e.subjectId))]
  
  let subjectList: any[] = []
  if (subjectIds.length > 0) {
    subjectList = await db.select().from(subjects).where(
      sql`${subjects.id} IN ${subjectIds}`
    )
  }
  
  let results: any[] = []
  if (examIds.length > 0) {
    results = await db.select().from(examResults).where(
      sql`${examResults.examId} IN ${examIds}`
    )
  }
  
  const gradeScaleList = await db.select().from(gradeScales).where(eq(gradeScales.isDefault, true)).limit(1)
  const defaultGradeScale = gradeScaleList.length > 0 ? JSON.parse(gradeScaleList[0].grades as string) : DEFAULT_GRADE_SCALE
  
  const studentList = await db.select().from(students).where(
    and(
      eq(students.levelId, levelId),
      eq(students.status, 'active')
    )
  )
  
  const studentReports = studentList.map(student => {
    const studentResults = results.filter(r => r.studentId === student.id)
    
    const studentExamIds = studentResults.map(r => r.examId)
    const examsForStudent = examList.filter(e => studentExamIds.includes(e.id))
    
    const subjectResults = subjectList.map(subject => {
      const examsForSubject = examsForStudent.filter(e => e.subjectId === subject.id)
      const resultsForSubject = studentResults.filter(r => 
        examsForSubject.some(e => e.id === r.examId)
      )
      
      if (resultsForSubject.length === 0) {
        return {
          subjectId: subject.id,
          subjectName: subject.name,
          percentage: null,
          grade: null,
          gradeColor: '#999',
        }
      }
      
      const totalMarks = examsForSubject.reduce((sum, e) => sum + e.totalMarks, 0)
      const totalObtained = resultsForSubject.reduce((sum, r) => sum + r.marks, 0)
      const percentage = totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0
      const grade = getGrade(percentage, defaultGradeScale)
      
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        percentage: Math.round(percentage * 100) / 100,
        grade: grade?.grade || null,
        gradeColor: grade?.color || '#666',
      }
    })
    
    const subjectsWithResults = subjectResults.filter(r => r.percentage !== null)
    const totalMaxMarks = examsForStudent.reduce((sum, e) => sum + e.totalMarks, 0)
    const totalObtainedMarks = studentResults.reduce((sum, r) => sum + r.marks, 0)
    const subjectCount = subjectsWithResults.length
    const average = totalMaxMarks > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : 0
    const overallGrade = getGrade(average, defaultGradeScale)
    
    const subjectPoints = subjectResults
      .filter(r => r.grade !== null)
      .map(r => getGrade(r.percentage || 0, defaultGradeScale)?.points || 9)
    const aggregate = calculateAggregate(subjectPoints)
    const division = calculateDivision(aggregate)
    
    return {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNo: student.admissionNo,
      rollNo: student.rollNo,
      gender: student.gender,
      photo: student.photo,
      subjects: subjectResults,
      summary: {
        totalObtained: totalObtainedMarks,
        totalMax: totalMaxMarks,
        average: Math.round(average * 100) / 100,
        overallGrade: overallGrade?.grade || '-',
        overallGradeColor: overallGrade?.color || '#666',
        subjectCount: subjectCount,
        aggregate,
        division: division.division,
        divisionStanding: division.standing,
        divisionColor: division.color,
      }
    }
  })
  
  const sortedByAverage = [...studentReports].sort((a, b) => b.summary.average - a.summary.average)
  sortedByAverage.forEach((student: any, index: number) => {
    student.summary.rank = index + 1
    student.summary.rankSuffix = getRankSuffix(index + 1)
  })
  
  let termInfo = null
  if (termId) {
    termInfo = await db.select().from(terms).where(eq(terms.id, termId)).get()
  }
  
  const settings = await db.select().from(siteSettings).where(eq(siteSettings.id, 'default')).get()
  
  return c.json({
    school: {
      name: settings?.schoolName || 'Your School Name',
      address: settings?.schoolAddress || '',
      phone: settings?.schoolPhone || '',
      email: settings?.schoolEmail || '',
      logoType: settings?.logoType || 'icon',
      logoIcon: settings?.logoIcon || 'graduation-cap',
      logoImage: settings?.logoImage || null,
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
  const db = getDb(c)
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
  const defaultGradeScale = gradeScaleList.length > 0 ? JSON.parse(gradeScaleList[0].grades as string) : DEFAULT_GRADE_SCALE
  
  const subjectResults = subjectList.map(subject => {
    const examsForSubject = examList.filter(e => e.subjectId === subject.id)
    const resultsForSubject = results.filter(r => 
      examsForSubject.some(e => e.id === r.examId)
    )
    
    if (resultsForSubject.length === 0 || examsForSubject.length === 0) {
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        subjectCode: subject.code,
        examId: null,
        examTitle: examsForSubject[0]?.title || null,
        marks: null as number | null,
        totalMarks: null as number | null,
        percentage: null as number | null,
        grade: null,
        gradeColor: '#666',
        points: 0,
        notes: '',
      }
    }
    
    const totalMarksSum = examsForSubject.reduce((sum, e) => sum + e.totalMarks, 0)
    const totalObtainedSum = resultsForSubject.reduce((sum, r) => sum + r.marks, 0)
    const averageMarks = totalObtainedSum / examsForSubject.length
    const averagePercentage = totalMarksSum > 0 ? (totalObtainedSum / totalMarksSum) * 100 : 0
    const grade = getGrade(averagePercentage, defaultGradeScale)
    
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      examId: examsForSubject[0].id,
      examTitle: examsForSubject[0]?.title,
      marks: Math.round(averageMarks * 100) / 100,
      totalMarks: totalMarksSum,
      percentage: Math.round(averagePercentage * 100) / 100,
      grade: grade?.grade || null,
      gradeColor: grade?.color || '#666',
      points: grade?.points || 0,
      notes: resultsForSubject.map(r => r.notes).filter(Boolean).join(', ') || '',
    }
  })
  
  const filledResults = subjectResults.filter(r => r.examId !== undefined && r.marks !== null) as { marks: number; totalMarks: number }[]
  const { totalObtained, totalMax, average } = calculateTotalAndAverage(filledResults)
  const overallGrade = getGrade(average, defaultGradeScale)
  
  const subjectPoints = subjectResults
    .filter(r => r.grade !== null)
    .map(r => getGrade(r.percentage || 0, defaultGradeScale)?.points || 9)
  const aggregate = calculateAggregate(subjectPoints)
  const division = calculateDivision(aggregate)
  
  let termInfo = null
  if (termId) {
    termInfo = await db.select().from(terms).where(eq(terms.id, termId)).get()
  }
  
  // Get school settings
  const settings = await db.select().from(siteSettings).where(eq(siteSettings.id, 'default')).get()

  // Get teacher remarks
  let teacherRemarks = ''
  const remarksQuery: any[] = [eq(studentTermRemarks.studentId, studentId)]
  if (academicYearId) remarksQuery.push(eq(studentTermRemarks.academicYearId, academicYearId))
  if (termId) remarksQuery.push(eq(studentTermRemarks.termId, termId))
  
  const studentRemarks = await db.select().from(studentTermRemarks)
    .where(and(...remarksQuery))
    .limit(1)
  if (studentRemarks.length > 0) {
    teacherRemarks = studentRemarks[0].remarks
  }
  
  const reportCardThemeId = settings?.reportCardTheme || 'playful'
  const themeColors = REPORT_CARD_THEMES[reportCardThemeId] || REPORT_CARD_THEMES.playful
  
  return c.json({
    school: {
      name: settings?.schoolName || 'Your School Name',
      address: settings?.schoolAddress || '',
      phone: settings?.schoolPhone || '',
      email: settings?.schoolEmail || '',
      logoType: settings?.logoType || 'icon',
      logoIcon: settings?.logoIcon || 'graduation-cap',
      logoImage: settings?.logoImage || null,
      reportCardTheme: reportCardThemeId,
      themeColors,
    },
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      admissionNo: student.admissionNo,
      rollNo: student.rollNo,
      gender: student.gender,
      dob: student.dob,
      photo: student.photo,
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
      aggregate,
      division: division.division,
      divisionStanding: division.standing,
      divisionColor: division.color,
    },
    gradeScale: defaultGradeScale,
    teacherRemarks,
  })
})

export default app
