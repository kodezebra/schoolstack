import { getPadding } from '../utils'

export const VideoGallery = ({ content }: { content: any }) => (
  <section className="py-32 bg-slate-50 dark:bg-slate-900/50" style={getPadding(content.styles)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        {content.tagline && (
          <h2 className="text-accent font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">{content.tagline}</h2>
        )}
        <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl mb-6">
          {content.title || "Video Showcase"}
        </h3>
        {content.subtitle && (
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            {content.subtitle}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {content.items?.map((item: any, index: number) => (
          <div key={index} className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-200 dark:bg-slate-800 shadow-lg">
            {item.thumbnail ? (
              <img src={item.thumbnail} alt={item.title || `Video ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                <i data-lucide="video" className="w-12 h-12 text-slate-500 dark:text-slate-600"></i>
              </div>
            )}
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {item.videoUrl ? (
                <a href={item.videoUrl} className="w-16 h-16 bg-primary/90 backdrop-blur-md rounded-full flex items-center justify-center border border-primary/50 cursor-pointer hover:scale-110 transition-transform">
                  <i data-lucide="play" className="w-8 h-8 text-white fill-white"></i>
                </a>
              ) : (
                <div className="w-16 h-16 bg-primary/90 backdrop-blur-md rounded-full flex items-center justify-center border border-primary/50">
                  <i data-lucide="play" className="w-8 h-8 text-white fill-white"></i>
                </div>
              )}
            </div>
            {item.title && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900/80 to-transparent">
                <p className="text-white font-bold text-sm">{item.title}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
)
