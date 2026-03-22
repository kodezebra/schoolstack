import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Sheet,
  SheetContent,
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
import { Plus, Trash2, Settings2, Users, Search } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_dashboard/school/extra-charges')({
  component: ExtraChargesPage,
})

interface ExtraFeeItem {
  id: string
  title: string
  amount: number
  isRecurring: boolean
}

interface ExtraFeeCount {
  title: string
  count: number
}

interface ExtraFeeStudent {
  id: string
  admissionNo: string
  firstName: string
  lastName: string
  levelId: string
  levelName: string | null
  extraFeeId: string
  amount: number
  isRecurring: boolean
}

interface StudentsResponse {
  data: ExtraFeeStudent[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function ExtraChargesPage() {
  const queryClient = useQueryClient()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<ExtraFeeItem | null>(null)
  const [viewingStudents, setViewingStudents] = useState<string | null>(null)
  const [studentSearch, setStudentSearch] = useState('')
  const [studentLevelFilter, setStudentLevelFilter] = useState<string>('all')
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

  const { data: extraFeeCounts } = useQuery<ExtraFeeCount[]>({
    queryKey: ['school-students', 'extra-fee-counts'],
    queryFn: async () => {
      const res = await apiFetch('/school/students/extra-fee-counts')
      if (!res.ok) return []
      return res.json()
    },
    enabled: !!fees
  })

  const { data: levels } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['school-levels'],
    queryFn: async () => {
      const res = await apiFetch('/school/levels')
      if (!res.ok) return []
      return res.json()
    }
  })

  const { data: studentsData, isLoading: isLoadingStudents } = useQuery<StudentsResponse>({
    queryKey: ['school-students', 'extra-fee-students', viewingStudents, studentSearch, studentLevelFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ title: viewingStudents! })
      if (studentSearch) params.set('search', studentSearch)
      if (studentLevelFilter !== 'all') params.set('levelId', studentLevelFilter)
      const res = await apiFetch(`/school/students/extra-fee-students?${params}`)
      if (!res.ok) return { data: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } }
      return res.json()
    },
    enabled: !!viewingStudents
  })

  const getCount = (title: string) => {
    return extraFeeCounts?.find(c => c.title === title)?.count || 0
  }

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
      queryClient.invalidateQueries({ queryKey: ['school-students', 'extra-fee-counts'] })
      setIsSheetOpen(false)
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
    setIsSheetOpen(true)
  }

  const openAddDialog = () => {
    setEditingFee(null)
    setFormData({ title: '', amount: '', isRecurring: true })
    setIsSheetOpen(true)
  }

  const openViewStudents = (title: string) => {
    setViewingStudents(title)
    setStudentSearch('')
    setStudentLevelFilter('all')
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
          {fees?.map((fee) => {
            const count = getCount(fee.title)
            return (
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
                        <Settings2 className="h-4 w-4" />
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
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline">
                      {fee.isRecurring ? 'Every term' : 'One-time'}
                    </Badge>
                    {count > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs gap-1"
                        onClick={() => openViewStudents(fee.title)}
                      >
                        <Users className="h-3 w-3" />
                        {count} student{count !== 1 ? 's' : ''}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* View Students Sheet */}
      <Sheet open={!!viewingStudents} onOpenChange={(open) => !open && setViewingStudents(null)}>
        <SheetContent className="w-[500px] sm:w-[600px] p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{viewingStudents}</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-8"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>
              <Select value={studentLevelFilter} onValueChange={setStudentLevelFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All classes</SelectItem>
                  {levels?.map(level => (
                    <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoadingStudents ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : studentsData?.data.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No students found</p>
              </div>
            ) : (
              <>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentsData?.data.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div>
                              <span className="font-medium">{student.firstName} {student.lastName}</span>
                              <p className="text-xs text-muted-foreground">{student.admissionNo}</p>
                            </div>
                          </TableCell>
                          <TableCell>{student.levelName || '-'}</TableCell>
                          <TableCell className="text-right">{formatCurrency(student.amount)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to="/school/students/$id" params={{ id: student.id }}>
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {studentsData && studentsData.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Showing {studentsData.data.length} of {studentsData.pagination.total}</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={studentsData.pagination.page === 1}
                        onClick={() => {}}
                      >
                        Previous
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={studentsData.pagination.page >= studentsData.pagination.totalPages}
                        onClick={() => {}}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Add/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[450px] p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingFee ? 'Edit Charge' : 'Add Charge'}
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 mt-6">
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

            <div className="flex justify-end gap-2 pt-4 pb-4">
              <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={addFee}
                disabled={!formData.title || !formData.amount}
              >
                {saveMutation.isPending ? 'Saving...' : editingFee ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
