import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icon } from '@iconify/react'
import { Section, Field, ItemAccordion } from '../common'
import { IconPicker } from '../../IconPicker'
import { MediaPicker } from '../../MediaPicker'
import { PageSelector } from '../../PageSelector'

export function FeaturesInspector({ 
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
        <Field label="Subtitle"><textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={content.subtitle || ''} onChange={(e) => onUpdateContent({ ...content, subtitle: e.target.value })} /></Field>
      </Section>
      <Section title="Programs">
        <div className="space-y-2">
          {content.items?.map((item: any, i: number) => (
            <ItemAccordion key={i} title={item.title || `Program ${i+1}`} onRemove={() => removeItem('items', i)} isOpen={openItem === i} onToggle={() => onToggleItem(i)}>
              <Field label="Title"><Input value={item.title || ''} onChange={(e) => updateItem('items', i, { title: e.target.value })} /></Field>
              <Field label="Description"><textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={item.text || ''} onChange={(e) => updateItem('items', i, { text: e.target.value })} /></Field>
              <Field label="Icon (Optional)">
                <IconPicker 
                  value={item.icon} 
                  onSelect={(icon) => updateItem('items', i, { icon })} 
                />
              </Field>
              <Field label="Background Image (Optional)">
                <div className="flex items-center gap-2">
                  <Input 
                    value={item.image || ''} 
                    onChange={(e) => updateItem('items', i, { image: e.target.value })} 
                    placeholder="Leave empty for gradient"
                    className="flex-1"
                  />
                  <MediaPicker 
                    onSelect={(url) => updateItem('items', i, { image: url })} 
                    trigger={
                      <Button variant="outline" size="icon">
                        <Icon icon="ph:image-plus-fill" className="h-4 w-4" />
                      </Button>
                    } 
                  />
                </div>
                {item.image && (
                  <div className="mt-2 rounded-lg overflow-hidden">
                    <img src={item.image} alt="" className="w-full h-24 object-cover" />
                  </div>
                )}
              </Field>
              <Field label="Link (Optional)">
                <PageSelector
                  value={item.link || ''}
                  onChange={(url) => updateItem('items', i, { link: url })}
                  placeholder="Select a page or enter URL..."
                />
              </Field>
              {item.link && (
                <Field label="Link Label">
                  <Input 
                    value={item.linkLabel || 'Learn More'} 
                    onChange={(e) => updateItem('items', i, { linkLabel: e.target.value })} 
                    placeholder="Learn More"
                  />
                </Field>
              )}
            </ItemAccordion>
          ))}
          <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={() => addItem('items', { title: 'New Program', text: 'Program description', icon: '', image: '', link: '', linkLabel: '' })}>
            <Icon icon="ph:plus-fill" className="h-3 w-3" /> Add Program
          </Button>
        </div>
      </Section>
    </>
  )
}
