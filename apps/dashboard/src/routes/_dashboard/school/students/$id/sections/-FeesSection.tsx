import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, Receipt } from 'lucide-react'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import type { Student, FeePayment, FeeWithBalance } from './-student.types'

interface FeesSectionProps {
  student: Student
  feeBalances: FeeWithBalance[] | undefined
  payments: FeePayment[]
  isLoadingFees: boolean
  studentId: string
}

export function FeesSection({ student, feeBalances, payments, isLoadingFees, studentId }: FeesSectionProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { confirm } = useConfirmDialog()
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [isExtraFeeDialogOpen, setIsExtraFeeDialogOpen] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    feeId: '',
    feeType: 'base' as 'base' | 'extra',
    amount: '',
    paymentMethod: 'cash',
    transactionNo: '',
    receiptNo: '',
    notes: ''
  })
  const [adjustForm, setAdjustForm] = useState({
    feeStructureId: '',
    overrideAmount: '',
    reason: ''
  })
  const [extraFeeForm, setExtraFeeForm] = useState({
    title: '',
    amount: '',
    isRecurring: true
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(amount)
  }

  const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
  const totalBalance = feeBalances?.reduce((sum, f) => sum + f.balance, 0) || 0

  const paymentMutation = useMutation({
    mutationFn: async (data: { feeType: 'base' | 'extra', feeId: string, amount: number, paymentMethod: string, transactionNo?: string, receiptNo?: string, notes?: string }) => {
      const payload: any = {
        studentId: studentId,
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
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to record payment')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-student', studentId] })
      queryClient.invalidateQueries({ queryKey: ['school-student-fees', studentId] })
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
      toast({ title: 'Payment recorded', description: 'The payment has been saved successfully.', variant: 'success' })
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to record payment', description: error.message, variant: 'error' })
    }
  })

  const adjustFeeMutation = useMutation({
    mutationFn: async (data: { feeStructureId: string, overrideAmount: number, reason?: string }) => {
      const res = await apiFetch('/school/fees/overrides', {
        method: 'POST',
        body: JSON.stringify({ ...data, studentId: studentId })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to adjust fee')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-student-fees', studentId] })
      setIsAdjustDialogOpen(false)
      setAdjustForm({ feeStructureId: '', overrideAmount: '', reason: '' })
      toast({ title: 'Fee adjusted', description: 'The fee amount has been updated.', variant: 'success' })
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to adjust fee', description: error.message, variant: 'error' })
    }
  })

  const addExtraFeeMutation = useMutation({
    mutationFn: async (data: { title: string, amount: number, isRecurring: boolean }) => {
      const res = await apiFetch(`/school/students/${studentId}/fees/extra`, {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to add extra fee')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-student-fees', studentId] })
      setIsExtraFeeDialogOpen(false)
      setExtraFeeForm({ title: '', amount: '', isRecurring: true })
      toast({ title: 'Extra charge added', description: 'The charge has been added to the student.', variant: 'success' })
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to add charge', description: error.message, variant: 'error' })
    }
  })

  const removeExtraFeeMutation = useMutation({
    mutationFn: async (feeId: string) => {
      const res = await apiFetch(`/school/students/${studentId}/fees/extra/${feeId}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to remove extra fee')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-student-fees', studentId] })
      toast({ title: 'Charge removed', variant: 'success' })
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to remove charge', description: error.message, variant: 'error' })
    }
  })

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

  return (
    <>
      <div className="space-y-6">
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
                              confirm({
                                title: "Remove Charge",
                                description: `Remove "${fee.title}" from this student's charges?`,
                                confirmText: "Remove",
                                variant: "destructive",
                                onConfirm: () => removeExtraFeeMutation.mutate(fee.id),
                              })
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {payments?.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No payments recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {payments?.map((payment) => (
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
      </div>

      <Sheet open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <SheetContent className="w-[400px] sm:w-[450px] p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Record Payment</SheetTitle>
            <SheetDescription>Record a new payment for {student.firstName} {student.lastName}</SheetDescription>
          </SheetHeader>
          <form onSubmit={handlePaymentSubmit} className="space-y-4 mt-6">
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
                    <SelectGroup>
                      <SelectLabel>Base Fees</SelectLabel>
                      {feeBalances?.filter(f => f.type === 'base').map((fee) => (
                        <SelectItem key={fee.id} value={fee.id}>
                          {fee.title} - {formatCurrency(fee.amountDue)} {fee.balance > 0 ? `(Bal: ${formatCurrency(fee.balance)})` : ''}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {feeBalances?.filter(f => f.type === 'extra').length !== 0 && (
                    <SelectGroup>
                      <SelectLabel>Extra Charges</SelectLabel>
                      {feeBalances?.filter(f => f.type === 'extra').map((fee) => (
                        <SelectItem key={fee.id} value={fee.id}>
                          {fee.title} - {formatCurrency(fee.amountDue)} {fee.balance > 0 ? `(Bal: ${formatCurrency(fee.balance)})` : ''}
                        </SelectItem>
                      ))}
                    </SelectGroup>
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

            <div className="flex justify-end gap-2 pt-4 pb-4">
              <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={paymentMutation.isPending || !paymentForm.feeId || parseFloat(paymentForm.amount) <= 0}>
                {paymentMutation.isPending ? 'Recording...' : 'Record Payment'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <SheetContent className="w-[400px] sm:w-[450px] p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Adjust Fee Amount</SheetTitle>
            <SheetDescription>
              Override the fee amount for {student.firstName} {student.lastName}. 
              Leave blank or enter original amount to remove adjustment.
            </SheetDescription>
          </SheetHeader>
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
          }} className="space-y-4 mt-6">
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

            <div className="flex justify-end gap-2 pt-4 pb-4">
              <Button type="button" variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={adjustFeeMutation.isPending || !adjustForm.feeStructureId || !adjustForm.overrideAmount}>
                {adjustFeeMutation.isPending ? 'Saving...' : 'Save Adjustment'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={isExtraFeeDialogOpen} onOpenChange={setIsExtraFeeDialogOpen}>
        <SheetContent className="w-[400px] sm:w-[450px] p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Extra Charge</SheetTitle>
            <SheetDescription>
              Select from common charges or enter a custom one.
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-2 mt-6">
            <label className="text-sm font-medium">Or enter custom</label>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault()
            addExtraFeeMutation.mutate({
              title: extraFeeForm.title,
              amount: parseInt(extraFeeForm.amount) || 0,
              isRecurring: extraFeeForm.isRecurring
            })
          }} className="space-y-4 mt-4">
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

            <div className="flex justify-end gap-2 pt-4 pb-4">
              <Button type="button" variant="outline" onClick={() => setIsExtraFeeDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addExtraFeeMutation.isPending || !extraFeeForm.title || !extraFeeForm.amount}>
                {addExtraFeeMutation.isPending ? 'Adding...' : 'Add Charge'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
