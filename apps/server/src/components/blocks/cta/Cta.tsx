import { getPadding } from '../utils'

export const Cta = ({ content }: { content: any }) => (
  <section className="py-24 bg-primary mx-4 my-12 rounded-3xl" style={getPadding(content.styles)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-4xl font-display font-bold text-white sm:text-5xl mb-8">
        {content.title || "Ready to Revolutionize Your Digital Strategy?"}
      </h2>
      <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto font-medium">
        {content.subtitle || "Join hundreds of forward-thinking companies already using KZ Cloud to drive growth and innovation."}
      </p>
      <div className="flex justify-center">
        <a
          href={content.ctaLabel || "#"}
          className="bg-accent text-white px-12 py-5 rounded-2xl font-display font-bold text-xl hover:brightness-110 hover:scale-[1.05] active:scale-[0.98] transition-all shadow-2xl shadow-black/20 inline-block"
        >
          {content.ctaLabel || "Start Your Journey Today"}
        </a>
      </div>
    </div>
  </section>
)
