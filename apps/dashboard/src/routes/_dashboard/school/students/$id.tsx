import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Pencil,
  Trash2,
  Save,
  X,
  Plus,
  Receipt,
} from 'lucide-react'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PhotoUpload } from '@/components/ui/photo-upload'

export const Route = createFileRoute('/_dashboard/school/students/$id')({
  component: StudentDetailPage,
})

interface Student {
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

interface Level {
  id: string
  name: string
}

interface FeePayment {
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

interface FeeStructure {
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

interface FeeWithBalance extends FeeStructure {
  type: 'base' | 'extra'
  isRecurring?: boolean
  paid: number
  amountDue: number
  balance: number
  isPaid: boolean
  hasOverride: boolean
  overrideReason: string | null
}

interface StudentDetail extends Student {
  level?: Level
  payments: FeePayment[]
}

function StudentDetailPage() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<Student | null>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    feeId: '',
    feeType: 'base' as 'base' | 'extra',
    amount: '',
    paymentMethod: 'cash',
    transactionNo: '',
    receiptNo: '',
    notes: ''
  })
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [adjustForm, setAdjustForm] = useState({
    feeStructureId: '',
    overrideAmount: '',
    reason: ''
  })
  const [isExtraFeeDialogOpen, setIsExtraFeeDialogOpen] = useState(false)
  const [extraFeeForm, setExtraFeeForm] = useState({
    title: '',
    amount: '',
    isRecurring: true
  })

  const { data: student, isLoading } = useQuery<StudentDetail>({
    queryKey: ['school-student', id],
    queryFn: async () => {
      const res = await apiFetch(`/school/students/${id}`)
      if (!res.ok) throw new Error('Failed to fetch student')
      return res.json()
    }
  })

  const { data: feeBalances, isLoading: isLoadingFees } = useQuery<FeeWithBalance[]>({
    queryKey: ['school-student-fees', id],
    queryFn: async () => {
      const res = await apiFetch(`/school/students/${id}/fees`)
      if (!res.ok) return []
      return res.json()
    }
  })

  const { data: marks, isLoading: isLoadingMarks } = useQuery<any[]>({
    queryKey: ['school-student-marks', id],
    queryFn: async () => {
      const res = await apiFetch(`/school/results/student/${id}`)
      if (!res.ok) return []
      return res.json()
    }
  })

  const { data: extraFeesLibrary } = useQuery<any[]>({
    queryKey: ['settings', 'extra-fees'],
    queryFn: async () => {
      const res = await apiFetch('/settings/extra-fees')
      if (!res.ok) return []
      return res.json()
    }
  })

