import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { cn, formatDateRelative } from '@/lib/utils'
import { validatePhone } from '@/lib/validation'
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
import { Label } from '@/components/ui/label'
import { Avatar } from '@/components/ui/photo-upload'
import { StatusBadge } from '@/components/ui/status-badge'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useToast } from '@/components/ui/toast'
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
  const { toast } = useToast()
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
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
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create student')
      }
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['school-students'] })
      setIsAddDialogOpen(false)
      setSelectedPhoto(null)
      setFormErrors({})
      toast({
        title: 'Student added',
        description: `${data.firstName} ${data.lastName} has been enrolled.`,
        variant: 'success'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add student',
        description: error.message,
        variant: 'error'
      })
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
      toast({
        title: 'Student deleted',
        description: 'The student record has been removed.',
        variant: 'success'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'error'
      })
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
    setFormErrors({})
    
    const formData = new FormData(e.currentTarget)
    const errors: Record<string, string> = {}
    
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const gender = formData.get('gender') as string
    const levelId = formData.get('levelId') as string
    const parentName = formData.get('parentName') as string
    const parentPhone = formData.get('parentPhone') as string
    
    if (!firstName?.trim()) errors.firstName = 'First name is required'
    if (firstName?.length > 100) errors.firstName = 'Name is too long (max 100 characters)'
    if (!lastName?.trim()) errors.lastName = 'Last name is required'
    if (lastName?.length > 100) errors.lastName = 'Name is too long (max 100 characters)'
    if (!gender) errors.gender = 'Please select a gender'
    if (!levelId) errors.levelId = 'Please select a class'
    if (!parentName?.trim()) errors.parentName = 'Parent name is required'
    if (!parentPhone?.trim()) {
      errors.parentPhone = 'Phone number is required'
    } else {
      const phoneError = validatePhone(parentPhone)
      if (phoneError) errors.parentPhone = phoneError
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    
    const admNo = formData.get('admissionNo') as string
    createMutation.mutate({
      admissionNo: admNo || generatedAdmNo || undefined,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      levelId,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentEmail: formData.get('parentEmail') as string || undefined,
      address: formData.get('address') as string || undefined,
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
          <Breadcrumb items={[{ label: 'Students' }]} />
          <h1 className="text-3xl font-bold tracking-tight mt-2">Students</h1>
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
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{student.enrollmentDate ? formatDateRelative(student.enrollmentDate) : '-'}</span>
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
      <Sheet open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open)
        if (!open) setFormErrors({})
      }}>
        <SheetContent className="w-[400px] sm:w-[500px] p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add New Student</SheetTitle>
            <SheetDescription>Fill in the student details below.</SheetDescription>
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
                <Label htmlFor="admissionNo">Admission No. <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <div className="flex gap-2 mt-1.5">
                  <Input 
                    id="admissionNo"
                    name="admissionNo" 
                    placeholder={generatedAdmNo || "Auto-generated"}
                    maxLength={50}
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
                <Label htmlFor="levelId">Class <span className="text-destructive">*</span></Label>
                <Select name="levelId" onValueChange={() => setFormErrors(e => ({ ...e, levelId: '' }))}>
                  <SelectTrigger className={cn(formErrors.levelId && "border-destructive")}>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels?.map(level => (
                      <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.levelId && <p className="text-xs text-destructive mt-1">{formErrors.levelId}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                <Input 
                  id="firstName"
                  name="firstName" 
                  placeholder="Enter first name"
                  maxLength={100}
                  className={cn(formErrors.firstName && "border-destructive")}
                />
                {formErrors.firstName && <p className="text-xs text-destructive mt-1">{formErrors.firstName}</p>}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                <Input 
                  id="lastName"
                  name="lastName" 
                  placeholder="Enter last name"
                  maxLength={100}
                  className={cn(formErrors.lastName && "border-destructive")}
                />
                {formErrors.lastName && <p className="text-xs text-destructive mt-1">{formErrors.lastName}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="gender">Gender <span className="text-destructive">*</span></Label>
              <Select name="gender" onValueChange={() => setFormErrors(e => ({ ...e, gender: '' }))}>
                <SelectTrigger className={cn(formErrors.gender && "border-destructive")}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.gender && <p className="text-xs text-destructive mt-1">{formErrors.gender}</p>}
            </div>
            <div>
              <Label htmlFor="parentName">Parent Name <span className="text-destructive">*</span></Label>
              <Input 
                id="parentName"
                name="parentName" 
                placeholder="Enter parent's full name"
                maxLength={100}
                className={cn(formErrors.parentName && "border-destructive")}
              />
              {formErrors.parentName && <p className="text-xs text-destructive mt-1">{formErrors.parentName}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentPhone">Phone <span className="text-destructive">*</span></Label>
                <Input 
                  id="parentPhone"
                  name="parentPhone" 
                  placeholder="07xxxxxxxx"
                  maxLength={15}
                  className={cn(formErrors.parentPhone && "border-destructive")}
                />
                {formErrors.parentPhone && <p className="text-xs text-destructive mt-1">{formErrors.parentPhone}</p>}
                <p className="text-xs text-muted-foreground mt-1">Format: 0771234567</p>
              </div>
              <div>
                <Label htmlFor="parentEmail">Email <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <Input id="parentEmail" name="parentEmail" type="email" placeholder="parent@email.com" maxLength={255} />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <Input id="address" name="address" placeholder="Home address" maxLength={255} />
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
