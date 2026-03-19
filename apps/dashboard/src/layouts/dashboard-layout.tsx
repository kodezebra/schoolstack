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
  Search,
  HelpCircle,
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Route } from '@/routes/_dashboard/route'
import { UserMenu } from '@/components/user-menu'
import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

// Navigation with user-friendly names and descriptions
const navigation = [
  {
    section: 'Main',
    items: [
      { name: 'Dashboard', to: '/', icon: LayoutDashboard, description: 'Home and overview' },
      { name: 'Website Pages', to: '/cms', icon: FileCode2, description: 'Edit your website content' },
      { name: 'Messages', to: '/submissions', icon: Inbox, description: 'Contact form submissions' },
    ]
  },
  {
    section: 'School',
    icon: GraduationCap,
    items: [
      { name: 'Students', to: '/school/students/', icon: UsersRound, description: 'Manage student records' },
      { name: 'Staff', to: '/school/staff/', icon: Users, description: 'Manage teachers and staff' },
      { name: 'Subjects', to: '/school/subjects/', icon: BookOpen, description: 'Manage school subjects' },
      { name: 'Exams', to: '/school/exams/', icon: FileText, description: 'Create and manage exams' },
      { name: 'Terms', to: '/school/terms/', icon: Calendar, description: 'Academic terms and years' },
      { name: 'Reports', to: '/school/reports/', icon: BarChart3, description: 'Student performance reports' },
      { name: 'Outstanding Fees', to: '/school/reports/fees', icon: DollarSign, description: 'View unpaid fees' },
      { name: 'Grading System', to: '/school/grades/', icon: Scale, description: 'Manage grade scales' },
      { name: 'Fee Settings', to: '/school/fees', icon: Banknote, description: 'Configure fee structures' },
      { name: 'School Settings', to: '/school/settings', icon: ScrollText, description: 'School information' },
    ]
  },
  {
    section: 'Account',
    items: [
      { name: 'Users', to: '/users', icon: Users, description: 'Manage user accounts' },
      { name: 'Profile', to: '/profile', icon: User, description: 'Your personal settings' },
      { name: 'Settings', to: '/settings', icon: Settings, description: 'System configuration' },
    ]
  },
]

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [schoolOpen, setSchoolOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
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

  // Filter navigation items based on search
  const filteredNavigation = searchQuery.trim()
    ? navigation.map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(section => section.items.length > 0)
    : navigation

  // Auto-open school dropdown when child is active or when searching
  useEffect(() => {
    if (searchQuery) {
      setSchoolOpen(true)
      return
    }
    
    // Find if current page is in School section
    const schoolSection = navigation.find(section => section.section === 'School')
    const isSchoolPage = schoolSection?.items?.some((item: any) =>
      location.pathname.startsWith(item.to || '')
    )
    
    setSchoolOpen(isSchoolPage || false)
  }, [location.pathname, searchQuery])

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Dynamically update document title and favicon
  useEffect(() => {
    if (settings) {
      // Find current page name from navigation
      let pageName = 'Dashboard'
      for (const section of navigation) {
        const item = section.items.find(i =>
          i.to === location.pathname || location.pathname.startsWith(i.to || '')
        )
        if (item) {
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
          
          {/* Search */}
          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/70"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid gap-1 px-2 text-sm font-medium">
              {filteredNavigation.map((section: any) => (
                <div key={section.section} className="mb-3">
                  {/* Section Header */}
                  {!searchQuery && (
                    <div className="mb-1 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {section.section}
                    </div>
                  )}
                  
                  {/* Navigation Items */}
                  {section.section === 'School' ? (
                    <div className="space-y-1">
                      <button
                        onClick={() => setSchoolOpen(!schoolOpen)}
                        className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <section.icon className="h-4 w-4" />
                          <span>{section.section}</span>
                        </div>
                        {schoolOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {schoolOpen && (
                        <div className="ml-4 space-y-0.5">
                          {section.items.map((item: any) => (
                            <Link
                              key={item.name}
                              to={item.to}
                              title={item.description}
                              className="group flex items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-muted-foreground transition-all hover:text-primary [&.active]:bg-muted [&.active]:text-primary"
                              onClick={() => setSidebarOpen(false)}
                            >
                              <div className="flex items-center gap-3">
                                <item.icon className="h-4 w-4" />
                                <span>{item.name}</span>
                              </div>
                              <HelpCircle className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {section.items.map((item: any) => (
                        <Link
                          key={item.name}
                          to={item.to}
                          title={item.description}
                          className="group flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50 [&.active]:bg-muted [&.active]:text-primary"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </div>
                          <HelpCircle className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
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
