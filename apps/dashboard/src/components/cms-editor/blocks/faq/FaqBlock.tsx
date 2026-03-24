import { Icon } from '@iconify/react'

export function FaqBlock({ content }: { content: any }) {
  return (
    <div className="py-20 px-12 bg-white max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <div className="text-primary font-bold text-xs uppercase tracking-widest mb-2">{content.tagline}</div>
        <h2 className="text-4xl font-black text-slate-900">{content.title}</h2>
      </div>
      <div className="space-y-4">
        {content.items?.map((item: any, i: number) => (
          <div key={i} className="border-b pb-4">
            <div className="flex items-center justify-between font-bold py-2">
              <span>{item.question}</span>
              <Icon icon="ph:caret-down-fill" className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-slate-500 mt-2">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
