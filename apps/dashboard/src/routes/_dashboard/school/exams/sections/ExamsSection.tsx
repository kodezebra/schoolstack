import { Link } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import {
  Plus,
  Search,
  Trash2,
  FileText,
} from 'lucide-react'
import { useState } from 'react'
import type { Exam, AcademicYear, Level, Term, Subject } from './exam.types'

interface ExamsSectionProps {
  exams: Exam[] | undefined
  academicYears: AcademicYear[] | undefined
  levels: Level[] | undefined
  terms: Term[] | undefined
  subjects: Subject[] | undefined
  yearFilter: string
  levelFilter: string
  onYearFilterChange: (value: string) => void
  onLevelFilterChange: (value: string) => void
  onExamsRefresh: () => void
}

export function ExamsSection({
  exams,
  academicYears,
  levels,
  terms,
  subjects,
  yearFilter,
  levelFilter,
  onYearFilterChange,
  onLevelFilterChange,
  onExamsRefresh,
}: ExamsSectionProps) {
  const { toast } = useToast()
  const { confirm } = useConfirmDialog()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/school/exams/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete exam')
      return res.json()
    },
    onSuccess: () => {
      onExamsRefresh()
      toast({ title: 'Exam deleted', variant: 'success' })
    },
    onError: (error: Error) => {
      toast({ title: 'Delete failed', description: error.message, variant: 'error' })
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
      onExamsRefresh()
      setIsAddDialogOpen(false)
      toast({
        title: 'Exam created',
        description: `${data.title} has been added.`,
        variant: 'success'
      })
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create exam', description: error.message, variant: 'error' })
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

  return (
    <>
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
              <Select value={yearFilter} onValueChange={onYearFilterChange}>
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
              <Select value={levelFilter} onValueChange={onLevelFilterChange}>
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
    </>
  )
}
