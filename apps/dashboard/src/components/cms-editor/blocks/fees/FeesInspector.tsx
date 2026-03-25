import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icon } from '@iconify/react'
import { Section, Field, ItemAccordion } from '../common'
import { PageSelector } from '../../PageSelector'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SECTION_STYLES = [
  { value: 'list', label: 'List', description: 'Simple rows with name and price' },
  { value: 'table', label: 'Table', description: 'Grid table with columns' },
  { value: 'checklist', label: 'Checklist', description: 'Items with checkmarks, no prices' },
]

export function FeesInspector({ 
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
  const updateSection = (index: number, value: any) => {
    const newSections = [...(content.sections || [])]
    newSections[index] = { ...newSections[index], ...value }
    onUpdateContent({ ...content, sections: newSections })
  }

  const addSection = () => {
    const newSections = [...(content.sections || []), {
      title: 'New Section',
      style: 'list',
      items: [{ name: '', price: '', note: '' }]
    }]
    onUpdateContent({ ...content, sections: newSections })
    onToggleItem(newSections.length - 1)
  }

  const removeSection = (index: number) => {
    const newSections = (content.sections || []).filter((_: any, i: number) => i !== index)
    onUpdateContent({ ...content, sections: newSections })
  }

  const updateSectionItem = (sectionIndex: number, itemIndex: number, value: any) => {
    const section = content.sections?.[sectionIndex]
    if (!section) return
    
    const newItems = [...(section.items || [])]
    newItems[itemIndex] = { ...newItems[itemIndex], ...value }
    updateSection(sectionIndex, { items: newItems })
  }

  const addSectionItem = (sectionIndex: number) => {
    const section = content.sections?.[sectionIndex]
    if (!section) return
    
    const newItems = [...(section.items || []), { name: '', price: '', note: '' }]
    updateSection(sectionIndex, { items: newItems })
  }

  const removeSectionItem = (sectionIndex: number, itemIndex: number) => {
    const section = content.sections?.[sectionIndex]
    if (!section) return
    
    const newItems = section.items.filter((_: any, i: number) => i !== itemIndex)
    updateSection(sectionIndex, { items: newItems })
  }

  return (
    <>
      <Section title="Header">
        <Field label="Tagline"><Input value={content.tagline || ''} onChange={(e) => onUpdateContent({ ...content, tagline: e.target.value })} /></Field>
        <Field label="Title"><Input value={content.title || ''} onChange={(e) => onUpdateContent({ ...content, title: e.target.value })} /></Field>
        <Field label="Subtitle"><textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={content.subtitle || ''} onChange={(e) => onUpdateContent({ ...content, subtitle: e.target.value })} /></Field>
        <Field label="Currency">
          <Select value={content.currency || 'UGX'} onValueChange={(val) => onUpdateContent({ ...content, currency: val })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UGX">UGX (Uganda Shilling)</SelectItem>
              <SelectItem value="$">USD ($)</SelectItem>
              <SelectItem value="£">GBP (£)</SelectItem>
              <SelectItem value="€">EUR (€)</SelectItem>
              <SelectItem value="KES">KES (Kenya Shilling)</SelectItem>
              <SelectItem value="TZS">TZS (Tanzania Shilling)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </Section>
      <Section title="Fee Sections">
        <div className="space-y-2">
          {content.sections?.map((section: any, i: number) => (
            <ItemAccordion 
              key={i} 
              title={section.title || `Section ${i+1}`} 
              onRemove={() => removeSection(i)} 
              isOpen={openItem === i} 
              onToggle={() => onToggleItem(i)}
            >
              <Field label="Section Title"><Input value={section.title || ''} onChange={(e) => updateSection(i, { title: e.target.value })} /></Field>
              <Field label="Style">
                <Select value={section.style || 'list'} onValueChange={(val) => updateSection(i, { style: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTION_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        <div>
                          <div className="font-medium">{style.label}</div>
                          <div className="text-xs text-muted-foreground">{style.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              
              {section.style !== 'checklist' && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Items</span>
                    </div>
                    <div className="space-y-2">
                      {section.items?.map((item: any, j: number) => (
                        <div key={j} className="flex gap-2 items-start">
                          <div className="flex-1 space-y-1">
                            <Input 
                              value={item.name || ''} 
                              onChange={(e) => updateSectionItem(i, j, { name: e.target.value })} 
                              placeholder="Name (e.g., Registration)"
                              className="text-xs"
                            />
                            <div className="flex gap-1">
                              <Input 
                                value={item.price || ''} 
                                onChange={(e) => updateSectionItem(i, j, { price: e.target.value })} 
                                placeholder="Price"
                                className="text-xs flex-1"
                              />
                              <Input 
                                value={item.note || ''} 
                                onChange={(e) => updateSectionItem(i, j, { note: e.target.value })} 
                                placeholder="Note"
                                className="text-xs flex-1"
                              />
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSectionItem(i, j)}>
                            <Icon icon="ph:trash" className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => addSectionItem(i)}>
                      <Icon icon="ph:plus" className="h-4 w-4 mr-1" /> Add Item
                    </Button>
                  </div>
                </>
              )}
              
              {section.style === 'checklist' && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">Included Items</span>
                  </div>
                  <div className="space-y-2">
                    {section.items?.map((item: any, j: number) => (
                      <div key={j} className="flex gap-2 items-center">
                        <Input 
                          value={item.name || ''} 
                          onChange={(e) => updateSectionItem(i, j, { name: e.target.value })} 
                          placeholder="Item name (e.g., Swimming Lessons)"
                          className="flex-1 text-xs"
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSectionItem(i, j)}>
                          <Icon icon="ph:trash" className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => addSectionItem(i)}>
                    <Icon icon="ph:plus" className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                  <Field label="Note">
                    <Input 
                      value={section.note || ''} 
                      onChange={(e) => updateSection(i, { note: e.target.value })} 
                      placeholder="Optional note below the checklist"
                      className="text-xs"
                    />
                  </Field>
                </div>
              )}
            </ItemAccordion>
          ))}
          <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={addSection}>
            <Icon icon="ph:plus-fill" className="h-3 w-3" /> Add Section
          </Button>
        </div>
      </Section>
      <Section title="Call to Action (Optional)">
        <Field label="Button Label"><Input value={content.ctaLabel || ''} onChange={(e) => onUpdateContent({ ...content, ctaLabel: e.target.value })} placeholder="Apply Now" /></Field>
        {content.ctaLabel && (
          <Field label="Link">
            <PageSelector
              value={content.ctaHref || ''}
              onChange={(url) => onUpdateContent({ ...content, ctaHref: url })}
              placeholder="Select a page..."
            />
          </Field>
        )}
      </Section>
    </>
  )
}
