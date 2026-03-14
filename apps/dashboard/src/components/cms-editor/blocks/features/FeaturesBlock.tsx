import { renderDynamicIcon } from '../utils'

// Features section grid for the editor canvas
export function FeaturesBlock({ content }: { content: any }) {
  return (
    <div className="py-16 px-12">
      <div className="text-center mb-16">
        <div className="text-primary font-bold text-xs uppercase tracking-widest mb-2">{content.tagline}</div>
        <h2 className="text-4xl font-black text-slate-900">{content.title}</h2>
      </div>
      <div className="grid grid-cols-3 gap-8">
        {content.items?.map((item: any, i: number) => (
          <div key={i} className="p-8 rounded-3xl border bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
              {renderDynamicIcon(item.icon || 'zap', 'h-6 w-6')}
            </div>
            <h3 className="font-bold text-lg mb-2">{item.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
