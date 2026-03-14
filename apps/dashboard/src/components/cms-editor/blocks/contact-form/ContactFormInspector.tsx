import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from 'lucide-react'
import { Section, Field } from '../common'
import { Switch } from "@/components/ui/switch"

export function ContactFormInspector({
  content,
  onUpdateContent,
}: {
  content: any,
  onUpdateContent: (c: any) => void,
}) {
  const updateContactInfo = (key: string, value: string) => {
    const newContactInfo = { ...(content.contactInfo || {}), [key]: value }
    onUpdateContent({ ...content, contactInfo: newContactInfo })
  }

  const addField = () => {
    const newField = {
      name: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false,
      placeholder: '',
    }
    const newFields = [...(content.fields || []), newField]
    onUpdateContent({ ...content, fields: newFields })
  }

  const updateField = (index: number, value: any) => {
    const newFields = [...content.fields]
    newFields[index] = { ...newFields[index], ...value }
    onUpdateContent({ ...content, fields: newFields })
  }

  const removeField = (index: number) => {
    const newFields = content.fields.filter((_: any, i: number) => i !== index)
    onUpdateContent({ ...content, fields: newFields })
  }

  return (
    <>
      <Section title="Header Content">
        <Field label="Tagline"><Input value={content.tagline || ''} onChange={(e) => onUpdateContent({ ...content, tagline: e.target.value })} /></Field>
        <Field label="Title"><Input value={content.title || ''} onChange={(e) => onUpdateContent({ ...content, title: e.target.value })} /></Field>
        <Field label="Subtitle"><textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={content.subtitle || ''} onChange={(e) => onUpdateContent({ ...content, subtitle: e.target.value })} /></Field>
        <Field label="Submit Button Label"><Input value={content.submitLabel || ''} onChange={(e) => onUpdateContent({ ...content, submitLabel: e.target.value })} /></Field>
        <Field label="Success Message"><Input value={content.successMessage || ''} onChange={(e) => onUpdateContent({ ...content, successMessage: e.target.value })} /></Field>
        <Field label="Submit To (URL)"><Input value={content.submitTo || ''} onChange={(e) => onUpdateContent({ ...content, submitTo: e.target.value })} /></Field>
      </Section>
      <Section title="Contact Information">
        <Field label="Address"><Input value={content.contactInfo?.address || ''} onChange={(e) => updateContactInfo('address', e.target.value)} /></Field>
        <Field label="Email"><Input value={content.contactInfo?.email || ''} onChange={(e) => updateContactInfo('email', e.target.value)} /></Field>
        <Field label="Phone"><Input value={content.contactInfo?.phone || ''} onChange={(e) => updateContactInfo('phone', e.target.value)} /></Field>
      </Section>
      <Section title="Form Fields">
        <div className="space-y-3">
          {content.fields?.map((field: any, i: number) => (
            <div key={i} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{field.label || `Field ${i + 1}`}</span>
                <Button variant="ghost" size="icon" onClick={() => removeField(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Field label="Label"><Input value={field.label || ''} onChange={(e) => updateField(i, { label: e.target.value })} /></Field>
              <Field label="Field Name"><Input value={field.name || ''} onChange={(e) => updateField(i, { name: e.target.value })} /></Field>
              <Field label="Type">
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={field.type || 'text'}
                  onChange={(e) => updateField(i, { type: e.target.value })}
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="tel">Phone</option>
                  <option value="url">URL</option>
                  <option value="select">Select</option>
                  <option value="textarea">Textarea</option>
                </select>
              </Field>
              <Field label="Placeholder"><Input value={field.placeholder || ''} onChange={(e) => updateField(i, { placeholder: e.target.value })} /></Field>
              {field.type === 'select' && (
                <Field label="Options (comma separated)">
                  <Input value={field.options?.join(', ') || ''} onChange={(e) => updateField(i, { options: e.target.value.split(',').map((s: string) => s.trim()) })} />
                </Field>
              )}
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Required</label>
                <Switch
                  checked={field.required || false}
                  onCheckedChange={(checked) => updateField(i, { required: checked })}
                />
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={addField}>
            <Plus className="h-3 w-3" /> Add Field
          </Button>
        </div>
      </Section>
    </>
  )
}
