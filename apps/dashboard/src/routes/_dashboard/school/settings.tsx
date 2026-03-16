import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  Plus,
  Trash2,
  Calendar,
  Check
} from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export const Route = createFileRoute('/_dashboard/school/settings')({
  component: SchoolSettingsPage,
})

interface AcademicYear {
  id: string
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
  status: 'active' | 'closed'
}

interface Grade {
  id: string
  name: string
  order: number
}

function SchoolSettingsPage() {
  const queryClient = useQueryClient()
  const [isAddYearDialogOpen, setIsAddYearDialogOpen] = useState(false)
  const [isAddGradeDialogOpen, setIsAddGradeDialogOpen] = useState(false)

  const { data: academicYears, isLoading: yearsLoading } = useQuery<AcademicYear[]>({
    queryKey: ['school-academic-years'],
    queryFn: async () => {
      const res = await apiFetch('/school/academic-years')
      if (!res.ok) throw new Error('Failed to fetch years')
      return res.json()
    }
  })

  const { data: grades } = useQuery<Grade[]>({
    queryKey: ['school-grades'],
    queryFn: async () => {
      const res = await apiFetch('/school/grades')
      if (!res.ok) throw new Error('Failed to fetch grades')
      return res.json()
    }
  })

  const createYearMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/school/academic-years', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create year')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-academic-years'] })
      setIsAddYearDialogOpen(false)
    }
  })

  const setCurrentYearMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/school/academic-years/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isCurrent: true, status: 'active' })
      })
      if (!res.ok) throw new Error('Failed to set current year')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-academic-years'] })
    }
  })

  const deleteYearMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/school/academic-years/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete year')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-academic-years'] })
    }
  })

  const createGradeMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/school/grades', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create grade')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-grades'] })
      setIsAddGradeDialogOpen(false)
    }
  })

  const deleteGradeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/school/grades/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete grade')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-grades'] })
    }
  })

  const handleAddYear = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    createYearMutation.mutate({
      name: formData.get('name'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      status: 'active',
    })
  }

  const handleAddGrade = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    createGradeMutation.mutate({
      name: formData.get('name'),
      order: parseInt(formData.get('order') as string) || 0,
      academicYearId: academicYears?.find(y => y.isCurrent)?.id,
    })
  }

  const currentYear = academicYears?.find(y => y.isCurrent)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">School Settings</h1>
          <p className="text-muted-foreground">Manage academic years and grade levels.</p>
        </div>
      </div>

      <Tabs defaultValue="years" className="space-y-4">
        <TabsList>
          <TabsTrigger value="years">Academic Years</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
        </TabsList>

        <TabsContent value="years">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Academic Years</CardTitle>
                <CardDescription>Manage academic years and set the current year.</CardDescription>
              </div>
              <Button onClick={() => setIsAddYearDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Year
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {academicYears?.map((year) => (
                  <div key={year.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{year.name}</span>
                          {year.isCurrent && (
                            <Badge className="bg-green-100 text-green-700">Current</Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(year.startDate).toLocaleDateString()} - {new Date(year.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!year.isCurrent && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setCurrentYearMutation.mutate(year.id)}
                        >
                          <Check className="mr-2 h-4 w-4" /> Set as Current
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this academic year?')) {
                            deleteYearMutation.mutate(year.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {academicYears?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No academic years found. Add one to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Grade Levels</CardTitle>
                <CardDescription>Manage grade levels for the current academic year.</CardDescription>
              </div>
              <Button onClick={() => setIsAddGradeDialogOpen(true)} disabled={!currentYear}>
                <Plus className="mr-2 h-4 w-4" /> Add Grade
              </Button>
            </CardHeader>
            <CardContent>
              {!currentYear ? (
                <div className="text-center py-8 text-muted-foreground">
                  Set an academic year first before adding grades.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Current Year: {currentYear.name}
                  </div>
                  {grades?.map((grade) => (
                    <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{grade.name}</span>
                        <Badge variant="secondary">Order: {grade.order}</Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this grade?')) {
                            deleteGradeMutation.mutate(grade.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {grades?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No grades found for this academic year.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Academic Year Dialog */}
      <Dialog open={isAddYearDialogOpen} onOpenChange={setIsAddYearDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Academic Year</DialogTitle>
            <DialogDescription>Create a new academic year.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddYear} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Year Name</label>
              <Input name="name" required placeholder="e.g., 2024-2025" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input name="startDate" type="date" required />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input name="endDate" type="date" required />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddYearDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createYearMutation.isPending}>
                {createYearMutation.isPending ? 'Creating...' : 'Create Year'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Grade Dialog */}
      <Dialog open={isAddGradeDialogOpen} onOpenChange={setIsAddGradeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Grade Level</DialogTitle>
            <DialogDescription>Create a new grade for the current year.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddGrade} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Grade Name</label>
              <Input name="name" required placeholder="e.g., Primary 1, Senior 4" />
            </div>
            <div>
              <label className="text-sm font-medium">Order</label>
              <Input name="order" type="number" placeholder="Display order (e.g., 1, 2, 3)" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddGradeDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createGradeMutation.isPending}>
                {createGradeMutation.isPending ? 'Creating...' : 'Create Grade'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
