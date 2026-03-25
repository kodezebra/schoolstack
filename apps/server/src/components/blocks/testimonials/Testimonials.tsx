import { html, raw } from 'hono/html'
import { getPadding } from '../utils'

export const Testimonials = ({ content }: { content: any }) => {
  const paddingStyleStr = content.styles?.paddingY !== undefined 
    ? `padding-top: ${content.styles.paddingY}px; padding-bottom: ${content.styles.paddingY}px;` 
    : ''

  return html`
    <section class="py-32 bg-slate-50 dark:bg-slate-900/50" data-animate="fade-up" style="${paddingStyleStr}">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-20" data-animate-item>
          <h2 class="text-accent font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">
            ${content.tagline || "Testimonials"}
          </h2>
          <h3 class="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl">
            ${content.title || "What Our Clients Say"}
          </h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
          ${(content.items || []).map((item: any) => raw(`
            <div class="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none card-hover" data-animate-item>
              <div class="flex items-center gap-4 mb-8">
                <img src="${item.image}" alt="${item.name}" class="w-14 h-14 rounded-full object-cover" />
                <div>
                  <h4 class="font-display font-bold text-slate-900 dark:text-white">${item.name}</h4>
                  <p class="text-sm text-slate-500 font-medium">${item.role}</p>
                </div>
              </div>
              <p class="text-slate-600 dark:text-slate-400 leading-relaxed italic">"${item.text}"</p>
            </div>
          `))}
        </div>
      </div>
    </section>
  `
}
