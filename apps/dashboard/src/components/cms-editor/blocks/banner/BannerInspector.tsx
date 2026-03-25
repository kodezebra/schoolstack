import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Section, Field } from '../common'
import { MediaPicker } from '../../MediaPicker'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

export function BannerInspector({
  content,
  onUpdateContent,
}: {
  content: any,
  onUpdateContent: (c: any) => void,
}) {
  const renderImageField = (field: string, label: string, previewHeight: string) => (
    <Field label={label}>
      {content[field] ? (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 group">
          <img src={content[field]} alt={label} className={`w-full object-cover ${previewHeight}`} />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <MediaPicker
              onSelect={(url) => onUpdateContent({ ...content, [field]: url })}
              trigger={
                <Button variant="secondary" size="sm" className="gap-1">
                  <Upload className="h-3 w-3" /> Change
                </Button>
              }
            />
            <Button 
              variant="secondary" 
              size="sm" 
              className="gap-1"
              onClick={() => onUpdateContent({ ...content, [field]: '', ...(field === 'offsetImage' ? { showOffsetImage: false } : {}) })}
            >
              <X className="h-3 w-3" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <MediaPicker
          onSelect={(url) => onUpdateContent({ ...content, [field]: url, ...(field === 'offsetImage' ? { showOffsetImage: true } : {}) })}
          trigger={
            <Button variant="outline" className="w-full gap-2">
              <ImageIcon className="h-4 w-4" /> Choose Image
            </Button>
          }
        />
      )}
    </Field>
  )

  return (
    <>
      <Section title="Banner Settings">
        <Field label="Page Title">
          <Input 
            value={content.title || ''} 
            onChange={(e) => onUpdateContent({ ...content, title: e.target.value })} 
            placeholder="e.g. About Us"
          />
        </Field>

        <Field label="Eyebrow Text">
          <Input 
            value={content.eyebrow || ''} 
            onChange={(e) => onUpdateContent({ ...content, eyebrow: e.target.value })} 
            placeholder="e.g. Established 1994"
          />
        </Field>

        <Field label="Subtitle">
          <Input 
            value={content.subtitle || ''} 
            onChange={(e) => onUpdateContent({ ...content, subtitle: e.target.value })} 
            placeholder="Optional subtitle text"
          />
        </Field>

        {renderImageField('image', 'Background Image', 'h-32')}
        {renderImageField('textureImage', 'Texture/Pattern', 'h-16')}
        {renderImageField('offsetImage', 'Offset Decoration', 'h-20')}

        <Field label="Height">
          <div className="flex gap-2">
            {['small', 'medium', 'large'].map((size) => (
              <button
                key={size}
                onClick={() => onUpdateContent({ ...content, height: size })}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                  content.height === size 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
        </Field>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showDivider"
            checked={content.showDivider ?? true}
            onChange={(e) => onUpdateContent({ ...content, showDivider: e.target.checked })}
            className="rounded border-slate-300"
          />
          <label htmlFor="showDivider" className="text-xs font-medium text-slate-700">
            Show title divider line
          </label>
        </div>
      </Section>
    </>
  )
}
