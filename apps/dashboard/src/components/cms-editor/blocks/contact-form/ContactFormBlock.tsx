export function ContactFormBlock({ content }: { content: any }) {
  return (
    <div className="py-16 px-12">
      <div className="grid grid-cols-2 gap-12">
        <div>
          <div className="mb-8">
            <div className="text-primary font-bold text-xs uppercase tracking-widest mb-2">{content.tagline}</div>
            <h2 className="text-4xl font-black text-slate-900">{content.title}</h2>
            {content.subtitle && <p className="text-slate-500 mt-4">{content.subtitle}</p>}
          </div>
          {content.contactInfo && (
            <div className="space-y-4 text-sm">
              {content.contactInfo.address && (
                <div className="flex items-start gap-3">
                  <span className="text-primary">📍</span>
                  <span className="text-slate-600">{content.contactInfo.address}</span>
                </div>
              )}
              {content.contactInfo.email && (
                <div className="flex items-start gap-3">
                  <span className="text-primary">📧</span>
                  <span className="text-slate-600">{content.contactInfo.email}</span>
                </div>
              )}
              {content.contactInfo.phone && (
                <div className="flex items-start gap-3">
                  <span className="text-primary">📞</span>
                  <span className="text-slate-600">{content.contactInfo.phone}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="bg-slate-50 rounded-xl p-6 border">
          <div className="space-y-4">
            {content.fields?.map((field: any, i: number) => (
              <div key={i}>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <div className="h-20 rounded-lg border bg-white flex items-center px-3 text-slate-400 text-sm">
                    {field.placeholder || field.label}
                  </div>
                ) : (
                  <div className="h-10 rounded-lg border bg-white flex items-center px-3 text-slate-400 text-sm">
                    {field.placeholder || field.label}
                  </div>
                )}
              </div>
            ))}
            <button className="w-full h-10 bg-primary text-white rounded-lg font-semibold text-sm">
              {content.submitLabel || 'Send Message'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
