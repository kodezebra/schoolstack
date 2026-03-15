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
  { name: 'Users', to: '/users', icon: Users },
  { name: 'Profile', to: '/profile', icon: User },
  { name: 'Settings', to: '/settings', icon: Settings },
]

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  // Dynamically update document title and favicon
  useEffect(() => {
    if (settings) {
      // Find current page name from navigation
      const currentPage = navigation.find(item => 
        item.to === location.pathname || (item.to !== '/' && location.pathname.startsWith(item.to))
      )
      const pageName = currentPage?.name || 'Dashboard'
      
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
            <nav className="grid items-start px-4 text-sm font-medium">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary [&.active]:bg-muted [&.active]:text-primary"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
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
        <main className="flex-1 overflow-auto p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
