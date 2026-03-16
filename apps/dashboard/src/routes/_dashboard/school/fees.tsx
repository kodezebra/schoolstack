import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  Plus,
  Search,
  DollarSign,
  Trash2,
  Banknote
} from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const Route = createFileRoute('/_dashboard/school/fees')({
  component: FeesPage,
})

interface FeeStructure {
  id: string
  gradeId: string
  gradeName?: string
  academicYearId: string
  title: string
  description?: string
  amount: number
  dueDate?: string
  status: 'active' | 'closed'
}

interface FeePayment {
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

interface Grade {
  id: string
  name: string
}

interface AcademicYear {
  id: string
  name: string
  isCurrent: boolean
}

function FeesPage() {
  const queryClient = useQueryClient()
  const [isAddFeeDialogOpen, setIsAddFeeDialogOpen] = useState(false)
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: feeStructures, isLoading: feesLoading } = useQuery<FeeStructure[]>({
    queryKey: ['school-fees'],
    queryFn: async () => {
      const res = await apiFetch('/school/fees')
      if (!res.ok) throw new Error('Failed to fetch fees')
      return res.json()
    }
  })

  const { data: payments } = useQuery<FeePayment[]>({
    queryKey: ['school-payments'],
    queryFn: async () => {
      const res = await apiFetch('/school/payments')
      if (!res.ok) throw new Error('Failed to fetch payments')
      return res.json()
    }
  })

  const { data: grades } = useQuery<Grade[]>({
    queryKey: ['school-grades'],
    queryFn: async () => {
      const res = await apiFetch('/school/grades')
      if (!res.ok) return []
      return res.json()
    }
  })

  const { data: academicYears } = useQuery<AcademicYear[]>({
    queryKey: ['school-academic-years'],
    queryFn: async () => {
      const res = await apiFetch('/school/academic-years')
      if (!res.ok) return []
      return res.json()
    }
  })

  const { data: students } = useQuery<any[]>({
    queryKey: ['school-students', 'active'],
    queryFn: async () => {
      const res = await apiFetch('/school/students?status=active')
      if (!res.ok) return []
      return res.json()
    }
  })

  const createFeeMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/school/fees', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create fee')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-fees'] })
      setIsAddFeeDialogOpen(false)
    }
  })

  const createPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/school/payments', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to record payment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-payments'] })
      setIsAddPaymentDialogOpen(false)
    }
  })

  const deleteFeeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/school/fees/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete fee')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-fees'] })
    }
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UGX', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(amount)
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

  const filteredPayments = payments?.filter(p => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      p.studentName.toLowerCase().includes(query) ||
      p.admissionNo.toLowerCase().includes(query) ||
      p.feeTitle.toLowerCase().includes(query)
    )
  }) ?? []

  const totalCollected = payments?.reduce((sum, p) => sum + p.amount, 0) || 0

  const handleAddFee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const gradeId = formData.get('gradeId') as string
    const academicYearId = formData.get('academicYearId') as string
    const amount = parseInt(formData.get('amount') as string)
    
    createFeeMutation.mutate({
      gradeId,
      academicYearId,
      title: formData.get('title'),
      description: formData.get('description') || undefined,
      amount,
      dueDate: formData.get('dueDate') || undefined,
    })
  }

  const handleAddPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    createPaymentMutation.mutate({
      studentId: formData.get('studentId'),
      feeStructureId: formData.get('feeStructureId'),
      amount: parseInt(formData.get('amount') as string),
      paymentMethod: formData.get('paymentMethod'),
      transactionNo: formData.get('transactionNo') || undefined,
      notes: formData.get('notes') || undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fees</h1>
          <p className="text-muted-foreground">Manage fee structures and record payments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAddPaymentDialogOpen(true)}>
            <Banknote className="mr-2 h-4 w-4" /> Record Payment
          </Button>
          <Button onClick={() => setIsAddFeeDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Fee
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Collected</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalCollected)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Fee Structures</CardDescription>
            <CardTitle className="text-2xl">{feeStructures?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Transactions</CardDescription>
            <CardTitle className="text-2xl">{payments?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
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
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        No payments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{payment.studentName}</span>
                            <span className="text-xs text-muted-foreground">{payment.admissionNo}</span>
                          </div>
                        </TableCell>
                        <TableCell>{payment.feeTitle}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{getMethodBadge(payment.paymentMethod)}</TableCell>
                        <TableCell className="text-muted-foreground">{payment.transactionNo || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structures">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeStructures?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        No fee structures found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    feeStructures?.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell className="font-medium">{fee.title}</TableCell>
                        <TableCell>{fee.gradeName}</TableCell>
                        <TableCell>{formatCurrency(fee.amount)}</TableCell>
                        <TableCell>{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <Badge variant={fee.status === 'active' ? 'default' : 'secondary'}>
                            {fee.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this fee structure?')) {
                                deleteFeeMutation.mutate(fee.id)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Fee Dialog */}
      <Dialog open={isAddFeeDialogOpen} onOpenChange={setIsAddFeeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Fee Structure</DialogTitle>
            <DialogDescription>Set up a new fee for a grade.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddFee} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input name="title" required placeholder="e.g., Term 1 Fees" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Grade</label>
                <Select name="gradeId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades?.map(grade => (
                      <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Academic Year</label>
                <Select name="academicYearId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears?.map(year => (
                      <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Amount (UGX)</label>
                <Input name="amount" type="number" required placeholder="e.g., 150000" />
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input name="dueDate" type="date" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input name="description" placeholder="Optional description" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddFeeDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createFeeMutation.isPending}>
                {createFeeMutation.isPending ? 'Creating...' : 'Create Fee'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Record a fee payment from a student.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Student</label>
              <Select name="studentId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students?.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.admissionNo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Fee Structure</label>
              <Select name="feeStructureId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select fee" />
                </SelectTrigger>
                <SelectContent>
                  {feeStructures?.filter(f => f.status === 'active').map(fee => (
                    <SelectItem key={fee.id} value={fee.id}>
                      {fee.title} - {fee.gradeName} ({formatCurrency(fee.amount)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Amount (UGX)</label>
                <Input name="amount" type="number" required placeholder="e.g., 75000" />
              </div>
              <div>
                <label className="text-sm font-medium">Payment Method</label>
                <Select name="paymentMethod" required>
                  <SelectTrigger>
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
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddPaymentDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createPaymentMutation.isPending}>
                {createPaymentMutation.isPending ? 'Recording...' : 'Record Payment'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
