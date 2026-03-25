import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'
import { PhotoUpload } from '@/components/ui/photo-upload'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { 
  ArrowLeft,
  Settings2,
  Trash2,
  Save,
  X,
} from 'lucide-react'
import {
  OverviewSection,
  FeesSection,
  MarksSection,
} from './$id/sections/-index'
import type { Student, StudentDetail, FeeWithBalance, StudentTab } from './$id/sections/-student.types'

export const Route = createFileRoute('/_dashboard/school/students/$id')({
  component: StudentDetailPage,
})

function StudentDetailPage() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<StudentTab>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<Student | null>(null)
  const { confirm, renderConfirmDialog } = useConfirmDialog()

  const { data: student, isLoading } = useQuery<StudentDetail>({
    queryKey: ['school-student', id],
    queryFn: async () => {
      const res = await apiFetch(`/school/students/${id}`)
      if (!res.ok) throw new Error('Failed to fetch student')
      return res.json()
    }
  })

  const { data: feeBalances, isLoading: isLoadingFees } = useQuery<FeeWithBalance[]>({
    queryKey: ['school-student-fees', id],
    queryFn: async () => {
      const res = await apiFetch(`/school/students/${id}/fees`)
      if (!res.ok) return []
      return res.json()
    }
  })

  const { data: marks, isLoading: isLoadingMarks } = useQuery<any[]>({
    queryKey: ['school-student-marks', id],
    queryFn: async () => {
      const res = await apiFetch(`/school/results/student/${id}`)
      if (!res.ok) return []
      return res.json()
    }
  })

  const editMutation = useMutation({
    mutationFn: async (data: Partial<Student>) => {
      const res = await apiFetch(`/school/students/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update student')
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['school-student', id] })
      queryClient.invalidateQueries({ queryKey: ['school-students'] })
      setIsEditing(false)
      setEditedData(null)
      toast({
        title: 'Student updated',
        description: `${data.firstName} ${data.lastName}'s record has been saved.`,
        variant: 'success'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update student',
        description: error.message,
        variant: 'error'
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/school/students/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to delete student')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-students'] })
      toast({
        title: 'Student deleted',
        variant: 'success'
      })
      window.history.back()
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete student',
        description: error.message,
        variant: 'error'
      })
    }
  })

  const startEdit = () => {
    if (student) {
      setEditedData(student as Student)
      setIsEditing(true)
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditedData(null)
  }

  const saveEdit = () => {
    if (!editedData) return
    editMutation.mutate({
      firstName: editedData.firstName,
      lastName: editedData.lastName,
      gender: editedData.gender,
      levelId: editedData.levelId,
      rollNo: editedData.rollNo,
      parentName: editedData.parentName,
      parentPhone: editedData.parentPhone,
      parentEmail: editedData.parentEmail,
      address: editedData.address,
      status: editedData.status,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Student not found</p>
      </div>
    )
  }

  const display = isEditing && editedData ? editedData : student

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <PhotoUpload 
            entityId={student.id}
            entityType="student"
            currentPhoto={student.photo}
            onUploadSuccess={() => queryClient.invalidateQueries({ queryKey: ['school-student', id] })}
            onDeleteSuccess={() => queryClient.invalidateQueries({ queryKey: ['school-student', id] })}
            size="md"
          />
          <div>
            <h1 className="text-2xl font-bold">{display.firstName} {display.lastName}</h1>
            <p className="text-muted-foreground">Admission No: {display.admissionNo}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEdit}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button size="sm" onClick={saveEdit} disabled={editMutation.isPending}>
                <Save className="mr-2 h-4 w-4" /> {editMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={startEdit}>
                <Settings2 className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => {
                confirm({
                  title: "Delete Student",
                  description: "Are you sure you want to PERMANENTLY delete this student? This will also delete their fee history and exam results.",
                  confirmText: "Delete",
                  variant: "destructive",
                  onConfirm: () => deleteMutation.mutate(),
                })
              }}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StudentTab)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fees">Fees & Payments</TabsTrigger>
          <TabsTrigger value="marks">Marks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <OverviewSection
            student={student}
            isEditing={isEditing}
            editedData={editedData}
            onEditChange={setEditedData}
          />
        </TabsContent>

        <TabsContent value="fees" className="mt-0">
          <FeesSection
            student={student}
            feeBalances={feeBalances}
            payments={student.payments}
            isLoadingFees={isLoadingFees}
            studentId={id}
          />
        </TabsContent>

        <TabsContent value="marks" className="mt-0">
          <MarksSection
            marks={marks}
            isLoadingMarks={isLoadingMarks}
          />
        </TabsContent>
      </Tabs>

      {renderConfirmDialog()}
    </div>
  )
}
