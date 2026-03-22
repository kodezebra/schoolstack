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
  UsersRound,
  Banknote,
  ScrollText,
  BookOpen,
  FileText,
  Calendar,
  BarChart3,
  Scale,
  DollarSign,
  Search,
  HelpCircle,
  Plus,
  ChevronDown,
  GraduationCap,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  BookMarked,
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Route } from '@/routes/_dashboard/route'
import { UserMenu } from '@/components/user-menu'
import { HelpButton } from '@/components/help'
import { Avatar } from '@/components/ui/photo-upload'
import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Navigation with user-friendly names, descriptions, colors, and badges
// allowedRoles: undefined = all roles, otherwise array of allowed roles
// owner, admin, teacher, viewer
const navigation = [
  {
    section: 'Main',
    color: 'border-blue-400',
    items: [
      { name: 'Dashboard', to: '/', icon: LayoutDashboard, description: 'Home and overview', color: 'text-blue-600' },
      { name: 'Website Pages', to: '/cms', icon: FileCode2, description: 'Edit your website content', color: 'text-blue-600', allowedRoles: ['owner', 'admin', 'editor'] },
      { name: 'Messages', to: '/submissions', icon: Inbox, description: 'Contact form submissions', color: 'text-green-600', badge: 'messagesCount' },
    ]
  },
  {
    section: 'People',
    color: 'border-blue-400',
    items: [
      { name: 'Students', to: '/school/students/', icon: UsersRound, description: 'Manage student records', color: 'text-blue-600' },
      { name: 'Staff', to: '/school/staff/', icon: Users, description: 'Manage teachers and staff', color: 'text-green-600', allowedRoles: ['owner', 'admin'] },
      { name: 'Users', to: '/users', icon: User, description: 'Manage user accounts', color: 'text-purple-600', allowedRoles: ['owner', 'admin'] },
    ]
  },
  {
    section: 'Academics',
    color: 'border-purple-400',
    items: [
      { name: 'Subjects', to: '/school/subjects/', icon: BookOpen, description: 'Manage school subjects', color: 'text-purple-600' },
      { name: 'Exams', to: '/school/exams/', icon: FileText, description: 'Create and manage exams', color: 'text-purple-600' },
      { name: 'Terms', to: '/school/terms/', icon: Calendar, description: 'Academic terms and years', color: 'text-orange-600' },
      { name: 'Grading System', to: '/school/grades/', icon: Scale, description: 'Manage grade scales', color: 'text-purple-600', allowedRoles: ['owner', 'admin'] },
      { name: 'Reports', to: '/school/reports/', icon: BarChart3, description: 'Student performance reports', color: 'text-pink-600' },
    ]
  },
  {
    section: 'Finance',
    color: 'border-orange-400',
    items: [
      { name: 'Outstanding Fees', to: '/school/reports/fees', icon: DollarSign, description: 'View unpaid fees', color: 'text-indigo-600', badge: 'outstandingFeesCount' },
      { name: 'Record Payment', to: '/school/fees', icon: Banknote, description: 'Log fee payments', color: 'text-orange-600' },
      { name: 'Fee Structures', to: '/school/fees', icon: Banknote, description: 'Configure fee structures', color: 'text-orange-600', allowedRoles: ['owner', 'admin'] },
      { name: 'Extra Charges', to: '/school/extra-charges', icon: Plus, description: 'Manage transport, trips, and other charges', color: 'text-green-600', allowedRoles: ['owner', 'admin'] },
      { name: 'School Settings', to: '/school/settings', icon: ScrollText, description: 'School information', color: 'text-slate-600', allowedRoles: ['owner', 'admin'] },
    ]
  },
  {
    section: 'Account',
    color: 'border-slate-400',
    items: [
      { name: 'Profile', to: '/profile', icon: User, description: 'Your personal settings', color: 'text-blue-600' },
      { name: 'Settings', to: '/settings', icon: Settings, description: 'System configuration', color: 'text-slate-600', allowedRoles: ['owner', 'admin'] },
      { name: 'Help Center', to: '/help', icon: BookMarked, description: 'Guides and support', color: 'text-teal-600' },
    ]
  },
]

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  // Fetch badge counts
  const { data: messagesCount } = useQuery({
    queryKey: ['messages', 'count'],
    queryFn: async () => {
      const res = await apiFetch('/contact?limit=100')
      if (!res.ok) return 0
      const all = await res.json()
      return all.filter((m: any) => m.status === 'pending').length
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  const { data: outstandingFeesCount } = useQuery({
    queryKey: ['fees', 'outstanding', 'count'],
    queryFn: async () => {
      try {
        const res = await apiFetch('/school/reports/fees')
        if (!res.ok) return 0
        const data = await res.json()
        return data?.outstandingCount || 0
      } catch {
        return 0
      }
    },
    refetchInterval: 60000 // Refresh every minute
  })

  const { data: currentYear } = useQuery({
    queryKey: ['academic-years', 'current'],
    queryFn: async () => {
      const res = await apiFetch('/school/academic-years')
      if (!res.ok) return null
      const years = await res.json()
      return years.find((y: any) => y.isCurrent) || years[0]
    }
  })

  const { data: currentTerm } = useQuery({
    queryKey: ['terms', 'current'],
    queryFn: async () => {
      if (!currentYear) return null
      const res = await apiFetch(`/school/terms?academicYearId=${currentYear.id}`)
      if (!res.ok) return null
      const terms = await res.json()
      return terms.find((t: any) => t.status === 'active') || terms.find((t: any) => t.status === 'upcoming')
    },
    enabled: !!currentYear
  })

  // Notification counts
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const [messagesRes, feesRes] = await Promise.all([
        apiFetch('/contact?limit=100'),
        apiFetch('/school/fees/balances?status=outstanding').catch(() => null)
      ])
      
      const messages = messagesRes.ok ? await messagesRes.json() : []
      const pendingMessages = messages.filter((m: any) => m.status === 'pending').length
      
      const feesData = feesRes ? await feesRes.json() : null
      const outstandingFees = feesData?.totals?.outstandingStudents || 0
      
      return {
        pendingMessages,
        outstandingFees,
        total: pendingMessages + (outstandingFees > 10 ? 1 : 0) // Count as 1 notification if many outstanding
      }
    },
    refetchInterval: 30000
  })

  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Filter navigation items based on search and user role
  const filterNavigationItems = (items: any[], userRole: string) => {
    return items.filter(item => {
      if (!item.allowedRoles) return true
      return item.allowedRoles.includes(userRole)
    })
  }

  const filteredNavigation = searchQuery.trim()
    ? navigation.map(section => ({
        ...section,
        items: filterNavigationItems(section.items, user?.role || 'viewer')
          .filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
      })).filter(section => section.items.length > 0)
    : navigation.map(section => ({
        ...section,
        items: filterNavigationItems(section.items, user?.role || 'viewer')
      })).filter(section => section.items.length > 0)

  // Auto-open sections when searching
  useEffect(() => {
    // No special handling needed - all sections are always visible now
  }, [searchQuery])

  // Keyboard shortcuts
  useEffect(() => {
    let gPressedAt = 0
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      
      // Cmd/Ctrl + N: New (context-aware based on current page)
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        // Navigate based on current context
        if (location.pathname.includes('/students')) {
          window.location.href = '/school/students' // Will trigger add dialog
        } else if (location.pathname.includes('/fees')) {
          window.location.href = '/school/fees'
        } else if (location.pathname.includes('/exams')) {
          window.location.href = '/school/exams'
        } else {
          // Default: go to dashboard
          window.location.href = '/'
        }
      }
      
      // G then [key]: Navigation shortcuts
      if (e.key === 'g' || e.key === 'G') {
        gPressedAt = Date.now()
        return
      }
      
      // Check if G was pressed within last 800ms
      if (gPressedAt && Date.now() - gPressedAt < 800) {
        gPressedAt = 0
        const key = e.key.toLowerCase()
        
        switch (key) {
          case 'd': // Go to Dashboard
            window.location.href = '/'
            break
          case 's': // Go to Students
            window.location.href = '/school/students'
            break
          case 'f': // Go to Fees
            window.location.href = '/school/fees'
            break
          case 'e': // Go to Exams
            window.location.href = '/school/exams'
            break
          case 'r': // Go to Reports
            window.location.href = '/school/reports'
            break
          case 'm': // Go to Messages
            window.location.href = '/submissions'
            break
          case 'c': // Go to CMS
            window.location.href = '/cms'
            break
          case 'h': // Go to School Settings
            window.location.href = '/school/settings'
            break
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [location.pathname])

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
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold text-primary">
              <ShieldCheck className="h-6 w-6" />
              <span className="font-bold tracking-tight text-slate-900">{settings?.logoText || 'KZ Cloud'}</span>
            </Link>
          </div>

          {/* Search */}
          <div className="border-b px-3 py-2">
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

          {/* Scrollable Navigation */}
          <div className="flex-1 min-h-0 overflow-auto py-2 scrollbar-thin">
            <nav className="grid gap-1 px-2 text-sm font-medium">
              {filteredNavigation.map((section: any) => (
                <div key={section.section} className="mb-4">
                  {/* Section Header with color accent */}
                  {!searchQuery && (
                    <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <div className={cn('h-3 w-0.5 rounded-full', section.color || 'border-slate-400')} />
                      {section.section}
                    </div>
                  )}

                  {/* Navigation Items */}
                  <div className="space-y-0.5">
                    {section.items.map((item: any) => {
                      const badgeValue = item.badge === 'messagesCount' ? messagesCount : item.badge === 'outstandingFeesCount' ? outstandingFeesCount : undefined
                      const hasBadge = badgeValue !== undefined && badgeValue !== null && badgeValue > 0

                      return (
                        <Link
                          key={item.name}
                          to={item.to}
                          title={item.description}
                          className="group flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50 [&.active]:bg-muted [&.active]:text-primary"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className={cn('h-4 w-4', item.color)} />
                            <span>{item.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {hasBadge && (
                              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                                {badgeValue}
                              </span>
                            )}
                            <HelpCircle className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* User Info */}
          <div className="mt-auto p-4 border-t bg-muted">
            <div className="flex items-center gap-3 px-2">
              <Avatar
                photo={user?.photo}
                name={user?.name || 'User'}
                size="sm"
                className="w-8 h-8"
              />
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
          
          {/* Context Badge - Current Term/Year */}
          {(currentYear || currentTerm) && (
            <div className="hidden md:flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary">
                <GraduationCap className="h-3.5 w-3.5" />
                <span className="font-medium">{currentYear?.name || 'Current Year'}</span>
              </div>
              {currentTerm && (
                <>
                  <ChevronDown className="h-4 w-4 rotate-[-90deg] text-muted-foreground" />
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent text-accent-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="font-medium">{currentTerm.name}</span>
                  </div>
                </>
              )}
            </div>
          )}
          
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            {/* Notification Center */}
            <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications && notifications.total > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-3 border-b">
                  <h4 className="text-sm font-semibold">Notifications</h4>
                  <span className="text-xs text-muted-foreground">
                    {notifications?.total || 0} new
                  </span>
                </div>
                <div className="max-h-[300px] overflow-auto">
                  {/* Pending Messages */}
                  {notifications && notifications.pendingMessages > 0 && (
                    <Link 
                      to="/submissions"
                      className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors border-b"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                        <Inbox className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {notifications.pendingMessages} Pending Message{notifications.pendingMessages > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Contact form submissions need attention
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  )}
                  
                  {/* Outstanding Fees Alert */}
                  {notifications && notifications.outstandingFees > 10 && (
                    <Link 
                      to="/school/reports/fees"
                      className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {notifications.outstandingFees} Students with Outstanding Fees
                        </p>
                        <p className="text-xs text-muted-foreground">
                          High arrears count - review needed
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  )}
                  
                  {/* No Notifications */}
                  {(!notifications || notifications.total === 0) && (
                    <div className="p-8 text-center">
                      <CheckCircle className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">All caught up!</p>
                      <p className="text-xs text-muted-foreground mt-1">No new notifications</p>
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <UserMenu user={user} />
            
            {/* Help Button - Floating in bottom right, but we'll also show a small icon here */}
            <HelpButton />
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
