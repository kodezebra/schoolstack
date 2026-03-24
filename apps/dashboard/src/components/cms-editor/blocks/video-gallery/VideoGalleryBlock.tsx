import { Icon } from '@iconify/react'

export function VideoGalleryBlock({ content }: { content: any }) {
  return (
    <div className="py-20 px-12 bg-white">
      <div className="text-center mb-16">
        <div className="text-primary font-bold text-xs uppercase tracking-widest mb-2">{content.tagline}</div>
        <h2 className="text-4xl font-black text-slate-900">{content.title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-8">
        {content.items?.map((item: any, i: number) => (
          <div key={i} className="aspect-video bg-slate-900 rounded-3xl relative overflow-hidden group">
            {item.thumbnail ? (
              <img src={item.thumbnail} alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20">Video Thumbnail</div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Icon icon="ph:play-fill" className="h-6 w-6 text-slate-900" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="text-white font-bold text-lg">{item.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
