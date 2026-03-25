import { html, raw } from 'hono/html'
import { getPadding, renderIcon } from '../utils'

export const Features = ({ content }: { content: any }) => {
  const paddingStyleStr = content.styles?.paddingY !== undefined 
    ? `padding-top: ${content.styles.paddingY}px; padding-bottom: ${content.styles.paddingY}px;` 
    : ''

  const items = content.items || []

  return html`
    <section class="py-24 relative overflow-hidden" data-animate="fade-up" style="${paddingStyleStr}">
      <div class="absolute inset-0 decorative-dots opacity-30"></div>
      <div class="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl"></div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="text-center max-w-3xl mx-auto mb-16" data-animate-item>
          ${content.tagline ? html`<span class="section-tagline font-display font-bold tracking-[0.2em] uppercase text-sm mb-4 block">${content.tagline}</span>` : ''}
          <h2 class="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6 decorative-line">
            ${content.title || "Our Programs"}
          </h2>
          ${content.subtitle ? html`<p class="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">${content.subtitle}</p>` : ''}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          ${items.map((item: any, index: number) => {
            const number = String(index + 1).padStart(2, '0')
            const hasImage = !!item.image
            
            return raw(`
              <div class="group relative rounded-2xl overflow-hidden min-h-[420px] card-shimmer card-float" data-animate-item style="box-shadow: 0 4px 20px -5px rgba(0,0,0,0.1);">
                ${hasImage ? `
                  <div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style="background-image: url('${item.image}');">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent"></div>
                  </div>
                ` : `
                  <div class="absolute inset-0 bg-gradient-to-br from-primary/25 to-accent/15 dark:from-primary/35 dark:to-accent/25">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent"></div>
                    <div class="absolute inset-0 decorative-dots opacity-20"></div>
                  </div>
                `}
                <div class="relative h-full flex flex-col justify-end p-8 min-h-[420px]">
                  <span class="absolute top-6 right-6 text-7xl font-display font-black text-white/10 group-hover:text-white/20 transition-colors duration-500">${number}</span>
                  ${item.icon ? `
                    <div class="w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center mb-5 icon-bounce border border-white/20">
                      ${renderIcon(item.icon, 'w-7 h-7 text-white')}
                    </div>
                  ` : ''}
                  <h3 class="text-2xl md:text-3xl font-display font-bold text-white mb-4 group-hover:translate-x-2 transition-transform duration-300">${item.title}</h3>
                  <p class="text-white/85 leading-relaxed text-lg">${item.text}</p>
                  ${item.link ? `
                    <a href="${item.link}" class="inline-flex items-center gap-3 mt-6 text-white font-semibold group/link">
                      <span class="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300 group-hover/link:after:w-full">${item.linkLabel || 'Learn More'}</span>
                      <svg class="w-5 h-5 group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
