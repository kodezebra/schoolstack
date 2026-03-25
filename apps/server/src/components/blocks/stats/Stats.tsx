import { html, raw } from 'hono/html'
import { getPadding } from '../utils'

export const Stats = ({ content }: { content: any }) => {
  const paddingStyleStr = content.styles?.paddingY !== undefined 
    ? `padding-top: ${content.styles.paddingY}px; padding-bottom: ${content.styles.paddingY}px;` 
    : ''

  return html`
    <section class="px-4 py-16 bg-primary/5 dark:bg-primary/10 rounded-3xl mx-4 my-8 border border-primary/10" data-animate="scale-in" style="${paddingStyleStr}">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        ${(content.items || []).map((item: any) => raw(`
          <div class="flex flex-col gap-1" data-animate-item>
            <span class="text-3xl font-black text-primary">${item.value}</span>
            <span class="text-sm font-medium text-slate-500 uppercase tracking-wider">${item.label}</span>
          </div>
        `))}
      </div>
    </section>
  `
}
