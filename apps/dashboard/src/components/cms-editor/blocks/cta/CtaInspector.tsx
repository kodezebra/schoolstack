import { Input } from "@/components/ui/input"
import { Section, Field } from '../common'

export function CtaInspector({ content, onUpdateContent }: { content: any, onUpdateContent: (c: any) => void }) {
  return (
    <>
      <Section title="Text Content">
        <Field label="Title"><Input value={content.title || ''} onChange={(e) => onUpdateContent({ ...content, title: e.target.value })} /></Field>
        <Field label="Subtitle"><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={content.subtitle || ''} onChange={(e) => onUpdateContent({ ...content, subtitle: e.target.value })} /></Field>
      </Section>
      <Section title="Button">
        <div className="p-3 border rounded-lg bg-muted/20 space-y-3">
          <Field label="Label"><Input value={content.ctaLabel || ''} onChange={(e) => onUpdateContent({ ...content, ctaLabel: e.target.value })} /></Field>
          <Field label="Href"><Input value={content.ctaHref || ''} onChange={(e) => onUpdateContent({ ...content, ctaHref: e.target.value })} placeholder="/contact" /></Field>
        </div>
      </Section>
    </>
  )
}
