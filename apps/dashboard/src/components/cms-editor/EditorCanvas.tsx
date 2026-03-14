import { Button } from "@/components/ui/button"
import {
  Monitor, Smartphone, Tablet, Plus, PanelLeft, PanelRight,
  Copy, Trash2
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import type { Block } from './types'

// Block Components
import { NavbarBlock } from './blocks/navbar/NavbarBlock'
import { HeroBlock } from './blocks/hero/HeroBlock'
import { FeaturesBlock } from './blocks/features/FeaturesBlock'
import { ContentBlock } from './blocks/content/ContentBlock'
import { StatsBlock } from './blocks/stats/StatsBlock'
import { TeamBlock } from './blocks/team/TeamBlock'
import { TestimonialsBlock } from './blocks/testimonials/TestimonialsBlock'
import { FooterBlock } from './blocks/footer/FooterBlock'
import { TextBlock } from './blocks/text/TextBlock'
import { CtaBlock } from './blocks/cta/CtaBlock'
import { StepsBlock } from './blocks/steps/StepsBlock'
import { ValuesBlock } from './blocks/values/ValuesBlock'
import { SplitContentBlock } from './blocks/split-content/SplitContentBlock'
import { VideoGalleryBlock } from './blocks/video-gallery/VideoGalleryBlock'
import { FaqBlock } from './blocks/faq/FaqBlock'
import { PricingBlock } from './blocks/pricing/PricingBlock'
import { GalleryBlock } from './blocks/gallery/GalleryBlock'
import { ServicesBlock } from './blocks/services/ServicesBlock'
import { ContactFormBlock } from './blocks/contact-form/ContactFormBlock'

export function EditorCanvas({
  blocks,
  onSelectBlock,
  selectedBlockId,
  onToggleLeft,
  onToggleRight,
  leftOpen,
  rightOpen,
  onDuplicateBlock,
  onRemoveBlock
}: {
  blocks: Block[],
  onSelectBlock: (id: string) => void,
  selectedBlockId: string | null,
  onToggleLeft: () => void,
  onToggleRight: () => void,
  leftOpen: boolean,
  rightOpen: boolean,
  onDuplicateBlock: (id: string) => void,
  onRemoveBlock: (id: string) => void
}) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const blockRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  useEffect(() => {
    if (selectedBlockId && blockRefs.current[selectedBlockId]) {
      blockRefs.current[selectedBlockId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [selectedBlockId])

  const containerWidths = {
    desktop: 'w-full max-w-[1200px]',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]'
  }

  const renderBlock = (block: Block) => {
    switch (block.type) {
      case 'navbar': return <NavbarBlock content={block.content as any} />
      case 'hero': return <HeroBlock content={block.content as any} />
      case 'features': return <FeaturesBlock content={block.content as any} />
      case 'content': return <ContentBlock content={block.content as any} />
      case 'stats': return <StatsBlock content={block.content as any} />
      case 'team': return <TeamBlock content={block.content as any} />
      case 'testimonials': return <TestimonialsBlock content={block.content as any} />
      case 'footer': return <FooterBlock content={block.content as any} />
      case 'cta': return <CtaBlock content={block.content as any} />
      case 'steps': return <StepsBlock content={block.content as any} />
      case 'values': return <ValuesBlock content={block.content as any} />
      case 'splitContent': return <SplitContentBlock content={block.content as any} />
      case 'videoGallery': return <VideoGalleryBlock content={block.content as any} />
      case 'faq': return <FaqBlock content={block.content as any} />
      case 'text': return <TextBlock content={block.content as any} />
      case 'pricing': return <PricingBlock content={block.content as any} />
      case 'gallery': return <GalleryBlock content={block.content as any} />
      case 'services': return <ServicesBlock content={block.content as any} />
      case 'contact-form': return <ContactFormBlock content={block.content as any} />
      default:
        return (
          <div className="px-12 py-16 border-2 border-dashed rounded-2xl m-6 text-center bg-muted/30 border-muted-foreground/10">
            <div className="h-12 w-12 rounded-full bg-background border shadow-sm flex items-center justify-center mx-auto mb-4">
              <Plus className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">
              {(block as any).type} Component
            </div>
            <div className="text-xs text-muted-foreground/60 max-w-[200px] mx-auto italic">
              This component is currently being updated or is not yet available in the preview canvas.
            </div>
          </div>
        )
    }
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
            const styles = (block.content as any).styles || {}
            const paddingY = styles.paddingY !== undefined ? `${styles.paddingY}px` : '48px'

            return (
              <div
                key={block.id}
                ref={(el) => { blockRefs.current[block.id] = el }}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectBlock(block.id)
                }}
                style={{ paddingTop: paddingY, paddingBottom: paddingY }}
                className={cn(
                  "relative transition-all group/block",
                  isSelected ? "ring-2 ring-primary ring-inset z-10" : "hover:bg-slate-50/50"
                )}
              >
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
                  {renderBlock(block)}
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
