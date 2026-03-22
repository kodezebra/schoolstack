import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import {
  Users,
  Plus,
  Settings,
  ExternalLink,
  UserRound,
  GraduationCap,
  FileText,
  Banknote,
  ScrollText,
  Inbox,
  BarChart3,
  DollarSign,
  CheckCircle2,
  Clock,
  TrendingUp,
  UserCheck,
  CheckCircle,
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardActionCard } from '@/components/dashboard-action-card'
import { DashboardStat } from '@/components/dashboard-stat'
import { SITE_URL } from '@/config'

export const Route = createFileRoute('/_dashboard/')({
  component: DashboardOverview,
})

function DashboardOverview() {
  const { user } = Route.useRouteContext()

  const { data: studentsStats, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['school', 'students', 'stats'],
    queryFn: async () => {
      const res = await apiFetch('/school/students?limit=1')
      if (!res.ok) return { total: 0 }
      const data = await res.json()
      return { total: data.pagination?.total || 0 }
    }
  })

  const { data: messagesStats } = useQuery({
    queryKey: ['contact', 'stats'],
    queryFn: async () => {
      const res = await apiFetch('/contact?limit=100')
      if (!res.ok) return { total: 0, pending: 0 }
      const all = await res.json()
      const pending = all.filter((m: any) => m.status === 'pending').length
      return { total: all.length, pending }
    }
  })

  const { data: pages, isLoading: isLoadingPages } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const res = await apiFetch('/pages')
      if (!res.ok) throw new Error('Failed to fetch pages')
      return res.json()
    }
  })

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await apiFetch('/users')
      if (!res.ok) throw new Error('Failed to fetch users')
      return res.json()
    }
  })

  // Recent activity feed
  const { data: recentPayments } = useQuery({
    queryKey: ['recent-payments'],
    queryFn: async () => {
      const res = await apiFetch('/school/payments')
      if (!res.ok) return []
      const all: any[] = await res.json()
      return all.slice(0, 5).sort((a, b) => 
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      )
    },
    refetchInterval: 30000
  })

  const { data: recentStudents } = useQuery({
    queryKey: ['recent-students'],
    queryFn: async () => {
      const res = await apiFetch('/school/students?limit=5&status=active')
      if (!res.ok) return []
      const data = await res.json()
      return (data.data || []).sort((a: any, b: any) => 
        new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime()
      )
    },
    refetchInterval: 60000
  })

  const { data: recentMessages } = useQuery({
    queryKey: ['recent-messages'],
    queryFn: async () => {
      const res = await apiFetch('/contact?limit=3')
      if (!res.ok) return []
      return (await res.json()).filter((m: any) => m.status === 'pending')
    },
    refetchInterval: 30000
  })

  // Flatten pages to count them and get recent ones
  const flattenPages = (pagesList: any[] = []): any[] => {
    let flat: any[] = []
    pagesList.forEach(page => {
      flat.push(page)
      if (page.children && page.children.length > 0) {
        flat = flat.concat(flattenPages(page.children))
      }
    })
    return flat
  }

  const allPages = flattenPages(pages || [])
  const publishedPages = allPages.filter(p => p.status === 'published')
  const recentPages = [...allPages]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  // Action cards configuration
  const actionCards = [
    {
      to: '/school/students',
      title: 'Students',
      description: 'Manage student records',
      icon: Users,
      color: 'blue' as const
    },
    {
      to: '/school/staff',
      title: 'Staff',
      description: 'Manage teachers & staff',
      icon: UserRound,
      color: 'green' as const
    },
    {
      to: '/school/exams',
      title: 'Exams',
      description: 'Create and manage exams',
      icon: FileText,
      color: 'purple' as const
    },
    {
      to: '/school/fees',
      title: 'Record Payment',
      description: 'Log fee payments',
      icon: Banknote,
      color: 'orange' as const
    },
    {
      to: '/school/reports/',
      title: 'Reports',
      description: 'Student performance',
      icon: BarChart3,
      color: 'pink' as const
    },
    {
      to: '/school/reports/fees',
      title: 'Outstanding Fees',
      description: 'Track unpaid fees',
      icon: DollarSign,
      color: 'indigo' as const
    },
    {
      to: '/cms',
      title: 'Website Pages',
      description: 'Edit website content',
      icon: ScrollText,
      color: 'blue' as const
    },
    {
      to: '/submissions',
      title: 'Messages',
      description: 'Contact form inbox',
      icon: Inbox,
      color: 'green' as const,
      badge: messagesStats?.pending || undefined
    }
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || 'Admin'}</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening at your school today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/cms">
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              New Page
            </Button>
          </Link>
          <a href={SITE_URL} target="_blank" rel="noreferrer">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View Site
            </Button>
          </a>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStat
          title="Total Students"
          value={isLoadingStudents ? '...' : studentsStats?.total || 0}
          icon={GraduationCap}
          color="blue"
          description="Active enrollments"
        />
        <DashboardStat
          title="Unread Messages"
          value={messagesStats?.pending || 0}
          icon={Inbox}
          color="orange"
          description={messagesStats?.total ? `${messagesStats.total} total` : 'Contact form'}
        />
        <DashboardStat
          title="Published Pages"
          value={isLoadingPages ? '...' : publishedPages.length}
          icon={CheckCircle2}
          color="green"
          description={isLoadingPages ? '...' : `${allPages.length} total pages`}
        />
        <DashboardStat
          title="Team Members"
          value={isLoadingUsers ? '...' : users?.length || 0}
          icon={Users}
          color="purple"
          description="Active users"
        />
      </div>

      {/* Action Cards - Main Navigation */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {actionCards.map((card) => (
            <DashboardActionCard
              key={card.to}
              to={card.to}
              title={card.title}
              description={card.description}
              icon={card.icon}
              color={card.color}
              badge={card.badge}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Pages */}
        <Card className="lg:col-span-2 border-muted-foreground/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Updates</CardTitle>
              <CardDescription>Recently modified content pages</CardDescription>
            </div>
            <Link to="/cms">
              <Button variant="ghost" size="sm" className="text-primary gap-1">
                View all <TrendingUp className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoadingPages ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : recentPages.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl">
                <FileText className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground">No pages created yet.</p>
                <Link to="/cms" className="mt-4 inline-block">
                  <Button variant="outline" size="sm">Create your first page</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {recentPages.map((page) => (
                  <Link
                    key={page.id}
                    to="/cms/$pageId"
                    params={{ pageId: page.id }}
                    className="flex items-center justify-between py-4 hover:bg-muted/30 px-2 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{page.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          Updated {new Date(page.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest ${
                        page.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {page.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* School Quick Links */}
        <Card className="border-muted-foreground/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              School Management
            </CardTitle>
            <CardDescription>Quick access to school features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/school/students">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 bg-background shadow-sm">
                <Users className="h-4 w-4 text-blue-500" />
                Students
              </Button>
            </Link>
            <Link to="/school/staff">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 bg-background shadow-sm">
                <UserRound className="h-4 w-4 text-green-500" />
                Staff
              </Button>
            </Link>
            <Link to="/school/exams">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 bg-background shadow-sm">
                <FileText className="h-4 w-4 text-purple-500" />
                Exams
              </Button>
            </Link>
            <Link to="/school/fees">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 bg-background shadow-sm">
                <Banknote className="h-4 w-4 text-orange-500" />
                Fees
              </Button>
            </Link>
            <Link to="/school/settings">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 bg-background shadow-sm">
                <Settings className="h-4 w-4 text-slate-500" />
                School Settings
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="border-muted-foreground/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest actions across your school</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recent Payments */}
            {recentPayments && recentPayments.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Fee Payments
                </div>
                {recentPayments.slice(0, 3).map((payment: any) => (
                  <div key={payment.id} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {payment.studentName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.feeTitle} • {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                      +UGX {(payment.amount || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Student Enrollments */}
            {recentStudents && recentStudents.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  New Students
                </div>
                {recentStudents.slice(0, 2).map((student: any) => (
                  <Link 
                    key={student.id} 
                    to="/school/students/$id" 
                    params={{ id: student.id }}
                    className="flex items-start gap-3 group"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                      <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.levelName} • {new Date(student.enrollmentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pending Messages */}
            {recentMessages && recentMessages.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  New Messages
                </div>
                {recentMessages.slice(0, 2).map((msg: any) => (
                  <Link 
                    key={msg.id} 
                    to="/submissions"
                    className="flex items-start gap-3 group"
                  >
                    <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                      <Inbox className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                        {msg.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {msg.subject || 'Contact form submission'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Empty State */}
            {(!recentPayments || recentPayments.length === 0) && 
             (!recentStudents || recentStudents.length === 0) && 
             (!recentMessages || recentMessages.length === 0) && (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
