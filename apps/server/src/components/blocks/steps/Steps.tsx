import { getPadding } from '../utils'

export const Steps = ({ content }: { content: any }) => (
  <section className="py-32 bg-white dark:bg-background-dark" style={getPadding(content.styles)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        {content.tagline && (
          <h2 className="text-primary font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">{content.tagline}</h2>
        )}
        <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl mb-6">
          {content.title || "How It Works"}
        </h3>
        {content.subtitle && (
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            {content.subtitle}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {content.items?.map((item: any, index: number) => (
          <div key={index} className="relative flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
              {item.icon ? (
                <i data-lucide={item.icon} className="w-8 h-8"></i>
              ) : (
                <span className="text-2xl font-black">{item.number || index + 1}</span>
              )}
            </div>
            <h4 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-3">
              {item.title || `Step ${index + 1}`}
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {item.description || "Step description goes here."}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
)
