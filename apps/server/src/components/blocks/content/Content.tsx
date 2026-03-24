import { getPadding, IconSvg } from '../utils'

export const Content = ({ content }: { content: any }) => (
  <section className="py-32 overflow-hidden bg-white dark:bg-background-dark" style={getPadding(content.styles)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className={`lg:flex lg:items-center lg:gap-24 ${content.reverse ? "lg:flex-row-reverse" : ""}`}>
        <div className="lg:w-1/2 relative">
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl z-10 aspect-square sm:aspect-video lg:aspect-square bg-slate-200 dark:bg-slate-800 bg-cover bg-center"
            style={{ backgroundImage: `url('${content.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"}')` }}
          >
            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent rounded-full -z-0 opacity-20 blur-3xl"></div>
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary rounded-full -z-0 opacity-20 blur-3xl"></div>
        </div>
        <div className="mt-16 lg:mt-0 lg:w-1/2">
          <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl mb-8 leading-tight">
            {content.title || "About Our Vision"}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
            {content.text1 || "Founded on the principle of innovation, we believe that technology should be accessible, beautiful, and functional."}
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-medium">
            {content.text2 || "We don't just build products; we build partnerships. By understanding your unique challenges, we deliver solutions that are not only effective today but scalable for tomorrow."}
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
            {content.features?.map((f: string) => (
              <li className="flex items-center gap-3">
                <IconSvg icon={content.featureIcon || "check-circle"} className="text-primary w-6 h-6" />
                <span className="font-bold text-slate-700 dark:text-slate-200">{f}</span>
              </li>
            ))}
          </ul>
          {content.cta && (
            <a href={content.cta.href} className="text-primary font-display font-bold text-lg flex items-center gap-3 group hover:brightness-125 transition-all">
              <span className="relative">
                {content.cta.label}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </span>
              <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <IconSvg icon="arrow-right" className="w-5 h-5" />
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  </section>
)
