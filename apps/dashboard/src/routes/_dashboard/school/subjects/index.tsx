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
  CardHeader 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus,
  Search,
  Trash2,
  Check
} from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export const Route = createFileRoute('/_dashboard/school/subjects/')({
  component: SubjectsPage,
})

interface Subject {
  id: string
  name: string
  code?: string
  academicYearId: string
  createdAt: string
}

function SubjectsPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCommon, setSelectedCommon] = useState<string[]>([])
  const [newSubjectName, setNewSubjectName] = useState('')
  const [newSubjectCode, setNewSubjectCode] = useState('')

  const commonSubjects = [
    { name: 'Mathematics', code: 'MATH' },
    { name: 'English', code: 'ENG' },
    { name: 'Integrated Science', code: 'SCI' },
    { name: 'Social Studies', code: 'SST' },
    { name: 'Religious Education', code: 'RE' },
    { name: 'Physical Education', code: 'PE' },
    { name: 'Art and Technology', code: 'ART' },
    { name: 'Music, Dance and Drama', code: 'MDD' },
    { name: 'Local Language', code: 'LL' },
    { name: 'Literacy I', code: 'LIT1' },
    { name: 'Literacy II', code: 'LIT2' },
    { name: 'News', code: 'NEWS' },
  ]

  const { data: subjects, isLoading } = useQuery<Subject[]>({
    queryKey: ['school-subjects'],
    queryFn: async () => {
      const res = await apiFetch('/school/subjects')
      if (!res.ok) throw new Error('Failed to fetch subjects')
      return res.json()
    }
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/school/subjects', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create subject')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-subjects'] })
    }
  })

  const handleAddSubject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    createMutation.mutate({
      name: newSubjectName,
      code: newSubjectCode || undefined,
    })
    setNewSubjectName('')
    setNewSubjectCode('')
    setIsAddDialogOpen(false)
  }

  const handleBulkAdd = () => {
    const toAdd = commonSubjects.filter(s => selectedCommon.includes(s.name))
    toAdd.forEach(s => {
      if (!subjects?.some(existing => existing.name === s.name)) {
        createMutation.mutate(s)
      }
    })
    setSelectedCommon([])
    setIsAddDialogOpen(false)
  }

  const toggleSelection = (name: string) => {
    setSelectedCommon(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/school/subjects/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete subject')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-subjects'] })
    }
  })

  const filteredSubjects = subjects?.filter(s => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      s.name.toLowerCase().includes(query) ||
      s.code?.toLowerCase().includes(query)
    )
  }) ?? []

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
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground">Manage school-wide subjects.</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Subjects
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search subjects..." 
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                    No subjects found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>{subject.code || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this subject?')) {
                              deleteMutation.mutate(subject.id)
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

      {/* Add Subject Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Subjects</DialogTitle>
            <DialogDescription>Select multiple common subjects or add a custom one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-primary">Quick Select (Common Ugandan Subjects)</label>
              <div className="flex flex-wrap gap-2">
                {commonSubjects.map((s) => {
                  const isSelected = selectedCommon.includes(s.name)
                  const isExisting = subjects?.some(ex => ex.name === s.name)
                  
                  return (
                    <Button
                      key={s.name}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      className={`h-8 text-xs ${isExisting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => !isExisting && toggleSelection(s.name)}
                      disabled={isExisting}
                    >
                      {isSelected && <Check className="mr-1 h-3 w-3" />}
                      {s.name}
                    </Button>
                  )
                })}
              </div>
              {selectedCommon.length > 0 && (
                <Button className="w-full mt-2" onClick={handleBulkAdd}>
                  Add {selectedCommon.length} Selected Subjects
                </Button>
              )}
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or Add Custom</span>
              </div>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Subject Name</label>
                <Input 
                  name="name" 
                  required 
                  placeholder="e.g., Luganda" 
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Code (optional)</label>
                <Input 
                  name="code" 
                  placeholder="e.g., LUG" 
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Adding...' : 'Add Custom'}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
