import { Icon } from '@iconify/react'

export function FeesBlock({ content }: { content: any }) {
  const currency = content.currency || 'UGX'
  const sections = content.sections || []

  return (
    <div className="py-20 px-12 bg-slate-50">
      <div className="text-center mb-16">
        <div className="text-primary font-bold text-xs uppercase tracking-widest mb-2">{content.tagline}</div>
        <h2 className="text-4xl font-black text-slate-900">{content.title || 'School Fees'}</h2>
        {content.subtitle && <p className="mt-4 text-slate-600">{content.subtitle}</p>}
      </div>

      {sections.map((section: any, i: number) => (
        <div key={i} className="mb-12">
          {section.title && <h3 className="text-2xl font-bold text-slate-900 mb-6">{section.title}</h3>}
          
          {section.style === 'checklist' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items?.map((item: any, j: number) => (
                <div key={j} className="flex items-center gap-3 p-4 bg-white rounded-xl border">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Icon icon="ph:check-bold" className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-slate-700 font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          ) : section.style === 'table' ? (
            <div className="bg-white rounded-2xl border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold text-slate-900">Item</th>
                    <th className="text-right p-4 font-semibold text-slate-900">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {section.items?.map((item: any, j: number) => (
                    <tr key={j} className={j < section.items.length - 1 ? 'border-b' : ''}>
                      <td className="p-4 text-slate-700">{item.name}</td>
                      <td className="p-4 text-right font-semibold text-slate-900">{item.price} {currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {section.items?.map((item: any, j: number) => (
                <div key={j} className="flex items-center justify-between p-4 bg-white rounded-xl border">
                  <span className="text-slate-700 font-medium">{item.name}</span>
                  <span className="text-primary font-bold">{item.price} {currency}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {content.ctaLabel && content.ctaHref && (
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-full">
            {content.ctaLabel}
            <Icon icon="ph:arrow-right" className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
