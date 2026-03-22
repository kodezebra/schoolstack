export interface GradeConfig {
  grade: string
  minMarks: number
  maxMarks: number
  points: number
  color?: string
}

export const DEFAULT_GRADE_SCALE: GradeConfig[] = [
  { grade: 'A', minMarks: 90, maxMarks: 100, points: 4.0, color: '#22c55e' },
  { grade: 'B', minMarks: 80, maxMarks: 89, points: 3.0, color: '#3b82f6' },
  { grade: 'C', minMarks: 70, maxMarks: 79, points: 2.0, color: '#f59e0b' },
  { grade: 'D', minMarks: 60, maxMarks: 69, points: 1.0, color: '#f97316' },
  { grade: 'F', minMarks: 0, maxMarks: 59, points: 0, color: '#ef4444' },
]

export function getGrade(marks: number, gradeScale: GradeConfig[]): GradeConfig | null {
  for (const g of gradeScale) {
    if (marks >= g.minMarks && marks <= g.maxMarks) {
      return g
    }
  }
  return null
}

export function calculateTotalAndAverage(results: { marks: number; totalMarks: number }[]) {
  const totalObtained = results.reduce((sum, r) => sum + r.marks, 0)
  const totalMax = results.reduce((sum, r) => sum + r.totalMarks, 0)
  const average = results.length > 0 ? (totalObtained / results.length) : 0
  return { totalObtained, totalMax, average: Math.round(average * 100) / 100 }
}

export function getRankSuffix(rank: number): string {
  if (rank % 100 >= 11 && rank % 100 <= 13) return 'th'
  switch (rank % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}
