import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings2, Globe, ExternalLink, Rocket } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
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

export function EditorHeader({ 
  pageData, 
  settings, 
  setSettings, 
  onSaveSettings, 
  onSaveBlocks,
  isSavingBlocks,
  isSavingSettings
}: { 
  pageData: any, 
  settings: any, 
  setSettings: (s: any) => void,
  onSaveSettings: () => void,
  onSaveBlocks: () => void,
  isSavingBlocks: boolean,
  isSavingSettings: boolean
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const handleUpdateSettings = () => {
    onSaveSettings()
    setIsSettingsOpen(false)
  }

  return (
    <header className="h-14 border-b flex items-center justify-between px-4 bg-background z-20 shadow-sm shrink-0">
      <div className="flex items-center gap-3">
        <Link to="/cms">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="h-4 w-[1px] bg-border mx-1" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs tracking-tight">{pageData?.title}</span>
            <span className="text-[9px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded uppercase font-bold tracking-widest">
              {settings.status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted h-8 px-3 gap-2 text-[10px] font-bold uppercase tracking-wider">
              <Settings2 className="h-3.5 w-3.5" />
              Settings
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
                   </div>
                 </div>
              </div>
            </div>
            <SheetFooter className="mt-4">
              <Button className="w-full" onClick={handleUpdateSettings} disabled={isSavingSettings}>
                {isSavingSettings ? 'Saving...' : 'Update Settings'}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <div className="h-4 w-[1px] bg-border mx-2" />

        {pageData?.status === 'published' && (
          <a 
            href={`${SITE_URL}/${pageData.slug === 'home' ? '' : pageData.slug}`} 
            target="_blank" 
            rel="noreferrer"
          >
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full">
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
        )}

        <Button 
          size="sm" 
          className="h-8 gap-2 bg-primary hover:bg-primary/90 shadow-sm px-4 text-xs font-bold"
          onClick={onSaveBlocks} 
          disabled={isSavingBlocks}
        >
          <Rocket className="h-3.5 w-3.5" />
          {isSavingBlocks ? 'Saving...' : 'Publish'}
        </Button>
      </div>
    </header>
  )
}
