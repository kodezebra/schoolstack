import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { 
  SlidersVertical, MousePointer2, Trash2, ImagePlus, 
  Plus, X, ChevronDown, ChevronUp 
} from 'lucide-react'
import { MediaPicker } from './MediaPicker'
import { IconPicker } from './IconPicker'
import { useState } from 'react'

// --- Helper Components ---

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="space-y-4">
    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">{title}</h3>
    {children}
  </div>
)

const Field = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="grid gap-2">
    <Label className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/80">{label}</Label>
    {children}
  </div>
)

const ItemAccordion = ({ 
  title, 
  onRemove, 
  children,
  isOpen,
  onToggle
}: { 
  title: string, 
  onRemove: () => void, 
  children: React.ReactNode,
  isOpen: boolean,
  onToggle: () => void
}) => (
  <div className="border rounded-lg bg-muted/30 overflow-hidden">
    <div className="flex items-center justify-between px-3 py-2 bg-muted/50 cursor-pointer" onClick={onToggle}>
      <span className="text-[10px] font-bold truncate uppercase">{title}</span>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
          <X className="h-3 w-3 text-destructive" />
        </Button>
        {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </div>
    </div>
    {isOpen && <div className="p-3 space-y-3 border-t bg-background">{children}</div>}
  </div>
)

// --- Main Inspector Component ---

export function EditorInspector({ 
  selectedBlock, 
  onUpdateContent,
  onUpdateStyles,
  onRemoveBlock
}: { 
  selectedBlock: any | null, 
  onUpdateContent: (content: any) => void,
  onUpdateStyles: (styles: any) => void,
  onRemoveBlock: (id: string) => void
}) {
  const [openItems, setOpenItems] = useState<Record<string, number | null>>({})

  if (!selectedBlock) {
    return (
      <div className="w-full border-l bg-card flex flex-col items-center justify-center text-muted-foreground/30 p-12 text-center h-full">
        <MousePointer2 className="h-10 w-10 mb-4 opacity-5" />
        <p className="text-sm font-medium italic">Select a layer to edit.</p>
      </div>
    )
  }

  const toggleItem = (blockId: string, index: number) => {
    setOpenItems(prev => ({
      ...prev,
      [blockId]: prev[blockId] === index ? null : index
    }))
  }

  const content = selectedBlock.content
  const styles = content.styles || { paddingY: 48 }

  const updateItem = (key: string, index: number, value: any) => {
    const newItems = [...(content[key] || [])]
    newItems[index] = { ...newItems[index], ...value }
    onUpdateContent({ ...content, [key]: newItems })
  }

  const addItem = (key: string, defaultValue: any) => {
    const newItems = [...(content[key] || []), defaultValue]
    onUpdateContent({ ...content, [key]: newItems })
    setOpenItems(prev => ({ ...prev, [selectedBlock.id]: newItems.length - 1 }))
  }

  const removeItem = (key: string, index: number) => {
    const newItems = content[key].filter((_: any, i: number) => i !== index)
    onUpdateContent({ ...content, [key]: newItems })
  }

  return (
    <div className="w-full border-l bg-card flex flex-col h-full shadow-lg font-sans">
      <div className="p-4 border-b flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
           <SlidersVertical className="h-4 w-4 text-primary" />
           <h2 className="font-bold text-[10px] uppercase tracking-widest">{selectedBlock.type}</h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={() => onRemoveBlock(selectedBlock.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* --- NAVBAR --- */}
        {selectedBlock.type === 'navbar' && (
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
                    isOpen={openItems[selectedBlock.id] === i}
                    onToggle={() => toggleItem(selectedBlock.id, i)}
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
        )}

        {/* --- HERO --- */}
        {selectedBlock.type === 'hero' && (
          <>
            <Section title="Text Content">
              <Field label="Headline"><Input value={content.title || ''} onChange={(e) => onUpdateContent({ ...content, title: e.target.value })} /></Field>
              <Field label="Subtitle"><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={content.subtitle || ''} onChange={(e) => onUpdateContent({ ...content, subtitle: e.target.value })} /></Field>
            </Section>
            <Section title="Background Image">
              <div className="flex items-center gap-2">
                <Input value={content.image || ''} onChange={(e) => onUpdateContent({ ...content, image: e.target.value })} className="flex-1" />
                <MediaPicker onSelect={(url) => onUpdateContent({ ...content, image: url })} trigger={<Button variant="outline" size="icon"><ImagePlus className="h-4 w-4" /></Button>} />
              </div>
            </Section>
            <Section title="Primary Button">
              <div className="p-3 border rounded-lg bg-muted/20 space-y-3">
                <Field label="Label"><Input value={content.primaryCta?.label || ''} onChange={(e) => onUpdateContent({ ...content, primaryCta: { ...content.primaryCta, label: e.target.value } })} /></Field>
                <Field label="Href"><Input value={content.primaryCta?.href || ''} onChange={(e) => onUpdateContent({ ...content, primaryCta: { ...content.primaryCta, href: e.target.value } })} /></Field>
              </div>
            </Section>
            <Section title="Secondary Button">
              <div className="p-3 border rounded-lg bg-muted/20 space-y-3">
                <Field label="Label"><Input value={content.secondaryCta?.label || ''} onChange={(e) => onUpdateContent({ ...content, secondaryCta: { ...content.secondaryCta, label: e.target.value } })} /></Field>
                <Field label="Href"><Input value={content.secondaryCta?.href || ''} onChange={(e) => onUpdateContent({ ...content, secondaryCta: { ...content.secondaryCta, href: e.target.value } })} /></Field>
              </div>
            </Section>
          </>
        )}

        {/* --- FEATURES --- */}
        {selectedBlock.type === 'features' && (
          <>
            <Section title="Header Content">
              <Field label="Tagline"><Input value={content.tagline || ''} onChange={(e) => onUpdateContent({ ...content, tagline: e.target.value })} /></Field>
              <Field label="Title"><Input value={content.title || ''} onChange={(e) => onUpdateContent({ ...content, title: e.target.value })} /></Field>
              <Field label="Subtitle"><textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={content.subtitle || ''} onChange={(e) => onUpdateContent({ ...content, subtitle: e.target.value })} /></Field>
            </Section>
            <Section title="Feature Items">
              <div className="space-y-2">
                {content.items?.map((item: any, i: number) => (
                  <ItemAccordion key={i} title={item.title || `Feature ${i+1}`} onRemove={() => removeItem('items', i)} isOpen={openItems[selectedBlock.id] === i} onToggle={() => toggleItem(selectedBlock.id, i)}>
                    <Field label="Icon">
                      <IconPicker 
                        value={item.icon} 
                        onSelect={(icon) => updateItem('items', i, { icon })} 
                      />
                    </Field>
                    <Field label="Title"><Input value={item.title || ''} onChange={(e) => updateItem('items', i, { title: e.target.value })} /></Field>
                    <Field label="Description"><textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={item.text || ''} onChange={(e) => updateItem('items', i, { text: e.target.value })} /></Field>
                  </ItemAccordion>
                ))}
                <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={() => addItem('items', { icon: 'zap', title: 'New Feature', text: 'Feature description' })}>
                  <Plus className="h-3 w-3" /> Add Feature
                </Button>
              </div>
            </Section>
          </>
        )}

        {/* --- CONTENT --- */}
        {selectedBlock.type === 'content' && (
          <>
            <Section title="Text Content">
              <Field label="Title"><Input value={content.title || ''} onChange={(e) => onUpdateContent({ ...content, title: e.target.value })} /></Field>
              <Field label="Paragraph 1"><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={content.text1 || ''} onChange={(e) => onUpdateContent({ ...content, text1: e.target.value })} /></Field>
              <Field label="Paragraph 2"><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={content.text2 || ''} onChange={(e) => onUpdateContent({ ...content, text2: e.target.value })} /></Field>
            </Section>
            <Section title="Checklist Features">
              <div className="space-y-4">
                <Field label="Checklist Icon">
                  <IconPicker
                    value={content.featureIcon}
                    onSelect={(featureIcon) => onUpdateContent({ ...content, featureIcon })}
                  />
                </Field>
                <div className="space-y-2">
                  {content.features?.map((f: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <Input value={f} onChange={(e) => {
                      const newFeatures = [...content.features]
                      newFeatures[i] = e.target.value
                      onUpdateContent({ ...content, features: newFeatures })
                    }} />
                    <Button variant="ghost" size="icon" onClick={() => onUpdateContent({ ...content, features: content.features.filter((_: any, idx: number) => idx !== i) })}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={() => onUpdateContent({ ...content, features: [...(content.features || []), 'New Checklist Item'] })}>
                  <Plus className="h-3 w-3" /> Add Item
                </Button>
              </div>
            </div>
          </Section>
            <Section title="Image">
              <div className="flex items-center gap-2">
                <Input value={content.image || ''} onChange={(e) => onUpdateContent({ ...content, image: e.target.value })} className="flex-1" />
                <MediaPicker onSelect={(url) => onUpdateContent({ ...content, image: url })} trigger={<Button variant="outline" size="icon"><ImagePlus className="h-4 w-4" /></Button>} />
              </div>
            </Section>
            <Section title="CTA Button">
              <div className="p-3 border rounded-lg bg-muted/20 space-y-3">
                <Field label="Label"><Input value={content.cta?.label || ''} onChange={(e) => onUpdateContent({ ...content, cta: { ...content.cta, label: e.target.value } })} /></Field>
                <Field label="Href"><Input value={content.cta?.href || ''} onChange={(e) => onUpdateContent({ ...content, cta: { ...content.cta, href: e.target.value } })} placeholder="/contact" /></Field>
              </div>
            </Section>
          </>
        )}

        {/* --- STATS --- */}
        {selectedBlock.type === 'stats' && (
          <Section title="Statistics">
            <div className="space-y-2">
              {content.items?.map((item: any, i: number) => (
                <div key={i} className="p-3 border rounded-lg space-y-3 relative group">
                  <Button variant="ghost" size="icon" className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100" onClick={() => removeItem('items', i)}>
                    <X className="h-3 w-3" />
                  </Button>
                  <Field label="Value"><Input value={item.value || ''} onChange={(e) => updateItem('items', i, { value: e.target.value })} placeholder="500+" /></Field>
                  <Field label="Label"><Input value={item.label || ''} onChange={(e) => updateItem('items', i, { label: e.target.value })} placeholder="Users" /></Field>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={() => addItem('items', { value: '0', label: 'New Stat' })}>
                <Plus className="h-3 w-3" /> Add Stat
              </Button>
            </div>
          </Section>
        )}

        {/* --- TEAM --- */}
        {selectedBlock.type === 'team' && (
          <>
            <Section title="Header">
              <Field label="Tagline"><Input value={content.tagline || ''} onChange={(e) => onUpdateContent({ ...content, tagline: e.target.value })} /></Field>
              <Field label="Title"><Input value={content.title || ''} onChange={(e) => onUpdateContent({ ...content, title: e.target.value })} /></Field>
            </Section>
            <Section title="Members">
              <div className="space-y-2">
                {content.members?.map((m: any, i: number) => (
                  <ItemAccordion key={i} title={m.name || `Member ${i+1}`} onRemove={() => removeItem('members', i)} isOpen={openItems[selectedBlock.id] === i} onToggle={() => toggleItem(selectedBlock.id, i)}>
                    <Field label="Name"><Input value={m.name || ''} onChange={(e) => updateItem('members', i, { name: e.target.value })} /></Field>
                    <Field label="Role"><Input value={m.role || ''} onChange={(e) => updateItem('members', i, { role: e.target.value })} /></Field>
                    <Field label="Photo URL">
                      <div className="flex items-center gap-2">
                        <Input value={m.image || ''} onChange={(e) => updateItem('members', i, { image: e.target.value })} className="flex-1" />
                        <MediaPicker onSelect={(url) => updateItem('members', i, { image: url })} trigger={<Button variant="outline" size="icon"><ImagePlus className="h-4 w-4" /></Button>} />
                      </div>
                    </Field>
                  </ItemAccordion>
                ))}
                <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={() => addItem('members', { name: 'Member Name', role: 'Role', image: '' })}>
                  <Plus className="h-3 w-3" /> Add Member
                </Button>
              </div>
            </Section>
          </>
        )}

        {/* --- TESTIMONIALS --- */}
        {selectedBlock.type === 'testimonials' && (
          <>
            <Section title="Header">
              <Field label="Tagline"><Input value={content.tagline || ''} onChange={(e) => onUpdateContent({ ...content, tagline: e.target.value })} /></Field>
              <Field label="Title"><Input value={content.title || ''} onChange={(e) => onUpdateContent({ ...content, title: e.target.value })} /></Field>
            </Section>
            <Section title="Testimonials">
              <div className="space-y-2">
                {content.items?.map((item: any, i: number) => (
                  <ItemAccordion key={i} title={item.name || `Client ${i+1}`} onRemove={() => removeItem('items', i)} isOpen={openItems[selectedBlock.id] === i} onToggle={() => toggleItem(selectedBlock.id, i)}>
                    <Field label="Name"><Input value={item.name || ''} onChange={(e) => updateItem('items', i, { name: e.target.value })} /></Field>
                    <Field label="Role"><Input value={item.role || ''} onChange={(e) => updateItem('items', i, { role: e.target.value })} /></Field>
                    <Field label="Text"><textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={item.text || ''} onChange={(e) => updateItem('items', i, { text: e.target.value })} /></Field>
                    <Field label="Photo URL">
                      <div className="flex items-center gap-2">
                        <Input value={item.image || ''} onChange={(e) => updateItem('members', i, { image: e.target.value })} className="flex-1" />
                        <MediaPicker onSelect={(url) => updateItem('items', i, { image: url })} trigger={<Button variant="outline" size="icon"><ImagePlus className="h-4 w-4" /></Button>} />
                      </div>
                    </Field>
                  </ItemAccordion>
                ))}
                <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={() => addItem('items', { name: 'Client Name', role: 'CEO', text: 'Feedback here', image: '' })}>
                  <Plus className="h-3 w-3" /> Add Testimonial
                </Button>
              </div>
            </Section>
          </>
        )}

        {/* --- CTA --- */}
        {selectedBlock.type === 'cta' && (
          <>
            <Section title="Text Content">
              <Field label="Title"><Input value={content.title || ''} onChange={(e) => onUpdateContent({ ...content, title: e.target.value })} /></Field>
              <Field label="Subtitle"><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={content.subtitle || ''} onChange={(e) => onUpdateContent({ ...content, subtitle: e.target.value })} /></Field>
            </Section>
            <Section title="Button">
              <div className="p-3 border rounded-lg bg-muted/20 space-y-3">
                <Field label="Label"><Input value={content.ctaLabel || ''} onChange={(e) => onUpdateContent({ ...content, ctaLabel: e.target.value })} /></Field>
                <Field label="Href"><Input value={content.ctaHref || ''} onChange={(e) => onUpdateContent({ ...content, ctaHref: e.target.value })} placeholder="/contact" /></Field>
              </div>
            </Section>
          </>
        )}

        {/* --- FOOTER --- */}
        {selectedBlock.type === 'footer' && (
          <>
            <Section title="Brand Info">
              <Field label="Logo Text"><Input value={content.logoText || ''} onChange={(e) => onUpdateContent({ ...content, logoText: e.target.value })} /></Field>
              <Field label="Description"><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={content.description || ''} onChange={(e) => onUpdateContent({ ...content, description: e.target.value })} /></Field>
            </Section>
          </>
        )}

        {/* --- BASIC TEXT --- */}
        {selectedBlock.type === 'text' && (
          <Section title="Content">
            <Field label="Body Text">
              <textarea 
                className="flex min-h-[160px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm"
                value={content.text || ''} 
                onChange={(e) => onUpdateContent({ ...content, text: e.target.value })} 
              />
            </Field>
          </Section>
        )}

        {/* --- GLOBAL LAYOUT --- */}
        <div className="pt-8 border-t space-y-6">
           <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Layout</h3>
           <div className="grid gap-5">
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className="text-muted-foreground">Vertical Spacing</span>
                <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full">{styles.paddingY}px</span>
              </div>
              <Slider 
                value={[styles.paddingY || 48]} 
                onValueChange={([val]) => onUpdateStyles({ ...styles, paddingY: val })}
                max={200} 
                step={4} 
                className="py-2" 
              />
           </div>
        </div>
      </div>

      <div className="p-4 border-t bg-muted/10 text-[9px] text-center text-muted-foreground font-medium uppercase tracking-tighter">
        Draft auto-saved
      </div>
    </div>
  )
}
