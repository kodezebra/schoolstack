export interface Exam {
  id: string
  title: string
  type: 'test' | 'midterm' | 'final' | 'assignment' | 'quiz'
  academicYearId: string
  levelId: string
  subjectId: string
  examDate: string
  totalMarks: number
  status: 'draft' | 'published'
  createdAt: string
  subjectName?: string
  levelName?: string
}

export interface AcademicYear {
  id: string
  name: string
  status?: string
}

export interface Level {
  id: string
  name: string
}

export interface Term {
  id: string
  name: string
  academicYearId: string
}

export interface Subject {
  id: string
  name: string
}

export interface ExamSet {
  id: string
  name: string
  description?: string
  academicYearId: string
  termId?: string
  levelId: string
  levelName?: string
  startDate?: string
  endDate?: string
  status: 'draft' | 'published' | 'completed'
  examCount?: number
  createdAt: string
}

export interface LevelSubject {
  id: string
  levelId: string
  subjectId: string
  subject?: Subject
}

export type ExamTab = 'exams' | 'sets'
