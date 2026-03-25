import { html, raw } from 'hono/html'
import { getPadding, renderIcon } from '../utils'

export const Services = ({ content }: { content: any }) => {
  const paddingStyleStr = content.styles?.paddingY !== undefined 
    ? `padding-top: ${content.styles.paddingY}px; padding-bottom: ${content.styles.paddingY}px;` 
    : ''

  const renderItem = (item: any, i: number) => raw(`
    <div class="group p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 transition-all shadow-lg shadow-slate-200/50 dark:shadow-none card-hover" data-animate-item>
      <div class="w-14 h-14 ${item.bgClass || 'bg-primary/10'} rounded-xl flex items-center justify-center mb-6 ${item.iconClass || 'text-primary'} group-hover:scale-110 transition-transform">
        ${renderIcon(item.icon || 'zap', 'w-7 h-7')}
      </div>
      <h4 class="text-xl font-display font-bold text-slate-900 dark:text-white">${item.title}</h4>
      <p class="text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">${item.description}</p>
      ${item.link ? `
        <a href="${item.link}" class="inline-flex items-center gap-1 text-primary font-semibold mt-4 hover:underline">
          Learn more ${renderIcon('arrow-right', 'w-4 h-4')}
        </a>
      ` : ''}
    </div>
  `)

  return html`
    <section class="py-32 bg-slate-50 dark:bg-slate-900/50" data-animate="fade-up" style="${paddingStyleStr}">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-20" data-animate-item>
          <h2 class="text-accent font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">
            ${content.tagline || "Our Services"}
          </h2>
          <h3 class="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl">
            ${content.title || "What We Offer"}
          </h3>
          <p class="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium">
            ${content.subtitle || "Comprehensive solutions tailored to your needs."}
          </p>
        </div>
        ${content.layout === 'list' ? html`
          <div class="space-y-6">
            ${(content.items || []).map((item: any, i: number) => raw(`
              <div class="flex gap-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors card-hover" data-animate-item>
                <div class="w-14 h-14 ${item.bgClass || 'bg-primary/10'} rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconClass || 'text-primary'}">
                  ${renderIcon(item.icon || 'zap', 'w-7 h-7')}
                </div>
                <div>
                  <h4 class="text-xl font-display font-bold text-slate-900 dark:text-white">${item.title}</h4>
                  <p class="text-slate-600 dark:text-slate-400 mt-2">${item.description}</p>
                  ${item.link ? `
                    <a href="${item.link}" class="inline-flex items-center gap-1 text-primary font-semibold mt-3 hover:underline">
                      Learn more ${renderIcon('arrow-right', 'w-4 h-4')}
                    </a>
                  ` : ''}
                </div>
              </div>
            `))}
          </div>
        ` : html`
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${(content.items || []).map((item: any, i: number) => renderItem(item, i))}
          </div>
        `}
      </div>
    </section>
  `
}
