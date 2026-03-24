import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icon } from '@iconify/react'
import { Section, Field } from '../common'

export function GalleryInspector({
  content,
  onUpdateContent,
}: {
  content: any,
  onUpdateContent: (c: any) => void,
}) {
  const addImage = () => {
    const newImage = {
      src: '/placeholder.jpg',
      alt: 'Gallery image',
      caption: '',
    }
    const newImages = [...(content.images || []), newImage]
    onUpdateContent({ ...content, images: newImages })
  }

  const updateImage = (index: number, value: any) => {
    const newImages = [...content.images]
    newImages[index] = { ...newImages[index], ...value }
    onUpdateContent({ ...content, images: newImages })
  }

  const removeImage = (index: number) => {
    const newImages = content.images.filter((_: any, i: number) => i !== index)
    onUpdateContent({ ...content, images: newImages })
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...content.images]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= newImages.length) return
    ;[newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]
    onUpdateContent({ ...content, images: newImages })
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
            value={content.layout || 'default'}
            onChange={(e) => onUpdateContent({ ...content, layout: e.target.value })}
          >
            <option value="default">Default (2 columns)</option>
            <option value="grid">Grid (4 columns)</option>
            <option value="masonry">Masonry</option>
          </select>
        </Field>
      </Section>
      <Section title="Gallery Images">
        <div className="space-y-3">
          {content.images?.map((image: any, i: number) => (
            <div key={i} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveImage(i, 'up')}
                    disabled={i === 0}
                    className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <Icon icon="ph:dots-six-vertical-fill" className="h-3 w-3 rotate-90" />
                  </button>
                  <button
                    onClick={() => moveImage(i, 'down')}
                    disabled={i === content.images.length - 1}
                    className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <Icon icon="ph:dots-six-vertical-fill" className="h-3 w-3 -rotate-90" />
                  </button>
                </div>
                <span className="text-xs font-medium flex-1">Image {i + 1}</span>
                <Button variant="ghost" size="icon" onClick={() => removeImage(i)}>
                  <Icon icon="ph:trash-fill" className="h-4 w-4" />
                </Button>
              </div>
              <Field label="Image URL"><Input value={image.src || ''} onChange={(e) => updateImage(i, { src: e.target.value })} /></Field>
              <Field label="Alt Text"><Input value={image.alt || ''} onChange={(e) => updateImage(i, { alt: e.target.value })} /></Field>
              <Field label="Caption"><Input value={image.caption || ''} onChange={(e) => updateImage(i, { caption: e.target.value })} /></Field>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={addImage}>
            <Icon icon="ph:plus-fill" className="h-3 w-3" /> Add Image
          </Button>
        </div>
      </Section>
    </>
  )
}
