import { html, raw } from 'hono/html'
import { getPadding, renderIcon } from '../utils'

export const Features = ({ content }: { content: any }) => {
  const paddingStyleStr = content.styles?.paddingY !== undefined 
    ? `padding-top: ${content.styles.paddingY}px; padding-bottom: ${content.styles.paddingY}px;` 
    : ''

  return html`
    <section class="py-32 bg-slate-50 dark:bg-slate-900/50" data-animate="fade-up" style="${paddingStyleStr}">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-20" data-animate-item>
          <h2 class="text-accent font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">
            ${content.tagline || "Our Expertise"}
          </h2>
          <h3 class="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl">
            ${content.title || "Tailored Solutions for Your Success"}
          </h3>
          <p class="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium">
            ${content.subtitle || "We provide high-quality services to help your business thrive in a digital-first world through innovation and design."}
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
          ${(content.items || []).map((item: any, index: number) => raw(`
            <div class="group p-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none card-hover" data-animate-item>
              <div class="w-16 h-16 ${item.bgClass || 'bg-primary/10'} rounded-xl flex items-center justify-center mb-8 ${item.iconClass || 'text-primary'} group-hover:scale-110 transition-transform">
                ${renderIcon(item.icon || 'zap', 'w-10 h-10')}
              </div>
              <h4 class="text-2xl font-display font-bold mb-4">${item.title}</h4>
              <p class="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">${item.text}</p>
            </div>
          `))}
        </div>
      </div>
    </section>
  `
}
