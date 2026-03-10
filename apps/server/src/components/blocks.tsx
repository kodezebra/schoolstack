export const Hero = ({ content }: { content: any }) => (
  <section className="py-24 px-6 bg-slate-50 border-b border-slate-100">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-6xl font-extrabold tracking-tight mb-6 text-slate-900 leading-tight">
        {content.title}
      </h1>
      <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
        {content.subtitle}
      </p>
    </div>
  </section>
)

export const TextBlock = ({ content }: { content: any }) => (
  <section className="py-16 px-6">
    <div className="max-w-2xl mx-auto prose">
      <p className="whitespace-pre-wrap text-lg leading-relaxed text-slate-700">
        {content.text}
      </p>
    </div>
  </section>
)

export const NotFound = ({ homeUrl = "/" }: { homeUrl?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
    <h1 className="text-8xl font-black text-slate-200 mb-4 tracking-tighter uppercase">404</h1>
    <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
    <p className="text-slate-500 mb-8 max-w-xs mx-auto">This page doesn't exist or isn't published yet.</p>
    <a href={homeUrl} className="px-6 py-2 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors">
      Go back home
    </a>
  </div>
)

export const Footer = () => (
  <footer className="py-16 border-t border-slate-100 mt-20 text-center text-slate-400 text-xs tracking-widest uppercase">
    <div className="max-w-4xl mx-auto px-6">
      <p>&copy; {new Date().getFullYear()} Built with KZ Cloud CMS</p>
    </div>
  </footer>
)
