import { html, raw } from 'hono/html'
import { getPadding, renderIcon } from '../utils'

export const Pricing = ({ content }: { content: any }) => {
  const paddingStyleStr = content.styles?.paddingY !== undefined 
    ? `padding-top: ${content.styles.paddingY}px; padding-bottom: ${content.styles.paddingY}px;` 
    : ''

  return html`
    <section class="py-32 bg-white dark:bg-slate-950" data-animate="fade-up" style="${paddingStyleStr}">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-20" data-animate-item>
          <h2 class="text-accent font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">
            ${content.tagline || "Pricing Plans"}
          </h2>
          <h3 class="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl">
            ${content.title || "Choose Your Plan"}
          </h3>
          <p class="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium">
            ${content.subtitle || "Simple, transparent pricing for every stage of your journey."}
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${(content.tiers || []).map((tier: any, i: number) => raw(`
            <div class="relative rounded-2xl border-2 p-8 card-hover ${tier.recommended ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}" data-animate-item>
              ${tier.recommended ? `
                <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              ` : ''}
              <div class="text-center mb-8">
                <h4 class="text-xl font-display font-bold text-slate-900 dark:text-white">${tier.name}</h4>
                <p class="text-slate-500 dark:text-slate-400 text-sm mt-2">${tier.description}</p>
                <div class="mt-6 flex items-baseline justify-center gap-1">
                  <span class="text-5xl font-display font-bold text-slate-900 dark:text-white">
                    ${tier.currency || '$'}${tier.price}
                  </span>
                  <span class="text-slate-500 dark:text-slate-400">/${tier.period || 'month'}</span>
                </div>
              </div>
              <ul class="space-y-4 mb-8">
                ${(tier.features || []).map((feature: string) => `
                  <li class="flex items-start gap-3">
                    ${renderIcon('check', 'h-5 w-5 text-green-500 flex-shrink-0 mt-0.5')}
                    <span class="text-slate-600 dark:text-slate-300">${feature}</span>
                  </li>
                `).join('')}
              </ul>
              <a
                href="${tier.ctaHref || '#'}"
                class="block w-full py-3 px-4 rounded-lg text-center font-semibold transition-all btn-animated ${tier.recommended ? 'bg-primary text-white hover:bg-primary/90' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'}"
              >
                ${tier.ctaLabel || 'Get Started'}
              </a>
            </div>
          `))}
        </div>
      </div>
    </section>
  `
}
