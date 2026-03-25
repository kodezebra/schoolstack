import { html } from 'hono/html'
import { getPadding } from '../utils'

export const Gallery = ({ content }: { content: any }) => {
  const paddingStyleStr = content.styles?.paddingY !== undefined 
    ? `padding-top: ${content.styles.paddingY}px; padding-bottom: ${content.styles.paddingY}px;` 
    : ''

  const renderImage = (image: any, i: number, extraClass: string = '') => html`
    <div
      class="rounded-2xl overflow-hidden group relative img-zoom ${extraClass}"
      data-animate-item
    >
      <img
        src="${image.src}"
        alt="${image.alt || `Gallery image ${i + 1}`}"
        class="w-full h-full object-cover transition-transform duration-500"
      />
      ${image.caption ? html`
        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <p class="text-white text-sm font-medium">${image.caption}</p>
        </div>
      ` : ''}
    </div>
  `

  return html`
    <section class="py-32 bg-white dark:bg-slate-950" data-animate="fade-up" style="${paddingStyleStr}">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-20" data-animate-item>
          <h2 class="text-accent font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">
            ${content.tagline || "Our Work"}
          </h2>
          <h3 class="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl">
            ${content.title || "Featured Gallery"}
          </h3>
          <p class="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium">
            ${content.subtitle || "Explore our collection of projects and achievements."}
          </p>
        </div>
        ${content.layout === 'masonry' ? html`
          <div class="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            ${(content.images || []).map((image: any, i: number) => html`
              <div class="break-inside-avoid" data-animate-item>
                ${renderImage(image, i)}
              </div>
            `)}
          </div>
        ` : content.layout === 'grid' ? html`
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            ${(content.images || []).map((image: any, i: number) => renderImage(image, i, 'aspect-square'))}
          </div>
        ` : html`
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            ${(content.images || []).map((image: any, i: number) => html`
              <div data-animate-item>
                <div class="h-64">${renderImage(image, i)}</div>
              </div>
            `)}
          </div>
        `}
      </div>
    </section>
  `
}
