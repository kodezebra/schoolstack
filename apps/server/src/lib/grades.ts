export interface GradeConfig {
  grade: string
  minMarks: number
  maxMarks: number
  points: number
  color?: string
  interpretation?: string
}

export interface DivisionInfo {
  division: string
  standing: string
  color: string
}

export interface ReportCardThemeColors {
  primary: string
  secondary: string
  accent: string
  header: string
  text: string
  background: string
  tableHeader: string
  tableRow: string
  footer: string
}

export interface ReportCardTheme {
  id: string
  colors: ReportCardThemeColors
}

export const REPORT_CARD_THEMES: Record<string, ReportCardThemeColors> = {
  playful: {
    primary: '#4ECDC4',
    secondary: '#FF6B6B',
    accent: '#FFE66D',
    header: '#FF6B6B',
    text: '#2D3436',
    background: '#FFFFFF',
    tableHeader: '#4ECDC4',
    tableRow: '#F8F9FA',
    footer: '#F0F4F8'
  },
  professional: {
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#FBBF24',
    header: '#1E3A8A',
    text: '#1F2937',
    background: '#FFFFFF',
    tableHeader: '#3B82F6',
    tableRow: '#F3F4F6',
    footer: '#E5E7EB'
  },
  minimal: {
    primary: '#374151',
    secondary: '#111827',
    accent: '#6B7280',
    header: '#111827',
    text: '#1F2937',
    background: '#FFFFFF',
    tableHeader: '#374151',
    tableRow: '#F9FAFB',
    footer: '#F3F4F6'
  },
  elegant: {
    primary: '#1E3A8A',
    secondary: '#D97706',
    accent: '#FBBF24',
    header: '#1E3A8A',
    text: '#1F2937',
    background: '#FFFFFF',
    tableHeader: '#1E3A8A',
    tableRow: '#EFF6FF',
    footer: '#DBEAFE'
  }
}

export const DEFAULT_GRADE_SCALE: GradeConfig[] = [
  { grade: 'D1', minMarks: 90, maxMarks: 100, points: 1, color: '#22c55e', interpretation: 'Distinction 1' },
  { grade: 'D2', minMarks: 80, maxMarks: 89, points: 2, color: '#16a34a', interpretation: 'Distinction 2' },
  { grade: 'C3', minMarks: 70, maxMarks: 79, points: 3, color: '#3b82f6', interpretation: 'Credit 3' },
  { grade: 'C4', minMarks: 65, maxMarks: 69, points: 4, color: '#2563eb', interpretation: 'Credit 4' },
  { grade: 'C5', minMarks: 60, maxMarks: 64, points: 5, color: '#0ea5e9', interpretation: 'Credit 5' },
  { grade: 'C6', minMarks: 55, maxMarks: 59, points: 6, color: '#06b6d4', interpretation: 'Credit 6' },
  { grade: 'P7', minMarks: 50, maxMarks: 54, points: 7, color: '#f59e0b', interpretation: 'Pass 7' },
  { grade: 'P8', minMarks: 45, maxMarks: 49, points: 8, color: '#d97706', interpretation: 'Pass 8' },
  { grade: 'F9', minMarks: 0, maxMarks: 44, points: 9, color: '#ef4444', interpretation: 'Fail 9' },
]

export const DIVISION_SCALE: DivisionInfo[] = [
  { division: 'DIV I', standing: 'First Grade', color: '#eab308' },
  { division: 'DIV II', standing: 'Second Grade', color: '#22c55e' },
  { division: 'DIV III', standing: 'Third Grade', color: '#3b82f6' },
  { division: 'DIV IV', standing: 'Fourth Grade', color: '#f97316' },
  { division: 'U', standing: 'Ungraded', color: '#ef4444' },
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

export function calculateAggregate(subjectPoints: number[]): number {
  if (subjectPoints.length === 0) return 0
  const sorted = [...subjectPoints].sort((a, b) => a - b)
  const best4 = sorted.slice(0, Math.min(4, sorted.length))
  return best4.reduce((sum, p) => sum + p, 0)
}

export function calculateDivision(aggregate: number): DivisionInfo {
  if (aggregate >= 4 && aggregate <= 12) {
    return DIVISION_SCALE[0] // DIV I
  } else if (aggregate >= 13 && aggregate <= 23) {
    return DIVISION_SCALE[1] // DIV II
  } else if (aggregate >= 24 && aggregate <= 29) {
    return DIVISION_SCALE[2] // DIV III
  } else if (aggregate >= 30 && aggregate <= 34) {
    return DIVISION_SCALE[3] // DIV IV
  } else {
    return DIVISION_SCALE[4] // U
  }
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
