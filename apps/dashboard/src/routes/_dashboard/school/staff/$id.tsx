import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Settings2,
  Trash2,
  Save,
  X,
  GraduationCap,
  Briefcase,
} from 'lucide-react'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PhotoUpload } from '@/components/ui/photo-upload'
import { RoleBadge } from '@/components/ui/status-badge'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'

export const Route = createFileRoute('/_dashboard/school/staff/$id')({
  component: StaffDetailPage,
})

interface Staff {
  id: string
  employeeNo: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: 'teacher' | 'admin' | 'counselor' | 'principal'
  department?: string
  qualifications?: string
  experience?: string
  photo?: string
  status: 'active' | 'inactive'
  joinDate: string
}

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
      {/* Header */}
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

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">First Name</label>
                        <Input 
                          value={editedData?.firstName || ''} 
                          onChange={(e) => setEditedData(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Last Name</label>
                        <Input 
                          value={editedData?.lastName || ''} 
                          onChange={(e) => setEditedData(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Role</label>
                      <Select 
                        value={editedData?.role} 
                        onValueChange={(v) => setEditedData(prev => prev ? { ...prev, role: v as any } : null)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="counselor">Counselor</SelectItem>
                          <SelectItem value="principal">Principal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Select 
                        value={editedData?.status} 
                        onValueChange={(v) => setEditedData(prev => prev ? { ...prev, status: v as any } : null)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <RoleBadge role={staff.role} />
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Joined</p>
                        <p className="font-medium">{new Date(staff.joinDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge variant={staff.status === 'active' ? 'default' : 'secondary'}>
                      {staff.status}
                    </Badge>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input 
                        value={editedData?.email || ''} 
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, email: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <Input 
                        value={editedData?.phone || ''} 
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, phone: e.target.value } : null)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">{staff.email}</p>
                      </div>
                    </div>
                    {staff.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="font-medium">{staff.phone}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-sm font-medium">Department</label>
                    <Input 
                      value={editedData?.department || ''} 
                      onChange={(e) => setEditedData(prev => prev ? { ...prev, department: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Qualifications</label>
                    <Input 
                      value={editedData?.qualifications || ''} 
                      onChange={(e) => setEditedData(prev => prev ? { ...prev, qualifications: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Experience</label>
                    <Input 
                      value={editedData?.experience || ''} 
                      onChange={(e) => setEditedData(prev => prev ? { ...prev, experience: e.target.value } : null)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="font-medium">{staff.department || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Qualifications</p>
                      <p className="font-medium">{staff.qualifications || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Experience</p>
                      <p className="font-medium">{staff.experience || '-'}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Notes feature coming soon...
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {renderConfirmDialog()}
    </div>
  )
}
