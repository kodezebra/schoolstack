import { Button } from "@/components/ui/button"
import {
  Plus, Layers, MousePointer2, Box, Type,
  Layout, Zap, Eye,
  BarChart3, Users, MessageSquare, Megaphone,
  PanelBottom, ListFilter, HeartHandshake, ImagePlay, CircleHelp
} from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const AVAILABLE_BLOCKS = [
  { type: 'navbar', icon: Layout, label: 'Navbar', description: 'Logo and navigation links.' },
  { type: 'hero', icon: Box, label: 'Hero Section', description: 'Headline, subheadline, and background.' },
  { type: 'features', icon: Zap, label: 'Features Grid', description: 'Highlight your services or features.' },
  { type: 'content', icon: Eye, label: 'Content Block', description: 'Text and image layout.' },
  { type: 'stats', icon: BarChart3, label: 'Stats Section', description: 'Numbers and milestones.' },
  { type: 'team', icon: Users, label: 'Team Section', description: 'Showcase your team members.' },
  { type: 'testimonials', icon: MessageSquare, label: 'Testimonials', description: 'What clients are saying.' },
  { type: 'cta', icon: Megaphone, label: 'Call to Action', description: 'Urge users to take action.' },
  { type: 'footer', icon: PanelBottom, label: 'Footer', description: 'Bottom navigation and info.' },
  { type: 'text', icon: Type, label: 'Basic Text', description: 'Simple text block.' },
  { type: 'steps', icon: ListFilter, label: 'Steps/Process', description: 'Numbered steps or process flow.' },
  { type: 'values', icon: HeartHandshake, label: 'Values Grid', description: 'Company values with icons.' },
  { type: 'splitContent', icon: Layout, label: 'Split Content', description: 'Image and text side-by-side.' },
  { type: 'videoGallery', icon: ImagePlay, label: 'Video Gallery', description: 'Grid of video thumbnails.' },
  { type: 'faq', icon: CircleHelp, label: 'FAQ', description: 'Accordion questions and answers.' },
]

export function EditorSidebar({ 
  blocks, 
  activeBlockId, 
  onSelectBlock, 
  onAddBlock 
}: { 
  blocks: any[], 
  activeBlockId: string | null,
  onSelectBlock: (id: string) => void,
  onAddBlock: (type: string) => void 
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  return (
    <div className="w-[280px] border-r bg-card flex flex-col h-full shadow-sm">
      <div className="p-4 border-b flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h2 className="font-bold text-xs uppercase tracking-widest">Layers</h2>
        </div>
        
        <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Component</DialogTitle>
              <DialogDescription>
                Choose a component to add to your page.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {AVAILABLE_BLOCKS.map((block) => (
                <button
                  key={block.type}
                  onClick={() => {
                    onAddBlock(block.type)
                    setIsPickerOpen(false)
                  }}
                  className="flex items-center gap-4 p-4 rounded-xl border bg-background hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <block.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{block.label}</div>
                    <div className="text-xs text-muted-foreground">{block.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {blocks.map((block, index) => {
          const isActive = activeBlockId === block.id
          const Icon = AVAILABLE_BLOCKS.find(b => b.type === block.type)?.icon || Box

          return (
            <button
              key={block.id}
              onClick={() => onSelectBlock(block.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md scale-[1.02] z-10" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-muted-foreground/60")} />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-tight truncate">
                  {block.type}
                </div>
                <div className={cn(
                  "text-[10px] truncate opacity-60 font-medium",
                  isActive ? "text-white" : "text-muted-foreground"
                )}>
                  {block.content.title || block.content.text || `Block ${index + 1}`}
                </div>
              </div>
            </button>
          )
        })}

        {blocks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4 opacity-50">
               <MousePointer2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">No layers yet. Click the <Plus className="inline h-3 w-3" /> button above to start.</p>
          </div>
        )}
      </div>
    </div>
  )
}
