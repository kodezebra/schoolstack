import { renderDynamicIcon } from '../utils'

export function ValuesBlock({ content }: { content: any }) {
  return (
    <div className="py-20 px-12 bg-white">
      <div className="text-center mb-16">
        <div className="text-primary font-bold text-xs uppercase tracking-widest mb-2">{content.tagline}</div>
        <h2 className="text-4xl font-black text-slate-900">{content.title}</h2>
      </div>
      <div className="grid grid-cols-3 gap-8">
        {content.items?.map((item: any, i: number) => (
          <div key={i} className="text-center p-6 space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
              {renderDynamicIcon(item.icon || 'heart', 'h-6 w-6')}
            </div>
            <h3 className="font-bold text-lg">{item.title}</h3>
            <p className="text-sm text-slate-500">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
