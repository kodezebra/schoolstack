export interface Student {
  id: string
  admissionNo: string
  firstName: string
  lastName: string
  gender: 'male' | 'female' | 'other'
  dob?: string
  levelId: string
  levelName?: string
  rollNo?: string
  parentName: string
  parentPhone: string
  parentEmail?: string
  address?: string
  photo?: string
  status: 'active' | 'transferred' | 'graduated' | 'withdrawn'
  enrollmentDate: string
}

export interface Level {
  id: string
  name: string
}

export interface FeePayment {
  id: string
  studentId: string
  feeStructureId?: string
  extraFeeId?: string
  feeTitle: string
  amount: number
  paymentDate: string
  paymentMethod: string
  transactionNo?: string
  receiptNo?: string
  notes?: string
}

export interface FeeStructure {
  id: string
  levelId: string
  academicYearId: string
  title: string
  description?: string
  amount: number
  dueDate?: string
  status: 'active' | 'closed'
  balance?: number
}

export interface FeeWithBalance extends FeeStructure {
  type: 'base' | 'extra'
  isRecurring?: boolean
  paid: number
  amountDue: number
  balance: number
  isPaid: boolean
  hasOverride: boolean
  overrideReason: string | null
}

export interface StudentDetail extends Student {
  level?: Level
  payments: FeePayment[]
}

export type StudentTab = 'overview' | 'fees' | 'marks'
