import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  Plus,
  Trash2,
  Calendar,
  Check,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Save,
  Loader2,
  Pencil
} from 'lucide-react'
import { useState, useEffect } from 'react'
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
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { REPORT_CARD_THEMES, DEFAULT_SETTINGS } from '../settings/settings.data'
import type { ParsedSettings, SiteSettings, ReportCardTheme } from '../settings/settings.types'

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

function LevelSubjectList({ levelId, teachers, onConfirm }: { levelId: string; teachers: Staff[]; onConfirm: (options: { title: string; description: string; confirmText?: string; variant?: "default" | "destructive"; onConfirm: () => void }) => void }) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
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
      toast({ title: 'Teacher assigned', description: 'The teacher has been updated.', variant: 'success' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to assign teacher', variant: 'error' })
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
      toast({ title: 'Subject removed', description: 'The subject has been removed from this class.', variant: 'success' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to remove subject', variant: 'error' })
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
                onConfirm({
                  title: "Remove Subject",
                  description: "Remove this subject from class?",
                  confirmText: "Remove",
                  variant: "destructive",
                  onConfirm: () => deleteMutation.mutate(ls.id),
                })
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
  const { toast } = useToast()
  const [isAddYearDialogOpen, setIsAddYearDialogOpen] = useState(false)
  const [isEditYearDialogOpen, setIsEditYearDialogOpen] = useState(false)
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null)
  const [isAddLevelDialogOpen, setIsAddLevelDialogOpen] = useState(false)
  const [isEditLevelDialogOpen, setIsEditLevelDialogOpen] = useState(false)
  const [editingLevel, setEditingLevel] = useState<Level | null>(null)
  const [parsedSettings, setParsedSettings] = useState<ParsedSettings>(DEFAULT_SETTINGS)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { confirm, renderConfirmDialog } = useConfirmDialog()

  const { data: settingsData } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const res = await apiFetch('/settings')
      if (!res.ok) throw new Error('Failed to fetch settings')
      return res.json() as Promise<SiteSettings>
    }
  })

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: ParsedSettings) => {
      const payload: Partial<SiteSettings> = {
        schoolName: settings.schoolName,
        schoolAddress: settings.schoolAddress,
        schoolPhone: settings.schoolPhone,
        schoolEmail: settings.schoolEmail,
        reportCardTheme: settings.reportCardTheme
      }
      const res = await apiFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to save settings')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] })
      setHasUnsavedChanges(false)
      toast({ title: 'Settings saved', description: 'School settings have been updated.', variant: 'success' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to save settings', variant: 'error' })
    }
  })

  const updateSetting = (key: string, value: unknown) => {
    setParsedSettings(prev => ({ ...prev, [key]: value }))
    setHasUnsavedChanges(true)
  }

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(parsedSettings)
  }

  useEffect(() => {
    if (settingsData) {
      setParsedSettings({
        ...DEFAULT_SETTINGS,
        schoolName: settingsData.schoolName || DEFAULT_SETTINGS.schoolName,
        schoolAddress: settingsData.schoolAddress || DEFAULT_SETTINGS.schoolAddress,
        schoolPhone: settingsData.schoolPhone || DEFAULT_SETTINGS.schoolPhone,
        schoolEmail: settingsData.schoolEmail || DEFAULT_SETTINGS.schoolEmail,
        reportCardTheme: settingsData.reportCardTheme || DEFAULT_SETTINGS.reportCardTheme
      })
    }
  }, [settingsData])

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
      toast({ title: 'Subjects added', description: 'The subjects have been assigned to this class.', variant: 'success' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to add subjects', variant: 'error' })
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
      toast({ title: 'Academic year created', description: 'The new year has been added.', variant: 'success' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to create year', variant: 'error' })
    }
  })

  const updateYearMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name: string; startDate: string; endDate: string }) => {
      const res = await apiFetch(`/school/academic-years/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update year')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-academic-years'] })
      setIsEditYearDialogOpen(false)
      setEditingYear(null)
      toast({ title: 'Academic year updated', description: 'Changes saved successfully.', variant: 'success' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to update year', variant: 'error' })
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
      toast({ title: 'Current year set', description: 'This year is now the active academic year.', variant: 'success' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to set current year', variant: 'error' })
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
      toast({ title: 'Year deleted', description: 'The academic year has been removed.', variant: 'success' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to delete year', variant: 'error' })
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
      queryClient.invalidateQueries({ queryKey: ['school-level-subjects', newLevel.id] })
      toast({ title: 'Class created', description: 'The new class has been added.', variant: 'success' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to create class', variant: 'error' })
    }
  })

  const updateLevelMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: string | number | null }) => {
      const res = await apiFetch(`/school/levels/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update class')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-levels'] })
      setIsEditLevelDialogOpen(false)
      setEditingLevel(null)
      toast({ title: 'Class updated', description: 'Changes saved successfully.', variant: 'success' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to update class', variant: 'error' })
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
      toast({ title: 'Class deleted', description: 'The class has been removed.', variant: 'success' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to delete class', variant: 'error' })
    }
  })

  const handleAddYear = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    
    if (new Date(endDate) <= new Date(startDate)) {
      toast({ title: 'Invalid dates', description: 'End date must be after start date.', variant: 'error' })
      return
    }
    
    createYearMutation.mutate({
      name: formData.get('name'),
      startDate,
      endDate,
      status: 'active',
    })
  }

  const handleEditYear = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingYear) return
    const formData = new FormData(e.currentTarget)
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    
    if (new Date(endDate) <= new Date(startDate)) {
      toast({ title: 'Invalid dates', description: 'End date must be after start date.', variant: 'error' })
      return
    }
    
    updateYearMutation.mutate({
      id: editingYear.id,
      name: formData.get('name') as string,
      startDate,
      endDate,
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

  const handleEditLevel = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingLevel) return
    const formData = new FormData(e.currentTarget)
    updateLevelMutation.mutate({
      id: editingLevel.id,
      name: formData.get('name') as string,
      order: parseInt(formData.get('order') as string) || 0,
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

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">
            <Building2 className="h-4 w-4 mr-2" />
            School Info
          </TabsTrigger>
          <TabsTrigger value="years">
            <Calendar className="h-4 w-4 mr-2" />
            Academic Years
          </TabsTrigger>
          <TabsTrigger value="levels">
            <User className="h-4 w-4 mr-2" />
            Classes
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  School Information
                </CardTitle>
                <CardDescription>Basic details about your school</CardDescription>
              </div>
              <Button onClick={handleSaveSettings} disabled={!hasUnsavedChanges || saveSettingsMutation.isPending}>
                {saveSettingsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {saveSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="schoolName"
                      value={parsedSettings.schoolName}
                      onChange={(e) => updateSetting('schoolName', e.target.value)}
                      placeholder="Your School Name"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolEmail">School Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="schoolEmail"
                      type="email"
                      value={parsedSettings.schoolEmail}
                      onChange={(e) => updateSetting('schoolEmail', e.target.value)}
                      placeholder="info@school.edu"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolPhone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="schoolPhone"
                      type="tel"
                      value={parsedSettings.schoolPhone}
                      onChange={(e) => updateSetting('schoolPhone', e.target.value)}
                      placeholder="+256 700 000 000"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolAddress">Physical Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="schoolAddress"
                      value={parsedSettings.schoolAddress}
                      onChange={(e) => updateSetting('schoolAddress', e.target.value)}
                      placeholder="123 School Street, City"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                          disabled={setCurrentYearMutation.isPending}
                          onClick={() => setCurrentYearMutation.mutate(year.id)}
                        >
                          {setCurrentYearMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="mr-2 h-4 w-4" />
                          )} Set as Current
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => {
                          setEditingYear(year)
                          setIsEditYearDialogOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        disabled={deleteYearMutation.isPending}
                        onClick={() => {
                          confirm({
                            title: "Delete Academic Year",
                            description: `Are you sure you want to delete "${year.name}"? This will also delete all terms, exams, and grades associated with this year. This action cannot be undone.`,
                            confirmText: "Delete",
                            variant: "destructive",
                            onConfirm: () => deleteYearMutation.mutate(year.id),
                          })
                        }}
                      >
                        {deleteYearMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
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
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => {
                            setEditingLevel(level)
                            setIsEditLevelDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          disabled={deleteLevelMutation.isPending}
                          onClick={() => {
                            confirm({
                              title: "Delete Class",
                              description: `Are you sure you want to delete "${level.name}"? This will remove all student enrollments, exam records, and fee structures for this class. This action cannot be undone.`,
                              confirmText: "Delete",
                              variant: "destructive",
                              onConfirm: () => deleteLevelMutation.mutate(level.id),
                            })
                          }}
                        >
                          {deleteLevelMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
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
                                confirm({
                                  title: "Add All Subjects",
                                  description: `Add all subjects to ${level.name}?`,
                                  confirmText: "Add All",
                                  onConfirm: () => addLevelSubjectsMutation.mutate({
                                    levelId: level.id,
                                    subjectIds: subjects?.map(s => s.id) || []
                                  }),
                                })
                              }}
                            >
                              Add All
                            </Button>
                          </div>
                        </div>
                        
                        <LevelSubjectList levelId={level.id} teachers={teachers} onConfirm={confirm} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Card Theme
              </CardTitle>
              <CardDescription>Choose a theme for your student report cards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REPORT_CARD_THEMES.map((theme: ReportCardTheme) => (
                  <button
                    key={theme.id}
                    onClick={() => updateSetting('reportCardTheme', theme.id)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      parsedSettings.reportCardTheme === theme.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">{theme.name}</span>
                      {parsedSettings.reportCardTheme === theme.id && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{theme.description}</p>
                    <div className="flex gap-1">
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.primary }} title="Primary" />
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.secondary }} title="Secondary" />
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.accent }} title="Accent" />
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.header }} title="Header" />
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.tableHeader }} title="Table Header" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-muted/30">
                <h4 className="font-medium text-sm mb-3">Preview</h4>
                {(() => {
                  const theme = REPORT_CARD_THEMES.find(t => t.id === parsedSettings.reportCardTheme) || REPORT_CARD_THEMES[0]
                  return (
                    <div className="rounded-lg overflow-hidden border" style={{ backgroundColor: theme.colors.background }}>
                      <div className="p-4 text-white" style={{ backgroundColor: theme.colors.header }}>
                        <div className="font-bold">{parsedSettings.schoolName || 'School Name'}</div>
                        <div className="text-sm opacity-80">Student Report Card</div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between mb-4">
                          <div>
                            <div className="font-semibold">Student Name</div>
                            <div className="text-sm text-muted-foreground">Term 1, 2024</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">Grade: P1</div>
                            <div className="text-sm text-muted-foreground">Class: Primary 1</div>
                          </div>
                        </div>
                        <table className="w-full text-sm">
                          <thead>
                            <tr style={{ backgroundColor: theme.colors.tableHeader, color: 'white' }}>
                              <th className="p-2 text-left">Subject</th>
                              <th className="p-2 text-center">Marks</th>
                              <th className="p-2 text-center">Grade</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ backgroundColor: theme.colors.tableRow }}>
                              <td className="p-2">Mathematics</td>
                              <td className="p-2 text-center">85</td>
                              <td className="p-2 text-center" style={{ color: theme.colors.primary }}>A</td>
                            </tr>
                            <tr>
                              <td className="p-2">English</td>
                              <td className="p-2 text-center">78</td>
                              <td className="p-2 text-center" style={{ color: theme.colors.primary }}>B+</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="p-3 text-center text-sm" style={{ backgroundColor: theme.colors.footer }}>
                        <span style={{ color: theme.colors.text }}>Total: 163/200</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Year Sheet */}
      <Sheet open={isAddYearDialogOpen} onOpenChange={setIsAddYearDialogOpen}>
        <SheetContent className="w-[400px] sm:w-[450px] p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Academic Year</SheetTitle>
            <SheetDescription>Create a new period.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleAddYear} className="space-y-4 mt-6">
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
            <div className="flex justify-end gap-2 pt-4 pb-4">
              <Button type="button" variant="outline" onClick={() => setIsAddYearDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createYearMutation.isPending}>
                {createYearMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {createYearMutation.isPending ? 'Creating...' : 'Create Year'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Add Level Sheet */}
      <Sheet open={isAddLevelDialogOpen} onOpenChange={setIsAddLevelDialogOpen}>
        <SheetContent className="w-[400px] sm:w-[450px] p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Class</SheetTitle>
            <SheetDescription>Select a common class or enter manually.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
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
              <div className="flex justify-end gap-2 pt-4 pb-4">
                <Button type="button" variant="outline" onClick={() => setIsAddLevelDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createLevelMutation.isPending}>
                  {createLevelMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {createLevelMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Year Sheet */}
      <Sheet open={isEditYearDialogOpen} onOpenChange={(open) => {
        setIsEditYearDialogOpen(open)
        if (!open) setEditingYear(null)
      }}>
        <SheetContent className="w-[400px] sm:w-[450px] p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Academic Year</SheetTitle>
            <SheetDescription>Update the academic year details.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleEditYear} className="space-y-4 mt-6">
            <div>
              <label className="text-sm font-medium">Year Name</label>
              <Input 
                name="name" 
                required 
                defaultValue={editingYear?.name}
                placeholder="e.g., 2024-2025" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input 
                  name="startDate" 
                  type="date" 
                  required 
                  defaultValue={editingYear?.startDate?.split('T')[0]}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input 
                  name="endDate" 
                  type="date" 
                  required 
                  defaultValue={editingYear?.endDate?.split('T')[0]}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 pb-4">
              <Button type="button" variant="outline" onClick={() => setIsEditYearDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateYearMutation.isPending}>
                {updateYearMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {updateYearMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Edit Level Sheet */}
      <Sheet open={isEditLevelDialogOpen} onOpenChange={(open) => {
        setIsEditLevelDialogOpen(open)
        if (!open) setEditingLevel(null)
      }}>
        <SheetContent className="w-[400px] sm:w-[450px] p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Class</SheetTitle>
            <SheetDescription>Update the class details.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleEditLevel} className="space-y-4 mt-6">
            <div>
              <label className="text-sm font-medium">Class Name</label>
              <Input 
                name="name" 
                required 
                defaultValue={editingLevel?.name}
                placeholder="e.g., Senior 1" 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Order</label>
              <Input 
                name="order" 
                type="number" 
                defaultValue={editingLevel?.order}
                placeholder="e.g., 11" 
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 pb-4">
              <Button type="button" variant="outline" onClick={() => setIsEditLevelDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateLevelMutation.isPending}>
                {updateLevelMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {updateLevelMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {renderConfirmDialog()}
    </div>
  )
}