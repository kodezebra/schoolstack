import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { validateAmount } from '@/lib/validation'
import { formatDateRelative } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from '@/components/ui/empty-state'
import { Search, Receipt } from 'lucide-react'
import type { FeePayment, FeeStructure } from './-fee.types'

interface PaymentsSectionProps {
  payments: FeePayment[] | undefined
  feeStructures: FeeStructure[] | undefined
  students: any[]
  onPaymentsRefresh: () => void
}

export function PaymentsSection({ payments, feeStructures, students, onPaymentsRefresh }: PaymentsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false)
  const [paymentFormErrors, setPaymentFormErrors] = useState<Record<string, string>>({})

  const filteredPayments = payments?.filter(p => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      p.studentName.toLowerCase().includes(query) ||
      p.admissionNo.toLowerCase().includes(query) ||
      p.feeTitle.toLowerCase().includes(query)
    )
  }) ?? []

  const filteredStudents = students.filter((s: any) => 
    !studentSearch.trim() || `${s.firstName} ${s.lastName} ${s.admissionNo}`.toLowerCase().includes(studentSearch.toLowerCase())
  )

  const createPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/school/payments', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to record payment')
      }
      return res.json()
    },
    onSuccess: () => {
      onPaymentsRefresh()
      setIsAddPaymentDialogOpen(false)
      setStudentSearch('')
      setPaymentFormErrors({})
    },
    onError: (error: Error) => {
      alert(error.message)
    }
  })

  const fmtCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(amount)
  }

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      cash: 'bg-green-100 text-green-700',
      mobile_money: 'bg-blue-100 text-blue-700',
      bank: 'bg-purple-100 text-purple-700',
      school_pay: 'bg-amber-100 text-amber-700',
    }
    const labels: Record<string, string> = {
      cash: 'Cash',
      mobile_money: 'Mobile Money',
      bank: 'Bank',
      school_pay: 'School Pay',
    }
    return <Badge className={colors[method] || ''}>{labels[method] || method}</Badge>
  }

  const handleAddPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPaymentFormErrors({})
    
    const formData = new FormData(e.currentTarget)
    const errors: Record<string, string> = {}
    
    const studentId = formData.get('studentId')
    const feeStructureId = formData.get('feeStructureId')
    const amountStr = formData.get('amount') as string
    const paymentMethod = formData.get('paymentMethod')
    
    if (!studentId) errors.studentId = 'Please select a student'
    if (!feeStructureId) errors.feeStructureId = 'Please select a fee structure'
    if (!paymentMethod) errors.paymentMethod = 'Please select a payment method'
    
    const amount = parseFloat(amountStr)
    const amountError = validateAmount(amount)
    if (amountError) errors.amount = amountError
    
    if (Object.keys(errors).length > 0) {
      setPaymentFormErrors(errors)
      return
    }
    
    createPaymentMutation.mutate({
      studentId,
      feeStructureId,
      amount,
      paymentMethod,
      transactionNo: formData.get('transactionNo') || undefined,
      notes: formData.get('notes') || undefined,
    })
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search payments..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Ref No.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      icon={<Receipt className="h-6 w-6" />}
                      title="No payments yet"
                      description="Record your first fee payment to track collections"
                      action={{
                        label: 'Record Payment',
                        onClick: () => setIsAddPaymentDialogOpen(true)
                      }}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDateRelative(payment.paymentDate)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{payment.studentName}</span>
                        <span className="text-xs text-muted-foreground">{payment.admissionNo}</span>
                      </div>
                    </TableCell>
                    <TableCell>{payment.feeTitle}</TableCell>
                    <TableCell className="font-medium">{fmtCurrency(payment.amount)}</TableCell>
                    <TableCell>{getMethodBadge(payment.paymentMethod)}</TableCell>
                    <TableCell className="text-muted-foreground">{payment.transactionNo || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={isAddPaymentDialogOpen} onOpenChange={(open) => {
        setIsAddPaymentDialogOpen(open)
        if (!open) {
          setStudentSearch('')
          setPaymentFormErrors({})
        }
      }}>
        <SheetContent className="w-[400px] sm:w-[450px] p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Record Payment</SheetTitle>
            <SheetDescription>Record a fee payment from a student.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleAddPayment} className="space-y-4 mt-6">
            <div>
              <label className="text-sm font-medium">Student <span className="text-destructive">*</span></label>
              <div className="relative mt-1.5">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select name="studentId" onValueChange={() => setPaymentFormErrors(e => ({ ...e, studentId: '' }))}>
                <SelectTrigger className={`mt-2 ${paymentFormErrors.studentId ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {filteredStudents.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      {studentSearch ? 'No students found' : 'Type to search students'}
                    </div>
                  ) : (
                    filteredStudents.slice(0, 50).map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} ({student.admissionNo})
                      </SelectItem>
                    ))
                  )}
                  {filteredStudents.length > 50 && (
                    <div className="py-2 text-center text-xs text-muted-foreground border-t">
                      Showing 50 of {filteredStudents.length} students
                    </div>
                  )}
                </SelectContent>
              </Select>
              {paymentFormErrors.studentId && (
                <p className="text-xs text-destructive mt-1">{paymentFormErrors.studentId}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Fee Structure <span className="text-destructive">*</span></label>
              <Select name="feeStructureId" onValueChange={() => setPaymentFormErrors(e => ({ ...e, feeStructureId: '' }))}>
                <SelectTrigger className={paymentFormErrors.feeStructureId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select fee" />
                </SelectTrigger>
                <SelectContent>
                  {feeStructures?.filter(f => f.status === 'active').length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No active fee structures. Create one first.
                    </div>
                  ) : (
                    feeStructures?.filter(f => f.status === 'active').map(fee => (
                      <SelectItem key={fee.id} value={fee.id}>
                        {fee.title} - {fee.levelName} ({fmtCurrency(fee.amount)})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Amount (UGX) <span className="text-destructive">*</span></label>
                <Input 
                  name="amount" 
                  type="number" 
                  min={0}
                  step={1000}
                  required 
                  placeholder="e.g., 75000"
                  className={paymentFormErrors.amount ? 'border-destructive' : ''}
                />
                {paymentFormErrors.amount && (
                  <p className="text-xs text-destructive mt-1">{paymentFormErrors.amount}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Payment Method <span className="text-destructive">*</span></label>
                <Select name="paymentMethod" onValueChange={() => setPaymentFormErrors(e => ({ ...e, paymentMethod: '' }))}>
                  <SelectTrigger className={paymentFormErrors.paymentMethod ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="school_pay">School Pay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Transaction No.</label>
                <Input name="transactionNo" placeholder="Optional" />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Input name="notes" placeholder="Optional" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 pb-4">
              <Button type="button" variant="outline" onClick={() => setIsAddPaymentDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createPaymentMutation.isPending}>
                {createPaymentMutation.isPending ? 'Recording...' : 'Record Payment'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
