import { getPadding } from '../utils'

export const Services = ({ content }: { content: any }) => (
  <section className="py-32 bg-slate-50 dark:bg-slate-900/50" style={getPadding(content.styles)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h2 className="text-accent font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">
          {content.tagline || "Our Services"}
        </h2>
        <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl">
          {content.title || "What We Offer"}
        </h3>
        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium">
          {content.subtitle || "Comprehensive solutions tailored to your needs."}
        </p>
      </div>
      {content.layout === 'list' ? (
        <div className="space-y-6">
          {content.items?.map((item: any, i: number) => (
            <div
              key={i}
              className="flex gap-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors"
            >
              <div className={`w-14 h-14 ${item.bgClass || "bg-primary/10"} rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconClass || "text-primary"}`}>
                <i data-lucide={item.icon || "zap"} className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-xl font-display font-bold text-slate-900 dark:text-white">{item.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 mt-2">{item.description}</p>
                {item.link && (
                  <a href={item.link} className="inline-flex items-center gap-1 text-primary font-semibold mt-3 hover:underline">
                    Learn more <i data-lucide="arrow-right" className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.items?.map((item: any, i: number) => (
            <div
              key={i}
              className="group p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 transition-all shadow-lg shadow-slate-200/50 dark:shadow-none hover:-translate-y-1"
            >
              <div className={`w-14 h-14 ${item.bgClass || "bg-primary/10"} rounded-xl flex items-center justify-center mb-6 ${item.iconClass || "text-primary"} group-hover:scale-110 transition-transform`}>
                <i data-lucide={item.icon || "zap"} className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-display font-bold text-slate-900 dark:text-white">{item.title}</h4>
              <p className="text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">{item.description}</p>
              {item.link && (
                <a href={item.link} className="inline-flex items-center gap-1 text-primary font-semibold mt-4 hover:underline">
                  Learn more <i data-lucide="arrow-right" className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
)
