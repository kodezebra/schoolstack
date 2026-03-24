import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icon } from '@iconify/react'
import { Section, Field, ItemAccordion } from '../common'
import { MediaPicker } from '../../MediaPicker'

export function TeamInspector({ 
  content, 
  onUpdateContent, 
  openItem, 
  onToggleItem 
}: { 
  content: any, 
  onUpdateContent: (c: any) => void,
  openItem: number | null,
  onToggleItem: (i: number) => void
}) {
  const updateItem = (key: string, index: number, value: any) => {
    const newItems = [...(content[key] || [])]
    newItems[index] = { ...newItems[index], ...value }
    onUpdateContent({ ...content, [key]: newItems })
  }

  const addItem = (key: string, defaultValue: any) => {
    const newItems = [...(content[key] || []), defaultValue]
    onUpdateContent({ ...content, [key]: newItems })
    onToggleItem(newItems.length - 1)
  }

  const removeItem = (key: string, index: number) => {
    const newItems = content[key].filter((_: any, i: number) => i !== index)
    onUpdateContent({ ...content, [key]: newItems })
  }

  return (
    <>
      <Section title="Header">
        <Field label="Tagline"><Input value={content.tagline || ''} onChange={(e) => onUpdateContent({ ...content, tagline: e.target.value })} /></Field>
        <Field label="Title"><Input value={content.title || ''} onChange={(e) => onUpdateContent({ ...content, title: e.target.value })} /></Field>
      </Section>
      <Section title="Members">
        <div className="space-y-2">
          {content.members?.map((m: any, i: number) => (
            <ItemAccordion key={i} title={m.name || `Member ${i+1}`} onRemove={() => removeItem('members', i)} isOpen={openItem === i} onToggle={() => onToggleItem(i)}>
              <Field label="Name"><Input value={m.name || ''} onChange={(e) => updateItem('members', i, { name: e.target.value })} /></Field>
              <Field label="Role"><Input value={m.role || ''} onChange={(e) => updateItem('members', i, { role: e.target.value })} /></Field>
              <Field label="Photo URL">
                <div className="flex items-center gap-2">
                  <Input value={m.image || ''} onChange={(e) => updateItem('members', i, { image: e.target.value })} className="flex-1" />
                  <MediaPicker onSelect={(url) => updateItem('members', i, { image: url })} trigger={<Button variant="outline" size="icon"><Icon icon="ph:image-plus-fill" className="h-4 w-4" /></Button>} />
                </div>
              </Field>
            </ItemAccordion>
          ))}
          <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={() => addItem('members', { name: 'Member Name', role: 'Role', image: '' })}>
            <Icon icon="ph:plus-fill" className="h-3 w-3" /> Add Member
          </Button>
        </div>
      </Section>
    </>
  )
}
