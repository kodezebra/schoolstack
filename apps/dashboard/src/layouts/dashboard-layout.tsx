import { Link, Outlet, useLocation } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Settings,
  Users,
  ShieldCheck,
  Menu,
  Bell,
  FileCode2,
  User,
  Inbox,
  GraduationCap,
  UsersRound,
  Banknote,
  ScrollText,
  ChevronDown,
  ChevronRight,
  BookOpen,
  FileText,
  Calendar,
  BarChart3,
  Scale,
  DollarSign,
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Route } from '@/routes/_dashboard/route'
import { UserMenu } from '@/components/user-menu'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

  const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'CMS Pages', to: '/cms', icon: FileCode2 },
  { name: 'Inbox', to: '/submissions', icon: Inbox },
  { name: 'School', icon: GraduationCap, children: [
    { name: 'Students', to: '/school/students/', icon: UsersRound },
    { name: 'Staff', to: '/school/staff/', icon: Users },
    { name: 'Subjects', to: '/school/subjects/', icon: BookOpen },
    { name: 'Exams', to: '/school/exams/', icon: FileText },
    { name: 'Terms', to: '/school/terms/', icon: Calendar },
    { name: 'Reports', to: '/school/reports/', icon: BarChart3 },
    { name: 'Fee Balances', to: '/school/reports/fees', icon: DollarSign },
    { name: 'Grade Scale', to: '/school/grades/', icon: Scale },
    { name: 'Fees', to: '/school/fees', icon: Banknote },
    { name: 'Settings', to: '/school/settings', icon: ScrollText },
  ]},
  { name: 'Users', to: '/users', icon: Users },
  { name: 'Profile', to: '/profile', icon: User },
  { name: 'Settings', to: '/settings', icon: Settings },
]

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [schoolOpen, setSchoolOpen] = useState(false)
  const location = useLocation()

  // Access the user from the route context, which is set by beforeLoad
  const { user } = Route.useRouteContext();

  // Fetch settings to update title and favicon
  const { data: settings } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const res = await apiFetch('/settings')
      if (!res.ok) return null
      return res.json()
    }
  })

  // Auto-open school dropdown when child is active
  useEffect(() => {
    const isSchoolPage = navigation.find((item: any) => 
      item.children?.some((child: any) => 
        location.pathname.startsWith(child.to || '')
      )
    )
    if (isSchoolPage) {
      setSchoolOpen(true)
    }
  }, [location.pathname])

  // Dynamically update document title and favicon
  useEffect(() => {
    if (settings) {
      // Find current page name from navigation (including children)
      let pageName = 'Dashboard'
      for (const item of navigation) {
        if (item.children) {
          const child = item.children.find(c => 
            c.to === location.pathname || location.pathname.startsWith(c.to || '')
          )
          if (child) {
            pageName = `${item.name}: ${child.name}`
            break
          }
        } else if (item.to === location.pathname || (item.to !== '/' && location.pathname.startsWith(item.to))) {
          pageName = item.name
          break
        }
      }
      
      // Update title: "App Name | Page Name"
      const brandName = settings.logoText || 'KZ Cloud'
      document.title = `${brandName} | ${pageName}`

      // Update favicon
      const faviconUrl = settings.favicon || '/favicon.png'
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']")
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.getElementsByTagName('head')[0].appendChild(link)
      }
      link.href = faviconUrl
    }
  }, [settings, location.pathname])

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transition-transform duration-300 md:block md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-14 items-center border-b px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold text-primary">
              <ShieldCheck className="h-6 w-6" />
              <span className="font-bold tracking-tight text-slate-900">{settings?.logoText || 'KZ Cloud'}</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid gap-1 px-4 text-sm font-medium">
              {navigation.map((item: any) => (
                item.children ? (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={() => setSchoolOpen(!schoolOpen)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </div>
                      {schoolOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {schoolOpen && (
                      <div className="ml-6 space-y-1">
                        {item.children.map((child: any) => (
                          <Link
                            key={child.name}
                            to={child.to}
                            className="flex items-center gap-3 rounded-lg px-3 py-1.5 text-muted-foreground transition-all hover:text-primary [&.active]:bg-muted [&.active]:text-primary"
                            onClick={() => setSidebarOpen(false)}
                          >
                            <child.icon className="h-4 w-4" />
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.to}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary [&.active]:bg-muted [&.active]:text-primary"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              ))}
            </nav>
          </div>

          {/* User Info */}
          <div className="mt-auto p-4 border-t bg-muted">
            <div className="flex items-center gap-3 px-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                {user?.name?.[0] || user?.email?.[0]}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:ml-64">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
          <Button variant="outline" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-primary" />
            </Button>
            <UserMenu user={user} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 lg:p-10 print:p-2 print:overflow-visible">
          <Outlet />
        </main>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0.5cm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide sidebar */
          aside {
            display: none !important;
          }
          /* Hide header */
          header {
            display: none !important;
          }
          /* Remove sidebar margin and adjust padding */
          .md\\:ml-64 {
            margin-left: 0 !important;
          }
          /* Hide no-print elements */
          .no-print,
          [class*="no-print"] {
            display: none !important;
          }
          /* Ensure white background */
          body {
            background: white !important;
          }
          .bg-background {
            background: white !important;
          }
        }
      `}</style>
    </div>
  )
}
