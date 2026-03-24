import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus, Layers, MousePointer2, Box, Type,
  Layout, Zap, Eye,
  BarChart3, Users, MessageSquare, Megaphone,
  ListFilter, HeartHandshake, ImagePlay, CircleHelp,
  Search, Sparkles, FileText, Image as ImageIcon, MessageCircle,
  ChevronUp, ChevronDown
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type BlockCategory = 'all' | 'layout' | 'content' | 'media' | 'interactive'

interface BlockDefinition {
  type: string
  icon: any
  label: string
  description: string
  category: BlockCategory
  color: string
}

const AVAILABLE_BLOCKS: BlockDefinition[] = [
  { type: 'hero', icon: Box, label: 'Hero Section', description: 'Headline, subheadline, and background', category: 'layout', color: 'from-purple-500 to-pink-500' },
  { type: 'splitContent', icon: Layout, label: 'Split Content', description: 'Image and text side-by-side', category: 'layout', color: 'from-indigo-500 to-blue-500' },
  
  { type: 'features', icon: Zap, label: 'Features Grid', description: 'Highlight your services or features', category: 'content', color: 'from-amber-500 to-orange-500' },
  { type: 'content', icon: Eye, label: 'Content Block', description: 'Text and image layout', category: 'content', color: 'from-emerald-500 to-teal-500' },
  { type: 'stats', icon: BarChart3, label: 'Stats Section', description: 'Numbers and milestones', category: 'content', color: 'from-rose-500 to-red-500' },
  { type: 'team', icon: Users, label: 'Team Section', description: 'Showcase your team members', category: 'content', color: 'from-violet-500 to-purple-500' },
  { type: 'testimonials', icon: MessageSquare, label: 'Testimonials', description: 'What clients are saying', category: 'content', color: 'from-fuchsia-500 to-pink-500' },
  { type: 'steps', icon: ListFilter, label: 'Steps/Process', description: 'Numbered steps or process flow', category: 'content', color: 'from-cyan-500 to-blue-500' },
  { type: 'values', icon: HeartHandshake, label: 'Values Grid', description: 'Company values with icons', category: 'content', color: 'from-green-500 to-emerald-500' },
  { type: 'faq', icon: CircleHelp, label: 'FAQ', description: 'Accordion questions and answers', category: 'content', color: 'from-indigo-500 to-violet-500' },
  { type: 'text', icon: Type, label: 'Basic Text', description: 'Simple text block', category: 'content', color: 'from-gray-500 to-slate-500' },
  
  { type: 'videoGallery', icon: ImagePlay, label: 'Video Gallery', description: 'Grid of video thumbnails', category: 'media', color: 'from-red-500 to-rose-500' },
  
  { type: 'cta', icon: Megaphone, label: 'Call to Action', description: 'Urge users to take action', category: 'interactive', color: 'from-orange-500 to-amber-500' },
  { type: 'contact-form', icon: MessageCircle, label: 'Contact Form', description: 'Add a contact form with custom fields', category: 'interactive', color: 'from-green-500 to-emerald-500' },
]

const CATEGORIES: { id: BlockCategory; label: string; icon: any }[] = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'layout', label: 'Layout', icon: Layout },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'media', label: 'Media', icon: ImageIcon },
  { id: 'interactive', label: 'Interactive', icon: MessageCircle },
]

