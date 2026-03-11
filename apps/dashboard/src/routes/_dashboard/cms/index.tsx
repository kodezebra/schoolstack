import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { Plus, FileText, ChevronRight, Globe } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useState } from 'react'
import { apiFetch } from '@/lib/api'

export const Route = createFileRoute('/_dashboard/cms/')({
  component: CMSIndex,
})

function CMSIndex() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    status: 'draft' as 'draft' | 'published',
    metaTitle: '',
    metaDescription: ''
  })

  // 1. FETCH DATA
  const { data: pages, isLoading, error } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const res = await apiFetch('/pages')
      return res.json()
    },
  })

  // 2. CREATE DATA
  const createPage = useMutation({
    mutationFn: async (newPage: typeof formData) => {
      const res = await apiFetch('/pages', {
        method: 'POST',
        body: JSON.stringify(newPage),
      })
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
      setIsOpen(false)
      navigate({ to: '/cms/$pageId', params: { pageId: data.id } })
    },
  })

  const handleTitleChange = (val: string) => {
    setFormData({
      ...formData,
      title: val,
      slug: val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    })
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error fetching pages</div>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CMS Pages</h1>
          <p className="text-muted-foreground">Manage your content blocks.</p>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Page
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md p-10 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Create New Page</SheetTitle>
              <SheetDescription>
                Add a new page to your project. You can edit the content blocks after creation.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-6 py-6">
              <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                <div className="space-y-0.5">
                  <Label className="text-base">Published Status</Label>
                  <div className="text-sm text-muted-foreground">Make this page live immediately.</div>
                </div>
                <Switch 
                  checked={formData.status === 'published'} 
                  onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'published' : 'draft' })} 
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. My Awesome Project"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-1 text-sm">/</span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2 border-t pt-4">
                <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                  <Globe className="h-4 w-4" />
                  <span>SEO & Metadata</span>
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="m-title">Meta Title</Label>
                    <Input 
                      id="m-title" 
                      value={formData.metaTitle} 
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })} 
                      placeholder="SEO Title Tag" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="m-desc">Meta Description</Label>
                    <textarea 
                      id="m-desc" 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={formData.metaDescription} 
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })} 
                      placeholder="Description for search engines..."
                    />
                  </div>
                </div>
              </div>
            </div>
            <SheetFooter>
              <Button 
                className="w-full"
                onClick={() => createPage.mutate(formData)}
                disabled={createPage.isPending || !formData.title || !formData.slug}
              >
                {createPage.isPending ? 'Creating...' : 'Create Page'}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="divide-y">
          {pages?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No pages yet. Create your first one above.
            </div>
          ) : (
            pages?.map((page: any) => (
              <Link
                key={page.id}
                to="/cms/$pageId"
                params={{ pageId: page.id }}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{page.title}</div>
                      {page.status === 'published' && (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                          Live
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground italic">/{page.slug}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="text-xs hidden sm:inline">
                    Updated {new Date(page.updatedAt).toLocaleDateString()}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
