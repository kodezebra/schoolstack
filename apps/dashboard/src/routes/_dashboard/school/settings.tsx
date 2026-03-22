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
  Check,
  User
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

interface Level {
  id: string
  name: string
  order: number
  academicYearId: string
  classTeacherId?: string
  classTeacherName?: string
  levelSubjects?: { subjectId: string }[]
}

interface Subject {
  id: string
  name: string
  code?: string
}

interface Staff {
  id: string
  firstName: string
  lastName: string
  role: string
}

interface LevelSubject {
  id: string
  levelId: string
  subjectId: string
  subjectName?: string
  teacherId?: string
  teacherName?: string
}

function LevelSubjectList({ levelId, teachers }: { levelId: string; teachers: Staff[] }) {
  const queryClient = useQueryClient()
  const { data: levelSubjects } = useQuery<LevelSubject[]>({
    queryKey: ['school-level-subjects', levelId],
    queryFn: async () => {
      const res = await apiFetch(`/school/exams/subjects/levels?levelId=${levelId}`)
      if (!res.ok) return []
      return res.json()
    }
  })

  const updateTeacherMutation = useMutation({
    mutationFn: async ({ id, teacherId }: { id: string; teacherId: string }) => {
      const res = await apiFetch(`/school/exams/subjects/levels/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ teacherId: teacherId === 'unassigned' ? null : teacherId })
      })
      if (!res.ok) throw new Error('Failed to assign teacher')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-level-subjects', levelId] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/school/exams/subjects/levels/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove subject')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-level-subjects', levelId] })
    }
  })

  if (!levelSubjects?.length) return <p className="text-sm text-muted-foreground italic">No subjects assigned</p>

  return (
    <div className="flex flex-wrap gap-2">
      {levelSubjects.map((ls) => (
        <div key={ls.id} className="flex flex-col gap-1.5 p-3 border rounded-lg bg-card shadow-sm min-w-[180px]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm">{ls.subjectName}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={() => {
                if(confirm('Remove this subject from class?')) deleteMutation.mutate(ls.id)
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Teacher</label>
            <Select 
              value={ls.teacherId || 'unassigned'} 
              onValueChange={(teacherId) => updateTeacherMutation.mutate({ id: ls.id, teacherId })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Assign Teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned" className="text-xs">No Teacher</SelectItem>
                {teachers.map(t => (
                  <SelectItem key={t.id} value={t.id} className="text-xs">{t.firstName} {t.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
    </div>
  )
}

function SchoolSettingsPage() {
  const queryClient = useQueryClient()
  const [isAddYearDialogOpen, setIsAddYearDialogOpen] = useState(false)
  const [isAddLevelDialogOpen, setIsAddLevelDialogOpen] = useState(false)

  const { data: staff } = useQuery<Staff[]>({
    queryKey: ['school-staff'],
    queryFn: async () => {
      const res = await apiFetch('/school/staff')
      if (!res.ok) return []
      return res.json()
    }
  })

  const teachers = staff?.filter(s => s.role === 'teacher') || []

  const { data: academicYears } = useQuery<AcademicYear[]>({
    queryKey: ['school-academic-years'],
    queryFn: async () => {
      const res = await apiFetch('/school/academic-years')
      if (!res.ok) throw new Error('Failed to fetch years')
      return res.json()
    }
  })

  const { data: levels } = useQuery<Level[]>({
    queryKey: ['school-levels'],
    queryFn: async () => {
      const res = await apiFetch('/school/levels')
      if (!res.ok) return []
      return res.json()
    }
  })

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ['school-subjects'],
    queryFn: async () => {
      const res = await apiFetch('/school/subjects')
      if (!res.ok) return []
      return res.json()
    }
  })

  const updateLevelMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const res = await apiFetch(`/school/levels/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update class')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-levels'] })
    }
  })

  const addLevelSubjectsMutation = useMutation({
    mutationFn: async (data: { levelId: string; subjectIds: string[] }) => {
      const res = await apiFetch('/school/exams/subjects/levels/bulk', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to add subjects')
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['school-level-subjects', variables.levelId] })
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

  const createLevelMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/school/levels', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create level')
      return res.json()
    },
    onSuccess: (newLevel) => {
      queryClient.invalidateQueries({ queryKey: ['school-levels'] })
      setIsAddLevelDialogOpen(false)
      // The LevelSubjectList now fetches its own data based on its levelId prop.
      // We don't need selectedLevelId state here as it's not directly used for rendering a specific levelSubjects list in this component.
      // However, we need to ensure the correct levelSubjects query is invalidated when a new level is added.
      queryClient.invalidateQueries({ queryKey: ['school-level-subjects', newLevel.id] })
    }
  })

  const deleteLevelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/school/levels/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete level')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-levels'] })
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

  const handleAddLevel = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    createLevelMutation.mutate({
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
          <p className="text-muted-foreground">Manage academic years, classes, and teachers.</p>
        </div>
      </div>

      <Tabs defaultValue="levels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="levels">Classes</TabsTrigger>
          <TabsTrigger value="years">Academic Years</TabsTrigger>
        </TabsList>

        <TabsContent value="years">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Academic Years</CardTitle>
                <CardDescription>Manage academic periods and set the current year.</CardDescription>
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
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Current</Badge>
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
                          if (confirm('Are you sure? This will delete data linked to this year!')) {
                            deleteYearMutation.mutate(year.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="levels">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Classes & Teachers</CardTitle>
                <CardDescription>Configure classes and assign teachers.</CardDescription>
              </div>
              <Button onClick={() => setIsAddLevelDialogOpen(true)} disabled={!currentYear}>
                <Plus className="mr-2 h-4 w-4" /> Add Class
              </Button>
            </CardHeader>
            <CardContent>
              {!currentYear ? (
                <div className="text-center py-8 text-muted-foreground">
                  Set an academic year first before adding classes.
                </div>
              ) : (
                <div className="space-y-6">
                  {levels?.map((level) => (
                    <div key={level.id} className="border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-4 bg-muted/30 border-b">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-xl">{level.name}</span>
                            <Badge variant="outline" className="text-xs">Order: {level.order}</Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground font-medium">Class Teacher:</span>
                            <Select 
                              value={level.classTeacherId || 'unassigned'} 
                              onValueChange={(teacherId) => updateLevelMutation.mutate({ id: level.id, classTeacherId: teacherId === 'unassigned' ? null : teacherId })}
                            >
                              <SelectTrigger className="h-8 w-[200px] text-xs">
                                <SelectValue placeholder="No teacher assigned" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned" className="text-xs">No Class Teacher</SelectItem>
                                {teachers.map(t => (
                                  <SelectItem key={t.id} value={t.id} className="text-xs">{t.firstName} {t.lastName}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (confirm('Delete this class and its data?')) {
                              deleteLevelMutation.mutate(level.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" /> Subjects & Teachers
                          </h4>
                          <div className="flex gap-2">
                            <Select 
                              value="" // Default to empty string to show placeholder
                              onValueChange={(subjectId) => {
                                addLevelSubjectsMutation.mutate({
                                  levelId: level.id,
                                  subjectIds: [subjectId]
                                })
                              }}
                            >
                              <SelectTrigger className="w-[180px] h-8 text-xs">
                                <SelectValue placeholder="Add Subject" />
                              </SelectTrigger>
                              <SelectContent>
                                {subjects?.filter(s => !level.levelSubjects?.some((ls: { subjectId: string }) => ls.subjectId === s.id)).map(s => ( // Filter out already assigned subjects
                                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 text-xs"
                              onClick={() => {
                                if (confirm(`Add all subjects to ${level.name}?`)) {
                                  addLevelSubjectsMutation.mutate({
                                    levelId: level.id,
                                    subjectIds: subjects?.map(s => s.id) || []
                                  })
                                }
                              }}
                            >
                              Add All
                            </Button>
                          </div>
                        </div>
                        
                        <LevelSubjectList levelId={level.id} teachers={teachers} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Year Dialog */}
      <Dialog open={isAddYearDialogOpen} onOpenChange={setIsAddYearDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Academic Year</DialogTitle>
            <DialogDescription>Create a new period.</DialogDescription>
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

      {/* Add Level Dialog */}
      <Dialog open={isAddLevelDialogOpen} onOpenChange={setIsAddLevelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Class</DialogTitle>
            <DialogDescription>Select a common class or enter manually.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Pick</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Baby Class', order: 1 },
                  { name: 'Middle Class', order: 2 },
                  { name: 'Top Class', order: 3 },
                  { name: 'Primary 1', order: 4 },
                  { name: 'Primary 2', order: 5 },
                  { name: 'Primary 3', order: 6 },
                  { name: 'Primary 4', order: 7 },
                  { name: 'Primary 5', order: 8 },
                  { name: 'Primary 6', order: 9 },
                  { name: 'Primary 7', order: 10 },
                ].map((c) => (
                  <Button
                    key={c.name}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      createLevelMutation.mutate({
                        name: c.name,
                        order: c.order,
                        academicYearId: currentYear?.id,
                      })
                    }}
                  >
                    {c.name}
                  </Button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddLevel} className="space-y-4 border-t pt-4">
              <div>
                <label className="text-sm font-medium">Class Name</label>
                <Input name="name" required placeholder="e.g., Senior 1" />
              </div>
              <div>
                <label className="text-sm font-medium">Order</label>
                <Input name="order" type="number" placeholder="e.g., 11" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddLevelDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createLevelMutation.isPending}>
                  {createLevelMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}