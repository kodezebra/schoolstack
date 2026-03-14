import { cn } from "@/lib/utils"

export function SplitContentBlock({ content }: { content: any }) {
  const isRight = content.imagePosition === 'right'
  
  return (
    <div className={cn(
      "py-20 px-12 flex items-center gap-16 bg-white",
      isRight ? "flex-row-reverse" : "flex-row"
    )}>
      <div className="flex-1 aspect-square bg-slate-100 rounded-3xl overflow-hidden shadow-xl">
        {content.image ? (
          <img src={content.image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">Image</div>
        )}
      </div>
      <div className="flex-1 space-y-6">
        <div className="text-primary font-bold text-xs uppercase tracking-widest">{content.eyebrow}</div>
        <h2 className="text-4xl font-black text-slate-900">{content.title}</h2>
        <p className="text-slate-600 leading-relaxed">{content.description}</p>
        {content.cta?.label && (
          <div className="bg-primary text-white px-6 py-3 rounded-xl font-bold inline-block">
            {content.cta.label}
          </div>
        )}
      </div>
    </div>
  )
}
