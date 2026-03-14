export function CtaBlock({ content }: { content: any }) {
  return (
    <div className="py-20 px-12 text-center bg-slate-900 text-white mx-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent"></div>
      <div className="relative z-10 space-y-6">
        <h2 className="text-4xl font-black">{content.title}</h2>
        <p className="text-slate-400 max-w-xl mx-auto">{content.subtitle}</p>
        <div className="bg-primary text-white px-8 py-4 rounded-2xl font-bold inline-block shadow-lg shadow-primary/20">
          {content.ctaLabel}
        </div>
      </div>
    </div>
  )
}
