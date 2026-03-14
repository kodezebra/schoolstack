import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import { Section, Field, ItemAccordion } from '../common'
import { IconPicker } from '../../IconPicker'

export function ServicesInspector({
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
  const updateItem = (index: number, value: any) => {
    const newItems = [...content.items]
    newItems[index] = { ...newItems[index], ...value }
    onUpdateContent({ ...content, items: newItems })
  }

  const addItem = () => {
    const newItem = {
      icon: 'zap',
      title: 'New Service',
      description: 'Service description',
      link: '',
      bgClass: 'bg-primary/10',
      iconClass: 'text-primary',
    }
    const newItems = [...(content.items || []), newItem]
    onUpdateContent({ ...content, items: newItems })
    onToggleItem(newItems.length - 1)
  }

  const removeItem = (index: number) => {
    const newItems = content.items.filter((_: any, i: number) => i !== index)
    onUpdateContent({ ...content, items: newItems })
  }

  return (
    <>
      <Section title="Header Content">
        <Field label="Tagline"><Input value={content.tagline || ''} onChange={(e) => onUpdateContent({ ...content, tagline: e.target.value })} /></Field>
        <Field label="Title"><Input value={content.title || ''} onChange={(e) => onUpdateContent({ ...content, title: e.target.value })} /></Field>
        <Field label="Subtitle"><textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={content.subtitle || ''} onChange={(e) => onUpdateContent({ ...content, subtitle: e.target.value })} /></Field>
        <Field label="Layout">
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            value={content.layout || 'grid'}
            onChange={(e) => onUpdateContent({ ...content, layout: e.target.value })}
          >
            <option value="grid">Grid (3 columns)</option>
            <option value="list">List (vertical)</option>
          </select>
        </Field>
      </Section>
      <Section title="Service Items">
        <div className="space-y-2">
          {content.items?.map((item: any, i: number) => (
            <ItemAccordion
              key={i}
              title={item.title || `Service ${i + 1}`}
              onRemove={() => removeItem(i)}
              isOpen={openItem === i}
              onToggle={() => onToggleItem(i)}
            >
              <div className="space-y-3">
                <Field label="Icon">
                  <IconPicker
                    value={item.icon}
                    onSelect={(icon) => updateItem(i, { icon })}
                  />
                </Field>
                <Field label="Title"><Input value={item.title || ''} onChange={(e) => updateItem(i, { title: e.target.value })} /></Field>
                <Field label="Description"><textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={item.description || ''} onChange={(e) => updateItem(i, { description: e.target.value })} /></Field>
                <Field label="Link URL"><Input value={item.link || ''} onChange={(e) => updateItem(i, { link: e.target.value })} /></Field>
              </div>
            </ItemAccordion>
          ))}
          <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={addItem}>
            <Plus className="h-3 w-3" /> Add Service
          </Button>
        </div>
      </Section>
    </>
  )
}
