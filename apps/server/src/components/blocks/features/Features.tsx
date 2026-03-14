import { getPadding } from '../utils'

export const Features = ({ content }: { content: any }) => (
  <section className="py-32 bg-slate-50 dark:bg-slate-900/50" style={getPadding(content.styles)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h2 className="text-accent font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">
          {content.tagline || "Our Expertise"}
        </h2>
        <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl">
          {content.title || "Tailored Solutions for Your Success"}
        </h3>
        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium">
          {content.subtitle || "We provide high-quality services to help your business thrive in a digital-first world through innovation and design."}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {content.items?.map((item: any) => (
          <div className="group p-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2">
            <div className={`w-16 h-16 ${item.bgClass || "bg-primary/10"} rounded-xl flex items-center justify-center mb-8 ${item.iconClass || "text-primary"} group-hover:scale-110 transition-transform`}>
              <i data-lucide={item.icon || "zap"} className="w-10 h-10"></i>
            </div>
            <h4 className="text-2xl font-display font-bold mb-4">{item.title}</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)
