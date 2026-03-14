import { renderDynamicIcon } from '../utils'

export function PricingBlock({ content }: { content: any }) {
  return (
    <div className="py-16 px-12 bg-slate-50">
      <div className="text-center mb-12">
        <div className="text-primary font-bold text-xs uppercase tracking-widest mb-2">{content.tagline}</div>
        <h2 className="text-4xl font-black text-slate-900">{content.title}</h2>
        {content.subtitle && <p className="text-slate-500 mt-4 max-w-2xl mx-auto">{content.subtitle}</p>}
      </div>
      <div className="grid grid-cols-3 gap-6">
        {content.tiers?.map((tier: any, i: number) => (
          <div
            key={i}
            className={`relative rounded-2xl border-2 p-6 ${
              tier.recommended ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'
            }`}
          >
            {tier.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase">
                Popular
              </div>
            )}
            <div className="text-center mb-6">
              <h4 className="font-bold text-lg">{tier.name}</h4>
              <p className="text-xs text-slate-500 mt-1">{tier.description}</p>
              <div className="mt-4 flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black">${tier.price}</span>
                <span className="text-slate-500 text-xs">/{tier.period}</span>
              </div>
            </div>
            <ul className="space-y-2 mb-6">
              {tier.features?.map((feature: string, j: number) => (
                <li key={j} className="flex items-start gap-2 text-xs">
                  {renderDynamicIcon('check', 'h-4 w-4 text-green-500 flex-shrink-0 mt-0.5')}
                  <span className="text-slate-600">{feature}</span>
                </li>
              ))}
            </ul>
            <button className={`w-full py-2 rounded-lg text-sm font-semibold ${
              tier.recommended ? 'bg-primary text-white' : 'bg-slate-900 text-white'
            }`}>
              {tier.ctaLabel || 'Get Started'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
