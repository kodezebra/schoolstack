import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import { Section, Field, ItemAccordion } from '../common'
import { IconPicker } from '../../IconPicker'
import type { NavbarContent } from '../../types'

// Inspector to manage navbar settings
export function NavbarInspector({ 
  content, 
  onUpdateContent, 
  openItem, 
  onToggleItem 
}: { 
  content: NavbarContent, 
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
      <Section title="Logo">
        <Field label="Logo Text">
          <Input value={content.logoText || ''} onChange={(e) => onUpdateContent({ ...content, logoText: e.target.value })} />
        </Field>
        <Field label="Logo Icon">
          <IconPicker 
            value={content.logoIcon} 
            onSelect={(logoIcon) => onUpdateContent({ ...content, logoIcon })} 
          />
        </Field>
      </Section>
      <Section title="Navigation Links">
        <div className="space-y-2">
          {content.links?.map((link: any, i: number) => (
            <ItemAccordion 
              key={i} 
              title={link.label || `Link ${i+1}`} 
              onRemove={() => removeItem('links', i)}
              isOpen={openItem === i}
              onToggle={() => onToggleItem(i)}
            >
              <Field label="Label"><Input value={link.label || ''} onChange={(e) => updateItem('links', i, { label: e.target.value })} /></Field>
              <Field label="Href"><Input value={link.href || ''} onChange={(e) => updateItem('links', i, { href: e.target.value })} /></Field>
            </ItemAccordion>
          ))}
          <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={() => addItem('links', { label: 'New Link', href: '#' })}>
            <Plus className="h-3 w-3" /> Add Link
          </Button>
        </div>
      </Section>
      <Section title="CTA Button">
        <div className="p-3 border rounded-lg bg-muted/20 space-y-3">
          <Field label="Label"><Input value={content.cta?.label || ''} onChange={(e) => onUpdateContent({ ...content, cta: { ...content.cta, label: e.target.value } })} /></Field>
          <Field label="Href"><Input value={content.cta?.href || ''} onChange={(e) => onUpdateContent({ ...content, cta: { ...content.cta, href: e.target.value } })} /></Field>
        </div>
      </Section>
    </>
  )
}
