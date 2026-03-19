import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  FileText,
  Printer,
  CheckCircle,
  AlertCircle,
  Users,
  DollarSign
} from 'lucide-react'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const Route = createFileRoute('/_dashboard/school/reports/fees')({
  component: FeeBalancesReportPage,
})

interface Level {
  id: string
  name: string
}

interface AcademicYear {
  id: string
  name: string
}

interface StudentBalance {
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

interface BalanceTotals {
  totalFees: number
  totalPaid: number
  totalOutstanding: number
  totalStudents: number
  paidStudents: number
  outstandingStudents: number
}

function FeeBalancesReportPage() {
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: academicYears } = useQuery<AcademicYear[]>({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const res = await apiFetch('/school/academic-years')
      if (!res.ok) return []
      return res.json()
    }
  })

  const { data: levels } = useQuery<Level[]>({
    queryKey: ['school-levels', selectedYear],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedYear && selectedYear !== 'all') params.set('academicYearId', selectedYear)
      const res = await apiFetch(`/school/levels?${params}`)
      if (!res.ok) return []
      return res.json()
    },
    enabled: true
  })

  const { data: balancesData, isLoading } = useQuery<{ students: StudentBalance[], totals: BalanceTotals }>({
    queryKey: ['fee-balances-report', selectedYear, selectedLevel, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedYear && selectedYear !== 'all') params.set('academicYearId', selectedYear)
      if (selectedLevel && selectedLevel !== 'all') params.set('levelId', selectedLevel)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await apiFetch(`/school/fees/balances?${params}`)
      if (!res.ok) return { students: [], totals: { totalFees: 0, totalPaid: 0, totalOutstanding: 0, totalStudents: 0, paidStudents: 0, outstandingStudents: 0 } }
      return res.json()
    }
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(amount)
  }

  const handlePrint = () => {
    window.print()
  }

  const currentYear = academicYears?.find(y => y.id === selectedYear)
  const currentLevel = levels?.find(l => l.id === selectedLevel)
  const today = new Date().toLocaleDateString('en-UG', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Balances Report</h1>
          <p className="text-muted-foreground mt-1">View student fee balances and outstanding payments</p>
        </div>
      </div>

      <Card className="no-print">
        <CardHeader>
          <CardTitle className="text-lg">Filter Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Academic Year</label>
              <Select value={selectedYear} onValueChange={(v) => { setSelectedYear(v); setSelectedLevel('all'); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {academicYears?.map(year => (
                    <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Class</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {levels?.map(level => (
                    <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="outstanding">Outstanding Only</SelectItem>
                  <SelectItem value="paid">Paid Up Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedYear ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <DollarSign className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground text-lg">Select an academic year to generate report</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="print-area space-y-4">
          <div className="hidden print:block mb-6">
            <div className="text-center border-b-2 border-black pb-2 mb-2">
              <h1 className="text-xl font-bold uppercase">KidzKave School</h1>
              <h2 className="text-lg font-bold uppercase mt-2">Fee Balances Report</h2>
              <p className="text-sm text-muted-foreground">
                {currentYear?.name || 'All Years'} {currentLevel ? `• ${currentLevel.name}` : ''}
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="py-3 px-4 no-print">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {currentYear && <Badge variant="outline">{currentYear.name}</Badge>}
                  {currentLevel && <Badge variant="secondary">{currentLevel.name}</Badge>}
                  {statusFilter !== 'all' && <Badge>{statusFilter === 'outstanding' ? 'Outstanding' : 'Paid Up'}</Badge>}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground no-print">
                  <span>{balancesData?.students.length || 0} Students</span>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-1" /> Print
                  </Button>
                </div>
                <div className="hidden print:block text-sm">
                  Date: {today}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Students</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {balancesData?.totals.totalStudents || 0}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Expected</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(balancesData?.totals.totalFees || 0)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Collected</CardDescription>
                <CardTitle className="text-2xl text-green-600">{formatCurrency(balancesData?.totals.totalPaid || 0)}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <CardHeader className="pb-2">
                <CardDescription>Outstanding</CardDescription>
                <CardTitle className="text-2xl text-red-600">{formatCurrency(balancesData?.totals.totalOutstanding || 0)}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 no-print">
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid Up</p>
                  <p className="text-2xl font-bold text-green-600">{balancesData?.totals.paidStudents || 0} Students</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 dark:bg-red-950/20 border-red-200">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="text-2xl font-bold text-red-600">{balancesData?.totals.outstandingStudents || 0} Students</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Student List</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50 print:bg-gray-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b">Class</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider border-b">Total Fees</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider border-b">Paid</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider border-b">Balance</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider border-b no-print">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {balancesData?.students.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                          No students found.
                        </td>
                      </tr>
                    ) : (
                      balancesData?.students.map((student, index) => (
                        <tr key={student.studentId} className="hover:bg-muted/30 print:hover:bg-transparent">
                          <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{student.studentName}</div>
                            <div className="text-xs text-muted-foreground">{student.admissionNo}</div>
                          </td>
                          <td className="px-4 py-3 text-sm">{student.levelName}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatCurrency(student.totalFees)}</td>
                          <td className="px-4 py-3 text-right text-green-600">{formatCurrency(student.totalPaid)}</td>
                          <td className={`px-4 py-3 text-right font-medium ${student.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(Math.max(0, student.balance))}
                          </td>
                          <td className="px-4 py-3 text-center no-print">
                            {student.isPaid ? (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                <CheckCircle className="h-3 w-3 mr-1" /> Paid
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertCircle className="h-3 w-3 mr-1" /> Outstanding
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="hidden print:block mt-8 pt-4 border-t">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm">Accounts Signature: _________________</p>
                <p className="text-sm mt-2">Date: _________________</p>
              </div>
              <div>
                <p className="text-sm">Headteacher's Signature: _________________</p>
                <p className="text-sm mt-2">Date: _________________</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
