import { html, raw } from 'hono/html'
import { getPadding, renderIcon } from '../utils'

export const Values = ({ content }: { content: any }) => {
  const paddingStyleStr = content.styles?.paddingY !== undefined 
    ? `padding-top: ${content.styles.paddingY}px; padding-bottom: ${content.styles.paddingY}px;` 
    : ''

  return html`
    <section class="py-20 bg-slate-50 dark:bg-slate-900/50" data-animate="fade-up" style="${paddingStyleStr}">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16" data-animate-item>
          ${content.tagline ? html`<span class="text-primary font-display font-bold tracking-[0.2em] uppercase text-sm mb-4 block">${content.tagline}</span>` : ''}
          <h2 class="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6">
            ${content.title || "Our Values"}
          </h2>
          ${content.subtitle ? html`<p class="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">${content.subtitle}</p>` : ''}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${(content.items || []).map((item: any) => raw(`
            <div class="group flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 hover:border-primary/50 hover:shadow-lg transition-all card-hover" data-animate-item>
              <div class="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                ${renderIcon(item.icon || 'star', 'w-7 h-7 text-primary group-hover:text-white')}
              </div>
              <div class="flex flex-col gap-2">
                <h4 class="text-slate-900 dark:text-slate-100 text-xl font-bold">${item.title || "Value"}</h4>
                <p class="text-slate-600 dark:text-slate-400 leading-relaxed">${item.description || ""}</p>
              </div>
            </div>
          `))}
        </div>
      </div>
    </section>
  `
}
