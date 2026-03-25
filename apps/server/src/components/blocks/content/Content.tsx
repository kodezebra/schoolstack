import { html, raw } from 'hono/html'
import { getPadding, renderIcon } from '../utils'

export const Content = ({ content }: { content: any }) => {
  const isReversed = content.reverse
  const paddingStyle = getPadding(content.styles) as Record<string, string>
  const paddingStyleStr = content.styles?.paddingY !== undefined 
    ? `padding-top: ${content.styles.paddingY}px; padding-bottom: ${content.styles.paddingY}px;` 
    : ''

  return html`
    <section class="py-32 overflow-hidden bg-white dark:bg-background-dark" data-animate="fade-up" style="${paddingStyleStr}">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:flex lg:items-center lg:gap-24 ${isReversed ? 'lg:flex-row-reverse' : ''}">
          <div class="lg:w-1/2 relative" data-animate-item>
            <div
              class="relative rounded-2xl overflow-hidden shadow-2xl z-10 aspect-square sm:aspect-video lg:aspect-square bg-slate-200 dark:bg-slate-800 bg-cover bg-center img-zoom"
              style="background-image: url('${content.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'}')"
            >
              <div class="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
            </div>
            <div class="absolute -bottom-10 -right-10 w-64 h-64 bg-accent rounded-full -z-0 opacity-20 blur-3xl"></div>
            <div class="absolute -top-10 -left-10 w-64 h-64 bg-primary rounded-full -z-0 opacity-20 blur-3xl"></div>
          </div>
          <div class="mt-16 lg:mt-0 lg:w-1/2" data-animate-item>
            <h2 class="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl mb-8 leading-tight">
              ${content.title || "About Our Vision"}
            </h2>
            <p class="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
              ${content.text1 || "Founded on the principle of innovation, we believe that technology should be accessible, beautiful, and functional."}
            </p>
            <p class="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-medium">
              ${content.text2 || "We don't just build products; we build partnerships. By understanding your unique challenges, we deliver solutions that are not only effective today but scalable for tomorrow."}
            </p>
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
              ${(content.features || []).map((f: string) => raw(`
                <li class="flex items-center gap-3">
                  <span class="text-primary w-6 h-6">${renderIcon(content.featureIcon || 'check-circle', 'w-6 h-6')}</span>
                  <span class="font-bold text-slate-700 dark:text-slate-200">${f}</span>
                </li>
              `))}
            </ul>
            ${content.cta ? raw(`
              <a href="${content.cta.href}" class="text-primary font-display font-bold text-lg flex items-center gap-3 group hover:brightness-125 transition-all">
                <span class="relative">
                  ${content.cta.label}
                  <span class="absolute bottom-0 left-0 w-full h-0.5 bg-primary/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </span>
                <div class="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <span class="w-5 h-5">${renderIcon('arrow-right', 'w-5 h-5')}</span>
                </div>
              </a>
            `) : ''}
          </div>
        </div>
      </div>
    </section>
  `
}
