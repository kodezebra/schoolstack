export function StepsBlock({ content }: { content: any }) {
  return (
    <div className="py-20 px-12 bg-white">
      <div className="text-center mb-16">
        <div className="text-primary font-bold text-xs uppercase tracking-widest mb-2">{content.tagline}</div>
        <h2 className="text-4xl font-black text-slate-900">{content.title}</h2>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {content.items?.map((item: any, i: number) => (
          <div key={i} className="space-y-4 relative">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">{i + 1}</div>
            <h3 className="font-bold text-lg">{item.title}</h3>
            <p className="text-sm text-slate-500">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
