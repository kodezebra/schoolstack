export function GalleryBlock({ content }: { content: any }) {
  const layout = content.layout || 'default'
  
  return (
    <div className="py-16 px-12">
      <div className="text-center mb-12">
        <div className="text-primary font-bold text-xs uppercase tracking-widest mb-2">{content.tagline}</div>
        <h2 className="text-4xl font-black text-slate-900">{content.title}</h2>
        {content.subtitle && <p className="text-slate-500 mt-4 max-w-2xl mx-auto">{content.subtitle}</p>}
      </div>
      {layout === 'masonry' ? (
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {content.images?.map((image: any, i: number) => (
            <div key={i} className="break-inside-avoid rounded-xl overflow-hidden bg-slate-100">
              <div className="aspect-[4/3] bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                {image.alt || `Image ${i + 1}`}
              </div>
            </div>
          ))}
        </div>
      ) : layout === 'grid' ? (
        <div className="grid grid-cols-4 gap-3">
          {content.images?.map((image: any, i: number) => (
            <div key={i} className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
              {image.alt || `Image ${i + 1}`}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {content.images?.map((image: any, i: number) => (
            <div key={i} className="rounded-xl bg-slate-100 aspect-video flex items-center justify-center text-slate-400 text-xs">
              {image.alt || `Image ${i + 1}`}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