export function EditorSidebar({
  blocks,
  activeBlockId,
  onSelectBlock,
  onAddBlock,
  onMoveBlock,
  onMoveBlockUp,
  onMoveBlockDown
}: {
  blocks: any[],
  activeBlockId: string | null,
  onSelectBlock: (id: string) => void,
  onAddBlock: (type: string) => void,
  onMoveBlock: (fromIndex: number, toIndex: number) => void,
  onMoveBlockUp: (index: number) => void,
  onMoveBlockDown: (index: number) => void
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<BlockCategory>('all')
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Load recently used from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('cms_recent_blocks')
    if (stored) {
      setRecentlyUsed(JSON.parse(stored))
    }
  }, [])

  // Auto-focus search input when dialog opens
  useEffect(() => {
    if (isPickerOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [isPickerOpen])

  // Filter blocks based on search and category
  const filteredBlocks = AVAILABLE_BLOCKS.filter(block => {
    const matchesSearch = searchQuery === '' || 
      block.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.type.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = activeCategory === 'all' || block.category === activeCategory
    
    return matchesSearch && matchesCategory
  })

  // Handle adding a block
  const handleAddBlock = (type: string) => {
    // Update recently used
    const newRecentlyUsed = [type, ...recentlyUsed.filter(t => t !== type)].slice(0, 5)
    setRecentlyUsed(newRecentlyUsed)
    localStorage.setItem('cms_recent_blocks', JSON.stringify(newRecentlyUsed))
    
    onAddBlock(type)
    setIsPickerOpen(false)
    setSearchQuery('')
    setActiveCategory('all')
    setSelectedIndex(0)
  }

  // Keyboard navigation for block picker
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPickerOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filteredBlocks.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && filteredBlocks[selectedIndex]) {
        e.preventDefault()
        handleAddBlock(filteredBlocks[selectedIndex].type)
      } else if (e.key === 'Escape') {
        setIsPickerOpen(false)
      } else if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1
        if (filteredBlocks[index]) {
          handleAddBlock(filteredBlocks[index].type)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPickerOpen, filteredBlocks, selectedIndex])

  // Keyboard shortcuts for moving layers (Alt+ArrowUp/ArrowDown)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeBlockId) return

      const currentIndex = blocks.findIndex(b => b.id === activeBlockId)
      if (currentIndex === -1) return

      // Alt + ArrowUp to move up
      if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault()
        onMoveBlockUp(currentIndex)
      }
      // Alt + ArrowDown to move down
      if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault()
        onMoveBlockDown(currentIndex)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeBlockId, blocks, onMoveBlockUp, onMoveBlockDown])

  // Get recently used blocks
  const recentBlocks = recentlyUsed
    .map(type => AVAILABLE_BLOCKS.find(b => b.type === type))
    .filter((b): b is BlockDefinition => !!b)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    onMoveBlock(draggedIndex, index)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

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
          <DialogContent className="sm:max-w-[650px] p-0 gap-0 overflow-hidden">
            <DialogHeader className="p-6 pb-4 border-b">
              <DialogTitle className="text-xl font-bold">Add Component</DialogTitle>
              <DialogDescription>
                Choose a component to add to your page. Use arrow keys to navigate, Enter to select.
              </DialogDescription>
            </DialogHeader>
            
            {/* Search */}
            <div className="px-6 py-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9"
                    onClick={() => setSearchQuery('')}
                  >
                    <Plus className="h-4 w-4 rotate-45" />
                  </Button>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="px-6 py-4 border-b">
              <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as BlockCategory)}>
                <TabsList className="w-full justify-start border-b-0 bg-transparent p-0 gap-1">
                  {CATEGORIES.map((cat) => (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all",
                        activeCategory === cat.id ? "bg-muted" : "hover:bg-muted/50"
                      )}
                    >
                      <cat.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{cat.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Recently Used */}
            {recentBlocks.length > 0 && !searchQuery && activeCategory === 'all' && (
              <div className="px-6 py-4 border-b bg-muted/30">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Recently Used</h4>
                <div className="flex gap-2">
                  {recentBlocks.map((block) => (
                    <button
                      key={block.type}
                      onClick={() => handleAddBlock(block.type)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-background hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <block.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{block.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Blocks Grid */}
            <div className="p-6 max-h-[400px] overflow-y-auto">
              {filteredBlocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm font-medium text-muted-foreground">No components found</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredBlocks.map((block, index) => {
                    const Icon = block.icon
                    const isSelected = index === selectedIndex
                    
                    return (
                      <button
                        key={block.type}
                        onClick={() => handleAddBlock(block.type)}
                        className={cn(
                          "group flex flex-col p-4 rounded-xl border text-left transition-all duration-200",
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md scale-[1.02]"
                            : "border-slate-200 dark:border-slate-800 bg-background hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5"
                        )}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className={cn(
                            "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br transition-transform group-hover:scale-110",
                            block.color
                          )}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm truncate">{block.label}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium uppercase">
                                {block.type}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {block.description}
                            </p>
                          </div>
                        </div>
                        {index < 9 && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <kbd className="inline-flex items-center justify-center h-5 w-5 rounded bg-muted text-[10px] font-mono text-muted-foreground">
                              {index + 1}
                            </kbd>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-background border font-mono">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-background border font-mono">Enter</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-background border font-mono">Esc</kbd>
                  Close
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                {filteredBlocks.length} component{filteredBlocks.length !== 1 ? 's' : ''} available
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {blocks.map((block, index) => {
          const isActive = activeBlockId === block.id
          const blockDef = AVAILABLE_BLOCKS.find(b => b.type === block.type)
          const Icon = blockDef?.icon || Box
          const isFirst = index === 0
          const isLast = index === blocks.length - 1

          return (
            <div
              key={block.id}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md scale-[1.02] z-10"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
                draggedIndex === index ? "opacity-50" : "",
                "cursor-grab active:cursor-grabbing"
              )}
            >
              {/* Move Handle */}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "h-full flex items-center justify-center w-6 shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity",
                  isActive ? "text-white/60" : "text-muted-foreground/40"
                )}
                title="Drag to reorder"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M9 3h6M9 7h6M9 11h6M9 15h6M9 19h6" strokeLinecap="round"/>
                </svg>
              </div>

              {/* Move Up/Down Buttons */}
              <div className="flex flex-col gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveBlockUp(index); }}
                  disabled={isFirst}
                  className={cn(
                    "h-4 w-4 flex items-center justify-center rounded transition-colors",
                    isFirst
                      ? "text-muted-foreground/20 cursor-not-allowed"
                      : isActive
                        ? "text-white/80 hover:text-white hover:bg-white/20"
                        : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/50"
                  )}
                  title="Move up (Alt+↑)"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveBlockDown(index); }}
                  disabled={isLast}
                  className={cn(
                    "h-4 w-4 flex items-center justify-center rounded transition-colors",
                    isLast
                      ? "text-muted-foreground/20 cursor-not-allowed"
                      : isActive
                        ? "text-white/80 hover:text-white hover:bg-white/20"
                        : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/50"
                  )}
                  title="Move down (Alt+↓)"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>

              {/* Icon and Label */}
              <button
                onClick={(e) => { e.stopPropagation(); onSelectBlock(block.id); }}
                className={cn(
                  "flex-1 flex items-center gap-3 min-w-0",
                  isActive ? "text-white" : ""
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-muted-foreground/60")} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-tight truncate">
                    {blockDef?.label || block.type}
                  </div>
                  <div className={cn(
                    "text-[10px] truncate opacity-60 font-medium",
                    isActive ? "text-white" : "text-muted-foreground"
                  )}>
                    {block.content.title || block.content.text || `Block ${index + 1}`}
                  </div>
                </div>
              </button>
            </div>
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
