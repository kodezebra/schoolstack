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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus,
  Search,
  MoreHorizontal,
  User,
  Phone,
  Mail,
  MapPin,
  Pencil,
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

export const Route = createFileRoute('/_dashboard/school/students')({
  component: StudentsPage,
})

interface Student {
  id: string
  admissionNo: string
  firstName: string
  lastName: string
  gender: 'male' | 'female' | 'other'
  dob?: string
  gradeId: string
  gradeName?: string
  rollNo?: string
  parentName: string
  parentPhone: string
  parentEmail?: string
  address?: string
  status: 'active' | 'transferred' | 'graduated' | 'withdrawn'
  enrollmentDate: string
}

interface Grade {
  id: string
  name: string
  order: number
}

function StudentsPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [gradeFilter, setGradeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ['school-students', gradeFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (gradeFilter !== 'all') params.set('gradeId', gradeFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await apiFetch(`/school/students?${params}`)
      if (!res.ok) throw new Error('Failed to fetch students')
      return res.json()
    }
  })

  const { data: grades } = useQuery<Grade[]>({
    queryKey: ['school-grades'],
    queryFn: async () => {
      const res = await apiFetch('/school/grades')
      if (!res.ok) return []
      return res.json()
    }
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/school/students', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create student')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-students'] })
      setIsAddDialogOpen(false)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/school/students/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete student')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-students'] })
      setSelectedStudent(null)
    }
  })

  const filteredStudents = students?.filter(s => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      s.firstName.toLowerCase().includes(query) ||
      s.lastName.toLowerCase().includes(query) ||
      s.admissionNo.toLowerCase().includes(query) ||
      s.parentName.toLowerCase().includes(query)
    )
  }) ?? []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
      case 'transferred':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Transferred</Badge>
      case 'graduated':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Graduated</Badge>
      case 'withdrawn':
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Withdrawn</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleAddStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    createMutation.mutate({
      admissionNo: formData.get('admissionNo'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      gender: formData.get('gender'),
      gradeId: formData.get('gradeId'),
      parentName: formData.get('parentName'),
      parentPhone: formData.get('parentPhone'),
      parentEmail: formData.get('parentEmail') || undefined,
      address: formData.get('address') || undefined,
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
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Manage student enrollment and records.</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search students..." 
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {grades?.map(grade => (
                    <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admission No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Parent Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No students found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id} className="cursor-pointer" onClick={() => setSelectedStudent(student)}>
                    <TableCell className="font-medium">{student.admissionNo}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{student.firstName} {student.lastName}</span>
                        <span className="text-xs text-muted-foreground capitalize">{student.gender}</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.gradeName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{student.parentName}</span>
                        <span className="text-xs text-muted-foreground">{student.parentPhone}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (confirm('Are you sure you want to withdraw this student?')) {
                              deleteMutation.mutate(student.id)
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

      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>Enter student enrollment details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Admission No.</label>
                <Input name="admissionNo" required placeholder="e.g., ADM001" />
              </div>
              <div>
                <label className="text-sm font-medium">Grade</label>
                <Select name="gradeId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades?.map(grade => (
                      <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                    ))}
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
              <label className="text-sm font-medium">Gender</label>
              <Select name="gender" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Parent Name</label>
              <Input name="parentName" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Parent Phone</label>
                <Input name="parentPhone" required placeholder="07x xxx xxxx" />
              </div>
              <div>
                <label className="text-sm font-medium">Parent Email</label>
                <Input name="parentEmail" type="email" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <Input name="address" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Adding...' : 'Add Student'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Student Details Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="max-w-md">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedStudent.firstName} {selectedStudent.lastName}</DialogTitle>
                <DialogDescription>Admission No: {selectedStudent.admissionNo}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedStudent.status)}
                  <span className="text-sm text-muted-foreground">Grade: {selectedStudent.gradeName}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Parent</p>
                      <p className="text-sm font-medium">{selectedStudent.parentName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{selectedStudent.parentPhone}</p>
                    </div>
                  </div>
                  {selectedStudent.parentEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium">{selectedStudent.parentEmail}</p>
                      </div>
                    </div>
                  )}
                  {selectedStudent.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="text-sm font-medium">{selectedStudent.address}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-between pt-4 border-t">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to withdraw this student?')) {
                        deleteMutation.mutate(selectedStudent.id)
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Withdraw
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedStudent(null)}>Close</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
