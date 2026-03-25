import { html, raw } from 'hono/html'
import { getPadding, renderIcon } from '../utils'

export const Features = ({ content }: { content: any }) => {
  const paddingStyleStr = content.styles?.paddingY !== undefined 
    ? `padding-top: ${content.styles.paddingY}px; padding-bottom: ${content.styles.paddingY}px;` 
    : ''

  const items = content.items || []

  return html`
    <section class="py-20" data-animate="fade-up" style="${paddingStyleStr}">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16" data-animate-item>
          ${content.tagline ? html`<span class="text-primary font-display font-bold tracking-[0.2em] uppercase text-sm mb-4 block">${content.tagline}</span>` : ''}
          <h2 class="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6">
            ${content.title || "Our Programs"}
          </h2>
          ${content.subtitle ? html`<p class="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">${content.subtitle}</p>` : ''}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          ${items.map((item: any, index: number) => {
            const number = String(index + 1).padStart(2, '0')
            const hasImage = !!item.image
            
            return raw(`
              <div class="group relative rounded-2xl overflow-hidden min-h-[400px] card-hover" data-animate-item>
                ${hasImage ? `
                  <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${item.image}');">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent"></div>
                  </div>
                ` : `
                  <div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10 dark:from-primary/30 dark:to-accent/20">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent"></div>
                  </div>
                `}
                <div class="relative h-full flex flex-col justify-end p-8 min-h-[400px]">
                  <span class="absolute top-6 left-6 text-6xl font-display font-bold text-white/20">${number}</span>
                  ${item.icon ? `
                    <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                      ${renderIcon(item.icon, 'w-6 h-6 text-white')}
                    </div>
                  ` : ''}
                  <h3 class="text-2xl md:text-3xl font-display font-bold text-white mb-3">${item.title}</h3>
                  <p class="text-white/80 leading-relaxed">${item.text}</p>
                  ${item.link ? `
                    <a href="${item.link}" class="inline-flex items-center gap-2 mt-4 text-white font-semibold hover:gap-3 transition-all">
                      <span>${item.linkLabel || 'Learn More'}</span>
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                      </svg>
                    </a>
                  ` : ''}
                </div>
              </div>
            `)
          })}
        </div>
      </div>
    </section>
  `
}
