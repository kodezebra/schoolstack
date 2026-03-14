import { getPadding } from '../utils'

export const Gallery = ({ content }: { content: any }) => (
  <section className="py-32 bg-white dark:bg-slate-950" style={getPadding(content.styles)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h2 className="text-accent font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">
          {content.tagline || "Our Work"}
        </h2>
        <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl">
          {content.title || "Featured Gallery"}
        </h3>
        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium">
          {content.subtitle || "Explore our collection of projects and achievements."}
        </p>
      </div>
      {content.layout === 'masonry' ? (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {content.images?.map((image: any, i: number) => (
            <div
              key={i}
              className="break-inside-avoid rounded-2xl overflow-hidden group relative"
            >
              <img
                src={image.src}
                alt={image.alt || `Gallery image ${i + 1}`}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {image.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : content.layout === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {content.images?.map((image: any, i: number) => (
            <div
              key={i}
              className="aspect-square rounded-xl overflow-hidden group relative"
            >
              <img
                src={image.src}
                alt={image.alt || `Gallery image ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {image.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-medium">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {content.images?.map((image: any, i: number) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden group relative"
            >
              <img
                src={image.src}
                alt={image.alt || `Gallery image ${i + 1}`}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {image.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
)
