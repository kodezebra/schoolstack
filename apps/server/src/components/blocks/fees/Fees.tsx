import { html, raw } from 'hono/html'
import { getPadding, renderIcon } from '../utils'

export const Fees = ({ content, settings }: { content: any; settings?: any }) => {
  const paddingStyleStr = content.styles?.paddingY !== undefined 
    ? `padding-top: ${content.styles.paddingY}px; padding-bottom: ${content.styles.paddingY}px;` 
    : ''

  const currency = content.currency || settings?.currency || 'UGX'
  const sections = content.sections || []

  return html`
    <section class="py-20 bg-slate-50 dark:bg-slate-900/50" data-animate="fade-up" style="${paddingStyleStr}">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16" data-animate-item>
          ${content.tagline ? html`<span class="text-primary font-display font-bold tracking-[0.2em] uppercase text-sm mb-4 block">${content.tagline}</span>` : ''}
          <h2 class="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6">
            ${content.title || "School Fees"}
          </h2>
          ${content.subtitle ? html`<p class="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">${content.subtitle}</p>` : ''}
        </div>

        ${sections.map((section: any) => {
          if (section.style === 'checklist') {
            return raw(`
              <div class="mb-12" data-animate-item>
                ${section.title ? html`<h3 class="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">${section.title}</h3>` : ''}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  ${(section.items || []).map((item: any) => raw(`
                    <div class="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        ${renderIcon('check', 'w-5 h-5 text-green-600 dark:text-green-400')}
                      </div>
                      <span class="text-slate-700 dark:text-slate-300 font-medium">${item.name}</span>
                    </div>
                  `)).join('')}
                </div>
                ${section.note ? html`<p class="mt-4 text-slate-500 dark:text-slate-400 text-sm">${section.note}</p>` : ''}
              </div>
            `)
          }

          if (section.style === 'table') {
            return raw(`
              <div class="mb-12" data-animate-item>
                ${section.title ? html`<h3 class="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">${section.title}</h3>` : ''}
                <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table class="w-full">
                    <thead>
                      <tr class="border-b border-slate-200 dark:border-slate-800">
                        <th class="text-left p-4 font-semibold text-slate-900 dark:text-white">Item</th>
                        <th class="text-right p-4 font-semibold text-slate-900 dark:text-white">Amount</th>
                        ${section.items?.[0]?.note ? html`<th class="text-right p-4 font-semibold text-slate-900 dark:text-white">Note</th>` : ''}
                      </tr>
                    </thead>
                    <tbody>
                      ${(section.items || []).map((item: any, i: number) => raw(`
                        <tr class="${i < section.items.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}">
                          <td class="p-4 text-slate-700 dark:text-slate-300">${item.name}</td>
                          <td class="p-4 text-right font-semibold text-slate-900 dark:text-white">${item.price} ${currency}</td>
                          ${item.note ? html`<td class="p-4 text-right text-slate-500 dark:text-slate-400 text-sm">${item.note}</td>` : `<td></td>`}
                        </tr>
                      `)).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            `)
          }

          // Default: list style
          return raw(`
            <div class="mb-12" data-animate-item>
              ${section.title ? html`<h3 class="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">${section.title}</h3>` : ''}
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${(section.items || []).map((item: any) => raw(`
                  <div class="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span class="text-slate-700 dark:text-slate-300 font-medium">${item.name}</span>
                    <span class="text-primary font-bold">${item.price} ${currency}</span>
                  </div>
                `)).join('')}
              </div>
            </div>
          `)
        })}

        ${content.ctaLabel && content.ctaHref ? html`
          <div class="text-center mt-12" data-animate-item>
            <a href="${content.ctaHref}" class="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors">
              ${content.ctaLabel}
              ${renderIcon('arrow-right', 'w-5 h-5')}
            </a>
          </div>
        ` : ''}
      </div>
    </section>
  `
}
