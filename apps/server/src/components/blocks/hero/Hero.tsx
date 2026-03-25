import { html, raw } from 'hono/html'
import { getPadding, renderIcon } from '../utils'

export const Hero = ({ content }: { content: any }) => {
  const bgStyle = content.image 
    ? `background-image: linear-gradient(to bottom, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.9)), url('${content.image}'); background-size: cover; background-position: center;` 
    : ''
  const paddingStyle = getPadding(content.styles)
  const combinedStyle = `${bgStyle} ${paddingStyle.paddingTop ? `padding-top: ${paddingStyle.paddingTop}; padding-bottom: ${paddingStyle.paddingBottom || paddingStyle.paddingTop};` : ''}`

  return html`
    <header 
      class="relative hero-bg pt-24 pb-32 lg:pt-48 lg:pb-56 text-white overflow-hidden"
      style="${combinedStyle}"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="max-w-3xl">
          ${content.badge ? html`
            <div class="hero-badge mb-10 inline-flex items-center gap-3 px-5 py-3 rounded-full text-xs sm:text-sm font-black tracking-[0.15em] uppercase whitespace-nowrap ${
              content.badgeVariant === 'glass' 
                ? 'bg-white/10 backdrop-blur-md border border-white/20 text-white' 
                : 'bg-accent text-white shadow-xl shadow-accent/40 ring-2 ring-accent/30'
            } opacity-0">
              ${content.badgeIcon ? raw(`<span class="w-4 h-4 sm:w-5 sm:h-5 shrink-0">${renderIcon(content.badgeIcon, 'w-4 h-4 sm:w-5 sm:h-5 shrink-0')}</span>`) : html`
                <span class="relative flex h-2.5 w-2.5 shrink-0">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
              `}
              <span class="font-semibold tracking-[0.1em]">${content.badge}</span>
            </div>
          ` : ''}
          <h1 class="hero-title text-5xl font-display font-bold tracking-tight sm:text-7xl mb-8 leading-[1.1] opacity-0">
            ${content.title || "Design Your Future with Precision"}
          </h1>
          <p class="hero-subtitle mt-6 text-xl text-indigo-50 font-medium leading-relaxed max-w-2xl opacity-0">
            ${content.subtitle || "Elevate your digital presence with our modern, professional solutions tailored for growth and impact."}
          </p>
          <div class="mt-12 flex flex-col sm:flex-row gap-5">
            ${content.primaryCta ? html`
              <a
                href="${content.primaryCta.href || '#'}"
                class="hero-cta bg-accent text-white px-10 py-5 rounded-2xl font-display font-bold text-xl hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-accent/30 inline-block text-center btn-animated opacity-0"
              >
                ${content.primaryCta.label}
              </a>
            ` : ''}
            ${content.secondaryCta ? html`
              <a
                href="${content.secondaryCta.href || '#'}"
                class="hero-cta bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-2xl font-display font-bold text-xl hover:bg-white/20 transition-all inline-block text-center btn-animated opacity-0"
              >
                ${content.secondaryCta.label}
              </a>
            ` : ''}
          </div>
        </div>
      </div>
      ${!content.image ? html`<div class="absolute -bottom-24 -left-24 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-20 pointer-events-none"></div>` : ''}
    </header>
  `
}
