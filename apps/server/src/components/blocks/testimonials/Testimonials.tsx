import { getPadding } from '../utils'

export const Testimonials = ({ content }: { content: any }) => (
  <section className="py-32 bg-slate-50 dark:bg-slate-900/50" style={getPadding(content.styles)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h2 className="text-accent font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">
          {content.tagline || "Testimonials"}
        </h2>
        <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl">
          {content.title || "What Our Clients Say"}
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {content.items?.map((item: any) => (
          <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex items-center gap-4 mb-8">
              <img src={item.image} alt={item.name} className="w-14 h-14 rounded-full object-cover" />
              <div>
                <h4 className="font-display font-bold text-slate-900 dark:text-white">{item.name}</h4>
                <p className="text-sm text-slate-500 font-medium">{item.role}</p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">"{item.text}"</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)
