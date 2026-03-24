import { useState } from 'react'
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from '@/components/ui/empty-state'
import { Link } from '@tanstack/react-router'
import { Users, CheckCircle, AlertCircle } from 'lucide-react'
import type { BalancesData, Level, AcademicYear, FeeTab } from './fee.types'

interface BalancesSectionProps {
  balancesData: BalancesData | undefined
  levels: Level[] | undefined
  academicYears: AcademicYear[] | undefined
  balanceFilters: {
    academicYearId: string
    levelId: string
    status: string
  }
  onFilterChange: (filters: { academicYearId: string; levelId: string; status: string }) => void
  isLoading: boolean
}

export function BalancesSection({ balancesData, levels, academicYears, balanceFilters, onFilterChange, isLoading }: BalancesSectionProps) {
  const fmtCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(amount)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center flex-wrap">
        <Select 
          value={balanceFilters.academicYearId} 
          onValueChange={(v) => onFilterChange({ ...balanceFilters, academicYearId: v })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {academicYears?.map(year => (
              <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select 
          value={balanceFilters.levelId} 
          onValueChange={(v) => onFilterChange({ ...balanceFilters, levelId: v })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {levels?.map(level => (
              <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select 
          value={balanceFilters.status} 
          onValueChange={(v) => onFilterChange({ ...balanceFilters, status: v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="outstanding">Outstanding</SelectItem>
            <SelectItem value="paid">Paid Up</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
            <CardTitle className="text-2xl">{fmtCurrency(balancesData?.totals.totalFees || 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Collected</CardDescription>
            <CardTitle className="text-2xl text-green-600">{fmtCurrency(balancesData?.totals.totalPaid || 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader className="pb-2">
            <CardDescription>Outstanding</CardDescription>
            <CardTitle className="text-2xl text-red-600">{fmtCurrency(balancesData?.totals.totalOutstanding || 0)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Student Balances</CardTitle>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                {balancesData?.totals.paidStudents || 0} Paid
              </span>
              <span className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-red-600" />
                {balancesData?.totals.outstandingStudents || 0} Outstanding
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Total Fees</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : balancesData?.students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      icon={<Users className="h-6 w-6" />}
                      title="No student balances"
                      description="Student balances will appear after fee structures are created and students are enrolled"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                balancesData?.students.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell>
                      <Link to="/school/students/$id" params={{ id: student.studentId }} className="font-medium hover:underline">
                        {student.studentName}
                      </Link>
                      <p className="text-xs text-muted-foreground">{student.admissionNo}</p>
                    </TableCell>
                    <TableCell>{student.levelName}</TableCell>
                    <TableCell className="text-right font-medium">{fmtCurrency(student.totalFees)}</TableCell>
                    <TableCell className="text-right text-green-600">{fmtCurrency(student.totalPaid)}</TableCell>
                    <TableCell className={`text-right font-medium ${student.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {fmtCurrency(Math.max(0, student.balance))}
                    </TableCell>
                    <TableCell className="text-center">
                      {student.isPaid ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <CheckCircle className="h-3 w-3 mr-1" /> Paid
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" /> Outstanding
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
