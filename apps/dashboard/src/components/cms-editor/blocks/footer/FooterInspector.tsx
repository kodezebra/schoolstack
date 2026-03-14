import { Input } from "@/components/ui/input"
import { Section, Field } from '../common'

export function FooterInspector({ content, onUpdateContent }: { content: any, onUpdateContent: (c: any) => void }) {
  return (
    <>
      <Section title="Brand Info">
        <Field label="Logo Text">
          <Input value={content.logoText || ''} onChange={(e) => onUpdateContent({ ...content, logoText: e.target.value })} />
        </Field>
        <Field label="Description">
          <textarea 
            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" 
            value={content.description || ''} 
            onChange={(e) => onUpdateContent({ ...content, description: e.target.value })} 
          />
        </Field>
      </Section>
    </>
  )
}