  const editMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch(`/school/students/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update student')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-student', id] })
      queryClient.invalidateQueries({ queryKey: ['school-students'] })
      setIsEditing(false)
      setEditedData(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/school/students/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to withdraw student')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-students'] })
      window.history.back()
    }
  })

  const paymentMutation = useMutation({
    mutationFn: async (data: { feeType: 'base' | 'extra', feeId: string, amount: number, paymentMethod: string, transactionNo?: string, receiptNo?: string, notes?: string }) => {
      const payload: any = {
        studentId: id,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        transactionNo: data.transactionNo,
        receiptNo: data.receiptNo,
        notes: data.notes
      }
      
      if (data.feeType === 'base') {
        payload.feeStructureId = data.feeId
      } else {
        payload.extraFeeId = data.feeId
      }
      
      const res = await apiFetch('/school/payments', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to record payment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-student', id] })
      queryClient.invalidateQueries({ queryKey: ['school-student-fees', id] })
      queryClient.invalidateQueries({ queryKey: ['school-payments'] })
      setIsPaymentDialogOpen(false)
      setPaymentForm({
        feeId: '',
        feeType: 'base',
        amount: '',
        paymentMethod: 'cash',
        transactionNo: '',
        receiptNo: '',
        notes: ''
      })
    }
  })

  const adjustFeeMutation = useMutation({
    mutationFn: async (data: { feeStructureId: string, overrideAmount: number, reason?: string }) => {
      const res = await apiFetch('/school/fees/overrides', {
        method: 'POST',
        body: JSON.stringify({ ...data, studentId: id })
      })
      if (!res.ok) throw new Error('Failed to adjust fee')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-student-fees', id] })
      setIsAdjustDialogOpen(false)
      setAdjustForm({ feeStructureId: '', overrideAmount: '', reason: '' })
    }
  })

  const addExtraFeeMutation = useMutation({
    mutationFn: async (data: { title: string, amount: number, isRecurring: boolean }) => {
      const res = await apiFetch(`/school/students/${id}/fees/extra`, {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to add extra fee')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-student-fees', id] })
      setIsExtraFeeDialogOpen(false)
      setExtraFeeForm({ title: '', amount: '', isRecurring: true })
    }
  })

  const removeExtraFeeMutation = useMutation({
    mutationFn: async (feeId: string) => {
      const res = await apiFetch(`/school/students/${id}/fees/extra/${feeId}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to remove extra fee')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-student-fees', id] })
    }
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(amount)
  }

  const startEdit = () => {
    if (student) {
      setEditedData(student)
      setIsEditing(true)
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditedData(null)
  }

  const saveEdit = () => {
    if (!editedData) return
    editMutation.mutate({
      firstName: editedData.firstName,
      lastName: editedData.lastName,
      gender: editedData.gender,
      levelId: editedData.levelId,
      rollNo: editedData.rollNo,
      parentName: editedData.parentName,
      parentPhone: editedData.parentPhone,
      parentEmail: editedData.parentEmail,
      address: editedData.address,
      status: editedData.status,
    })
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(paymentForm.amount)
    if (!student || !paymentForm.feeId || isNaN(amount) || amount <= 0) return
    paymentMutation.mutate({
      feeType: paymentForm.feeType,
      feeId: paymentForm.feeId,
      amount: amount,
      paymentMethod: paymentForm.paymentMethod,
      transactionNo: paymentForm.transactionNo || undefined,
      receiptNo: paymentForm.receiptNo || undefined,
      notes: paymentForm.notes || undefined,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Student not found</p>
      </div>
    )
  }

  const display = isEditing && editedData ? editedData : student
  const totalPaid = student.payments?.reduce((sum, p) => sum + p.amount, 0) || 0
  const totalBalance = feeBalances?.reduce((sum, f) => sum + f.balance, 0) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <PhotoUpload 
            entityId={student.id}
            entityType="student"
            currentPhoto={student.photo}
            onUploadSuccess={() => queryClient.invalidateQueries({ queryKey: ['school-student', id] })}
            onDeleteSuccess={() => queryClient.invalidateQueries({ queryKey: ['school-student', id] })}
            size="md"
          />
          <div>
            <h1 className="text-2xl font-bold">{display.firstName} {display.lastName}</h1>
            <p className="text-muted-foreground">Admission No: {display.admissionNo}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEdit}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button size="sm" onClick={saveEdit} disabled={editMutation.isPending}>
                <Save className="mr-2 h-4 w-4" /> {editMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={startEdit}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => {
                if (confirm('Are you sure you want to PERMANENTLY delete this student? This will also delete their fee history and exam results.')) {
                  deleteMutation.mutate()
                }
              }}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fees">Fees & Payments</TabsTrigger>
          <TabsTrigger value="marks">Marks</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">First Name</label>
                        <Input 
                          value={editedData?.firstName || ''} 
                          onChange={(e) => setEditedData(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Last Name</label>
                        <Input 
                          value={editedData?.lastName || ''} 
                          onChange={(e) => setEditedData(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Gender</label>
                      <Select 
                        value={editedData?.gender} 
                        onValueChange={(v) => setEditedData(prev => prev ? { ...prev, gender: v as any } : null)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Roll No.</label>
                      <Input 
                        value={editedData?.rollNo || ''} 
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, rollNo: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Select 
                        value={editedData?.status} 
                        onValueChange={(v) => setEditedData(prev => prev ? { ...prev, status: v as any } : null)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="transferred">Transferred</SelectItem>
                          <SelectItem value="graduated">Graduated</SelectItem>
                          <SelectItem value="withdrawn">Withdrawn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="font-medium capitalize">{student.gender}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Enrolled</p>
                        <p className="font-medium">{new Date(student.enrollmentDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                        {student.status}
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Parent / Guardian</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="text-sm font-medium">Parent Name</label>
                      <Input 
                        value={editedData?.parentName || ''} 
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, parentName: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <Input 
                        value={editedData?.parentPhone || ''} 
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, parentPhone: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input 
                        value={editedData?.parentEmail || ''} 
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, parentEmail: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Address</label>
                      <Input 
                        value={editedData?.address || ''} 
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, address: e.target.value } : null)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Parent Name</p>
                        <p className="font-medium">{student.parentName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium">{student.parentPhone}</p>
                      </div>
                    </div>
                    {student.parentEmail && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-medium">{student.parentEmail}</p>
                        </div>
                      </div>
                    )}
                    {student.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Address</p>
                          <p className="font-medium">{student.address}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fees Tab */}
        <TabsContent value="fees" className="space-y-6">
          {/* Fee Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(feeBalances?.reduce((sum, f) => sum + f.amountDue, 0) || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(totalBalance)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Fee Balances Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Fee Structure & Balances</CardTitle>
              <Button size="sm" onClick={() => setIsPaymentDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Record Payment
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingFees ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : feeBalances?.filter(f => f.type !== 'extra').length === 0 && feeBalances?.filter(f => f.type === 'extra').length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No fee structures found for this student's class.</p>
              ) : (
                <div className="space-y-4">
                  {/* Base Fees */}
                  {feeBalances?.filter(f => f.type !== 'extra').length !== 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">Base Fees</h4>
                      {feeBalances?.filter(f => f.type !== 'extra').map((fee) => (
                        <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{fee.title}</p>
                              {fee.hasOverride && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  Adjusted
                                </Badge>
                              )}
                              <Badge variant={fee.isPaid ? 'default' : fee.balance > 0 ? 'destructive' : 'secondary'}>
                                {fee.isPaid ? 'Paid' : fee.balance > 0 ? 'Outstanding' : 'N/A'}
                              </Badge>
                            </div>
                            {fee.hasOverride && fee.overrideReason && (
                              <p className="text-sm text-muted-foreground">{fee.overrideReason}</p>
                            )}
                            {fee.description && (
                              <p className="text-sm text-muted-foreground">{fee.description}</p>
                            )}
                            {fee.dueDate && (
                              <p className="text-xs text-muted-foreground">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right space-y-1">
                              <p className="font-medium">
                                {fee.hasOverride ? (
                                  <span>
                                    <span className="line-through text-muted-foreground text-sm">{formatCurrency(fee.amount)}</span>
                                    <span className="ml-2 text-amber-600">{formatCurrency(fee.amountDue)}</span>
                                  </span>
                                ) : (
                                  formatCurrency(fee.amountDue)
                                )}
                              </p>
                              <p className="text-sm text-green-600">Paid: {formatCurrency(fee.paid)}</p>
                              {fee.balance > 0 && (
                                <p className="text-sm text-red-600">Balance: {formatCurrency(fee.balance)}</p>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setAdjustForm({
                                  feeStructureId: fee.id,
                                  overrideAmount: String(fee.amountDue),
                                  reason: fee.overrideReason || ''
                                })
                                setIsAdjustDialogOpen(true)
                              }}
                            >
                              Adjust
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Extra Charges */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-muted-foreground">Extra Charges</h4>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsExtraFeeDialogOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Extra Charge
                      </Button>
                    </div>
                    {feeBalances?.filter(f => f.type === 'extra').length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No extra charges added.</p>
                    ) : (
                      feeBalances?.filter(f => f.type === 'extra').map((fee) => (
                        <div key={fee.id} className="flex items-center justify-between p-4 border border-primary/20 rounded-lg bg-primary/5">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{fee.title}</p>
                              <Badge variant="outline" className="text-xs">
                                {fee.isRecurring ? 'Every term' : 'One-time'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(fee.amountDue)}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                if (confirm(`Remove "${fee.title}" from this student's charges?`)) {
                                  removeExtraFeeMutation.mutate(fee.id)
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {student.payments?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No payments recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {student.payments?.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Receipt className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{payment.feeTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.paymentDate).toLocaleDateString()} • {payment.paymentMethod.replace('_', ' ')}
                            {payment.transactionNo && ` • ${payment.transactionNo}`}
                            {payment.receiptNo && ` • Receipt: ${payment.receiptNo}`}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium text-green-600">{formatCurrency(payment.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marks Tab */}
        <TabsContent value="marks">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Exam Marks</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingMarks ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : marks?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No exam results recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {marks?.map((mark) => {
                    const percentage = Math.round((mark.marks / mark.totalMarks) * 100)
                    return (
                      <div key={mark.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{mark.examTitle}</p>
                            <Badge variant={percentage >= 50 ? 'default' : 'destructive'}>
                              {percentage}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {mark.subjectName} • {mark.examType} • {mark.examDate ? new Date(mark.examDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{mark.marks} / {mark.totalMarks}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Record a new payment for {student.firstName} {student.lastName}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Fee</label>
              <Select 
                value={paymentForm.feeId} 
                onValueChange={(v) => {
                  const fee = feeBalances?.find(f => f.id === v)
                  if (fee) {
                    setPaymentForm(prev => ({ 
                      ...prev, 
                      feeId: v,
                      feeType: fee.type,
                      amount: String(fee.balance > 0 ? fee.balance : fee.amountDue)
                    }))
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fee" />
                </SelectTrigger>
                <SelectContent>
                  {feeBalances?.filter(f => f.type === 'base').length !== 0 && (
                    <>
                      <SelectLabel>Base Fees</SelectLabel>
                      {feeBalances?.filter(f => f.type === 'base').map((fee) => (
                        <SelectItem key={fee.id} value={fee.id}>
                          {fee.title} - {formatCurrency(fee.amountDue)} {fee.balance > 0 ? `(Bal: ${formatCurrency(fee.balance)})` : ''}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {feeBalances?.filter(f => f.type === 'extra').length !== 0 && (
                    <>
                      <SelectLabel>Extra Charges</SelectLabel>
                      {feeBalances?.filter(f => f.type === 'extra').map((fee) => (
                        <SelectItem key={fee.id} value={fee.id}>
                          {fee.title} - {formatCurrency(fee.amountDue)} {fee.balance > 0 ? `(Bal: ${formatCurrency(fee.balance)})` : ''}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-2">
              <label className="text-sm font-medium">Amount</label>
              <Input 
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Enter amount"
                required
              />
              {(() => {
                const selectedFee = feeBalances?.find(f => f.id === paymentForm.feeId)
                if (!selectedFee) return null
                return (
                  <p className="text-xs text-muted-foreground mt-1">
                    Balance due: {formatCurrency(selectedFee.balance)}
                  </p>
                )
              })()}
            </div>

            <div>
              <label className="text-sm font-medium">Payment Method</label>
              <Select 
                value={paymentForm.paymentMethod} 
                onValueChange={(v) => setPaymentForm(prev => ({ ...prev, paymentMethod: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="school_pay">School Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Transaction No.</label>
                <Input 
                  value={paymentForm.transactionNo}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionNo: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Receipt No.</label>
                <Input 
                  value={paymentForm.receiptNo}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, receiptNo: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input 
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={paymentMutation.isPending || !paymentForm.feeId || parseFloat(paymentForm.amount) <= 0}>
                {paymentMutation.isPending ? 'Recording...' : 'Record Payment'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Fee Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Fee Amount</DialogTitle>
            <DialogDescription>
              Override the fee amount for {student.firstName} {student.lastName}. 
              Leave blank or enter original amount to remove adjustment.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            const fee = feeBalances?.find(f => f.id === adjustForm.feeStructureId)
            if (!fee) return
            
            const overrideAmount = parseInt(adjustForm.overrideAmount) || 0
            
            if (overrideAmount === 0 || overrideAmount === fee.amount) {
              adjustFeeMutation.mutate({
                feeStructureId: adjustForm.feeStructureId,
                overrideAmount: overrideAmount || fee.amount,
                reason: adjustForm.reason || undefined
              })
            } else {
              adjustFeeMutation.mutate({
                feeStructureId: adjustForm.feeStructureId,
                overrideAmount,
                reason: adjustForm.reason || undefined
              })
            }
          }} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Fee</label>
              <Select 
                value={adjustForm.feeStructureId} 
                onValueChange={(v) => {
                  const fee = feeBalances?.find(f => f.id === v)
                  setAdjustForm(prev => ({ 
                    ...prev, 
                    feeStructureId: v,
                    overrideAmount: fee ? String(fee.amountDue) : '',
                    reason: fee?.overrideReason || ''
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fee" />
                </SelectTrigger>
                <SelectContent>
                  {feeBalances?.map((fee) => (
                    <SelectItem key={fee.id} value={fee.id}>
                      {fee.title} ({formatCurrency(fee.amount)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">New Amount (UGX)</label>
              <Input 
                type="number"
                value={adjustForm.overrideAmount}
                onChange={(e) => setAdjustForm(prev => ({ ...prev, overrideAmount: e.target.value }))}
                placeholder="Enter new amount"
                required
              />
              {adjustForm.feeStructureId && (
                <p className="text-xs text-muted-foreground mt-1">
                  Original: {formatCurrency(feeBalances?.find(f => f.id === adjustForm.feeStructureId)?.amount || 0)}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Reason (optional)</label>
              <Input 
                value={adjustForm.reason}
                onChange={(e) => setAdjustForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="e.g., Agreed to pay less"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={adjustFeeMutation.isPending || !adjustForm.feeStructureId || !adjustForm.overrideAmount}>
                {adjustFeeMutation.isPending ? 'Saving...' : 'Save Adjustment'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Extra Charge Dialog */}
      <Dialog open={isExtraFeeDialogOpen} onOpenChange={setIsExtraFeeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Extra Charge</DialogTitle>
            <DialogDescription>
              Select from common charges or enter a custom one.
            </DialogDescription>
          </DialogHeader>
          
          {/* Library Options */}
          {extraFeesLibrary && extraFeesLibrary.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Common Charges</label>
              <div className="grid grid-cols-2 gap-2">
                {extraFeesLibrary.map((fee) => (
                  <button
                    key={fee.id}
                    type="button"
                    onClick={() => {
                      setExtraFeeForm({
                        title: fee.title,
                        amount: String(fee.amount),
                        isRecurring: fee.isRecurring
                      })
                    }}
                    className={`p-3 border rounded-lg text-left transition-colors hover:bg-muted ${
                      extraFeeForm.title === fee.title ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <p className="font-medium text-sm">{fee.title}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(fee.amount)}</p>
                  </button>
                ))}
              </div>
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or enter custom</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={(e) => {
            e.preventDefault()
            addExtraFeeMutation.mutate({
              title: extraFeeForm.title,
              amount: parseInt(extraFeeForm.amount) || 0,
              isRecurring: extraFeeForm.isRecurring
            })
          }} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Charge Name</label>
              <Input 
                value={extraFeeForm.title}
                onChange={(e) => setExtraFeeForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Transport, Class Tour"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Amount (UGX)</label>
              <Input 
                type="number"
                value={extraFeeForm.amount}
                onChange={(e) => setExtraFeeForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Enter amount"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Frequency</label>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={extraFeeForm.isRecurring}
                    onChange={() => setExtraFeeForm(prev => ({ ...prev, isRecurring: true }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Every term</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!extraFeeForm.isRecurring}
                    onChange={() => setExtraFeeForm(prev => ({ ...prev, isRecurring: false }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">One-time</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsExtraFeeDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addExtraFeeMutation.isPending || !extraFeeForm.title || !extraFeeForm.amount}>
                {addExtraFeeMutation.isPending ? 'Adding...' : 'Add Charge'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
