// Hero section rendering on the editor canvas
export function HeroBlock({ content }: { content: any }) {
  return (
    <div 
      className="text-center py-20 px-12 space-y-6 border-y relative overflow-hidden bg-slate-900 text-white"
      style={content.image ? { 
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.9)), url('${content.image}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}}
    >
      {!content.image && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10"></div>}
      <h1 className="text-6xl font-black tracking-tight leading-[1.1]">
        {content.title}
      </h1>
      <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
        {content.subtitle}
      </p>
      <div className="flex justify-center gap-4 pt-4">
        <div className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20">
          {content.primaryCta?.label}
        </div>
        <div className="bg-white border border-slate-200 px-8 py-4 rounded-2xl font-bold text-slate-900">
          {content.secondaryCta?.label}
        </div>
      </div>
    </div>
  )
}
