import { getPadding } from '../utils'

export const Values = ({ content }: { content: any }) => (
  <section className="py-32 bg-slate-50 dark:bg-slate-900/50" style={getPadding(content.styles)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        {content.tagline && (
          <h2 className="text-primary font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">{content.tagline}</h2>
        )}
        <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl mb-6">
          {content.title || "Our Core Values"}
        </h3>
        {content.subtitle && (
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.items?.map((item: any, index: number) => (
          <div key={index} className="group flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/50 p-8 hover:border-primary/50 transition-colors">
            <div className="text-primary bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              {item.icon ? (
                <i data-lucide={item.icon} className="w-7 h-7"></i>
              ) : (
                <i data-lucide="star" className="w-7 h-7"></i>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-slate-900 dark:text-slate-100 text-xl font-bold">{item.title || "Value Title"}</h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{item.description || "Value description goes here."}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)
