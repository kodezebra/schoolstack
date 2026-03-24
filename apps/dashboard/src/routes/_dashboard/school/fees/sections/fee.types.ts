export interface FeeStructure {
  id: string
  levelId: string
  levelName?: string
  academicYearId: string
  title: string
  description?: string
  amount: number
  dueDate?: string
  scope: string
  scopeDisplay?: string
  status: 'active' | 'closed'
}

export interface FeePayment {
  id: string
  studentId: string
  studentName: string
  admissionNo: string
  feeStructureId: string
  feeTitle: string
  amount: number
  paymentDate: string
  paymentMethod: 'cash' | 'mobile_money' | 'bank' | 'school_pay'
  transactionNo?: string
}

export interface Level {
  id: string
  name: string
}

export interface AcademicYear {
  id: string
  name: string
  isCurrent: boolean
}

export interface StudentBalance {
  studentId: string
  studentName: string
  admissionNo: string
  levelName: string
  levelId: string
  totalFees: number
  totalPaid: number
  balance: number
  isPaid: boolean
}

export interface BalanceTotals {
  totalFees: number
  totalPaid: number
  totalOutstanding: number
  totalStudents: number
  paidStudents: number
  outstandingStudents: number
}

export interface BalancesData {
  students: StudentBalance[]
  totals: BalanceTotals
}

export type FeeTab = 'payments' | 'structures' | 'balances'
