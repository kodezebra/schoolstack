import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ImagePlus } from 'lucide-react'
import { Section, Field } from '../common'
import { MediaPicker } from '../../MediaPicker'

// Inspector for editing hero section content
export function HeroInspector({ content, onUpdateContent }: { content: any, onUpdateContent: (c: any) => void }) {
  return (
    <>
      <Section title="Text Content">
        <Field label="Headline"><Input value={content.title || ''} onChange={(e) => onUpdateContent({ ...content, title: e.target.value })} /></Field>
        <Field label="Subtitle"><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={content.subtitle || ''} onChange={(e) => onUpdateContent({ ...content, subtitle: e.target.value })} /></Field>
      </Section>
      <Section title="Background Image">
        <div className="flex items-center gap-2">
          <Input value={content.image || ''} onChange={(e) => onUpdateContent({ ...content, image: e.target.value })} className="flex-1" />
          <MediaPicker onSelect={(url) => onUpdateContent({ ...content, image: url })} trigger={<Button variant="outline" size="icon"><ImagePlus className="h-4 w-4" /></Button>} />
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
