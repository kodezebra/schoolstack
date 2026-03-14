import { renderDynamicIcon } from '../utils'
import { Image as ImageIcon } from 'lucide-react'

// Split content section rendering on the canvas
export function ContentBlock({ content }: { content: any }) {
  return (
    <div className="py-20 px-12 flex items-center gap-16 bg-white">
      <div className="flex-1 aspect-square bg-slate-100 rounded-[2.5rem] border-8 border-white shadow-2xl relative overflow-hidden group/img">
        {content.image ? (
          <img src={content.image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ImageIcon className="h-20 w-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
      </div>
      <div className="flex-1 space-y-6 text-left">
        <h2 className="text-4xl font-black text-slate-900">{content.title}</h2>
        <p className="text-slate-600 leading-relaxed">{content.text1}</p>
        <p className="text-slate-500 text-sm leading-relaxed">{content.text2}</p>
        <div className="grid grid-cols-2 gap-3 pt-4">
          {content.features?.map((f: string) => (
            <div key={f} className="flex items-center gap-2 font-bold text-[11px] text-slate-700">
              {renderDynamicIcon(content.featureIcon || 'check-circle', 'h-4 w-4 text-primary')}
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
