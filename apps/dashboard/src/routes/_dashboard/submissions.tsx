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
import { 
  Mail, 
  Trash2, 
  Archive, 
  CheckCircle2, 
  Clock, 
  User, 
  Calendar,
  ChevronRight,
  Inbox
} from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export const Route = createFileRoute('/_dashboard/submissions')({
  component: SubmissionsPage,
})

interface Submission {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'pending' | 'read' | 'archived'
  createdAt: string
  data: string // JSON string
}

function SubmissionsPage() {
  const queryClient = useQueryClient()
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  const { data: submissions, isLoading } = useQuery<Submission[]>({
    queryKey: ['submissions'],
    queryFn: async () => {
      const res = await apiFetch('/contact')
      if (!res.ok) throw new Error('Failed to fetch submissions')
      return res.json()
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const res = await apiFetch(`/contact/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error('Failed to update status')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/contact/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete submission')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
      setSelectedSubmission(null)
    }
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none flex items-center gap-1"><Clock className="h-3 w-3" /> New</Badge>
      case 'read':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Read</Badge>
      case 'archived':
        return <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none flex items-center gap-1"><Archive className="h-3 w-3" /> Archived</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleView = (submission: Submission) => {
    setSelectedSubmission(submission)
    if (submission.status === 'pending') {
      updateStatusMutation.mutate({ id: submission.id, status: 'read' })
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
          <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
          <p className="text-muted-foreground">Manage your website's contact form submissions.</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="px-3 py-1">
             {submissions?.filter(s => s.status === 'pending').length || 0} New
           </Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Contact Submissions</CardTitle>
          <CardDescription>
            A list of all messages sent through your contact forms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="h-8 w-8 opacity-20" />
                      <p>No submissions yet.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                submissions?.map((submission) => (
                  <TableRow 
                    key={submission.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleView(submission)}
                  >
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{submission.name}</span>
                        <span className="text-xs text-muted-foreground">{submission.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate font-medium">
                      {submission.subject}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleView(submission)}
                        >
                          <ChevronRight className="h-4 w-4" />
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

      {/* Submission Detail Modal */}
      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusBadge(selectedSubmission.status)}
                </div>
                <DialogTitle className="text-2xl">{selectedSubmission.subject}</DialogTitle>
                <DialogDescription className="flex items-center gap-4 pt-2">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> {selectedSubmission.name}</span>
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selectedSubmission.email}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(selectedSubmission.createdAt).toLocaleString()}</span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-6 p-6 bg-muted/30 rounded-lg border min-h-[200px] whitespace-pre-wrap text-sm leading-relaxed">
                {selectedSubmission.message}
              </div>

              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="flex items-center gap-2">
                  {selectedSubmission.status !== 'archived' ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ id: selectedSubmission.id, status: 'archived' })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <Archive className="mr-2 h-4 w-4" /> Archive
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ id: selectedSubmission.id, status: 'read' })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <Clock className="mr-2 h-4 w-4" /> Mark as Active
                    </Button>
                  )}
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this submission?')) {
                      deleteMutation.mutate(selectedSubmission.id)
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
