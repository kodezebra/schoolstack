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
  Mail, 
  Trash2, 
  Archive, 
  CheckCircle2, 
  Clock, 
  User, 
  Calendar,
  ChevronRight,
  Inbox,
  Search,
  RotateCcw,
  Copy,
  Reply
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
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

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
  data: string
}

type FilterStatus = 'all' | 'pending' | 'read' | 'archived'

function SubmissionsPage() {
  const queryClient = useQueryClient()
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

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

  const filteredSubmissions = submissions?.filter(sub => {
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus
    const matchesSearch = !searchQuery || 
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.message.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  }) ?? []

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
          <h1 className="text-3xl font-bold tracking-tight">Contact Submissions</h1>
          <p className="text-muted-foreground">Manage messages sent through your contact forms.</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="px-3 py-1">
             {submissions?.filter(s => s.status === 'pending').length || 0} New
           </Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">New</TabsTrigger>
                <TabsTrigger value="read">Read</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search messages..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="h-8 w-8 opacity-20" />
                      <p>{searchQuery ? 'No messages found.' : 'No submissions yet.'}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions.map((submission) => (
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
                    <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                      {submission.message}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
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
                <DialogTitle className="text-2xl">Message from {selectedSubmission.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-4 pt-2 flex-wrap">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> {selectedSubmission.name}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(selectedSubmission.createdAt).toLocaleString()}</span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex items-center gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm flex-1">{selectedSubmission.email}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedSubmission.email)
                    setCopiedEmail(selectedSubmission.email)
                    setTimeout(() => setCopiedEmail(null), 2000)
                  }}
                >
                  {copiedEmail === selectedSubmission.email ? 'Copied!' : <><Copy className="h-3 w-3 mr-1" /> Copy</>}
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => window.location.href = `mailto:${selectedSubmission.email}?subject=Re: Contact Form Submission`}
                >
                  <Reply className="h-3 w-3 mr-1" /> Reply
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Hint: Requires an email client (like Gmail or Outlook) to be set up on your device.
              </p>

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
                      <RotateCcw className="mr-2 h-4 w-4" /> Mark as Unread
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
