import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { 
  Plus,
  Trash2,
  Scale,
  Copy
} from 'lucide-react'
import { useState } from 'react'
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

export const Route = createFileRoute('/_dashboard/school/grades/')({
  component: GradeScalesPage,
})

interface Grade {
  grade: string
  minMarks: number
  maxMarks: number
  points: number
  color: string
}

interface GradeScale {
  id: string
  name: string
  academicYearId: string | null
  academicYearName?: string
  grades: Grade[]
  isDefault: boolean
  createdAt: string
}

interface AcademicYear {
  id: string
  name: string
}

const DEFAULT_GRADES: Grade[] = [
  { grade: 'A', minMarks: 90, maxMarks: 100, points: 4.0, color: '#22c55e' },
  { grade: 'B', minMarks: 80, maxMarks: 89, points: 3.0, color: '#3b82f6' },
  { grade: 'C', minMarks: 70, maxMarks: 79, points: 2.0, color: '#f59e0b' },
  { grade: 'D', minMarks: 60, maxMarks: 69, points: 1.0, color: '#f97316' },
  { grade: 'F', minMarks: 0, maxMarks: 59, points: 0, color: '#ef4444' },
]

const PRESETS = [
  { name: 'Standard (A-F)', grades: DEFAULT_GRADES },
  { name: 'UG Primary', grades: [
    { grade: '1', minMarks: 90, maxMarks: 100, points: 1, color: '#22c55e' },
    { grade: '2', minMarks: 80, maxMarks: 89, points: 2, color: '#3b82f6' },
    { grade: '3', minMarks: 70, maxMarks: 79, points: 3, color: '#f59e0b' },
    { grade: '4', minMarks: 60, maxMarks: 69, points: 4, color: '#f97316' },
    { grade: '5', minMarks: 50, maxMarks: 59, points: 5, color: '#ef4444' },
    { grade: '6', minMarks: 0, maxMarks: 49, points: 6, color: '#991b1b' },
  ]},
  { name: 'Percentage Only', grades: [
    { grade: 'Pass', minMarks: 50, maxMarks: 100, points: 1, color: '#22c55e' },
    { grade: 'Fail', minMarks: 0, maxMarks: 49, points: 0, color: '#ef4444' },
  ]},
]

function GradeScalesPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { confirm, renderConfirmDialog } = useConfirmDialog()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingScale, setEditingScale] = useState<GradeScale | null>(null)
  const [selectedYear, setSelectedYear] = useState<string>('')

  const [formData, setFormData] = useState<{
    name: string
    academicYearId: string
    isDefault: boolean
    grades: Grade[]
  }>({
    name: '',
    academicYearId: '',
    isDefault: false,
    grades: [...DEFAULT_GRADES]
  })

  const { data: gradeScales, isLoading } = useQuery<GradeScale[]>({
    queryKey: ['grade-scales', selectedYear],
    queryFn: async () => {
      const params = (selectedYear && selectedYear !== 'all') ? `?academicYearId=${selectedYear}` : ''
      const res = await apiFetch(`/school/grade-scales${params}`)
      if (!res.ok) throw new Error('Failed to fetch grade scales')
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
    mutationFn: async (data: any) => {
      const res = await apiFetch('/school/grade-scales', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create grade scale')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grade-scales'] })
      setIsDialogOpen(false)
      resetForm()
      toast({ title: 'Grade scale created', description: 'The grading system has been added successfully.', variant: 'success' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to create grade scale', variant: 'error' })
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiFetch(`/school/grade-scales/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update grade scale')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grade-scales'] })
      setIsDialogOpen(false)
      setEditingScale(null)
      resetForm()
      toast({ title: 'Grade scale updated', description: 'The grading system has been updated successfully.', variant: 'success' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to update grade scale', variant: 'error' })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/school/grade-scales/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete grade scale')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grade-scales'] })
      toast({ title: 'Grade scale deleted', description: 'The grading system has been removed.', variant: 'success' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to delete grade scale', variant: 'error' })
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      academicYearId: '',
      isDefault: false,
      grades: [...DEFAULT_GRADES]
    })
  }

  const openCreateDialog = () => {
    resetForm()
    setEditingScale(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (scale: GradeScale) => {
    setEditingScale(scale)
    setFormData({
      name: scale.name,
      academicYearId: scale.academicYearId || '',
      isDefault: scale.isDefault,
      grades: [...scale.grades]
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    const data = {
      name: formData.name,
      academicYearId: formData.academicYearId || null,
      isDefault: formData.isDefault,
      grades: formData.grades
    }
    
    if (editingScale) {
      updateMutation.mutate({ id: editingScale.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const addGrade = () => {
    const lastGrade = formData.grades[formData.grades.length - 1]
    const newMin = lastGrade ? Math.max(0, lastGrade.minMarks - 10) : 0
    const newMax = lastGrade ? Math.max(1, newMin + 9) : 10
    setFormData({
      ...formData,
      grades: [...formData.grades, { 
        grade: '', 
        minMarks: newMin, 
        maxMarks: newMax, 
        points: 0, 
        color: '#6b7280' 
      }]
    })
  }

  const updateGrade = (index: number, field: keyof Grade, value: any) => {
    const newGrades = [...formData.grades]
    newGrades[index] = { ...newGrades[index], [field]: value }
    setFormData({ ...formData, grades: newGrades })
  }

  const removeGrade = (index: number) => {
    const newGrades = formData.grades.filter((_, i) => i !== index)
    setFormData({ ...formData, grades: newGrades })
  }

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setFormData({
      ...formData,
      name: preset.name,
      grades: [...preset.grades]
    })
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grade Scales</h1>
          <p className="text-muted-foreground mt-1">Configure grading systems for your school</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Create Grade Scale
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
      ) : gradeScales?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Scale className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground">No grade scales found</p>
            <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" /> Create First Grade Scale
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {gradeScales?.map(scale => (
            <Card key={scale.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{scale.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{scale.academicYearName || 'All Years'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {scale.isDefault && (
                    <Badge variant="default" className="bg-green-600">Default</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {scale.grades.map((g, i) => (
                    <div 
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: g.color }}
                    >
                      {g.grade}: {g.minMarks}-{g.maxMarks}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(scale)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      confirm({
                        title: 'Delete Grade Scale',
                        description: `Are you sure you want to delete "${scale.name}"? This action cannot be undone.`,
                        confirmText: 'Delete',
                        variant: 'destructive',
                        onConfirm: () => deleteMutation.mutate(scale.id)
                      })
                    }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <SheetContent className="w-[400px] sm:w-[600px] p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingScale ? 'Edit Grade Scale' : 'Create Grade Scale'}</SheetTitle>
            <SheetDescription>
              {editingScale ? 'Update the grade scale below.' : 'Create a new grading system. Use the presets or build your own.'}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 mt-6">
            {!editingScale && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Quick Start with Preset</label>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset, i) => (
                    <Button 
                      key={i}
                      variant="outline" 
                      size="sm"
                      onClick={() => applyPreset(preset)}
                      className="text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" /> {preset.name}
                    </Button>
                  ))}
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or build manually</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Scale Name</label>
                  <Input 
                    placeholder="e.g., Primary School Scale" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Academic Year (Optional)</label>
                  <Select 
                    value={formData.academicYearId} 
                    onValueChange={(v) => setFormData({ ...formData, academicYearId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Academic Years</SelectItem>
                      {academicYears?.map(year => (
                        <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Grades</label>
                  <Button variant="outline" size="sm" onClick={addGrade}>
                    <Plus className="h-4 w-4 mr-1" /> Add Grade
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {formData.grades.map((grade, index) => (
                    <div key={index} className="grid grid-cols-[auto_auto_auto_auto_auto] gap-2 items-center p-2 border rounded-lg">
                      <input
                        type="color"
                        value={grade.color}
                        onChange={(e) => updateGrade(index, 'color', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-0"
                      />
                      <Input
                        placeholder="Grade"
                        className="w-16"
                        value={grade.grade}
                        onChange={(e) => updateGrade(index, 'grade', e.target.value)}
                      />
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Input
                          type="number"
                          className="w-14"
                          value={grade.minMarks}
                          onChange={(e) => updateGrade(index, 'minMarks', parseInt(e.target.value) || 0)}
                        />
                        <span>to</span>
                        <Input
                          type="number"
                          className="w-14"
                          value={grade.maxMarks}
                          onChange={(e) => updateGrade(index, 'maxMarks', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Pts:</span>
                        <Input
                          type="number"
                          step="0.1"
                          className="w-14"
                          value={grade.points}
                          onChange={(e) => updateGrade(index, 'points', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                        onClick={() => removeGrade(index)}
                        disabled={formData.grades.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isDefault" className="text-sm">
                  Set as default grade scale
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Preview</label>
                <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
                  {formData.grades.map((g, i) => (
                    <div 
                      key={i}
                      className="px-3 py-1.5 rounded-full text-sm font-medium text-white shadow-sm"
                      style={{ backgroundColor: g.color }}
                    >
                      {g.grade || '?'} ({g.minMarks}-{g.maxMarks})
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={handleSubmit}
                disabled={!formData.name || formData.grades.length === 0}
              >
                {editingScale ? 'Update Grade Scale' : 'Create Grade Scale'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      {renderConfirmDialog()}
    </div>
  )
}
