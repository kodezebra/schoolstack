import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icon } from '@iconify/react'
import { Section, Field } from '../common'
import { MediaPicker } from '../../MediaPicker'
import { IconPicker } from '../../IconPicker'

// Inspector to customize split content and checklist features
export function ContentInspector({ content, onUpdateContent }: { content: any, onUpdateContent: (c: any) => void }) {
  return (
    <>
      <Section title="Text Content">
        <Field label="Title"><Input value={content.title || ''} onChange={(e) => onUpdateContent({ ...content, title: e.target.value })} /></Field>
        <Field label="Paragraph 1"><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={content.text1 || ''} onChange={(e) => onUpdateContent({ ...content, text1: e.target.value })} /></Field>
        <Field label="Paragraph 2"><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={content.text2 || ''} onChange={(e) => onUpdateContent({ ...content, text2: e.target.value })} /></Field>
      </Section>
      <Section title="Checklist Features">
        <div className="space-y-4">
          <Field label="Checklist Icon">
            <IconPicker
              value={content.featureIcon}
              onSelect={(featureIcon) => onUpdateContent({ ...content, featureIcon })}
            />
          </Field>
          <div className="space-y-2">
            {content.features?.map((f: string, i: number) => (
            <div key={i} className="flex gap-2">
              <Input value={f} onChange={(e) => {
                const newFeatures = [...content.features]
                newFeatures[i] = e.target.value
                onUpdateContent({ ...content, features: newFeatures })
              }} />
              <Button variant="ghost" size="icon" onClick={() => onUpdateContent({ ...content, features: content.features.filter((_: any, idx: number) => idx !== i) })}>
                <Icon icon="ph:x-fill" className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={() => onUpdateContent({ ...content, features: [...(content.features || []), 'New Checklist Item'] })}>
            <Icon icon="ph:plus-fill" className="h-3 w-3" /> Add Item
          </Button>
        </div>
      </div>
    </Section>
      <Section title="Image">
        <div className="flex items-center gap-2">
          <Input value={content.image || ''} onChange={(e) => onUpdateContent({ ...content, image: e.target.value })} className="flex-1" />
          <MediaPicker onSelect={(url) => onUpdateContent({ ...content, image: url })} trigger={<Button variant="outline" size="icon"><Icon icon="ph:image-plus-fill" className="h-4 w-4" /></Button>} />
        </div>
      </Section>
      <Section title="CTA Button">
        <div className="p-3 border rounded-lg bg-muted/20 space-y-3">
          <Field label="Label"><Input value={content.cta?.label || ''} onChange={(e) => onUpdateContent({ ...content, cta: { ...content.cta, label: e.target.value } })} /></Field>
          <Field label="Href"><Input value={content.cta?.href || ''} onChange={(e) => onUpdateContent({ ...content, cta: { ...content.cta, href: e.target.value } })} placeholder="/contact" /></Field>
        </div>
      </Section>
    </>
  )
}
