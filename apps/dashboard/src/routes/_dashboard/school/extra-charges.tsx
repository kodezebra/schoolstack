import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export const Route = createFileRoute('/_dashboard/school/extra-charges')({
  component: ExtraChargesPage,
})

interface ExtraFeeItem {
  id: string
  title: string
  amount: number
  isRecurring: boolean
}

function ExtraChargesPage() {
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<ExtraFeeItem | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    isRecurring: true
  })

  const { data: fees, isLoading } = useQuery<ExtraFeeItem[]>({
    queryKey: ['settings', 'extra-fees'],
    queryFn: async () => {
      const res = await apiFetch('/settings/extra-fees')
      if (!res.ok) return []
      return res.json()
    }
  })

  const saveMutation = useMutation({
    mutationFn: async (library: ExtraFeeItem[]) => {
      const res = await apiFetch('/settings/extra-fees', {
        method: 'PUT',
        body: JSON.stringify({ library })
      })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'extra-fees'] })
      setIsDialogOpen(false)
      setEditingFee(null)
      setFormData({ title: '', amount: '', isRecurring: true })
    }
  })

  const addFee = () => {
    if (!formData.title || !formData.amount) return
    
    const newFee: ExtraFeeItem = {
      id: crypto.randomUUID(),
      title: formData.title,
      amount: parseInt(formData.amount) || 0,
      isRecurring: formData.isRecurring
    }
    
    const updatedFees = editingFee
      ? fees?.map(f => f.id === editingFee.id ? newFee : f) || [newFee]
      : [...(fees || []), newFee]
    
    saveMutation.mutate(updatedFees)
  }

  const removeFee = (id: string) => {
    const updatedFees = fees?.filter(f => f.id !== id) || []
    saveMutation.mutate(updatedFees)
  }

  const openEditDialog = (fee: ExtraFeeItem) => {
    setEditingFee(fee)
    setFormData({
      title: fee.title,
      amount: String(fee.amount),
      isRecurring: fee.isRecurring
    })
    setIsDialogOpen(true)
  }

  const openAddDialog = () => {
    setEditingFee(null)
    setFormData({ title: '', amount: '', isRecurring: true })
    setIsDialogOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', { 
      style: 'currency', 
      currency: 'UGX', 
      maximumFractionDigits: 0 
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Extra Charges</h1>
          <p className="text-muted-foreground mt-1">
            Manage common charges like transport, class tours, and uniforms.
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Charge
        </Button>
      </div>

      {fees?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">No extra charges yet</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
              Add common charges like transport, class tours, or uniforms. These will appear as quick options when adding charges to students.
            </p>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" /> Add Your First Charge
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fees?.map((fee) => (
            <Card key={fee.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{fee.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(fee)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFee(fee.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(fee.amount)}</p>
                <Badge variant="outline" className="mt-2">
                  {fee.isRecurring ? 'Every term' : 'One-time'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingFee ? 'Edit Charge' : 'Add Charge'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 overflow-y-auto py-2">
            <div>
              <label className="text-sm font-medium">Charge Name</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Transport, Class Tour, Uniform"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Default Amount (UGX)</label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Enter amount"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This amount will be pre-filled when adding to a student.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Frequency</label>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.isRecurring}
                    onChange={() => setFormData(prev => ({ ...prev, isRecurring: true }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Every term</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!formData.isRecurring}
                    onChange={() => setFormData(prev => ({ ...prev, isRecurring: false }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">One-time</span>
                </label>
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={addFee}
                disabled={!formData.title || !formData.amount}
              >
                {saveMutation.isPending ? 'Saving...' : editingFee ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
