import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icon } from '@iconify/react'
import { Section, Field } from '../common'
import { MediaPicker } from '../../MediaPicker'
import { IconPicker } from '../../IconPicker'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Inspector for editing hero section content
export function HeroInspector({ content, onUpdateContent }: { content: any, onUpdateContent: (c: any) => void }) {
  return (
    <>
      <Section title="Text Content">
        <div className="space-y-4">
          <Field label="Badge Text">
            <Input value={content.badge || ''} onChange={(e) => onUpdateContent({ ...content, badge: e.target.value })} placeholder="e.g. NEW FEATURE" />
          </Field>
          
          <div className="space-y-3 mb-2">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Badge Style</Label>
            <RadioGroup 
              value={content.badgeVariant || 'accent'} 
              onValueChange={(val) => onUpdateContent({ ...content, badgeVariant: val })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="accent" id="b-accent" />
                <Label htmlFor="b-accent" className="text-xs">Accent (Official)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="glass" id="b-glass" />
                <Label htmlFor="b-glass" className="text-xs">Glass (Secondary)</Label>
              </div>
            </RadioGroup>
          </div>

          <Field label="Badge Icon">
            <IconPicker value={content.badgeIcon} onSelect={(icon) => onUpdateContent({ ...content, badgeIcon: icon })} />
          </Field>
        </div>
        <Field label="Headline"><Input value={content.title || ''} onChange={(e) => onUpdateContent({ ...content, title: e.target.value })} /></Field>
        <Field label="Subtitle"><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={content.subtitle || ''} onChange={(e) => onUpdateContent({ ...content, subtitle: e.target.value })} /></Field>
      </Section>
      <Section title="Background Image">
        <div className="flex items-center gap-2">
          <Input value={content.image || ''} onChange={(e) => onUpdateContent({ ...content, image: e.target.value })} className="flex-1" />
          <MediaPicker onSelect={(url) => onUpdateContent({ ...content, image: url })} trigger={<Button variant="outline" size="icon"><Icon icon="ph:image-plus-fill" className="h-4 w-4" /></Button>} />
        </div>
      </Section>
      <Section title="Primary Button">
        <div className="p-3 border rounded-lg bg-muted/20 space-y-3">
          <Field label="Label"><Input value={content.primaryCta?.label || ''} onChange={(e) => onUpdateContent({ ...content, primaryCta: { ...content.primaryCta, label: e.target.value } })} /></Field>
          <Field label="Href"><Input value={content.primaryCta?.href || ''} onChange={(e) => onUpdateContent({ ...content, primaryCta: { ...content.primaryCta, href: e.target.value } })} /></Field>
        </div>
      </Section>
      <Section title="Secondary Button">
        <div className="p-3 border rounded-lg bg-muted/20 space-y-3">
          <Field label="Label"><Input value={content.secondaryCta?.label || ''} onChange={(e) => onUpdateContent({ ...content, secondaryCta: { ...content.secondaryCta, label: e.target.value } })} /></Field>
          <Field label="Href"><Input value={content.secondaryCta?.href || ''} onChange={(e) => onUpdateContent({ ...content, secondaryCta: { ...content.secondaryCta, href: e.target.value } })} /></Field>
        </div>
      </Section>
    </>
  )
}
