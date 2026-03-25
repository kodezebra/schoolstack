import { html, raw } from 'hono/html'
import { getPadding, renderIcon } from '../utils'

export const Steps = ({ content }: { content: any }) => {
  const paddingStyleStr = content.styles?.paddingY !== undefined 
    ? `padding-top: ${content.styles.paddingY}px; padding-bottom: ${content.styles.paddingY}px;` 
    : ''

  return html`
    <section class="py-32 bg-white dark:bg-background-dark" data-animate="fade-up" style="${paddingStyleStr}">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-20" data-animate-item>
          ${content.tagline ? html`<h2 class="text-primary font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">${content.tagline}</h2>` : ''}
          <h3 class="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl mb-6">
            ${content.title || "How It Works"}
          </h3>
          ${content.subtitle ? html`<p class="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">${content.subtitle}</p>` : ''}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          ${(content.items || []).map((item: any, index: number) => raw(`
            <div class="relative flex flex-col items-center text-center p-6 card-hover" data-animate-item>
              <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                ${item.icon ? renderIcon(item.icon, 'w-8 h-8') : `<span class="text-2xl font-black">${item.number || index + 1}</span>`}
              </div>
              <h4 class="text-xl font-display font-bold text-slate-900 dark:text-white mb-3">${item.title || `Step ${index + 1}`}</h4>
              <p class="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">${item.description || "Step description goes here."}</p>
            </div>
          `))}
        </div>
      </div>
    </section>
  `
}
