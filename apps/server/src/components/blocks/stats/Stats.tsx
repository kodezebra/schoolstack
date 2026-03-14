import { getPadding } from '../utils'

export const Stats = ({ content }: { content: any }) => (
  <section className="px-4 py-16 bg-primary/5 dark:bg-primary/10 rounded-3xl mx-4 my-8 border border-primary/10" style={getPadding(content.styles)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      {content.items?.map((item: any) => (
        <div className="flex flex-col gap-1">
          <span className="text-3xl font-black text-primary">{item.value}</span>
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{item.label}</span>
        </div>
      ))}
    </div>
  </section>
)
