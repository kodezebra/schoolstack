import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { Plus, FileText, ChevronRight, Globe, LayoutTemplate, Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

// Define the structure of a page template (should match server-side)
interface PageTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  blocks: any[]; // Blocks content from the template
}

export const Route = createFileRoute('/_dashboard/cms/')({
  component: CMSIndex,
})

function CMSIndex() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [pageToDelete, setPageToDelete] = useState<any | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    status: 'draft' as 'draft' | 'published',
    metaTitle: '',
    metaDescription: ''
  })

  // Fetch Templates
  const { data: templates, isLoading: isLoadingTemplates } = useQuery<PageTemplate[]>({
    queryKey: ['pageTemplates'],
    queryFn: async () => {
      const res = await apiFetch('/templates')
      return res.json()
    },
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
    mutationFn: async (newPageData: typeof formData & { blocks?: any[] }) => {
      const res = await apiFetch('/pages', {
        method: 'POST',
        body: JSON.stringify(newPageData),
      })
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
      setIsOpen(false)
      setSelectedTemplateId(null) // Reset selected template
      navigate({ to: '/cms/$pageId', params: { pageId: data.id } })
    },
  })

  // 3. DELETE DATA
  const deletePage = useMutation({
    mutationFn: async (pageId: string) => {
      const res = await apiFetch(`/pages/${pageId}`, {
        method: 'DELETE',
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
      setPageToDelete(null)
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

              {/* Template Selection */}
              <div className="grid gap-2 border-t pt-4">
                <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                  <LayoutTemplate className="h-4 w-4" />
                  <span>Choose a Template</span>
                </div>
                {isLoadingTemplates ? (
                  <div className="text-muted-foreground text-sm">Loading templates...</div>
                ) : (
                  <RadioGroup value={selectedTemplateId || ''} onValueChange={setSelectedTemplateId}>
                    <div className="grid grid-cols-2 gap-2">
                      <Label
                        htmlFor="template-blank"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <RadioGroupItem id="template-blank" value="blank" className="sr-only" />
                        <span className="mb-3 text-2xl">📄</span>
                        <span>Blank Page</span>
                      </Label>
                      {templates?.map((template) => (
                        <Label
                          key={template.id}
                          htmlFor={`template-${template.id}`}
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <RadioGroupItem id={`template-${template.id}`} value={template.id} className="sr-only" />
                          <span className="mb-3 text-2xl">
                            {template.id === 'landing-page' && '🚀'}
                            {template.id === 'about-us' && '🏢'}
                            {template.id === 'contact-us' && '📞'}
                          </span>
                          <span>{template.name}</span>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                )}
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
                onClick={() => {
                  const selectedTemplate = templates?.find(t => t.id === selectedTemplateId);
                  createPage.mutate({
                    ...formData,
                    blocks: selectedTemplate ? selectedTemplate.blocks : []
                  });
                }}
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
              <div key={page.id} className="flex items-center justify-between hover:bg-muted/50 transition-colors group">
                <Link
                  to="/cms/$pageId"
                  params={{ pageId: page.id }}
                  className="flex flex-1 items-center gap-4 p-4"
                >
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
                </Link>
                <div className="flex items-center gap-4 px-4 text-muted-foreground">
                  <span className="text-xs hidden sm:inline">
                    Updated {new Date(page.updatedAt).toLocaleDateString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPageToDelete(page);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Link 
                    to="/cms/$pageId" 
                    params={{ pageId: page.id }}
                    className="p-1 hover:text-foreground"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={!!pageToDelete} onOpenChange={(open) => !open && setPageToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold">{pageToDelete?.title}</span>? 
              This action cannot be undone and will permanently remove all associated content blocks.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPageToDelete(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => deletePage.mutate(pageToDelete.id)}
              disabled={deletePage.isPending}
            >
              {deletePage.isPending ? 'Deleting...' : 'Delete Page'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
