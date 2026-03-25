import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useState } from 'react'
import { PhotoUpload } from '@/components/ui/photo-upload'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { OverviewSection, DetailsSection, NotesSection } from './$id/sections/-index'
import type { Staff } from './$id/sections/-StaffSections'
import { ArrowLeft, Settings2, Trash2, Save, X } from 'lucide-react'

export const Route = createFileRoute('/_dashboard/school/staff/$id')({
  component: StaffDetailPage,
})

function StaffDetailPage() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<Staff | null>(null)
  const { confirm, renderConfirmDialog } = useConfirmDialog()

  const { data: staff, isLoading } = useQuery<Staff>({
    queryKey: ['school-staff', id],
    queryFn: async () => {
      const res = await apiFetch(`/school/staff/${id}`)
      if (!res.ok) throw new Error('Failed to fetch staff')
      return res.json()
    }
  })

  const editMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch(`/school/staff/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update staff')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-staff', id] })
      queryClient.invalidateQueries({ queryKey: ['school-staff'] })
      setIsEditing(false)
      setEditedData(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/school/staff/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove staff')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-staff'] })
      window.history.back()
    }
  })

  const startEdit = () => {
    if (staff) {
      setEditedData(staff)
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
      email: editedData.email,
      phone: editedData.phone,
      role: editedData.role,
      department: editedData.department,
      qualifications: editedData.qualifications,
      experience: editedData.experience,
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

  if (!staff) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Staff member not found</p>
      </div>
    )
  }

  const display = isEditing && editedData ? editedData : staff

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <PhotoUpload 
            entityId={staff.id}
            entityType="staff"
            currentPhoto={staff.photo}
            onUploadSuccess={() => queryClient.invalidateQueries({ queryKey: ['school-staff', id] })}
            onDeleteSuccess={() => queryClient.invalidateQueries({ queryKey: ['school-staff', id] })}
            size="md"
          />
          <div>
            <h1 className="text-2xl font-bold">{display.firstName} {display.lastName}</h1>
            <p className="text-muted-foreground">Employee No: {display.employeeNo}</p>
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
                  title: "Delete Staff",
                  description: "Are you sure you want to PERMANENTLY delete this staff member? This cannot be undone.",
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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <OverviewSection
            staff={staff}
            isEditing={isEditing}
            editedData={editedData}
            onEditChange={setEditedData}
          />
        </TabsContent>

        <TabsContent value="details" className="mt-0">
          <DetailsSection
            staff={staff}
            isEditing={isEditing}
            editedData={editedData}
            onEditChange={setEditedData}
          />
        </TabsContent>

        <TabsContent value="notes" className="mt-0">
          <NotesSection />
        </TabsContent>
      </Tabs>

      {renderConfirmDialog()}
    </div>
  )
}
