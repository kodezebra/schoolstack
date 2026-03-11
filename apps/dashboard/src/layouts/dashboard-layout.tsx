import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  Globe, 
  ShieldCheck, 
  Zap, 
  Menu,
  Search,
  Bell,
  CircleUser,
  FileCode2,
  LogOut
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Route } from '@/routes/_dashboard/route' // Import the specific Route object

import { apiFetch } from '@/lib/api'

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'CMS Pages', to: '/cms', icon: FileCode2 },
  { name: 'Websites', to: '/websites', icon: Globe },
  { name: 'Security', to: '/security', icon: ShieldCheck },
  { name: 'Performance', to: '/performance', icon: Zap },
  { name: 'Users', to: '/users', icon: Users },
  { name: 'Settings', to: '/settings', icon: Settings },
]

export function DashboardLayout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  
  // Access the user from the route context, which is set by beforeLoad
  const { user } = Route.useRouteContext(); // Now correctly accessing the route context

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiFetch('/auth/logout', { method: 'POST' })
    },
    onSuccess: () => {
      // Invalidate the 'me' query to clear the user from cache
      queryClient.invalidateQueries({ queryKey: ['me'] })
      navigate({ to: '/login' })
    }
  })

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-muted/40 md:block">
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-14 items-center border-b px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold text-primary">
              <ShieldCheck className="h-6 w-6" />
              <span className="font-bold tracking-tight text-slate-900">KZ Cloud</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary [&.active]:bg-muted [&.active]:text-primary"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* User Info & Logout */}
          <div className="mt-auto p-4 border-t bg-muted/20">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                {user?.name?.[0] || user?.email?.[0]}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs h-8 text-muted-foreground hover:text-destructive hover:border-destructive/20"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search resources..."
                  className="w-full bg-background pl-8 py-2 text-sm rounded-md border border-input focus:outline-none focus:ring-1 focus:ring-primary md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-primary" />
            </Button>
            <Button variant="ghost" size="icon">
              <CircleUser className="h-6 w-6" />
            </Button>
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
