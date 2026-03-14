import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Plus,
  FileText,
  MoreVertical,
  ExternalLink,
  Trash2,
  Settings2,
  Search,
  LayoutGrid,
  List,
  Calendar,
  Globe
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SITE_URL } from '@/config'

export const Route = createFileRoute('/_dashboard/cms/')({
  component: CMSPageList,
})

function CMSPageList() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data: pages, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const res = await apiFetch('/pages')
      if (!res.ok) throw new Error('Failed to fetch pages')
      return res.json()
    }
  })

  const createPageMutation = useMutation({
    mutationFn: async (newPage: any) => {
      const res = await apiFetch('/pages', {
        method: 'POST',
        body: JSON.stringify(newPage)
      })
      if (!res.ok) throw new Error('Failed to create page')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
    }
  })

  const deletePageMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/pages/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete page')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
    }
  })

  const handleCreatePage = () => {
    const title = window.prompt('Enter page title:')
    if (!title) return
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    
    createPageMutation.mutate({
      title,
      slug,
      status: 'draft'
    })
  }

  const filteredPages = pages?.filter((page: any) => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage your website pages and sections.</p>
        </div>
        <Button onClick={handleCreatePage} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Create New Page
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search pages..." 
            className="pl-10 bg-background" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center bg-background border rounded-lg p-1 shadow-sm">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-muted animate-pulse border-2 border-dashed border-muted-foreground/10" />
          ))}
        </div>
      ) : filteredPages?.length === 0 ? (
        <div className="text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-muted-foreground/10">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-background border shadow-sm mb-6">
            <FileText className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-xl font-semibold">No pages found</h3>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
            {searchQuery ? "Try adjusting your search query or clear it to see all pages." : "Get started by creating your first page to build your website."}
          </p>
          {!searchQuery && (
            <Button onClick={handleCreatePage} variant="outline" className="mt-6">
              Create your first page
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages?.map((page: any) => (
            <Card key={page.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-muted-foreground/10 flex flex-col">
              <CardHeader className="p-0">
                <div className="h-40 bg-muted/30 flex items-center justify-center relative group-hover:bg-muted/50 transition-colors">
                  <FileText className="h-12 w-12 text-muted-foreground/20 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-3 right-3">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-full border uppercase tracking-widest",
                      page.status === 'published' 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    )}>
                      {page.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">{page.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1 font-mono text-xs">
                      /{page.slug === 'home' ? '' : page.slug}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <Link to="/cms/$pageId" params={{ pageId: page.id }}>
                        <DropdownMenuItem className="gap-2">
                          <Settings2 className="h-4 w-4" />
                          Edit Page
                        </DropdownMenuItem>
                      </Link>
                      {page.status === 'published' && (
                        <DropdownMenuItem className="gap-2" asChild>
                          <a href={`${SITE_URL}/${page.slug === 'home' ? '' : page.slug}`} target="_blank" rel="noreferrer">
                            <Globe className="h-4 w-4" />
                            View Public Site
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this page?')) {
                            deletePageMutation.mutate(page.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Page
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground border-t pt-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-0 border-t">
                <Link
                  to="/cms/$pageId"
                  params={{ pageId: page.id }}
                  className="w-full"
                >
                  <Button variant="ghost" className="w-full h-12 rounded-none gap-2 text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground">
                    Edit Content
                    <Settings2 className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Page</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">URL Path</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Last Updated</th>
                <th className="p-4 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {filteredPages?.map((page: any) => (
                <tr key={page.id} className="border-b hover:bg-muted/30 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-muted-foreground/60" />
                      </div>
                      <div className="font-semibold text-sm truncate max-w-[200px] group-hover:text-primary transition-colors">
                        {page.title}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs text-muted-foreground">
                    /{page.slug === 'home' ? '' : page.slug}
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-full border uppercase tracking-widest",
                      page.status === 'published' 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    )}>
                      {page.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {page.status === 'published' && (
                         <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                           <a href={`${SITE_URL}/${page.slug === 'home' ? '' : page.slug}`} target="_blank" rel="noreferrer">
                             <ExternalLink className="h-4 w-4" />
                           </a>
                         </Button>
                       )}
                       <Link to="/cms/$pageId" params={{ pageId: page.id }}>
                         <Button variant="ghost" size="icon" className="h-8 w-8">
                           <Settings2 className="h-4 w-4" />
                         </Button>
                       </Link>
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8">
                             <MoreVertical className="h-4 w-4" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-48">
                           <DropdownMenuItem 
                            className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this page?')) {
                                deletePageMutation.mutate(page.id)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Page
                          </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}