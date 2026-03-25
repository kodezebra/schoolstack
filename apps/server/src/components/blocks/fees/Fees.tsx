import { html, raw } from 'hono/html'
import { getPadding, renderIcon } from '../utils'

export const Fees = ({ content, settings }: { content: any; settings?: any }) => {
  const paddingStyleStr = content.styles?.paddingY !== undefined 
    ? `padding-top: ${content.styles.paddingY}px; padding-bottom: ${content.styles.paddingY}px;` 
    : ''

  const currency = content.currency || settings?.currency || 'UGX'
  const sections = content.sections || []

  return html`
    <section class="py-24 relative overflow-hidden" data-animate="fade-up" style="${paddingStyleStr}">
      <div class="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-900/50 dark:to-slate-900"></div>
      <div class="absolute top-20 left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-10 w-60 h-60 bg-accent/5 rounded-full blur-3xl"></div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="text-center max-w-3xl mx-auto mb-16" data-animate-item>
          ${content.tagline ? html`<span class="section-tagline font-display font-bold tracking-[0.2em] uppercase text-sm mb-4 block">${content.tagline}</span>` : ''}
          <h2 class="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6 decorative-line">
            ${content.title || "School Fees"}
          </h2>
          ${content.subtitle ? html`<p class="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">${content.subtitle}</p>` : ''}
        </div>

        <div class="space-y-12">
        ${sections.map((section: any, sectionIndex: number) => {
          if (section.style === 'checklist') {
            return raw(`
              <div class="relative" data-animate-item>
                <div class="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-primary/50 rounded-full opacity-50"></div>
                <div class="pl-8">
                  ${section.title ? html`<h3 class="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3"><span class="text-3xl text-primary/30 font-black">0${sectionIndex + 1}</span>${section.title}</h3>` : ''}
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${(section.items || []).map((item: any) => raw(`
                      <div class="flex items-center gap-4 p-4 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800/80 fee-card-lift hover:border-green-300 dark:hover:border-green-700/50 group">
                        <div class="w-10 h-10 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          ${renderIcon('check', 'w-5 h-5 text-green-600 dark:text-green-400')}
                        </div>
                        <span class="text-slate-700 dark:text-slate-300 font-medium">${item.name}</span>
                      </div>
                    `)).join('')}
                  </div>
                  ${section.note ? html`<p class="mt-5 text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2"><span class="w-1.5 h-1.5 bg-primary rounded-full"></span>${section.note}</p>` : ''}
                </div>
              </div>
            `)
          }

          if (section.style === 'table') {
            return raw(`
              <div class="relative" data-animate-item>
                <div class="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-primary/50 rounded-full opacity-50"></div>
                <div class="pl-8">
                  ${section.title ? html`<h3 class="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3"><span class="text-3xl text-primary/30 font-black">0${sectionIndex + 1}</span>${section.title}</h3>` : ''}
                  <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-lg shadow-slate-200/20 dark:shadow-slate-950/20">
                    <table class="w-full">
                      <thead>
                        <tr class="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
                          <th class="text-left p-5 font-bold text-slate-900 dark:text-white">Item</th>
                          <th class="text-right p-5 font-bold text-slate-900 dark:text-white">Amount</th>
                          ${section.items?.[0]?.note ? html`<th class="text-right p-5 font-bold text-slate-900 dark:text-white">Note</th>` : ''}
                        </tr>
                      </thead>
                      <tbody>
                        ${(section.items || []).map((item: any, i: number) => raw(`
                          <tr class="hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors duration-200 fee-card-lift ${i < section.items.length - 1 ? 'border-b border-slate-100/80 dark:border-slate-800/50' : ''}">
                            <td class="p-5 text-slate-700 dark:text-slate-300">${item.name}</td>
                            <td class="p-5 text-right font-bold text-primary">${item.price} ${currency}</td>
                            ${item.note ? html`<td class="p-5 text-right text-slate-500 dark:text-slate-400 text-sm italic">${item.note}</td>` : `<td></td>`}
                          </tr>
                        `)).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            `)
          }

          // Default: list style
          return raw(`
            <div class="relative" data-animate-item>
              <div class="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-primary/50 rounded-full opacity-50"></div>
              <div class="pl-8">
                ${section.title ? html`<h3 class="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3"><span class="text-3xl text-primary/30 font-black">0${sectionIndex + 1}</span>${section.title}</h3>` : ''}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  ${(section.items || []).map((item: any) => raw(`
                    <div class="flex items-center justify-between p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-800/80 fee-card-lift group">
                      <span class="text-slate-700 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">${item.name}</span>
                      <span class="px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary font-bold rounded-lg group-hover:bg-primary group-hover:text-white transition-all duration-300">${item.price} ${currency}</span>
                    </div>
                  `)).join('')}
                </div>
              </div>
            </div>
          `)
        })}
        </div>

        ${content.ctaLabel && content.ctaHref ? raw(`
          <div class="text-center mt-16" data-animate-item>
            <a href="${content.ctaHref}" class="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all duration-300 group">
              ${content.ctaLabel}
              <span class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                ${renderIcon('arrow-right', 'w-5 h-5')}
              </span>
            </a>
          </div>
        `) : ''}
      </div>
    </section>
  `
}
