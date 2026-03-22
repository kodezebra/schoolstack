import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus,
  Trash2,
  Calendar,
  Settings2
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

export const Route = createFileRoute('/_dashboard/school/terms/')({
  component: TermsPage,
})

interface Term {
  id: string
  name: string
  academicYearId: string
  academicYearName?: string
  startDate: string
  endDate: string
  status: 'upcoming' | 'active' | 'closed'
  createdAt: string
}

interface AcademicYear {
  id: string
  name: string
}

function TermsPage() {
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTerm, setEditingTerm] = useState<Term | null>(null)
  const [selectedYear, setSelectedYear] = useState<string>('')

  const [formData, setFormData] = useState({
    name: '',
    academicYearId: '',
    startDate: '',
    endDate: '',
    status: 'upcoming' as 'upcoming' | 'active' | 'closed'
  })

  const { data: terms, isLoading } = useQuery<Term[]>({
    queryKey: ['school-terms', selectedYear],
    queryFn: async () => {
      const params = (selectedYear && selectedYear !== 'all') ? `?academicYearId=${selectedYear}` : ''
      const res = await apiFetch(`/school/terms${params}`)
      if (!res.ok) throw new Error('Failed to fetch terms')
      return res.json()
    }
  })

  const { data: academicYears } = useQuery<AcademicYear[]>({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const res = await apiFetch('/school/academic-years')
      if (!res.ok) return []
      return res.json()
    }
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiFetch('/school/terms', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create term')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-terms'] })
      setIsDialogOpen(false)
      resetForm()
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await apiFetch(`/school/terms/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update term')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-terms'] })
      setIsDialogOpen(false)
      setEditingTerm(null)
      resetForm()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/school/terms/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete term')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-terms'] })
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      academicYearId: academicYears?.[0]?.id || '',
      startDate: '',
      endDate: '',
      status: 'upcoming'
    })
  }

  const openCreateDialog = () => {
    resetForm()
    setEditingTerm(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (term: Term) => {
    setEditingTerm(term)
    setFormData({
      name: term.name,
      academicYearId: term.academicYearId,
      startDate: term.startDate ? new Date(term.startDate).toISOString().split('T')[0] : '',
      endDate: term.endDate ? new Date(term.endDate).toISOString().split('T')[0] : '',
      status: term.status
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    const data = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString()
    }
    
    if (editingTerm) {
      updateMutation.mutate({ id: editingTerm.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
    active: 'bg-green-100 text-green-700 border-green-200',
    closed: 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Terms</h1>
          <p className="text-muted-foreground mt-1">Manage terms within academic years</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Term
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All Academic Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Academic Years</SelectItem>
            {academicYears?.map(year => (
              <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : terms?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground">No terms found</p>
            <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" /> Create First Term
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {terms?.map(term => (
            <Card key={term.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{term.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{term.academicYearName}</p>
                </div>
                <Badge className={statusColors[term.status]}>
                  {term.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date</span>
                    <span className="font-medium">
                      {term.startDate ? new Date(term.startDate).toLocaleDateString() : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End Date</span>
                    <span className="font-medium">
                      {term.endDate ? new Date(term.endDate).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(term)}>
                    <Settings2 className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteMutation.mutate(term.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTerm ? 'Edit Term' : 'Create New Term'}</DialogTitle>
            <DialogDescription>
              {editingTerm ? 'Update the term details below.' : 'Add a new academic term.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Term Name</label>
              <Input 
                placeholder="e.g., Term 1, First Term" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Academic Year</label>
              <Select 
                value={formData.academicYearId} 
                onValueChange={(v) => setFormData({ ...formData, academicYearId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears?.map(year => (
                    <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input 
                  type="date" 
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => setFormData({ ...formData, status: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              className="w-full" 
              onClick={handleSubmit}
              disabled={!formData.name || !formData.academicYearId || !formData.startDate || !formData.endDate}
            >
              {editingTerm ? 'Update Term' : 'Create Term'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
