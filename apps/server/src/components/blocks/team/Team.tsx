import { getPadding } from '../utils'

export const Team = ({ content }: { content: any }) => (
  <section className="py-32 bg-white dark:bg-background-dark" style={getPadding(content.styles)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h2 className="text-primary font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">
          {content.tagline || "Our Team"}
        </h2>
        <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl">
          {content.title || "Meet the Minds Behind KZ Cloud"}
        </h3>
        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium">
          {content.subtitle || "A diverse group of designers, developers, and strategists dedicated to excellence and innovation."}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {content.members?.map((member: any) => (
          <div className="text-center group">
            <div className="relative mb-6 rounded-3xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-800">
              <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
            </div>
            <h4 className="text-xl font-display font-bold text-slate-900 dark:text-white">{member.name}</h4>
            <p className="text-primary font-bold text-sm">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)
