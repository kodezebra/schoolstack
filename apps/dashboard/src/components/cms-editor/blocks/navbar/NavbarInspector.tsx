import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { Section, Field, ItemAccordion } from '../common'
import { IconPicker } from '../../IconPicker'
import type { NavbarContent, NavbarLink } from '../../types'

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

  const addChildItem = (parentIndex: number) => {
    const link = content.links[parentIndex]
    const children = [...(link.children || []), { label: 'Child Link', href: '#' }]
    updateItem('links', parentIndex, { children })
  }

  const updateChildItem = (parentIndex: number, childIndex: number, value: any) => {
    const link = content.links[parentIndex]
    const children = [...(link.children || [])]
    children[childIndex] = { ...children[childIndex], ...value }
    updateItem('links', parentIndex, { children })
  }

  const removeChildItem = (parentIndex: number, childIndex: number) => {
    const link = content.links[parentIndex]
    const children = (link.children || []).filter((_: any, i: number) => i !== childIndex)
    updateItem('links', parentIndex, { children: children.length > 0 ? children : undefined })
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
          {content.links?.map((link: NavbarLink, i: number) => (
            <ItemAccordion 
              key={i} 
              title={link.label || `Link ${i+1}`}
              onRemove={() => removeItem('links', i)}
              isOpen={openItem === i}
              onToggle={() => onToggleItem(i)}
            >
              <Field label="Label"><Input value={link.label || ''} onChange={(e) => updateItem('links', i, { label: e.target.value })} /></Field>
              <Field label="Href"><Input value={link.href || ''} onChange={(e) => updateItem('links', i, { href: e.target.value })} /></Field>
              
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <ChevronDown className="w-4 h-4" /> Dropdown Items
                  </span>
                </div>
                {link.children?.map((child: any, j: number) => (
                  <div key={j} className="flex items-center gap-2 ml-2 pl-2 border-l-2 border-slate-200 dark:border-slate-700">
                    <Input 
                      value={child.label || ''} 
                      onChange={(e) => updateChildItem(i, j, { label: e.target.value })}
                      placeholder="Child label"
                      className="h-8 text-sm"
                    />
                    <Input 
                      value={child.href || ''} 
                      onChange={(e) => updateChildItem(i, j, { href: e.target.value })}
                      placeholder="/child"
                      className="h-8 text-sm"
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => removeChildItem(i, j)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full gap-2 mt-2" onClick={() => addChildItem(i)}>
                  <Plus className="h-3 w-3" /> Add Dropdown Item
                </Button>
              </div>
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
