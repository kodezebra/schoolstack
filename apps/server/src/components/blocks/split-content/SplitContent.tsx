import { getPadding } from '../utils'

export const SplitContent = ({ content, settings }: { content: any; settings?: any }) => {
  const imagePosition = content.imagePosition || 'left'
  const isReversed = imagePosition === 'right'

  return (
    <section className="py-32 overflow-hidden bg-white dark:bg-background-dark" style={getPadding(content.styles)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`lg:flex lg:items-center lg:gap-24 ${isReversed ? 'lg:flex-row-reverse' : ''}`}>
          <div className={`relative ${isReversed ? 'lg:w-1/2' : 'lg:w-1/2'}`}>
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl z-10 aspect-square sm:aspect-video lg:aspect-square bg-slate-200 dark:bg-slate-800 bg-cover bg-center"
              style={{ backgroundImage: `url('${content.image || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"}')` }}
            >
              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent rounded-full -z-0 opacity-20 blur-3xl"></div>
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary rounded-full -z-0 opacity-20 blur-3xl"></div>
          </div>
          <div className={`mt-16 lg:mt-0 ${isReversed ? 'lg:w-1/2 lg:pr-8' : 'lg:w-1/2 lg:pl-8'}`}>
            {content.eyebrow && (
              <span className="text-primary font-bold tracking-widest text-sm uppercase block mb-4">{content.eyebrow}</span>
            )}
            <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl mb-8 leading-tight">
              {content.title || "About Our Vision"}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
              {content.description || "Founded on the principle of innovation, we believe that technology should be accessible, beautiful, and functional."}
            </p>
            {content.cta && (
              <a
                href={content.cta.href || "#"}
                className="text-primary font-display font-bold text-lg flex items-center gap-3 group hover:brightness-125 transition-all"
              >
                <span className="relative">
                  {content.cta.label || "Learn More"}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </span>
                <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <i data-lucide="arrow-right" className="w-5 h-5"></i>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
