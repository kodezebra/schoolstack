import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft,
  Save,
  Check
} from 'lucide-react'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/_dashboard/school/exams/$id')({
  component: ExamDetailPage,
})

interface ExamResult {
  id: string
  examId: string
  studentId: string
  marks: number
  notes?: string
  createdAt: string
  studentName?: string
  admissionNo?: string
}

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
  subjectName?: string
  levelName?: string
}

interface Student {
  id: string
  admissionNo: string
  firstName: string
  lastName: string
}

function ExamDetailPage() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()
  const [marksData, setMarksData] = useState<Record<string, { marks: string; notes: string }>>({})
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const { data: examData, isLoading } = useQuery<Exam & { results: ExamResult[] }>({
    queryKey: ['school-exam', id],
    queryFn: async () => {
      const res = await apiFetch(`/school/exams/${id}`)
      if (!res.ok) throw new Error('Failed to fetch exam')
      return res.json()
    }
  })

  const { data: students } = useQuery<Student[]>({
    queryKey: ['school-students-by-level', examData?.levelId],
    queryFn: async () => {
      if (!examData?.levelId) return []
      const res = await apiFetch(`/school/students?levelId=${examData.levelId}&status=active&limit=1000`)
      if (!res.ok) return []
      const data = await res.json()
      return data.data || []
    },
    enabled: !!examData?.levelId
  })

  const saveMutation = useMutation({
    mutationFn: async ({ studentId, marks, notes }: { studentId: string; marks: number; notes?: string }) => {
      const res = await apiFetch(`/school/exams/${id}/results`, {
        method: 'POST',
        body: JSON.stringify({ studentId, marks, notes })
      })
      if (!res.ok) throw new Error('Failed to save marks')
      return res.json()
    },
    onSuccess: (_data, variables) => {
      setSavedIds(prev => new Set([...prev, variables.studentId]))
      queryClient.invalidateQueries({ queryKey: ['school-exam', id] })
    }
  })

  useEffect(() => {
    if (examData?.results) {
      const initial: Record<string, { marks: string; notes: string }> = {}
      examData.results.forEach(r => {
        initial[r.studentId] = { marks: String(r.marks), notes: r.notes || '' }
      })
      setMarksData(initial)
      
      const ids = new Set(examData.results.map(r => r.studentId))
      setSavedIds(ids)
    }
  }, [examData?.results])

  const handleSave = (studentId: string) => {
    const data = marksData[studentId]
    if (!data || data.marks === '') return
    
    const marks = parseFloat(data.marks)
    if (isNaN(marks)) return
    
    saveMutation.mutate({ studentId, marks, notes: data.notes || undefined })
  }

  const handleMarksChange = (studentId: string, value: string) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], marks: value }
    }))
    setSavedIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(studentId)
      return newSet
    })
  }

  const handleNotesChange = (studentId: string, value: string) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes: value }
    }))
    setSavedIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(studentId)
      return newSet
    })
  }

  const handleSaveAll = async () => {
    const unsavedIds = students?.filter(s => !savedIds.has(s.id)).map(s => s.id) || []
    for (const studentId of unsavedIds) {
      const data = marksData[studentId]
      if (data && data.marks !== '') {
        const marks = parseFloat(data.marks)
        if (!isNaN(marks)) {
          await saveMutation.mutateAsync({ studentId, marks, notes: data.notes || undefined })
        }
      }
    }
  }

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/school/exams/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'published' })
      })
      if (!res.ok) throw new Error('Failed to set as Ready')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-exam', id] })
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!examData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Exam not found</p>
      </div>
    )
  }

  const results = examData.results || []
  const entryProgress = students?.length ? Math.round((results.length / students.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary">{examData.subjectName}</Badge>
              <Badge variant="outline">{examData.levelName}</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{examData.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right mr-4 hidden md:block">
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Progress</p>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${entryProgress}%` }} />
              </div>
              <span className="text-xs font-medium">{entryProgress}%</span>
            </div>
          </div>

          <Badge variant={examData.status === 'published' ? 'default' : 'secondary'}>
            {examData.status === 'published' ? 'Report Card Ready' : 'Internal Editing'}
          </Badge>
          
          {examData.status === 'draft' && entryProgress === 100 && (
            <Button size="sm" onClick={() => publishMutation.mutate()}>
              Finalize Marks
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Max Marks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{examData.totalMarks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Entered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {results.length > 0 
                ? Math.round(results.reduce((sum, r) => sum + r.marks, 0) / results.length)
                : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-lg font-semibold">Mark Sheet</CardTitle>
          <Button 
            size="sm"
            onClick={handleSaveAll} 
            disabled={saveMutation.isPending || students?.every(s => savedIds.has(s.id))}
            variant="outline"
          >
            <Save className="mr-2 h-4 w-4" /> Save All
          </Button>
        </CardHeader>
        <CardContent>
          {students?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No active students found in this class.
            </div>
          ) : (
            <div className="space-y-3">
              {students?.map((student) => {
                const isSaved = savedIds.has(student.id)
                
                return (
                  <div key={student.id} className={`flex items-center gap-4 p-3 border rounded-lg transition-colors ${isSaved ? 'bg-green-50/30 border-green-100' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{student.admissionNo}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Input
                          type="number"
                          className="w-24 h-9 text-right pr-8"
                          value={marksData[student.id]?.marks ?? ''}
                          onChange={(e) => handleMarksChange(student.id, e.target.value)}
                          max={examData.totalMarks}
                          min={0}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium pointer-events-none">
                          /{examData.totalMarks}
                        </span>
                      </div>

                      <Input
                        className="w-48 md:w-64 h-9 text-sm"
                        placeholder="Comment..."
                        value={marksData[student.id]?.notes ?? ''}
                        onChange={(e) => handleNotesChange(student.id, e.target.value)}
                      />

                      <Button 
                        size="icon" 
                        variant={isSaved ? "ghost" : "default"}
                        className={`h-9 w-9 shrink-0 ${isSaved ? 'text-green-600' : ''}`}
                        onClick={() => handleSave(student.id)}
                        disabled={isSaved || saveMutation.isPending || !marksData[student.id]?.marks}
                      >
                        {isSaved ? <Check className="h-5 w-5" /> : <Save className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}