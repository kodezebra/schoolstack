import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { 
  FileText, 
  Users, 
  Plus, 
  Settings, 
  ArrowRight, 
  Layout, 
  CheckCircle2, 
  Clock,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SITE_URL } from '@/config'

export const Route = createFileRoute('/_dashboard/')({
  component: DashboardOverview,
})

function DashboardOverview() {
  const { user } = Route.useRouteContext()

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

  const stats = [
    {
      title: "Total Pages",
      value: isLoadingPages ? "..." : allPages.length,
      icon: FileText,
      description: "Total content pages",
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      title: "Published",
      value: isLoadingPages ? "..." : publishedPages.length,
      icon: CheckCircle2,
      description: "Live on your website",
      color: "text-emerald-600",
      bg: "bg-emerald-100 dark:bg-emerald-900/20"
    },
    {
      title: "Team Members",
      value: isLoadingUsers ? "..." : users?.length || 0,
      icon: Users,
      description: "Active collaborators",
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900/20"
    }
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || 'Admin'}</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your website today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/cms">
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              Create Page
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-muted-foreground/10 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity / Pages */}
        <Card className="lg:col-span-2 border-muted-foreground/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Updates</CardTitle>
              <CardDescription>Recently modified content pages</CardDescription>
            </div>
            <Link to="/cms">
              <Button variant="ghost" size="sm" className="text-primary gap-1">
                View all <ArrowRight className="h-3 w-3" />
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
                        <Layout className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
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
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions / Getting Started */}
        <div className="space-y-6">
          <Card className="border-muted-foreground/10 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Link to="/cms">
                <Button variant="outline" className="w-full justify-start gap-3 h-11 bg-background shadow-sm">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Manage Content
                </Button>
              </Link>
              <Link to="/users">
                <Button variant="outline" className="w-full justify-start gap-3 h-11 bg-background shadow-sm">
                  <Users className="h-4 w-4 text-purple-500" />
                  Team Members
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="outline" className="w-full justify-start gap-3 h-11 bg-background shadow-sm">
                  <Settings className="h-4 w-4 text-slate-500" />
                  Site Settings
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-muted-foreground/10 overflow-hidden">
            <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-600" />
            <CardHeader>
              <CardTitle className="text-base">Pro Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Use the <span className="font-semibold text-foreground">Global Settings</span> to manage your navigation menu, footer, and branding across all pages at once.
              </p>
              <Link to="/settings" className="text-primary text-sm font-medium inline-flex items-center gap-1 mt-4 hover:underline">
                Go to settings <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
