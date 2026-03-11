import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { Save, Plus, Trash2, ArrowLeft, Settings2, Globe, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
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
import { SITE_URL } from '@/config'
import { apiFetch } from '@/lib/api'

export const Route = createFileRoute('/_dashboard/cms/$pageId')({
  component: CMSPage,
})

function CMSPage() {
  const { pageId } = Route.useParams()
  const queryClient = useQueryClient()
  const [localBlocks, setLocalBlocks] = useState<any[]>([])
  
  // Settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settings, setSettings] = useState({
    title: '',
    slug: '',
    description: '',
    status: 'draft',
    metaTitle: '',
    metaDescription: ''
  })

  // 1. Fetch Page & Blocks
  const { data: pageData, isLoading } = useQuery({
    queryKey: ['page', pageId],
    queryFn: async () => {
      const res = await apiFetch(`/pages/${pageId}`)
      return res.json()
    }
  })

  // Sync local state when data is loaded
  useEffect(() => {
    if (pageData) {
      if (pageData.blocks) {
        setLocalBlocks(pageData.blocks.map((b: any) => ({
          ...b,
          content: typeof b.content === 'string' ? JSON.parse(b.content) : b.content
        })))
      }
      setSettings({
        title: pageData.title || '',
        slug: pageData.slug || '',
        description: pageData.description || '',
        status: pageData.status || 'draft',
        metaTitle: pageData.metaTitle || '',
        metaDescription: pageData.metaDescription || ''
      })
    }
  }, [pageData])

  // 2. Save Blocks Mutation
  const saveBlocks = useMutation({
    mutationFn: async (blocks: any[]) => {
      await apiFetch(`/pages/${pageId}/blocks`, {
        method: 'PUT',
        body: JSON.stringify(blocks),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page', pageId] })
    },
  })

  // 3. Save Settings Mutation
  const updateSettings = useMutation({
    mutationFn: async (newSettings: typeof settings) => {
      const res = await apiFetch(`/pages/${pageId}`, {
        method: 'PATCH',
        body: JSON.stringify(newSettings),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page', pageId] })
      setIsSettingsOpen(false)
    },
  })

  const addBlock = (type: string) => {
    const newBlock = {
      type,
      content: type === 'hero' ? { title: 'New Hero', subtitle: '' } : { text: 'New text block' },
      id: `temp-${Date.now()}`
    }
    setLocalBlocks([...localBlocks, newBlock])
  }

  const updateBlockContent = (index: number, content: any) => {
    const newBlocks = [...localBlocks]
    newBlocks[index].content = content
    setLocalBlocks(newBlocks)
  }

  const removeBlock = (index: number) => {
    setLocalBlocks(localBlocks.filter((_, i) => i !== index))
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 border-b">
        <div className="flex items-center gap-4">
          <Link to="/cms">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">{pageData?.title}</h1>
              {pageData?.status === 'published' && (
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Live</span>
              )}
            </div>
            <p className="text-muted-foreground italic text-xs">/{pageData?.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pageData?.status === 'published' && (
            <a 
              href={`${SITE_URL}/${pageData.slug === 'home' ? '' : pageData.slug}`} 
              target="_blank" 
              rel="noreferrer"
            >
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Live
              </Button>
            </a>
          )}
          <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px] p-10 overflow-auto">
              <SheetHeader>
                <SheetTitle>Page Settings</SheetTitle>
                <SheetDescription>
                  Configure your page's metadata, status, and SEO settings.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-6 py-6">
                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-base">Published Status</Label>
                    <div className="text-sm text-muted-foreground">Make this page live for the world.</div>
                  </div>
                  <Switch 
                    checked={settings.status === 'published'} 
                    onCheckedChange={(checked) => setSettings({ ...settings, status: checked ? 'published' : 'draft' })} 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="s-title">Page Title</Label>
                  <Input id="s-title" value={settings.title} onChange={(e) => setSettings({ ...settings, title: e.target.value })} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="s-slug">Slug (URL)</Label>
                  <Input id="s-slug" value={settings.slug} onChange={(e) => setSettings({ ...settings, slug: e.target.value })} />
                </div>

                <div className="grid gap-2 border-t pt-4">
                  <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                    <Globe className="h-4 w-4" />
                    <span>SEO & Metadata</span>
                  </div>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="m-title">Meta Title</Label>
                      <Input id="m-title" value={settings.metaTitle} onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })} placeholder="SEO Title Tag" />
                      <p className="text-[10px] text-muted-foreground">Keep it under 60 characters for best results.</p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="m-desc">Meta Description</Label>
                      <textarea 
                        id="m-desc" 
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={settings.metaDescription} 
                        onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })} 
                        placeholder="Description for search engines..."
                      />
                      <p className="text-[10px] text-muted-foreground">Aim for 150-160 characters.</p>
                    </div>
                  </div>
                </div>
              </div>
              <SheetFooter className="mt-4">
                <Button className="w-full" onClick={() => updateSettings.mutate(settings)} disabled={updateSettings.isPending}>
                  {updateSettings.isPending ? 'Saving...' : 'Update Settings'}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          
          <Button onClick={() => saveBlocks.mutate(localBlocks)} disabled={saveBlocks.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {saveBlocks.isPending ? 'Saving...' : 'Save Blocks'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {localBlocks.map((block, index) => (
          <div key={block.id} className="relative group rounded-lg border bg-card p-6 shadow-sm border-l-4 border-l-primary/30 hover:border-l-primary transition-all">
            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeBlock(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mb-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              {block.type} BLOCK
            </div>

            {block.type === 'hero' ? (
              <div className="grid gap-4">
                <input
                  className="bg-transparent border-none text-2xl font-bold w-full focus:outline-none placeholder:text-muted-foreground/30"
                  value={block.content.title}
                  onChange={(e) => updateBlockContent(index, { ...block.content, title: e.target.value })}
                  placeholder="Hero Title"
                />
                <textarea
                  className="bg-transparent text-muted-foreground w-full focus:outline-none resize-none overflow-hidden h-auto"
                  value={block.content.subtitle}
                  onChange={(e) => updateBlockContent(index, { ...block.content, subtitle: e.target.value })}
                  placeholder="Hero Subtitle"
                />
              </div>
            ) : (
              <textarea
                className="bg-transparent w-full min-h-[100px] focus:outline-none resize-none"
                value={block.content.text}
                onChange={(e) => updateBlockContent(index, { ...block.content, text: e.target.value })}
                placeholder="Content text..."
              />
            )}
          </div>
        ))}

        {localBlocks.length === 0 && (
          <div className="text-center p-12 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/5">
            <Plus className="h-8 w-8 mx-auto mb-2 opacity-20" />
            No blocks in this page yet. Add your first one below.
          </div>
        )}

        <div className="flex items-center justify-center gap-4 py-12 border-t mt-4">
          <Button variant="outline" size="sm" onClick={() => addBlock('hero')} className="rounded-full">
            <Plus className="mr-2 h-3 w-3" /> Add Hero
          </Button>
          <Button variant="outline" size="sm" onClick={() => addBlock('text')} className="rounded-full">
            <Plus className="mr-2 h-3 w-3" /> Add Text
          </Button>
        </div>
      </div>
    </div>
  )
}