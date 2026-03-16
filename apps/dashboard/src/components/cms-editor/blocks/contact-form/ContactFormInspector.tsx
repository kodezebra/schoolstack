import { Input } from "@/components/ui/input"
import { Section, Field } from '../common'

export function ContactFormInspector({
  content,
  onUpdateContent,
}: {
  content: any,
  onUpdateContent: (c: any) => void,
}) {
  return (
    <>
      <Section title="Header">
        <Field label="Tagline"><Input value={content.tagline || ''} onChange={(e) => onUpdateContent({ ...content, tagline: e.target.value })} /></Field>
        <Field label="Title"><Input value={content.title || ''} onChange={(e) => onUpdateContent({ ...content, title: e.target.value })} /></Field>
        <Field label="Subtitle"><textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={content.subtitle || ''} onChange={(e) => onUpdateContent({ ...content, subtitle: e.target.value })} /></Field>
      </Section>
    </>
  )
}
