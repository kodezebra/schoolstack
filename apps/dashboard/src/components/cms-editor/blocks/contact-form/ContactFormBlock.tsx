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
        </div>
        <div className="bg-slate-50 rounded-xl p-6 border">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
              <div className="h-10 rounded-lg border bg-white flex items-center px-3 text-slate-400 text-sm">Your name</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
              <div className="h-10 rounded-lg border bg-white flex items-center px-3 text-slate-400 text-sm">your@email.com</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Message <span className="text-red-500">*</span></label>
              <div className="h-20 rounded-lg border bg-white flex items-center px-3 text-slate-400 text-sm">Your message</div>
            </div>
            <button className="w-full h-10 bg-primary text-white rounded-lg font-semibold text-sm">
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
