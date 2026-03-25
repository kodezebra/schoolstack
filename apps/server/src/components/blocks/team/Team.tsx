import { html } from 'hono/html'
import { getPadding } from '../utils'

export const Team = ({ content }: { content: any }) => html`
  <section class="py-32 bg-white dark:bg-background-dark" data-animate="fade-up" style="${getPadding(content.styles)}">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-20" data-animate-item>
        <h2 class="text-primary font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">
          ${content.tagline || "Our Team"}
        </h2>
        <h3 class="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl">
          ${content.title || "Meet the Minds Behind KZ Cloud"}
        </h3>
        <p class="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium">
          ${content.subtitle || "A diverse group of designers, developers, and strategists dedicated to excellence and innovation."}
        </p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        ${(content.members || []).map((member: any, index: number) => html`
          <div class="text-center group" data-animate-item>
            <div class="relative mb-6 rounded-3xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-800 team-card overflow-hidden">
              <img src="${member.image}" alt="${member.name}" class="w-full h-full object-cover" style="filter: grayscale(100%);" />
            </div>
            <h4 class="text-xl font-display font-bold text-slate-900 dark:text-white">${member.name}</h4>
            <p class="text-primary font-bold text-sm">${member.role}</p>
          </div>
        `)}
      </div>
    </div>
  </section>
`
