import { useState, useMemo } from 'react'
import * as LucideIcons from 'lucide-react'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  DialogDescription 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

// A curated list of common icons to keep the UI snappy
const COMMON_ICONS = [
  'github', 'twitter', 'x', 'linkedin', 'facebook', 'instagram', 'youtube', 'tiktok', 'whatsapp',
  'zap', 'star', 'heart', 'shield', 'check-circle', 'info', 'help-circle', 
  'alert-circle', 'settings', 'user', 'users', 'mail', 'phone', 'globe', 
  'map-pin', 'search', 'bell', 'calendar', 'clock', 'camera', 'image', 
  'video', 'music', 'mic', 'layout', 'grid', 'list', 'box', 'package', 
  'truck', 'shopping-cart', 'shopping-bag', 'credit-card', 'wallet', 
  'banknote', 'bar-chart', 'bar-chart-2', 'pie-chart', 'line-chart', 
  'activity', 'trending-up', 'trending-down', 'arrow-up', 'arrow-down', 
  'arrow-left', 'arrow-right', 'chevron-up', 'chevron-down', 'chevron-left', 
  'chevron-right', 'external-link', 'link', 'link-2', 'unlink', 'plus', 
  'minus', 'plus-circle', 'minus-circle', 'check', 'x', 'copy', 'clipboard', 
  'file', 'file-text', 'folder', 'folder-plus', 'folder-minus', 'archive', 
  'trash', 'trash-2', 'edit', 'edit-2', 'edit-3', 'pen-tool', 'mouse-pointer', 
  'hand', 'thumbs-up', 'thumbs-down', 'message-square', 'message-circle', 
  'share', 'share-2', 'download', 'upload', 'cloud', 'cloud-drizzle', 
  'cloud-lightning', 'cloud-rain', 'cloud-snow', 'sun', 'moon', 'sunrise', 
  'sunset', 'wind', 'thermometer', 'droplets', 'cpu', 'database', 'hard-drive', 
  'monitor', 'smartphone', 'tablet', 'tv', 'watch', 'wifi', 'bluetooth'
]

export function IconPicker({ 
  value, 
  onSelect,
  trigger 
}: { 
  value?: string,
  onSelect: (iconName: string) => void,
  trigger?: React.ReactNode 
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filteredIcons = useMemo(() => {
    return COMMON_ICONS.filter(name => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const renderIcon = (name: string) => {
    const iconLower = name?.toLowerCase() || ''
    const brands: Record<string, any> = {
      github: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>,
      twitter: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>,
      x: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -9.233m2.464 -3.367l4.768 -6.4" /></svg>,
      linkedin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>,
      facebook: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
      instagram: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>,
      youtube: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2 69.44 69.44 0 0 1 15 0 2 2 0 0 1 2 2 24.12 24.12 0 0 1 0 10 2 2 0 0 1-2 2 69.44 69.44 0 0 1-15 0 2 2 0 0 1-2-2z"/><path d="m10 15 5-3-5-3z"/></svg>,
      tiktok: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>,
      whatsapp: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-10.4 8.38 8.38 0 0 1 3.8.9L21 4.5z"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>,
      insta: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
    }
    
    if (brands[iconLower]) return brands[iconLower]

    // Convert kebab-case to PascalCase for lucide-react
    const pascalName = name
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') as keyof typeof LucideIcons
    
    const IconComponent = (LucideIcons[pascalName] as any) || LucideIcons.HelpCircle
    return <IconComponent className="h-5 w-5" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            {value ? renderIcon(value) : <LucideIcons.Search className="h-4 w-4" />}
            <span className="capitalize">{value || 'Select Icon'}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] h-[500px] flex flex-col p-0 overflow-hidden">
        <div className="p-6 border-b">
          <DialogHeader>
            <DialogTitle>Select an Icon</DialogTitle>
            <DialogDescription>
              Search for a Lucide icon to use in your component.
            </DialogDescription>
          </DialogHeader>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search icons..." 
              className="pl-9 pr-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-muted/10">
          {filteredIcons.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground italic text-sm">
              <p>No icons found matching "{searchTerm}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {filteredIcons.map((name) => (
                <button
                  key={name}
                  className={`
                    flex flex-col items-center justify-center p-3 rounded-lg border bg-card hover:border-primary hover:bg-primary/5 transition-all group
                    ${value === name ? 'border-primary bg-primary/10 ring-1 ring-primary' : ''}
                  `}
                  onClick={() => {
                    onSelect(name)
                    setIsOpen(false)
                    setSearchTerm('')
                  }}
                  title={name}
                >
                  <div className={`mb-2 group-hover:scale-110 transition-transform ${value === name ? 'text-primary' : 'text-muted-foreground'}`}>
                    {renderIcon(name)}
                  </div>
                  <span className="text-[9px] truncate w-full text-center text-muted-foreground capitalize">
                    {name.replace(/-/g, ' ')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-card flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
