import { PanelBottom, Globe, Mail, Share2 } from 'lucide-react'

export function FooterBlock({ content }: { content: any }) {
  return (
    <footer className="py-16 px-12 bg-slate-950 text-white rounded-b-lg">
      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-5 space-y-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <PanelBottom className="h-6 w-6 text-primary" />
            {content.logoText}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs">{content.description}</p>
          <div className="flex gap-3">
            {[Globe, Mail, Share2].map((Icon, i) => (
              <div key={i} className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                <Icon className="h-4 w-4" />
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-7 grid grid-cols-3 gap-8">
          {['Product', 'Company', 'Legal'].map((title) => (
            <div key={title} className="space-y-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{title}</div>
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="text-[11px] text-slate-400">Link {i}</div>)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-16 pt-8 border-t border-slate-900 text-center text-[10px] text-slate-600 uppercase tracking-widest">
        © {new Date().getFullYear()} {content.logoText}. All rights reserved.
      </div>
    </footer>
  )
}
