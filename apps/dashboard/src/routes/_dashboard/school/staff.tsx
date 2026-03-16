import { createFileRoute } from '@tanstack/react-router'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus,
  Search,
  Mail,
  Phone,
  Trash2
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

export const Route = createFileRoute('/_dashboard/school/staff')({
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
  status: 'active' | 'inactive'
  joinDate: string
}

function StaffPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

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
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-staff'] })
      setIsAddDialogOpen(false)
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
    createMutation.mutate({
      employeeNo: formData.get('employeeNo'),
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
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm('Are you sure you want to remove this staff member?')) {
                            deleteMutation.mutate(member.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Employee No.</label>
                <Input name="employeeNo" required placeholder="e.g., EMP001" />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select name="role" required>
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
