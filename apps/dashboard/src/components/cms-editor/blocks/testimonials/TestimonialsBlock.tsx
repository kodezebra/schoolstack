import { Icon } from '@iconify/react'

export function TestimonialsBlock({ content }: { content: any }) {
  return (
    <div className="py-20 px-12 bg-slate-50/50">
      <div className="text-center mb-16">
        <div className="text-accent font-bold text-xs uppercase tracking-widest mb-2">{content.tagline}</div>
        <h2 className="text-4xl font-black text-slate-900">{content.title}</h2>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {content.items?.map((item: any, i: number) => (
          <div key={i} className="p-8 rounded-3xl border bg-white shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Icon icon="ph:chats-fill" className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs truncate">{item.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{item.role}</div>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">"{item.text}"</p>
          </div>
        ))}
      </div>
    </div>
  )
}
