import { getPadding } from '../utils'

export const Hero = ({ content }: { content: any }) => (
  <header 
    className="relative hero-bg pt-24 pb-32 lg:pt-48 lg:pb-56 text-white overflow-hidden"
    style={{
      ...(content.image ? { 
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.9)), url('${content.image}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}),
      ...getPadding(content.styles)
    }}
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-3xl">
        <h1 className="text-5xl font-display font-bold tracking-tight sm:text-7xl mb-8 leading-[1.1]">
          {content.title || "Design Your Future with Precision"}
        </h1>
        <p className="mt-6 text-xl text-indigo-50 font-medium leading-relaxed max-w-2xl">
          {content.subtitle || "Elevate your digital presence with our modern, professional solutions tailored for growth and impact."}
        </p>
        <div className="mt-12 flex flex-col sm:flex-row gap-5">
          {content.primaryCta && (
            <a
              href={content.primaryCta.href || "#"}
              className="bg-accent text-white px-10 py-5 rounded-2xl font-display font-bold text-xl hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-accent/30 inline-block text-center"
            >
              {content.primaryCta.label}
            </a>
          )}
          {content.secondaryCta && (
            <a
              href={content.secondaryCta.href || "#"}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-2xl font-display font-bold text-xl hover:bg-white/20 transition-all inline-block text-center"
            >
              {content.secondaryCta.label}
            </a>
          )}
        </div>
      </div>
    </div>
    {!content.image && <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-20 pointer-events-none"></div>}
  </header>
)
