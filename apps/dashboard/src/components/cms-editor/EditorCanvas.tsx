import { Button } from "@/components/ui/button"
import * as LucideIcons from 'lucide-react'
import {
  Monitor, Smartphone, Tablet, Plus, PanelLeft, PanelRight,
  Image as ImageIcon, Users,
  MessageSquare, PanelBottom, Globe, Mail, Share2,
  GripVertical, Copy, Trash2
} from 'lucide-react'
import { useState } from 'react'
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function EditorCanvas({
  blocks,
  onSelectBlock,
  selectedBlockId,
  onToggleLeft,
  onToggleRight,
  leftOpen,
  rightOpen,
  onDuplicateBlock,
  onRemoveBlock,
  onMoveBlock
}: {
  blocks: any[],
  onSelectBlock: (id: string) => void,
  selectedBlockId: string | null,
  onToggleLeft: () => void,
  onToggleRight: () => void,
  leftOpen: boolean,
  rightOpen: boolean,
  onDuplicateBlock: (id: string) => void,
  onRemoveBlock: (id: string) => void,
  onMoveBlock: (fromIndex: number, toIndex: number) => void
}) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const containerWidths = {
    desktop: 'w-full max-w-[1200px]',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]'
  }

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

  const renderDynamicIcon = (name: string, className?: string) => {
    if (!name) return null
    const pascalName = name
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') as keyof typeof LucideIcons
    
    const IconComponent = (LucideIcons[pascalName] as any)
    if (!IconComponent) return null
    return <IconComponent className={className} />
  }

  return (
    <TooltipProvider>
      <div className="flex-1 bg-muted/20 h-full flex flex-col items-center overflow-y-auto overflow-x-hidden relative group/canvas">
        {/* Enhanced Canvas Toolbar */}
        <div className="flex items-center justify-between w-full px-4 py-2 sticky top-0 z-50 bg-background/50 backdrop-blur-sm border-b mb-8 shrink-0">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8", leftOpen ? "text-primary bg-primary/10" : "text-muted-foreground")}
                  onClick={onToggleLeft}
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{leftOpen ? 'Hide' : 'Show'} Layers</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-1 bg-background p-1 rounded-full border shadow-sm">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={device === 'desktop' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7 rounded-full" onClick={() => setDevice('desktop')}>
                  <Monitor className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Desktop View</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={device === 'tablet' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7 rounded-full" onClick={() => setDevice('tablet')}>
                  <Tablet className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Tablet View</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={device === 'mobile' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7 rounded-full" onClick={() => setDevice('mobile')}>
                  <Smartphone className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Mobile View</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8", rightOpen ? "text-primary bg-primary/10" : "text-muted-foreground")}
                  onClick={onToggleRight}
                >
                  <PanelRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{rightOpen ? 'Hide' : 'Show'} Inspector</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* The Stage */}
        <div className={cn(
          "bg-white shadow-xl min-h-[calc(100vh-120px)] transition-all duration-300 relative rounded-sm border mb-20",
          containerWidths[device]
        )}>
          {blocks.map((block) => {
            const isSelected = selectedBlockId === block.id
            const styles = block.content.styles || {}
            const paddingY = styles.paddingY !== undefined ? `${styles.paddingY}px` : '48px'
            
            return (
              <div
                key={block.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectBlock(block.id)
                }}
                style={{ paddingTop: paddingY, paddingBottom: paddingY }}
                className={cn(
                  "relative transition-all group/block",
                  isSelected ? "ring-2 ring-primary ring-inset z-10" : "hover:bg-slate-50/50",
                  draggedIndex === index ? "opacity-50" : ""
                )}
              >
                {/* Drag Handle & Actions */}
                <div className="absolute -left-3 top-2 opacity-0 group-hover/block:opacity-100 transition-opacity flex flex-col gap-1 z-20">
                  <button
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    className="h-6 w-6 rounded bg-background border shadow-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary cursor-grab active:cursor-grabbing"
                    title="Drag to reorder"
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                {/* Block Actions */}
                <div className="absolute -right-2 top-2 opacity-0 group-hover/block:opacity-100 transition-opacity flex items-center gap-1 z-20">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 bg-background border shadow-sm hover:border-primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDuplicateBlock(block.id)
                    }}
                    title="Duplicate block"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 bg-background border shadow-sm hover:border-destructive text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveBlock(block.id)
                    }}
                    title="Delete block"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {/* Render Block Content */}
                <div className="group/block relative">
                  {block.type === 'navbar' && (
                    <div className="border-b px-8 py-4 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                      <div className="flex items-center gap-2 font-bold text-xl">
                        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white">
                          {renderDynamicIcon(block.content.logoIcon || 'layout', 'h-5 w-5')}
                        </div>
                        {block.content.logoText}
                      </div>
                      <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        {block.content.links?.map((l: any) => <span key={l.label}>{l.label}</span>)}
                        <div className="bg-primary text-white px-4 py-1.5 rounded-full text-xs font-bold">
                          {block.content.cta?.label}
                        </div>
                      </div>
                    </div>
                  )}

                  {block.type === 'hero' && (
                    <div 
                      className="text-center py-20 px-12 space-y-6 border-y relative overflow-hidden bg-slate-900 text-white"
                      style={block.content.image ? { 
                        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.9)), url('${block.content.image}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      } : {}}
                    >
                      {!block.content.image && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10"></div>}
                      <h1 className="text-6xl font-black tracking-tight leading-[1.1]">
                        {block.content.title}
                      </h1>
                      <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        {block.content.subtitle}
                      </p>
                      <div className="flex justify-center gap-4 pt-4">
                        <div className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20">
                          {block.content.primaryCta?.label}
                        </div>
                        <div className="bg-white border border-slate-200 px-8 py-4 rounded-2xl font-bold">
                          {block.content.secondaryCta?.label}
                        </div>
                      </div>
                    </div>
                  )}

                  {block.type === 'features' && (
                    <div className="py-16 px-12">
                      <div className="text-center mb-16">
                        <div className="text-primary font-bold text-xs uppercase tracking-widest mb-2">{block.content.tagline}</div>
                        <h2 className="text-4xl font-black text-slate-900">{block.content.title}</h2>
                      </div>
                      <div className="grid grid-cols-3 gap-8">
                        {block.content.items?.map((item: any, i: number) => (
                          <div key={i} className="p-8 rounded-3xl border bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                              {renderDynamicIcon(item.icon || 'zap', 'h-6 w-6')}
                            </div>
                            <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{item.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {block.type === 'content' && (
                    <div className="py-20 px-12 flex items-center gap-16 bg-white">
                      <div className="flex-1 aspect-square bg-slate-100 rounded-[2.5rem] border-8 border-white shadow-2xl relative overflow-hidden group/img">
                        {block.content.image ? (
                          <img src={block.content.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon className="h-20 w-20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
                      </div>
                      <div className="flex-1 space-y-6 text-left">
                        <h2 className="text-4xl font-black text-slate-900">{block.content.title}</h2>
                        <p className="text-slate-600 leading-relaxed">{block.content.text1}</p>
                        <p className="text-slate-500 text-sm leading-relaxed">{block.content.text2}</p>
                        <div className="grid grid-cols-2 gap-3 pt-4">
                          {block.content.features?.map((f: string) => (
                            <div key={f} className="flex items-center gap-2 font-bold text-[11px] text-slate-700">
                              {renderDynamicIcon(block.content.featureIcon || 'check-circle', 'h-4 w-4 text-primary')}
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {block.type === 'stats' && (
                    <div className="py-16 px-12 bg-primary text-white mx-8 rounded-3xl grid grid-cols-4 gap-8 text-center shadow-xl shadow-primary/20">
                      {block.content.items?.map((item: any, i: number) => (
                        <div key={i}>
                          <div className="text-3xl font-black mb-1">{item.value}</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {block.type === 'team' && (
                    <div className="py-20 px-12 bg-white">
                      <div className="text-center mb-16">
                        <div className="text-primary font-bold text-xs uppercase tracking-widest mb-2">{block.content.tagline}</div>
                        <h2 className="text-4xl font-black text-slate-900">{block.content.title}</h2>
                      </div>
                      <div className="grid grid-cols-4 gap-6">
                        {block.content.members?.map((member: any, i: number) => (
                          <div key={i} className="text-center group/member">
                            <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden mb-4 border-4 border-transparent group-hover/member:border-primary/20 transition-all">
                              {member.image ? (
                                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <Users className="h-10 w-10" />
                                </div>
                              )}
                            </div>
                            <div className="font-bold text-sm text-slate-900">{member.name}</div>
                            <div className="text-[10px] font-bold text-primary uppercase">{member.role}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {block.type === 'testimonials' && (
                    <div className="py-20 px-12 bg-slate-50/50">
                      <div className="text-center mb-16">
                        <div className="text-accent font-bold text-xs uppercase tracking-widest mb-2">{block.content.tagline}</div>
                        <h2 className="text-4xl font-black text-slate-900">{block.content.title}</h2>
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        {block.content.items?.map((item: any, i: number) => (
                          <div key={i} className="p-8 rounded-3xl border bg-white shadow-sm space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden shrink-0">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <MessageSquare className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-xs truncate">{item.name}</div>
                                <div className="text-[10px] text-muted-foreground truncate">{item.role}</div>
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed italic">"{item.text}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {block.type === 'footer' && (
                    <footer className="py-16 px-12 bg-slate-950 text-white rounded-b-lg">
                      <div className="grid grid-cols-12 gap-12">
                        <div className="col-span-5 space-y-6">
                          <div className="flex items-center gap-2 font-bold text-xl">
                            <PanelBottom className="h-6 w-6 text-primary" />
                            {block.content.logoText}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed max-w-xs">{block.content.description}</p>
                          <div className="flex gap-3">
                            {[Globe, Mail, Share2].map((Icon, i) => (
                              <div key={i} className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                                <Icon className="h-4 w-4" />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="col-span-7 grid grid-cols-3 gap-8">
                          {['Product', 'Company', 'Legal'].map((title) => (
                            <div key={title} className="space-y-4">
                              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{title}</div>
                              <div className="space-y-2">
                                {[1,2,3].map(i => <div key={i} className="text-[11px] text-slate-400">Link {i}</div>)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-16 pt-8 border-t border-slate-900 text-center text-[10px] text-slate-600 uppercase tracking-widest">
                        © {new Date().getFullYear()} {block.content.logoText}. All rights reserved.
                      </div>
                    </footer>
                  )}

                  {(!block.type || block.type === 'text') && (
                    <div className="px-12 py-8">
                      <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap italic opacity-50">
                        {block.content.text || 'Standard text block...'}
                      </p>
                    </div>
                  )}
                  
                  {/* Generic Placeholder for other types */}
                  {!['navbar', 'hero', 'features', 'content', 'stats', 'cta', 'text'].includes(block.type) && (
                    <div className="px-12 py-12 border-2 border-dashed rounded-xl m-4 text-center bg-muted/30">
                      <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        {block.type} Block
                      </div>
                      <div className="text-xs text-muted-foreground opacity-60 italic">
                        (Preview rendering in progress)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {blocks.length === 0 && (
            <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground/30 p-20 text-center italic">
              <Plus className="h-12 w-12 mb-4 opacity-10" />
              <p className="text-xl">Your canvas is empty.</p>
              <p className="text-sm">Select a block from the left sidebar to start building.</p>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}