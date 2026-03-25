import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import {
  Settings2, MousePointer2, Trash2, Copy, AlertCircle
} from 'lucide-react'
import { useState } from 'react'
import type { Block } from './types'

// Modular Inspectors
import { HeroInspector } from './blocks/hero/HeroInspector'
import { FeaturesInspector } from './blocks/features/FeaturesInspector'
import { ContentInspector } from './blocks/content/ContentInspector'
import { StatsInspector } from './blocks/stats/StatsInspector'
import { TeamInspector } from './blocks/team/TeamInspector'
import { TestimonialsInspector } from './blocks/testimonials/TestimonialsInspector'
import { TextInspector } from './blocks/text/TextInspector'
import { CtaInspector } from './blocks/cta/CtaInspector'
import { StepsInspector } from './blocks/steps/StepsInspector'
import { ValuesInspector } from './blocks/values/ValuesInspector'
import { SplitContentInspector } from './blocks/split-content/SplitContentInspector'
import { VideoGalleryInspector } from './blocks/video-gallery/VideoGalleryInspector'
import { FaqInspector } from './blocks/faq/FaqInspector'
import { PricingInspector } from './blocks/pricing/PricingInspector'
import { GalleryInspector } from './blocks/gallery/GalleryInspector'
import { ServicesInspector } from './blocks/services/ServicesInspector'
import { ContactFormInspector } from './blocks/contact-form/ContactFormInspector'
import { MapInspector } from './blocks/map/MapInspector'
import { BannerInspector } from './blocks/banner/BannerInspector'
import { FeesInspector } from './blocks/fees/FeesInspector'

export function EditorInspector({
  selectedBlock,
  onUpdateContent,
  onUpdateStyles,
  onRemoveBlock,
  onDuplicateBlock
}: {
  selectedBlock: Block | null,
  onUpdateContent: (content: any) => void,
  onUpdateStyles: (styles: any) => void,
  onRemoveBlock: (id: string) => void,
  onDuplicateBlock: (id: string) => void
}) {
  const [openItems, setOpenItems] = useState<Record<string, number | null>>({})

  if (!selectedBlock) {
    return (
      <div className="w-full border-l bg-card flex flex-col items-center justify-center text-muted-foreground/30 p-12 text-center h-full">
        <MousePointer2 className="h-10 w-10 mb-4 opacity-5" />
        <p className="text-sm font-medium italic">Select a layer to edit.</p>
      </div>
    )
  }

  // Validation: Check for empty required fields
  const hasEmptyRequired = !(selectedBlock.content as any).title && 
    !(selectedBlock.content as any).text && 
    selectedBlock.type !== 'stats'

  const toggleItem = (index: number) => {
    setOpenItems(prev => ({
      ...prev,
      [selectedBlock.id]: prev[selectedBlock.id] === index ? null : index
    }))
  }

  const content = selectedBlock.content
  const styles = content.styles || { paddingY: 48 }

  const renderInspector = () => {
    const commonProps = {
      content: content as any,
      onUpdateContent,
      openItem: openItems[selectedBlock.id] ?? null,
      onToggleItem: toggleItem
    }

    switch (selectedBlock.type) {
      case 'hero': return <HeroInspector content={content as any} onUpdateContent={onUpdateContent} />
      case 'features': return <FeaturesInspector {...commonProps} />
      case 'content': return <ContentInspector content={content as any} onUpdateContent={onUpdateContent} />
      case 'stats': return <StatsInspector content={content as any} onUpdateContent={onUpdateContent} />
      case 'team': return <TeamInspector {...commonProps} />
      case 'testimonials': return <TestimonialsInspector {...commonProps} />
      case 'cta': return <CtaInspector content={content as any} onUpdateContent={onUpdateContent} />
      case 'steps': return <StepsInspector {...commonProps} />
      case 'values': return <ValuesInspector {...commonProps} />
      case 'splitContent': return <SplitContentInspector content={content as any} onUpdateContent={onUpdateContent} />
      case 'videoGallery': return <VideoGalleryInspector {...commonProps} />
      case 'faq': return <FaqInspector {...commonProps} />
      case 'text': return <TextInspector content={content as any} onUpdateContent={onUpdateContent} />
      case 'pricing': return <PricingInspector {...commonProps} />
      case 'gallery': return <GalleryInspector {...commonProps} />
      case 'services': return <ServicesInspector {...commonProps} />
      case 'contact-form': return <ContactFormInspector {...commonProps} />
      case 'map': return <MapInspector content={content as any} onUpdateContent={onUpdateContent} />
      case 'banner': return <BannerInspector content={content as any} onUpdateContent={onUpdateContent} />
      case 'fees': return <FeesInspector {...commonProps} />
      default: return <div className="p-4 text-xs text-muted-foreground italic">No specialized inspector for this block type.</div>
    }
  }

  return (
    <div className="w-full border-l bg-card flex flex-col h-full shadow-lg font-sans">
      <div className="p-4 border-b flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
           <Settings2 className="h-4 w-4 text-primary" />
           <h2 className="font-bold text-[10px] uppercase tracking-widest">{selectedBlock.type}</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => onDuplicateBlock(selectedBlock.id)}
            title="Duplicate block"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={() => onRemoveBlock(selectedBlock.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Validation Warning */}
      {hasEmptyRequired && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            This block appears to be empty. Add some content to make it visible.
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {renderInspector()}

        {/* --- GLOBAL LAYOUT --- */}
        <div className="pt-8 border-t space-y-6">
           <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Layout</h3>
           <div className="grid gap-5">
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className="text-muted-foreground">Vertical Spacing</span>
                <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full">{styles.paddingY}px</span>
              </div>
              <Slider 
                value={[styles.paddingY || 48]} 
                onValueChange={([val]) => onUpdateStyles({ ...styles, paddingY: val })}
                max={200} 
                step={4} 
                className="py-2" 
              />
           </div>
        </div>
      </div>

      <div className="p-4 border-t bg-muted/10 text-[9px] text-center text-muted-foreground font-medium uppercase tracking-tighter">
        Draft auto-saved
      </div>
    </div>
  )
}