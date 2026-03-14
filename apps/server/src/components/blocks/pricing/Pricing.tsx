import { getPadding } from '../utils'

export const Pricing = ({ content }: { content: any }) => (
  <section className="py-32 bg-white dark:bg-slate-950" style={getPadding(content.styles)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h2 className="text-accent font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">
          {content.tagline || "Pricing Plans"}
        </h2>
        <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl">
          {content.title || "Choose Your Plan"}
        </h3>
        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium">
          {content.subtitle || "Simple, transparent pricing for every stage of your journey."}
        </p>
        {content.billingCycle && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${content.billingCycle === 'monthly' ? 'text-primary' : 'text-slate-500'}`}>Monthly</span>
            <span className={`text-sm font-medium ${content.billingCycle === 'yearly' ? 'text-primary' : 'text-slate-500'}`}>Yearly</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {content.tiers?.map((tier: any, i: number) => (
          <div
            key={i}
            className={`relative rounded-2xl border-2 p-8 ${
              tier.recommended
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
            }`}
          >
            {tier.recommended && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
            )}
            <div className="text-center mb-8">
              <h4 className="text-xl font-display font-bold text-slate-900 dark:text-white">{tier.name}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">{tier.description}</p>
              <div className="mt-6 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-display font-bold text-slate-900 dark:text-white">
                  {tier.currency || '$'}{tier.price}
                </span>
                <span className="text-slate-500 dark:text-slate-400">/{tier.period || 'month'}</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8">
              {tier.features?.map((feature: string, j: number) => (
                <li key={j} className="flex items-start gap-3">
                  <i data-lucide="check" className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
            <a
              href={tier.ctaHref || '#'}
              className={`block w-full py-3 px-4 rounded-lg text-center font-semibold transition-all ${
                tier.recommended
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
              }`}
            >
              {tier.ctaLabel || 'Get Started'}
            </a>
          </div>
        ))}
      </div>
    </div>
  </section>
)
