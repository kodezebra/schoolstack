import { getPadding } from '../utils'

export const Faq = ({ content }: { content: any }) => (
  <section className="py-32 bg-white dark:bg-background-dark" style={getPadding(content.styles)}>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        {content.tagline && (
          <h2 className="text-primary font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">{content.tagline}</h2>
        )}
        <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl mb-6">
          {content.title || "Frequently Asked Questions"}
        </h3>
        {content.subtitle && (
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            {content.subtitle}
          </p>
        )}
      </div>
      <div className="space-y-4">
        {content.items?.map((item: any, index: number) => (
          <details key={index} className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
            <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 pr-4">{item.question || "Question?"}</h4>
              <span className="text-primary transition-transform group-open:rotate-180 flex-shrink-0">
                <i data-lucide="chevron-down" className="w-6 h-6"></i>
              </span>
            </summary>
            <div className="px-6 pb-6">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.answer || "Answer goes here."}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  </section>
)
