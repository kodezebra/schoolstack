import { useState } from 'react'
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
import { Plus, Trash2, Folder } from 'lucide-react'
import type { ExamSet, AcademicYear, Level, Term, Subject } from './exam.types'

interface ExamSetsSectionProps {
  examSets: ExamSet[] | undefined
  academicYears: AcademicYear[] | undefined
  levels: Level[] | undefined
  terms: Term[] | undefined
  subjects: Subject[] | undefined
  onExamSetsRefresh: () => void
}

export function ExamSetsSection({
  examSets,
  academicYears,
  levels,
  terms,
  subjects,
  onExamSetsRefresh,
}: ExamSetsSectionProps) {
  const { toast } = useToast()
  const { confirm } = useConfirmDialog()
  const [isExamSetDialogOpen, setIsExamSetDialogOpen] = useState(false)
  const [isBulkExamDialogOpen, setIsBulkExamDialogOpen] = useState(false)
  const [selectedExamSet, setSelectedExamSet] = useState<ExamSet | null>(null)
  const [examSetForm, setExamSetForm] = useState({
    yearId: '',
    termId: '',
    name: ''
  })

  const deleteExamSetMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/school/exams/sets/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete exam set')
      return res.json()
    },
    onSuccess: () => {
      onExamSetsRefresh()
      toast({ title: 'Exam set deleted', variant: 'success' })
    },
    onError: (error: Error) => {
      toast({ title: 'Delete failed', description: error.message, variant: 'error' })
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
      onExamSetsRefresh()
      setIsExamSetDialogOpen(false)
      toast({ title: 'Exam set created', variant: 'success' })
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create exam set', description: error.message, variant: 'error' })
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
      onExamSetsRefresh()
      setIsBulkExamDialogOpen(false)
      setSelectedExamSet(null)
    }
  })

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Exam Sets</h3>
              <p className="text-sm text-muted-foreground">Group exams together (e.g., Beginning of Term)</p>
            </div>
            <Button variant="outline" onClick={() => setIsExamSetDialogOpen(true)}>
              <Folder className="mr-2 h-4 w-4" /> New Exam Set
            </Button>
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
              
              if (subjectIds.length === 0) {
                toast({ title: 'No subjects selected', description: 'Please select at least one subject', variant: 'error' })
                return
              }
              
              confirm({
                title: `Create ${subjectIds.length} Exam${subjectIds.length > 1 ? 's' : ''}?`,
                description: `This will create ${subjectIds.length} exams for the selected subjects.`,
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
    </>
  )
}
