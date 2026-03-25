import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icon } from '@iconify/react'
import { useState } from 'react'
import { Section, Field, ItemAccordion } from '../common'
import { MediaPicker } from '../../MediaPicker'
import type { VideoPlatform } from '../../types'

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

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
  const [processingUrl, setProcessingUrl] = useState<number | null>(null)

  const apiBase = import.meta.env.VITE_API_URL || '/api'

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

  const handleUrlChange = async (index: number, url: string) => {
    updateItem('items', index, { url })
    
    if (!url) {
      updateItem('items', index, { 
        platform: undefined, 
        videoId: '', 
        embedUrl: '', 
        thumbnail: '',
        embedAllowed: true 
      })
      return
    }

    setProcessingUrl(index)
    
    try {
      const response = await fetch(`${apiBase}/video/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      
      if (response.ok) {
        const data = await response.json()
        const video = data.block
        
        updateItem('items', index, {
          id: video.id,
          platform: video.platform,
          videoId: video.videoId,
          embedUrl: video.embedUrl,
          thumbnail: video.thumbnail,
          embedAllowed: video.embedAllowed ?? true,
          title: video.title || content.items[index]?.title || (video.platform === 'tiktok' ? 'TikTok Video' : 'YouTube Video'),
        })
      } else {
        updateItem('items', index, { platform: 'youtube' as VideoPlatform, embedAllowed: true })
      }
    } catch (e) {
      console.error('Failed to parse video URL:', e)
      updateItem('items', index, { platform: 'youtube' as VideoPlatform, embedAllowed: true })
    }
    
    setProcessingUrl(null)
  }

  const addNewVideo = () => {
    addItem('items', { 
      id: generateId(),
      platform: 'youtube' as VideoPlatform, 
      videoId: '', 
      url: '', 
      embedUrl: '', 
      thumbnail: '', 
      embedAllowed: true,
      title: 'New Video' 
    })
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
            <ItemAccordion key={item.id || i} title={item.title || `Video ${i+1}`} onRemove={() => removeItem('items', i)} isOpen={openItem === i} onToggle={() => onToggleItem(i)}>
              <Field label="Title"><Input value={item.title || ''} onChange={(e) => updateItem('items', i, { title: e.target.value })} /></Field>
              
              <Field label="Video URL">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input 
                      value={item.url || ''} 
                      onChange={(e) => handleUrlChange(i, e.target.value)} 
                      placeholder="https://youtube.com/watch?v=... or https://tiktok.com/..."
                      className="pr-8"
                    />
                    {processingUrl === i && (
                      <Icon icon="ph:spinner" className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {item.platform && (
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      item.platform === 'tiktok' 
                        ? 'bg-cyan-500/20 text-cyan-600' 
                        : 'bg-red-500/20 text-red-600'
                    }`}>
                      {item.platform}
                    </div>
                  )}
                </div>
              </Field>

              {item.platform === 'tiktok' && (
                <div className="px-3 py-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <div className="flex items-start gap-2">
                    <Icon icon="ph:info" className="h-4 w-4 text-cyan-600 mt-0.5" />
                    <p className="text-xs text-cyan-700 dark:text-cyan-400">
                      TikTok videos open in the TikTok app/browser. Embedding may not always work due to platform restrictions.
                    </p>
                  </div>
                </div>
              )}

              {item.thumbnail && (
                <Field label="Preview">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {item.platform === 'tiktok' ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 rounded-full">
                          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                          </svg>
                          <span className="text-white text-sm font-medium">Watch on TikTok</span>
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                          <Icon icon="ph:play-fill" className="h-5 w-5 text-slate-900 ml-0.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </Field>
              )}

              <Field label="Custom Thumbnail (Optional)">
                <div className="flex items-center gap-2">
                  <Input value={item.thumbnail || ''} onChange={(e) => updateItem('items', i, { thumbnail: e.target.value })} className="flex-1" placeholder="Leave empty to use auto-generated" />
                  <MediaPicker onSelect={(url) => updateItem('items', i, { thumbnail: url })} trigger={<Button variant="outline" size="icon"><Icon icon="ph:image-plus-fill" className="h-4 w-4" /></Button>} />
                </div>
              </Field>
            </ItemAccordion>
          ))}
          <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={addNewVideo}>
            <Icon icon="ph:plus-fill" className="h-3 w-3" /> Add Video
          </Button>
        </div>
      </Section>
    </>
  )
}
