import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
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
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { Trash2, Banknote } from 'lucide-react'
import type { FeeStructure, AcademicYear } from './-fee.types'

interface FeeStructuresSectionProps {
  feeStructures: FeeStructure[] | undefined
  academicYears: AcademicYear[] | undefined
  onFeesRefresh: () => void
}

export function FeeStructuresSection({ feeStructures, academicYears, onFeesRefresh }: FeeStructuresSectionProps) {
  const { toast } = useToast()
  const { confirm } = useConfirmDialog()
  const [isAddFeeDialogOpen, setIsAddFeeDialogOpen] = useState(false)

  const createFeeMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/school/fees', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create fee')
      }
      return res.json()
    },
    onSuccess: () => {
      onFeesRefresh()
      setIsAddFeeDialogOpen(false)
      toast({ title: 'Fee structure created', variant: 'success' })
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create fee', description: error.message, variant: 'error' })
    }
  })

  const deleteFeeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/school/fees/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete fee')
      return res.json()
    },
    onSuccess: () => {
      onFeesRefresh()
      toast({ title: 'Fee structure deleted', variant: 'success' })
    },
    onError: (error: Error) => {
      toast({ title: 'Delete failed', description: error.message, variant: 'error' })
    }
  })

  const fmtCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(amount)
  }

  const handleAddFee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    createFeeMutation.mutate({
      scope: formData.get('scope'),
      academicYearId: formData.get('academicYearId'),
      title: formData.get('title'),
      description: formData.get('description') || undefined,
      amount: parseInt(formData.get('amount') as string),
      dueDate: formData.get('dueDate') || undefined,
    })
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeStructures?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      icon={<Banknote className="h-6 w-6" />}
                      title="No fee structures yet"
                      description="Create fee structures to start collecting payments"
                      action={{
                        label: 'Create Fee Structure',
                        onClick: () => setIsAddFeeDialogOpen(true)
                      }}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                feeStructures?.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{fee.title}</TableCell>
                    <TableCell>{fee.scopeDisplay || 'All Classes'}</TableCell>
                    <TableCell>{fmtCurrency(fee.amount)}</TableCell>
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
                          confirm({
                            title: "Delete Fee Structure",
                            description: "Are you sure you want to delete this fee structure?",
                            confirmText: "Delete",
                            variant: "destructive",
                            onConfirm: () => deleteFeeMutation.mutate(fee.id),
                          })
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

      <Sheet open={isAddFeeDialogOpen} onOpenChange={setIsAddFeeDialogOpen}>
        <SheetContent className="w-[400px] sm:w-[450px] p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create Fee Structure</SheetTitle>
            <SheetDescription>Set up a new fee for a class.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleAddFee} className="space-y-4 mt-6">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input name="title" required placeholder="e.g., Tuition Fee" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Scope</label>
                <Select name="scope" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="preschool">Pre-School (Day Care - Top Class)</SelectItem>
                    <SelectItem value="lower_primary">Lower Primary (Primary 1-3)</SelectItem>
                    <SelectItem value="upper_primary">Upper Primary (Primary 4-7)</SelectItem>
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
            <div className="flex justify-end gap-2 pt-4 pb-4">
              <Button type="button" variant="outline" onClick={() => setIsAddFeeDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createFeeMutation.isPending}>
                {createFeeMutation.isPending ? 'Creating...' : 'Create Fee'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
