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
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/photo-upload'
import { 
  Plus,
  Search,
  Trash2,
  Settings2,
  RefreshCw,
  Camera
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

export const Route = createFileRoute('/_dashboard/school/staff/')({
  component: StaffPage,
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

function StaffPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('teacher')
  const [generatedEmpNo, setGeneratedEmpNo] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const { data: staff, isLoading } = useQuery<Staff[]>({
    queryKey: ['school-staff', roleFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (roleFilter !== 'all') params.set('role', roleFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await apiFetch(`/school/staff?${params}`)
      if (!res.ok) throw new Error('Failed to fetch staff')
      return res.json()
    }
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/school/staff', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create staff')
      const newStaff = await res.json()
      
      if (selectedPhoto) {
        const formData = new FormData()
        formData.append('photo', selectedPhoto)
        const photoRes = await apiFetch(`/school/staff/${newStaff.id}/photo`, {
          method: 'POST',
          body: formData
        })
        if (!photoRes.ok) {
          const err = await photoRes.json()
          console.error('Photo upload failed:', err)
        }
      }
      
      return newStaff
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-staff'] })
      setIsAddDialogOpen(false)
      setSelectedPhoto(null)
      setPhotoPreview(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/school/staff/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete staff')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-staff'] })
    }
  })

  const filteredStaff = staff?.filter(s => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      s.firstName.toLowerCase().includes(query) ||
      s.lastName.toLowerCase().includes(query) ||
      s.employeeNo.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query)
    )
  }) ?? []

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      teacher: 'bg-blue-100 text-blue-700',
      admin: 'bg-purple-100 text-purple-700',
      counselor: 'bg-green-100 text-green-700',
      principal: 'bg-amber-100 text-amber-700',
    }
    return <Badge className={colors[role] || ''}>{role}</Badge>
  }

  const handleAddStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const empNo = formData.get('employeeNo') as string
    createMutation.mutate({
      employeeNo: empNo || generatedEmpNo || undefined,
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone') || undefined,
      role: formData.get('role'),
      department: formData.get('department') || undefined,
      qualifications: formData.get('qualifications') || undefined,
      experience: formData.get('experience') || undefined,
    })
  }

  const generateEmpNo = async () => {
    setIsGenerating(true)
    try {
      const res = await apiFetch(`/school/generate-number?type=staff&role=${selectedRole}`)
      if (res.ok) {
        const data = await res.json()
        setGeneratedEmpNo(data.number)
      }
    } catch (err) {
      console.error('Failed to generate employee number', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRoleChange = (value: string) => {
    setSelectedRole(value)
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
          <p className="text-muted-foreground">Manage teachers and staff members.</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Staff
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search staff..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="counselor">Counselor</SelectItem>
                  <SelectItem value="principal">Principal</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Employee No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No staff found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Avatar 
                        photo={member.photo} 
                        name={`${member.firstName} ${member.lastName}`}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{member.employeeNo}</TableCell>
                    <TableCell>{member.firstName} {member.lastName}</TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell>{member.department || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{member.email}</span>
                        {member.phone && <span className="text-xs text-muted-foreground">{member.phone}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status}
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
                          <Link to="/school/staff/$id" params={{ id: member.id }}>
                            <Settings2 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (confirm('Are you sure you want to PERMANENTLY delete this staff member? This cannot be undone.')) {
                              deleteMutation.mutate(member.id)
                            }
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

      {/* Add Staff Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Staff</DialogTitle>
            <DialogDescription>Enter staff member details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStaff} className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <input
                  type="file"
                  id="staff-photo-upload"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setSelectedPhoto(file)
                      const reader = new FileReader()
                      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
                      reader.readAsDataURL(file)
                    }
                  }}
                />
                {photoPreview || selectedPhoto ? (
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-primary">
                    <img 
                      src={photoPreview || undefined} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <label 
                    htmlFor="staff-photo-upload"
                    className="w-32 h-32 rounded-full bg-muted flex flex-col items-center justify-center gap-1 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <Camera className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Photo</span>
                  </label>
                )}
                {selectedPhoto && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPhoto(null)
                      setPhotoPreview(null)
                    }}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Employee No.</label>
                <div className="flex gap-2">
                  <Input 
                    name="employeeNo" 
                    placeholder={generatedEmpNo || "Auto-generated"}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={generateEmpNo}
                    disabled={isGenerating}
                    title="Generate number"
                  >
                    <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select name="role" required defaultValue="teacher" onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="counselor">Counselor</SelectItem>
                    <SelectItem value="principal">Principal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <Input name="firstName" required />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <Input name="lastName" required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input name="email" type="email" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input name="phone" />
              </div>
              <div>
                <label className="text-sm font-medium">Department</label>
                <Input name="department" placeholder="e.g., Science" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Qualifications</label>
                <Input name="qualifications" placeholder="e.g., BSc. Education" />
              </div>
              <div>
                <label className="text-sm font-medium">Experience</label>
                <Input name="experience" placeholder="e.g., 5 years" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Adding...' : 'Add Staff'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
