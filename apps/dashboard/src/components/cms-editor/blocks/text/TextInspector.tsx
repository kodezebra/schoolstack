import { Section, Field } from '../common'

export function TextInspector({ content, onUpdateContent }: { content: any, onUpdateContent: (c: any) => void }) {
  return (
    <Section title="Content">
      <Field label="Body Text">
        <textarea
          className="flex min-h-[160px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm"
          value={content.text || ''}
          onChange={(e) => onUpdateContent({ ...content, text: e.target.value })}
        />
      </Field>
    </Section>
  )
}
