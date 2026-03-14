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
import { FileText, Layout, Megaphone, Phone, User, Briefcase, Loader2, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

interface Page {
  id: string
  title: string
  slug: string
  children?: Page[]
}

interface Template {
  id: string
  name: string
  description: string
  blocks: any[]
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

const ICON_MAP: Record<string, React.ReactNode> = {
  'blank': <FileText className="h-6 w-6" />,
  'landing-page': <Megaphone className="h-6 w-6" />,
  'saas-product': <Layout className="h-6 w-6" />,
  'agency': <Briefcase className="h-6 w-6" />,
  'consulting': <Briefcase className="h-6 w-6" />,
  'startup': <Layout className="h-6 w-6" />,
  'personal-portfolio': <User className="h-6 w-6" />,
  'about': <User className="h-6 w-6" />,
  'contact': <Phone className="h-6 w-6" />,
  'hero-basic': <Layout className="h-6 w-6" />,
  'landing': <Megaphone className="h-6 w-6" />,
  'service': <Briefcase className="h-6 w-6" />
}

export function CreatePageSheet({ open, onOpenChange, onCreate, isCreating }: CreatePageSheetProps) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('blank')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [parentId, setParentId] = useState<string | null>(null)

  // Fetch templates from server
  const { data: templates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const res = await apiFetch('/templates')
      if (!res.ok) return []
      return res.json() as Promise<Template[]>
    }
  })

  // Fetch pages for parent selection
  const { data: pages } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const res = await apiFetch('/pages')
      if (!res.ok) return []
      return res.json() as Promise<Page[]>
    }
  })

  // Categorize templates
  const categorizeTemplate = (templateId: string): string => {
    const businessTemplates = ['landing-page', 'saas-product', 'agency', 'consulting', 'startup']
    const portfolioTemplates = ['personal-portfolio', 'agency']
    
    if (businessTemplates.includes(templateId)) return 'business'
    if (portfolioTemplates.includes(templateId)) return 'portfolio'
    return 'simple'
  }

  // Filter templates by category
  const filteredTemplates = templates?.filter((template) => {
    if (selectedCategory === 'all') return true
    if (selectedCategory === 'blank') return false
    return categorizeTemplate(template.id) === selectedCategory
  }) || []

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

  // Note: SEO fields (metaTitle, metaDescription) stay blank
  // They will be auto-generated on save if left empty

  const handleCreate = () => {
    if (!title.trim()) return

    // Find selected template data
    const selectedTemplateData = templates?.find(t => t.id === selectedTemplate)
    const templateBlocks = selectedTemplateData?.blocks || []

    onCreate({
      title: title.trim(),
      slug: slug || 'untitled',
      status: isPublished ? 'published' : 'draft',
      template: selectedTemplate,
      blocks: templateBlocks,
      parentId,
      order: 0,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || `Learn more about ${title}`
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setTitle('')
      setSlug('')
      setIsPublished(false)
      setSelectedTemplate('blank')
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
            Add a new page to your website. Choose a template to get started quickly.
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
              placeholder="e.g., About Us, Contact"
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
                yourcms.com/
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
            <p className="text-xs text-muted-foreground">
              ✨ Auto-generated from title, but you can edit it
            </p>
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

          {/* Template Selection */}
          <div className="grid gap-4">
            <Label className="text-base font-semibold">Starting Template</Label>
            
            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="simple">Simple</TabsTrigger>
              </TabsList>

              <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                {/* Blank Page Option (Always shown) */}
                {(selectedCategory === 'all' || selectedCategory === 'simple') && (
                  <Card
                    className={cn(
                      'cursor-pointer transition-all hover:border-primary hover:bg-muted/50',
                      selectedTemplate === 'blank'
                        ? 'border-primary bg-muted/50 ring-2 ring-primary ring-offset-2'
                        : 'border-muted-foreground/20'
                    )}
                    onClick={() => setSelectedTemplate('blank')}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className={cn(
                        "h-12 w-12 rounded-lg flex items-center justify-center shrink-0",
                        selectedTemplate === 'blank'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}>
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">Blank Page</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted border text-muted-foreground font-medium">
                            Simple
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Start from scratch
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Server Templates */}
                {isLoadingTemplates ? (
                  <div className="flex items-center justify-center p-8 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading templates...
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="flex items-center justify-center p-8 text-muted-foreground text-sm">
                    No templates in this category
                  </div>
                ) : (
                  filteredTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className={cn(
                        'cursor-pointer transition-all hover:border-primary hover:bg-muted/50',
                        selectedTemplate === template.id
                          ? 'border-primary bg-muted/50 ring-2 ring-primary ring-offset-2'
                          : 'border-muted-foreground/20'
                      )}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className={cn(
                          "h-12 w-12 rounded-lg flex items-center justify-center shrink-0",
                          selectedTemplate === template.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}>
                          {ICON_MAP[template.id] || <Layout className="h-6 w-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{template.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted border text-muted-foreground font-medium capitalize">
                              {categorizeTemplate(template.id)}
                            </span>
                            {['landing-page', 'saas-product'].includes(template.id) && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 font-medium flex items-center gap-0.5">
                                <Star className="h-2.5 w-2.5" />
                                Popular
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {template.description}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </Tabs>
            
            <p className="text-xs text-muted-foreground">
              {filteredTemplates.length + (selectedCategory === 'all' || selectedCategory === 'simple' ? 1 : 0)} templates available
            </p>
          </div>

          {/* SEO Settings (Collapsible) */}
          <div className="grid gap-4 border-t pt-6 mt-4">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <FileText className="h-4 w-4" />
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
              <p className="text-xs text-muted-foreground">
                ℹ️ Will be auto-generated from page title on save if left blank
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-meta-description">Meta Description</Label>
              <Input
                id="create-meta-description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Leave blank to auto-generate"
              />
              <p className="text-xs text-muted-foreground">
                ℹ️ Will be auto-generated on save if left blank
              </p>
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
