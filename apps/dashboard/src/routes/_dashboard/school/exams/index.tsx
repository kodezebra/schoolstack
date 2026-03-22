import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Card, 
  CardContent, 
  CardHeader 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useToast } from '@/components/ui/toast'
import { EmptyState } from '@/components/ui/empty-state'
import { 
  Plus,
  Search,
  Trash2,
  FileText,
  Folder
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useConfirmDialog } from '@/components/ui/confirm-dialog'

export const Route = createFileRoute('/_dashboard/school/exams/')({
  component: ExamsPage,
})

interface Exam {
  id: string
  title: string
  type: 'test' | 'midterm' | 'final' | 'assignment' | 'quiz'
  academicYearId: string
  levelId: string
  subjectId: string
  examDate: string
  totalMarks: number
  status: 'draft' | 'published'
  createdAt: string
  subjectName?: string
  levelName?: string
}

interface AcademicYear {
  id: string
  name: string
  status?: string
}

interface Level {
  id: string
  name: string
}

interface Term {
  id: string
  name: string
  academicYearId: string
}

interface Subject {
  id: string
  name: string
}

interface ExamSet {
  id: string
  name: string
  description?: string
  academicYearId: string
  termId?: string
  levelId: string
  levelName?: string
  startDate?: string
  endDate?: string
  status: 'draft' | 'published' | 'completed'
  examCount?: number
  createdAt: string
}

interface LevelSubject {
  id: string
  levelId: string
  subjectId: string
  subject?: Subject
}

function ExamsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [subjectFilter, _setSubjectFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isExamSetDialogOpen, setIsExamSetDialogOpen] = useState(false)
  const [isBulkExamDialogOpen, setIsBulkExamDialogOpen] = useState(false)
  const [selectedExamSet, setSelectedExamSet] = useState<ExamSet | null>(null)
  const [examSetForm, setExamSetForm] = useState({
    yearId: '',
    termId: '',
    name: ''
  })
  const { confirm, renderConfirmDialog } = useConfirmDialog()

  const { data: exams, isLoading } = useQuery<Exam[]>({
    queryKey: ['school-exams', yearFilter, levelFilter, subjectFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (yearFilter !== 'all') params.set('academicYearId', yearFilter)
      if (levelFilter !== 'all') params.set('levelId', levelFilter)
      if (subjectFilter !== 'all') params.set('subjectId', subjectFilter)
      const res = await apiFetch(`/school/exams?${params}`)
      if (!res.ok) throw new Error('Failed to fetch exams')
      return res.json()
    }
  })

  const { data: academicYears } = useQuery<AcademicYear[]>({
    queryKey: ['school-academic-years'],
    queryFn: async () => {
      const res = await apiFetch('/school/academic-years')
      if (!res.ok) return []
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

  const { data: terms } = useQuery<Term[]>({
    queryKey: ['school-terms', yearFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (yearFilter !== 'all') params.set('academicYearId', yearFilter)
      const res = await apiFetch(`/school/terms?${params}`)
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

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/school/exams', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create exam')
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['school-exams'] })
      setIsAddDialogOpen(false)
      toast({
        title: 'Exam created',
        description: `${data.title} has been added.`,
        variant: 'success'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create exam',
        description: error.message,
        variant: 'error'
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/school/exams/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete exam')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-exams'] })
      toast({
        title: 'Exam deleted',
        variant: 'success'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'error'
      })
    }
  })

  // Exam Sets queries and mutations
  const { data: examSets } = useQuery<ExamSet[]>({
    queryKey: ['school-exam-sets', yearFilter, levelFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (yearFilter !== 'all') params.set('academicYearId', yearFilter)
      if (levelFilter !== 'all') params.set('levelId', levelFilter)
      const res = await apiFetch(`/school/exams/sets?${params}`)
      if (!res.ok) throw new Error('Failed to fetch exam sets')
      return res.json()
    }
  })

  const { data: levelSubjects } = useQuery<LevelSubject[]>({
    queryKey: ['school-level-subjects', levelFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (levelFilter !== 'all') params.set('levelId', levelFilter)
      const res = await apiFetch(`/school/exams/subjects/levels?${params}`)
      if (!res.ok) throw new Error('Failed to fetch level subjects')
      return res.json()
    }
  })

  const createExamSetMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/school/exams/sets', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create exam set')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-exam-sets'] })
      setIsExamSetDialogOpen(false)
      toast({
        title: 'Exam set created',
        variant: 'success'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create exam set',
        description: error.message,
        variant: 'error'
      })
    }
  })

  const deleteExamSetMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/school/exams/sets/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete exam set')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-exam-sets'] })
      toast({
        title: 'Exam set deleted',
        variant: 'success'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'error'
      })
    }
  })

  const bulkCreateExamsMutation = useMutation({
    mutationFn: async ({ examSetId, data }: { examSetId: string; data: any }) => {
      const res = await apiFetch(`/school/exams/sets/${examSetId}/exams`, {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create bulk exams')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-exams'] })
      queryClient.invalidateQueries({ queryKey: ['school-exam-sets'] })
      setIsBulkExamDialogOpen(false)
      setSelectedExamSet(null)
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-level-subjects'] })
    }
  })

  const filteredExams = exams?.filter(e => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      e.title.toLowerCase().includes(query) ||
      e.subjectName?.toLowerCase().includes(query) ||
      e.levelName?.toLowerCase().includes(query)
    )
  }) ?? []

  const getExamTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      test: 'bg-blue-100 text-blue-700',
      midterm: 'bg-purple-100 text-purple-700',
      final: 'bg-red-100 text-red-700',
      assignment: 'bg-green-100 text-green-700',
      quiz: 'bg-yellow-100 text-yellow-700',
    }
    return <Badge className={colors[type] || ''}>{type}</Badge>
  }

  const handleAddExam = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const termId = formData.get('termId')
    createMutation.mutate({
      title: formData.get('title'),
      type: formData.get('type'),
      academicYearId: formData.get('academicYearId'),
      levelId: formData.get('levelId'),
      subjectId: formData.get('subjectId'),
      termId: termId || undefined,
      examDate: formData.get('examDate'),
      totalMarks: parseInt(formData.get('totalMarks') as string) || 100,
    })
  }

  const [isAddLevelSubjectDialogOpen, setIsAddLevelSubjectDialogOpen] = useState(false)

  const unassignedSubjects = subjects?.filter(s => 
    !levelSubjects?.some(ls => ls.subjectId === s.id)
  ) ?? []

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
          <Breadcrumb items={[{ label: 'Exams' }]} />
          <h1 className="text-3xl font-bold tracking-tight mt-2">Exams</h1>
          <p className="text-muted-foreground">Manage exams and test schedules.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsExamSetDialogOpen(true)}>
            <Folder className="mr-2 h-4 w-4" /> New Exam Set
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Exam
          </Button>
        </div>
      </div>

      <Tabs defaultValue="exams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="exams">All Exams</TabsTrigger>
          <TabsTrigger value="sets">Exam Sets</TabsTrigger>
        </TabsList>

        <TabsContent value="exams" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search exams..." 
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {academicYears?.map(year => (
                        <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {levels?.map(level => (
                        <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <EmptyState
                      icon={<FileText className="h-6 w-6" />}
                      title="No exams created yet"
                      description="Create exams to track student performance and generate report cards"
                      action={{
                        label: 'Create Exam',
                        onClick: () => setIsAddDialogOpen(true)
                      }}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell>{getExamTypeBadge(exam.type)}</TableCell>
                    <TableCell>{exam.subjectName || '-'}</TableCell>
                    <TableCell>{exam.levelName || '-'}</TableCell>
                    <TableCell>{new Date(exam.examDate).toLocaleDateString()}</TableCell>
                    <TableCell>{exam.totalMarks}</TableCell>
                    <TableCell>
                      <Badge variant={exam.status === 'published' ? 'default' : 'secondary'}>
                        {exam.status === 'published' ? 'Ready for Report' : 'Draft/Editing'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          asChild
                        >
                          <Link to="/school/exams/$id" params={{ id: exam.id }}>
                            <FileText className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            confirm({
                              title: "Delete Exam",
                              description: "Are you sure you want to delete this exam?",
                              confirmText: "Delete",
                              variant: "destructive",
                              onConfirm: () => deleteMutation.mutate(exam.id),
                            })
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Exam Sheet */}
      <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <SheetContent className="w-[400px] sm:w-[450px] p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create New Exam</SheetTitle>
            <SheetDescription>Set up exam details and schedule.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleAddExam} className="space-y-4 mt-6">
            <div>
              <label className="text-sm font-medium">Exam Title</label>
              <Input name="title" required placeholder="e.g., Term 1 Mathematics Exam" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Beginning of Term</SelectItem>
                    <SelectItem value="midterm">Mid Term</SelectItem>
                    <SelectItem value="final">End of Term</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Total Marks</label>
                <Input name="totalMarks" type="number" defaultValue="100" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Academic Year</label>
              <Select name="academicYearId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears?.filter(y => y.status === 'active').map(year => (
                    <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Term (Optional)</label>
              <Select name="termId">
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {terms?.map(term => (
                    <SelectItem key={term.id} value={term.id}>{term.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Level</label>
                <Select name="levelId" required onValueChange={() => {}}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels?.map(level => (
                      <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Select name="subjectId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Exam Date</label>
              <Input name="examDate" type="date" required />
            </div>
            <div className="flex justify-end gap-2 pt-4 pb-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Exam'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
      </TabsContent>

      {/* Exam Sets Tab */}
      <TabsContent value="sets">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Exam Sets</h3>
                <p className="text-sm text-muted-foreground">Group exams together (e.g., Beginning of Term)</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Exams</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examSets?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <EmptyState
                        icon={<Folder className="h-6 w-6" />}
                        title="No exam sets yet"
                        description="Group exams together for easier management (e.g., Mid Term Exams)"
                        action={{
                          label: 'Create Exam Set',
                          onClick: () => setIsExamSetDialogOpen(true)
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  examSets?.map((set) => (
                    <TableRow key={set.id}>
                      <TableCell className="font-medium">{set.name}</TableCell>
                      <TableCell>{set.levelName || '-'}</TableCell>
                      <TableCell>{set.startDate ? new Date(set.startDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{set.endDate ? new Date(set.endDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{set.examCount || 0}</TableCell>
                      <TableCell>
                        <Badge variant={set.status === 'published' ? 'default' : 'secondary'}>
                          {set.status === 'published' ? 'Visible to Parents' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedExamSet(set)
                              setIsBulkExamDialogOpen(true)
                            }}
                          >
                            Add Exams
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              confirm({
                                title: "Delete Exam Set",
                                description: "Are you sure you want to delete this exam set?",
                                confirmText: "Delete",
                                variant: "destructive",
                                onConfirm: () => deleteExamSetMutation.mutate(set.id),
                              })
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>

      {/* Add Level Subjects Sheet */}
      <Sheet open={isAddLevelSubjectDialogOpen} onOpenChange={setIsAddLevelSubjectDialogOpen}>
        <SheetContent className="w-[400px] sm:w-[450px] p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Subjects to {levels?.find(l => l.id === levelFilter)?.name}</SheetTitle>
            <SheetDescription>Select subjects to assign to this level.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
              {unassignedSubjects.length === 0 ? (
                <p className="col-span-2 text-center text-sm text-muted-foreground py-4">
                  All available subjects have been assigned.
                </p>
              ) : (
                unassignedSubjects.map((subject) => (
                  <Button
                    key={subject.id}
                    variant="outline"
                    className="justify-start h-auto py-2 px-3 text-left"
                    onClick={() => {
                      addLevelSubjectsMutation.mutate({
                        levelId: levelFilter,
                        subjectIds: [subject.id]
                      })
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">{subject.name}</span>
                  </Button>
                ))
              )}
            </div>
            <div className="flex justify-end pt-2 pb-4">
              <Button variant="outline" onClick={() => setIsAddLevelSubjectDialogOpen(false)}>Close</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Create Exam Set Sheet */}
      <Sheet open={isExamSetDialogOpen} onOpenChange={setIsExamSetDialogOpen}>
        <SheetContent className="w-[400px] sm:w-[450px] p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create Exam Set</SheetTitle>
            <SheetDescription>Group multiple exams together</SheetDescription>
          </SheetHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            createExamSetMutation.mutate({
              name: formData.get('name'),
              description: formData.get('description') || undefined,
              academicYearId: formData.get('academicYearId'),
              termId: formData.get('termId') || undefined,
              levelId: formData.get('levelId'),
              startDate: formData.get('startDate') || undefined,
              endDate: formData.get('endDate') || undefined,
            })
          }} className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Academic Year</label>
                <Select name="academicYearId" required onValueChange={(v) => setExamSetForm(f => ({ ...f, yearId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears?.filter(y => y.status === 'active').map(year => (
                      <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Term (optional)</label>
                <Select name="termId" onValueChange={(v) => {
                  const term = terms?.find(t => t.id === v)
                  setExamSetForm(f => ({ ...f, termId: v, name: term ? `Term ${term.name.replace('Term ', '')} - ` : f.name }))
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms?.map(term => (
                      <SelectItem key={term.id} value={term.id}>{term.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Set Name</label>
              <div className="space-y-2">
                <div className="flex gap-1">
                  {['Beginning of', 'Mid Term', 'End of'].map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        const term = terms?.find(t => t.id === examSetForm.termId)
                        const termNum = term ? ` ${term.name.replace('Term ', '')}` : ''
                        setExamSetForm(f => ({ ...f, name: `${preset}${termNum}` }))
                      }}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
                <Input 
                  name="name" 
                  required 
                  placeholder="e.g., Beginning of Term 1"
                  value={examSetForm.name}
                  onChange={(e) => setExamSetForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input name="description" placeholder="Optional description" />
            </div>
            <div>
              <label className="text-sm font-medium">Level</label>
              <Select name="levelId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levels?.map(level => (
                    <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input name="startDate" type="date" />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input name="endDate" type="date" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 pb-4">
              <Button type="button" variant="outline" onClick={() => {
                setExamSetForm({ yearId: '', termId: '', name: '' })
                setIsExamSetDialogOpen(false)
              }}>Cancel</Button>
              <Button type="submit" disabled={createExamSetMutation.isPending}>
                {createExamSetMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Bulk Create Exams Sheet */}
      <Sheet open={isBulkExamDialogOpen} onOpenChange={(open) => {
        setIsBulkExamDialogOpen(open)
        if (!open) setSelectedExamSet(null)
      }}>
        <SheetContent className="w-[400px] sm:w-[450px] p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Exams to Set</SheetTitle>
            <SheetDescription>Create multiple exams at once for {selectedExamSet?.name}</SheetDescription>
          </SheetHeader>
          {selectedExamSet && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const subjectIds = Array.from(e.currentTarget.querySelectorAll('input[name="subjects"]:checked')).map((input: any) => input.value)
              const examType = formData.get('type') as string
              const typeLabel = examType === 'test' ? 'Test' : examType === 'midterm' ? 'Midterm' : examType === 'final' ? 'Final' : examType === 'assignment' ? 'Assignment' : 'Quiz'
              
              if (subjectIds.length === 0) {
                toast({ title: 'No subjects selected', description: 'Please select at least one subject', variant: 'error' })
                return
              }
              
              confirm({
                title: `Create ${subjectIds.length} Exam${subjectIds.length > 1 ? 's' : ''}?`,
                description: `This will create ${subjectIds.length} ${typeLabel} exams for the selected subjects. This action cannot be undone.`,
                confirmText: `Create ${subjectIds.length} Exam${subjectIds.length > 1 ? 's' : ''}`,
                onConfirm: () => {
                  bulkCreateExamsMutation.mutate({
                    examSetId: selectedExamSet.id,
                    data: {
                      subjectIds,
                      type: examType,
                      examDate: formData.get('examDate'),
                      totalMarks: parseInt(formData.get('totalMarks') as string) || 100,
                      titleTemplate: formData.get('titleTemplate'),
                    }
                  })
                }
              })
            }} className="space-y-4 mt-6">
              <div>
                <label className="text-sm font-medium">Exam Type</label>
                <Select name="type" required defaultValue="test">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test</SelectItem>
                    <SelectItem value="midterm">Midterm</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Exam Date</label>
                  <Input name="examDate" type="date" required />
                </div>
                <div>
                  <label className="text-sm font-medium">Total Marks</label>
                  <Input name="totalMarks" type="number" defaultValue="100" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Subjects</label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                  {subjects?.map(subject => (
                    <label key={subject.id} className="flex items-center gap-2">
                      <input type="checkbox" name="subjects" value={subject.id} />
                      <span>{subject.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 pb-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsBulkExamDialogOpen(false)
                  setSelectedExamSet(null)
                }}>Cancel</Button>
                <Button type="submit" disabled={bulkCreateExamsMutation.isPending}>
                  {bulkCreateExamsMutation.isPending ? 'Creating...' : 'Create Exams'}
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>

      {renderConfirmDialog()}
    </div>
  )
}
