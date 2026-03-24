import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { PAGE_LAYOUTS, getLayoutById } from './pageLayouts'

interface Page {
  id: string
  title: string
  slug: string
  children?: Page[]
}

interface CreatePageSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (data: {
    title: string
    slug: string
    status: 'draft' | 'published'
    template: string
    blocks: any[]
    parentId?: string | null
    order?: number
    metaTitle?: string
    metaDescription?: string
  }) => void
  isCreating: boolean
}

const LAYOUT_ICONS: Record<string, string> = {
  home: 'ph:house',
  users: 'ph:users',
  mail: 'ph:envelope',
  calendar: 'ph:calendar',
  file: 'ph:file',
  zap: 'ph:lightning',
  heart: 'ph:heart',
  star: 'ph:star',
}

const LAYOUT_COLORS: Record<string, string> = {
  'from-blue-500 to-cyan-500': 'bg-gradient-to-br from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500': 'bg-gradient-to-br from-purple-500 to-pink-500',
  'from-green-500 to-emerald-500': 'bg-gradient-to-br from-green-500 to-emerald-500',
  'from-orange-500 to-amber-500': 'bg-gradient-to-br from-orange-500 to-amber-500',
  'from-slate-500 to-zinc-500': 'bg-gradient-to-br from-slate-500 to-zinc-500',
}

export function CreatePageSheet({ open, onOpenChange, onCreate, isCreating }: CreatePageSheetProps) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [selectedLayout, setSelectedLayout] = useState('blank')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [parentId, setParentId] = useState<string | null>(null)

  // Fetch pages for parent selection
  const { data: pages } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const res = await apiFetch('/pages')
      if (!res.ok) return []
      return res.json() as Promise<Page[]>
    }
  })

  // Filter layouts by category
  const filteredLayouts = PAGE_LAYOUTS.filter((layout) => {
    if (selectedCategory === 'all') return true
    if (selectedCategory === 'blank') return layout.category === 'blank'
    return layout.category === selectedCategory
  })

  // Auto-generate slug from title
  useEffect(() => {
    if (title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setSlug(generatedSlug)
    } else {
      setSlug('')
    }
  }, [title])

  const handleCreate = () => {
    if (!title.trim()) return

    const selectedLayoutData = getLayoutById(selectedLayout)
    const layoutBlocks = selectedLayoutData?.blocks || []

    // Give blocks fresh IDs
    const freshBlocks = layoutBlocks.map((block, index) => ({
      ...block,
      id: `${block.type}-${Date.now()}-${index}`
    }))

    onCreate({
      title: title.trim(),
      slug: slug || 'untitled',
      status: isPublished ? 'published' : 'draft',
      template: selectedLayout,
      blocks: freshBlocks,
      parentId,
      order: 0,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || `Learn more about ${title}`
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTitle('')
      setSlug('')
      setIsPublished(false)
      setSelectedLayout('blank')
      setMetaTitle('')
      setMetaDescription('')
    }
    onOpenChange(newOpen)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] p-8 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold">Create New Page</SheetTitle>
          <SheetDescription className="text-base">
            Choose a starting layout to get your page up and running quickly.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-2">
          {/* Page Title */}
          <div className="grid gap-2">
            <Label htmlFor="create-title" className="text-base font-semibold">Page Title *</Label>
            <Input
              id="create-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., About Us, Contact, Events"
              className="text-base h-11"
            />
            <p className="text-xs text-muted-foreground">
              This will be the main heading of your page
            </p>
          </div>

          {/* URL Slug */}
          <div className="grid gap-2">
            <Label htmlFor="create-slug" className="text-base font-semibold">URL Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground bg-muted px-3 py-2.5 rounded-md border whitespace-nowrap">
                yoursite.com/
                {parentId && (
                  <span className="text-primary font-medium">
                    {pages?.find(p => p.id === parentId)?.slug}/
                  </span>
                )}
              </span>
              <Input
                id="create-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="about-us"
                className="flex-1 h-11"
              />
            </div>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Published Status</Label>
              <div className="text-sm text-muted-foreground">
                {isPublished ? 'Make this page live immediately' : 'Save as draft to edit first'}
              </div>
            </div>
            <Switch
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
          </div>

          {/* Parent Page Selector */}
          <div className="grid gap-2">
            <Label htmlFor="parent-page" className="text-base font-semibold">Parent Page (Optional)</Label>
            <Select
              value={parentId || 'null'}
              onValueChange={(value) => setParentId(value === 'null' ? null : value)}
            >
              <SelectTrigger id="parent-page" className="h-11">
                <SelectValue placeholder="Select a parent page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">None (Top-level page)</SelectItem>
                {pages?.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose a parent page to create a nested page (e.g., Services &gt; Web Design)
            </p>
          </div>

          {/* Layout Selection */}
          <div className="grid gap-4">
            <Label className="text-base font-semibold">Starting Layout</Label>
            
            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="homepage">Home</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="blank">Blank</TabsTrigger>
              </TabsList>

              <div className="grid gap-3 max-h-[320px] overflow-y-auto pr-2">
                {filteredLayouts.map((layout) => {
                  const iconName = layout.preview?.icon || 'file'
                  const colorClass = layout.preview?.color || 'from-slate-500 to-zinc-500'
                  const bgClass = LAYOUT_COLORS[colorClass] || LAYOUT_COLORS['from-slate-500 to-zinc-500']
                  
                  return (
                    <Card
                      key={layout.id}
                      className={cn(
                        'cursor-pointer transition-all hover:border-primary hover:bg-muted/50',
                        selectedLayout === layout.id
                          ? 'border-primary bg-muted/50 ring-2 ring-primary ring-offset-2'
                          : 'border-muted-foreground/20'
                      )}
                      onClick={() => setSelectedLayout(layout.id)}
                    >
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className={cn(
                          'h-12 w-12 rounded-lg flex items-center justify-center shrink-0 text-white',
                          bgClass,
                          selectedLayout === layout.id && 'ring-2 ring-primary ring-offset-2'
                        )}>
                          <Icon icon={LAYOUT_ICONS[iconName] || 'ph:file'} className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{layout.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted border text-muted-foreground font-medium capitalize">
                              {layout.category}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {layout.description}
                          </div>
                          {layout.blocks.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {layout.blocks.slice(0, 4).map((block, i) => (
                                <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                                  {block.type}
                                </span>
                              ))}
                              {layout.blocks.length > 4 && (
                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                  +{layout.blocks.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </Tabs>
            
            <p className="text-xs text-muted-foreground">
              {filteredLayouts.length} layout{filteredLayouts.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {/* SEO Settings */}
          <div className="grid gap-4 border-t pt-6 mt-4">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Icon icon="ph:magnifying-glass" className="h-4 w-4" />
              <span className="text-sm">SEO & Metadata</span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-meta-title">Meta Title</Label>
              <Input
                id="create-meta-title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Leave blank to auto-generate"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-meta-description">Meta Description</Label>
              <Input
                id="create-meta-description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Leave blank to auto-generate"
              />
            </div>
          </div>
        </div>

        <SheetFooter className="gap-2 mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isCreating}
            className="h-11 px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !title.trim()}
            className="gap-2 h-11 px-6"
          >
            {isCreating ? (
              <>
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              'Create Page'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
