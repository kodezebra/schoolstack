import { html } from 'hono/html'
import { getPadding } from '../utils'

export const Cta = ({ content }: { content: any }) => html`
  <section class="py-24 bg-primary mx-4 my-12 rounded-3xl" data-animate="scale-in" style="${getPadding(content.styles)}">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 class="text-4xl font-display font-bold text-white sm:text-5xl mb-8" data-animate-item>
        ${content.title || "Ready to Revolutionize Your Digital Strategy?"}
      </h2>
      <p class="text-xl text-white/90 mb-12 max-w-2xl mx-auto font-medium" data-animate-item>
        ${content.subtitle || "Join hundreds of forward-thinking companies already using KZ Cloud to drive growth and innovation."}
      </p>
      <div class="flex justify-center" data-animate-item>
        <a
          href="${content.cta?.href || '#'}"
          class="bg-accent text-white px-12 py-5 rounded-2xl font-display font-bold text-xl hover:brightness-110 hover:scale-[1.05] active:scale-[0.98] transition-all shadow-2xl shadow-black/20 inline-block btn-animated"
        >
          ${content.cta?.label || content.ctaLabel || "Start Your Journey Today"}
        </a>
      </div>
    </div>
  </section>
`
