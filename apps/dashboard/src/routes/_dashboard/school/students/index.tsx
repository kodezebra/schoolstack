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
import { 
  Card, 
  CardContent, 
  CardHeader 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/photo-upload'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Plus,
  Search,
  Trash2,
  Settings2,
  RefreshCw,
  Camera,
  Users,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const Route = createFileRoute('/_dashboard/school/students/')({
  component: StudentsPage,
})

interface Student {
  id: string
  admissionNo: string
  firstName: string
  lastName: string
  gender: 'male' | 'female' | 'other'
  dob?: string
  levelId: string
  levelName?: string
  rollNo?: string
  parentName: string
  parentPhone: string
  parentEmail?: string
  address?: string
  photo?: string
  status: 'active' | 'transferred' | 'graduated' | 'withdrawn'
  enrollmentDate: string
}

interface Level {
  id: string
  name: string
  order: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface StudentsResponse {
  data: Student[]
  pagination: Pagination
}

function StudentsPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [generatedAdmNo, setGeneratedAdmNo] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const { confirm, renderConfirmDialog } = useConfirmDialog()

  const { data: response, isLoading } = useQuery<StudentsResponse>({
    queryKey: ['school-students', levelFilter, statusFilter, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (levelFilter !== 'all') params.set('levelId', levelFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      params.set('page', String(page))
      params.set('limit', String(limit))
      const res = await apiFetch(`/school/students?${params}`)
      if (!res.ok) throw new Error('Failed to fetch students')
      return res.json()
    }
  })

  const students = response?.data || []
  const pagination = response?.pagination

  const { data: levels } = useQuery<Level[]>({
    queryKey: ['school-levels'],
    queryFn: async () => {
      const res = await apiFetch('/school/levels')
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
      const newStudent = await res.json()
      
      if (selectedPhoto) {
        const formData = new FormData()
        formData.append('photo', selectedPhoto)
        const photoRes = await apiFetch(`/school/students/${newStudent.id}/photo`, {
          method: 'POST',
          body: formData
        })
        if (!photoRes.ok) {
          const err = await photoRes.json()
          console.error('Photo upload failed:', err)
        }
      }
      
      return newStudent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-students'] })
      setIsAddDialogOpen(false)
      setSelectedPhoto(null)
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

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [levelFilter, statusFilter])

  const handleAddStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const admNo = formData.get('admissionNo') as string
    createMutation.mutate({
      admissionNo: admNo || generatedAdmNo || undefined,
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      gender: formData.get('gender'),
      levelId: formData.get('levelId'),
      parentName: formData.get('parentName'),
      parentPhone: formData.get('parentPhone'),
      parentEmail: formData.get('parentEmail') || undefined,
      address: formData.get('address') || undefined,
    })
  }

  const generateAdmNo = async () => {
    setIsGenerating(true)
    try {
      const res = await apiFetch('/school/generate-number?type=student')
      if (res.ok) {
        const data = await res.json()
        setGeneratedAdmNo(data.number)
      }
    } catch (err) {
      console.error('Failed to generate admission number', err)
    } finally {
      setIsGenerating(false)
    }
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
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {levels?.map(level => (
                    <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
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
                <TableHead>Photo</TableHead>
                <TableHead>Admission No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Parent Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40">
                    <div className="flex flex-col items-center justify-center text-center">
                      {searchQuery || levelFilter !== 'all' || statusFilter !== 'all' ? (
                        <>
                          <Search className="h-10 w-10 text-muted-foreground/40 mb-3" />
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            No students match your filters
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSearchQuery('')
                              setLevelFilter('all')
                              setStatusFilter('all')
                            }}
                          >
                            Clear Filters
                          </Button>
                        </>
                      ) : (
                        <>
                          <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            No students enrolled yet
                          </p>
                          <p className="text-xs text-muted-foreground mb-3">
                            Get started by adding your first student record
                          </p>
                          <Button onClick={() => setIsAddDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Student
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Avatar 
                        photo={student.photo} 
                        name={`${student.firstName} ${student.lastName}`}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{student.admissionNo}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{student.firstName} {student.lastName}</span>
                        <span className="text-xs text-muted-foreground capitalize">{student.gender}</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.levelName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{student.parentName}</span>
                        <span className="text-xs text-muted-foreground">{student.parentPhone}</span>
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={student.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          asChild
                        >
                          <Link to="/school/students/$id" params={{ id: student.id }} >
                            <Settings2 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            confirm({
                              title: "Delete Student",
                              description: "Are you sure you want to PERMANENTLY delete this student? This will also delete their fee history and exam results.",
                              confirmText: "Delete",
                              variant: "destructive",
                              onConfirm: () => deleteMutation.mutate(student.id),
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

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing {filteredStudents.length} of {pagination.total} students
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">Page {page} of {pagination.totalPages || 1}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => p + 1)}
              disabled={page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add Student Sheet */}
      <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <SheetContent className="w-[400px] sm:w-[500px] p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add New Student</SheetTitle>
            <SheetDescription>Enter student enrollment details.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleAddStudent} className="space-y-4 mt-6">
            <div className="flex justify-center">
              <div className="relative">
                <input
                  type="file"
                  id="photo-upload"
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
                    htmlFor="photo-upload"
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
                <label className="text-sm font-medium">Admission No.</label>
                <div className="flex gap-2">
                  <Input 
                    name="admissionNo" 
                    placeholder={generatedAdmNo || "Auto-generated"}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={generateAdmNo}
                    disabled={isGenerating}
                    title="Generate number"
                  >
                    <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Class</label>
                <Select name="levelId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels?.map(level => (
                      <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
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
            <div className="flex justify-end gap-2 pt-4 pb-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Adding...' : 'Add Student'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {renderConfirmDialog()}
    </div>
  )
}
