import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { apiFetch } from '@/lib/api'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { ExamsSection, ExamSetsSection } from './sections/-index'
import type { ExamTab } from './sections/-exam.types'

export const Route = createFileRoute('/_dashboard/school/exams/')({
  component: ExamsPage,
})

function ExamsPage() {
  const [activeTab, setActiveTab] = useState<ExamTab>('exams')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [subjectFilter] = useState<string>('all')
  const { renderConfirmDialog } = useConfirmDialog()

  const { data: exams, isLoading, refetch: refetchExams } = useQuery<any[]>({
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

  const { data: academicYears } = useQuery<any[]>({
    queryKey: ['school-academic-years'],
    queryFn: async () => {
      const res = await apiFetch('/school/academic-years')
      if (!res.ok) return []
      return res.json()
    }
  })

  const { data: levels } = useQuery<any[]>({
    queryKey: ['school-levels'],
    queryFn: async () => {
      const res = await apiFetch('/school/levels')
      if (!res.ok) return []
      return res.json()
    }
  })

  const { data: terms } = useQuery<any[]>({
    queryKey: ['school-terms', yearFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (yearFilter !== 'all') params.set('academicYearId', yearFilter)
      const res = await apiFetch(`/school/terms?${params}`)
      if (!res.ok) return []
      return res.json()
    }
  })

  const { data: subjects } = useQuery<any[]>({
    queryKey: ['school-subjects'],
    queryFn: async () => {
      const res = await apiFetch('/school/subjects')
      if (!res.ok) return []
      return res.json()
    }
  })

  const { data: examSets, refetch: refetchExamSets } = useQuery<any[]>({
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
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ExamTab)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="exams">All Exams</TabsTrigger>
          <TabsTrigger value="sets">Exam Sets</TabsTrigger>
        </TabsList>

        <TabsContent value="exams" className="mt-0">
          <ExamsSection
            exams={exams}
            academicYears={academicYears}
            levels={levels}
            terms={terms}
            subjects={subjects}
            yearFilter={yearFilter}
            levelFilter={levelFilter}
            onYearFilterChange={setYearFilter}
            onLevelFilterChange={setLevelFilter}
            onExamsRefresh={refetchExams}
          />
        </TabsContent>

        <TabsContent value="sets" className="mt-0">
          <ExamSetsSection
            examSets={examSets}
            academicYears={academicYears}
            levels={levels}
            terms={terms}
            subjects={subjects}
            onExamSetsRefresh={refetchExamSets}
          />
        </TabsContent>
      </Tabs>

      {renderConfirmDialog()}
    </div>
  )
}
