import { html } from 'hono/html'
import { getPadding } from '../utils'

export const Banner = ({ content }: { content: any }) => {
  const heightMap: Record<string, string> = {
    small: '240px',
    medium: '360px',
    large: '480px'
  }
  
  const bannerHeight = heightMap[content.height as string] || '360px'
  const titleSize = content.height === 'large' ? 'text-6xl md:text-8xl' : content.height === 'medium' ? 'text-5xl md:text-6xl' : 'text-4xl'
  const showOffsetImage = content.showOffsetImage && content.offsetImage
  const hasImage = !!content.image
  const textColorClass = hasImage ? 'text-white' : 'text-primary'
  const subtitleColorClass = hasImage ? 'text-white/80' : 'text-secondary'
  const dividerColorClass = hasImage ? 'bg-white' : 'bg-primary'
  const eyebrowColorClass = hasImage ? 'text-white/80' : 'text-secondary'

  return html`
    <section 
      class="w-full relative flex items-center overflow-hidden bg-surface-container-low"
      style="height: ${bannerHeight}"
    >
      ${content.image ? html`
        <div 
          class="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style="background-image: url('${content.image}')"
        ></div>
      ` : ''}
      
      ${content.textureImage ? html`
        <div 
          class="absolute inset-0 opacity-15"
          style="background-image: url('${content.textureImage}')"
        ></div>
      ` : ''}
      
      <div 
        class="absolute inset-0 ${hasImage ? 'bg-gradient-to-b from-slate-900/75 via-slate-900/60 to-slate-900/75' : 'bg-gradient-to-br from-primary/10 via-surface-container-low to-primary-container/10'}"
      ></div>

      ${hasImage ? html`
        <div class="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/20"></div>
      ` : ''}
      
      ${showOffsetImage ? html`
        <div 
          class="banner-offset-image absolute -bottom-12 right-12 hidden lg:block w-72 h-96 rounded-2xl overflow-hidden shadow-2xl rotate-3 border-8 border-white z-20"
          style="bottom: ${content.offsetImageBottom || '-48px'}"
        >
          <img src="${content.offsetImage}" alt="" class="w-full h-full object-cover" />
        </div>
      ` : ''}
      
      <div class="max-w-4xl mx-auto px-6 w-full relative z-10 text-center">
        ${content.eyebrow ? html`
          <p class="banner-eyebrow font-label text-sm uppercase tracking-[0.35em] ${eyebrowColorClass} mb-6 opacity-0">
            ${content.eyebrow}
          </p>
        ` : ''}
        <h1 class="banner-title font-headline font-bold ${textColorClass} ${titleSize} tracking-tight leading-[1.1] opacity-0" style="${getPadding(content.styles)}">
          ${content.title || 'Page Title'}
        </h1>
        ${content.showDivider !== false ? html`
          <div class="banner-divider mt-10 h-1.5 w-32 mx-auto rounded-full ${dividerColorClass} opacity-0" style="transform-origin: center"></div>
        ` : ''}
        ${content.subtitle ? html`
          <p class="banner-subtitle mt-10 font-body text-xl leading-relaxed max-w-2xl mx-auto ${subtitleColorClass} opacity-0">
            ${content.subtitle}
          </p>
        ` : ''}
      </div>
    </section>
  `
}
