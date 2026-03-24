import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icon } from '@iconify/react'
import { Section, Field, ItemAccordion } from '../common'
import { MediaPicker } from '../../MediaPicker'

export function VideoGalleryInspector({ 
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
      <Section title="Videos">
        <div className="space-y-2">
          {content.items?.map((item: any, i: number) => (
            <ItemAccordion key={i} title={item.title || `Video ${i+1}`} onRemove={() => removeItem('items', i)} isOpen={openItem === i} onToggle={() => onToggleItem(i)}>
              <Field label="Title"><Input value={item.title || ''} onChange={(e) => updateItem('items', i, { title: e.target.value })} /></Field>
              <Field label="Thumbnail URL">
                <div className="flex items-center gap-2">
                  <Input value={item.thumbnail || ''} onChange={(e) => updateItem('items', i, { thumbnail: e.target.value })} className="flex-1" />
                  <MediaPicker onSelect={(url) => updateItem('items', i, { thumbnail: url })} trigger={<Button variant="outline" size="icon"><Icon icon="ph:image-plus-fill" className="h-4 w-4" /></Button>} />
                </div>
              </Field>
              <Field label="Video URL"><Input value={item.videoUrl || ''} onChange={(e) => updateItem('items', i, { videoUrl: e.target.value })} placeholder="https://youtube.com/..." /></Field>
            </ItemAccordion>
          ))}
          <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={() => addItem('items', { title: 'New Video', thumbnail: '', videoUrl: '' })}>
            <Icon icon="ph:plus-fill" className="h-3 w-3" /> Add Video
          </Button>
        </div>
      </Section>
    </>
  )
}
