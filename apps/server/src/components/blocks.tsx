const SocialIcon = ({ icon, className }: { icon: string, className?: string }) => {
  const iconLower = icon?.toLowerCase() || ''
  
  // Custom SVGs for brands not in Lucide
  const brands: Record<string, any> = {
    github: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>,
    twitter: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>,
    x: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -9.233m2.464 -3.367l4.768 -6.4" /></svg>,
    linkedin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>,
    facebook: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
    instagram: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>,
    youtube: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2 69.44 69.44 0 0 1 15 0 2 2 0 0 1 2 2 24.12 24.12 0 0 1 0 10 2 2 0 0 1-2 2 69.44 69.44 0 0 1-15 0 2 2 0 0 1-2-2z"/><path d="m10 15 5-3-5-3z"/></svg>,
    tiktok: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>,
    whatsapp: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-10.4 8.38 8.38 0 0 1 3.8.9L21 4.5z"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
  }

  if (brands[iconLower]) return brands[iconLower]
  return <i data-lucide={icon || 'external-link'} className={className}></i>
}

export const Navbar = ({ content, settings }: { content: any; settings?: any }) => {
  const logoText = content.logoText || settings?.logoText || "KZ Cloud"
  const logoIcon = content.logoIcon || settings?.logoIcon || "layout"
  const logoType = content.logoType || "icon"
  const logoImage = content.logoImage || ""
  
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            {logoType === 'image' && logoImage ? (
              <img src={logoImage} alt={logoText} className="h-9 w-auto object-contain" />
            ) : (
              <i data-lucide={logoIcon} className="text-primary w-9 h-9"></i>
            )}
            <span className="text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
              {logoText}
            </span>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-10">
              {content.links?.map((link: any) => (
                <a href={link.href} className="text-sm font-semibold hover:text-primary transition-colors">
                  {link.label}
                </a>
              ))}
              {content.cta && (
                <a
                  href={content.cta.href}
                  className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-600 hover:shadow-lg hover:shadow-primary/30 transition-all"
                >
                  {content.cta.label}
                </a>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <button 
              id="mobile-menu-button"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onclick="document.getElementById('mobile-menu').classList.toggle('hidden')"
            >
              <i data-lucide="menu" className="w-8 h-8"></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div id="mobile-menu" className="hidden md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-in slide-in-from-top duration-300">
        <div className="px-4 pt-2 pb-6 space-y-1">
          {content.links?.map((link: any) => (
            <a 
              href={link.href} 
              className="block px-3 py-4 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
            >
              {link.label}
            </a>
          ))}
          {content.cta && (
            <div className="pt-4 px-3">
              <a
                href={content.cta.href}
                className="block w-full text-center bg-primary text-white px-6 py-3.5 rounded-xl text-base font-bold shadow-lg shadow-primary/20"
              >
                {content.cta.label}
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

const getPadding = (styles: any) => {
  if (styles?.paddingY !== undefined) return { paddingTop: `${styles.paddingY}px`, paddingBottom: `${styles.paddingY}px` }
  return {}
}

export const Hero = ({ content }: { content: any }) => (
  <header 
    className="relative hero-bg pt-24 pb-32 lg:pt-48 lg:pb-56 text-white overflow-hidden"
    style={{
      ...(content.image ? { 
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.9)), url('${content.image}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}),
      ...getPadding(content.styles)
    }}
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-3xl">
        <h1 className="text-5xl font-display font-bold tracking-tight sm:text-7xl mb-8 leading-[1.1]">
          {content.title || "Design Your Future with Precision"}
        </h1>
        <p className="mt-6 text-xl text-indigo-50 font-medium leading-relaxed max-w-2xl">
          {content.subtitle || "Elevate your digital presence with our modern, professional solutions tailored for growth and impact."}
        </p>
        <div className="mt-12 flex flex-col sm:flex-row gap-5">
          {content.primaryCta && (
            <a
              href={content.primaryCta.href || "#"}
              className="bg-accent text-white px-10 py-5 rounded-2xl font-display font-bold text-xl hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-accent/20 inline-block text-center"
            >
              {content.primaryCta.label}
            </a>
          )}
          {content.secondaryCta && (
            <a
              href={content.secondaryCta.href || "#"}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-2xl font-display font-bold text-xl hover:bg-white/20 transition-all inline-block text-center"
            >
              {content.secondaryCta.label}
            </a>
          )}
        </div>
      </div>
    </div>
    {!content.image && <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-electric-teal rounded-full blur-[120px] opacity-20 pointer-events-none"></div>}
  </header>
)

export const Features = ({ content }: { content: any }) => (
  <section className="py-32 bg-slate-50 dark:bg-slate-900/50" style={getPadding(content.styles)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h2 className="text-accent font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">
          {content.tagline || "Our Expertise"}
        </h2>
        <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl">
          {content.title || "Tailored Solutions for Your Success"}
        </h3>
        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium">
          {content.subtitle || "We provide high-quality services to help your business thrive in a digital-first world through innovation and design."}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {content.items?.map((item: any) => (
          <div className="group p-10 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2">
            <div className={`w-16 h-16 ${item.bgClass || "bg-primary/10"} rounded-2xl flex items-center justify-center mb-8 ${item.iconClass || "text-primary"} group-hover:scale-110 transition-transform`}>
              <i data-lucide={item.icon || "zap"} className="w-10 h-10"></i>
            </div>
            <h4 className="text-2xl font-display font-bold mb-4">{item.title}</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export const Content = ({ content }: { content: any }) => (
  <section className="py-32 overflow-hidden bg-white dark:bg-background-dark" style={getPadding(content.styles)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className={`lg:flex lg:items-center lg:gap-24 ${content.reverse ? "lg:flex-row-reverse" : ""}`}>
        <div className="lg:w-1/2 relative">
          <div 
            className="relative rounded-[2.5rem] overflow-hidden shadow-2xl z-10 aspect-square sm:aspect-video lg:aspect-square bg-slate-200 dark:bg-slate-800 bg-cover bg-center" 
            style={{ backgroundImage: `url('${content.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"}')` }}
          >
            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent rounded-full -z-0 opacity-20 blur-3xl"></div>
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary rounded-full -z-0 opacity-20 blur-3xl"></div>
        </div>
        <div className="mt-16 lg:mt-0 lg:w-1/2">
          <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl mb-8 leading-tight">
            {content.title || "About Our Vision"}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
            {content.text1 || "Founded on the principle of innovation, we believe that technology should be accessible, beautiful, and functional."}
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-medium">
            {content.text2 || "We don't just build products; we build partnerships. By understanding your unique challenges, we deliver solutions that are not only effective today but scalable for tomorrow."}
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
            {content.features?.map((f: string) => (
              <li className="flex items-center gap-3">
                <i data-lucide={content.featureIcon || "check-circle"} className="text-primary w-6 h-6"></i>
                <span className="font-bold text-slate-700 dark:text-slate-200">{f}</span>
              </li>
            ))}
          </ul>
          {content.cta && (
            <a href={content.cta.href} className="text-primary font-display font-bold text-lg flex items-center gap-3 group hover:text-indigo-700 transition-all">
              <span className="relative">
                {content.cta.label}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </span>
              <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <i data-lucide="arrow-right" className="w-5 h-5"></i>
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  </section>
)

export const Stats = ({ content }: { content: any }) => (
  <section className="px-4 py-16 bg-primary/5 dark:bg-primary/10 rounded-3xl mx-4 my-8 border border-primary/10" style={getPadding(content.styles)}>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      {content.items?.map((item: any) => (
        <div className="flex flex-col gap-1">
          <span className="text-3xl font-black text-primary">{item.value}</span>
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{item.label}</span>
        </div>
      ))}
    </div>
  </section>
)

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

export const Testimonials = ({ content }: { content: any }) => (
  <section className="py-32 bg-slate-50 dark:bg-slate-900/50" style={getPadding(content.styles)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h2 className="text-accent font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">
          {content.tagline || "Testimonials"}
        </h2>
        <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl">
          {content.title || "What Our Clients Say"}
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {content.items?.map((item: any) => (
          <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex items-center gap-4 mb-8">
              <img src={item.image} alt={item.name} className="w-14 h-14 rounded-full object-cover" />
              <div>
                <h4 className="font-display font-bold text-slate-900 dark:text-white">{item.name}</h4>
                <p className="text-sm text-slate-500 font-medium">{item.role}</p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">"{item.text}"</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export const Cta = ({ content }: { content: any }) => (
  <section className="py-24 bg-primary mx-4 my-12 rounded-3xl" style={getPadding(content.styles)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-4xl font-display font-bold text-white sm:text-5xl mb-8">
        {content.title || "Ready to Revolutionize Your Digital Strategy?"}
      </h2>
      <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto font-medium">
        {content.subtitle || "Join hundreds of forward-thinking companies already using KZ Cloud to drive growth and innovation."}
      </p>
      <div className="flex justify-center">
        <a
          href={content.ctaHref || "#"}
          className="bg-accent text-white px-12 py-5 rounded-2xl font-display font-bold text-xl hover:bg-orange-600 hover:scale-[1.05] active:scale-[0.98] transition-all shadow-2xl shadow-black/20 inline-block"
        >
          {content.ctaLabel || "Start Your Journey Today"}
        </a>
      </div>
    </div>
  </section>
)

// --- NEW BLOCKS ---

export const Steps = ({ content }: { content: any }) => (
  <section className="py-32 bg-white dark:bg-background-dark" style={getPadding(content.styles)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        {content.tagline && (
          <h2 className="text-primary font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">{content.tagline}</h2>
        )}
        <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl mb-6">
          {content.title || "How It Works"}
        </h3>
        {content.subtitle && (
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            {content.subtitle}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {content.items?.map((item: any, index: number) => (
          <div key={index} className="relative flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
              {item.icon ? (
                <i data-lucide={item.icon} className="w-8 h-8"></i>
              ) : (
                <span className="text-2xl font-black">{item.number || index + 1}</span>
              )}
            </div>
            <h4 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-3">
              {item.title || `Step ${index + 1}`}
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {item.description || "Step description goes here."}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export const Values = ({ content }: { content: any }) => (
  <section className="py-32 bg-slate-50 dark:bg-slate-900/50" style={getPadding(content.styles)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        {content.tagline && (
          <h2 className="text-primary font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">{content.tagline}</h2>
        )}
        <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl mb-6">
          {content.title || "Our Core Values"}
        </h3>
        {content.subtitle && (
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.items?.map((item: any, index: number) => (
          <div key={index} className="group flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/50 p-8 hover:border-primary/50 transition-colors">
            <div className="text-primary bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              {item.icon ? (
                <i data-lucide={item.icon} className="w-7 h-7"></i>
              ) : (
                <i data-lucide="star" className="w-7 h-7"></i>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-slate-900 dark:text-slate-100 text-xl font-bold">{item.title || "Value Title"}</h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{item.description || "Value description goes here."}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export const SplitContent = ({ content, settings }: { content: any; settings?: any }) => {
  const imagePosition = content.imagePosition || 'left'
  const isReversed = imagePosition === 'right'

  return (
    <section className="py-32 overflow-hidden bg-white dark:bg-background-dark" style={getPadding(content.styles)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`lg:flex lg:items-center lg:gap-24 ${isReversed ? 'lg:flex-row-reverse' : ''}`}>
          <div className={`relative ${isReversed ? 'lg:w-1/2' : 'lg:w-1/2'}`}>
            <div
              className="relative rounded-[2.5rem] overflow-hidden shadow-2xl z-10 aspect-square sm:aspect-video lg:aspect-square bg-slate-200 dark:bg-slate-800 bg-cover bg-center"
              style={{ backgroundImage: `url('${content.image || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"}')` }}
            >
              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent rounded-full -z-0 opacity-20 blur-3xl"></div>
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary rounded-full -z-0 opacity-20 blur-3xl"></div>
          </div>
          <div className={`mt-16 lg:mt-0 ${isReversed ? 'lg:w-1/2 lg:pr-8' : 'lg:w-1/2 lg:pl-8'}`}>
            {content.eyebrow && (
              <span className="text-primary font-bold tracking-widest text-sm uppercase block mb-4">{content.eyebrow}</span>
            )}
            <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl mb-8 leading-tight">
              {content.title || "About Our Vision"}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
              {content.description || "Founded on the principle of innovation, we believe that technology should be accessible, beautiful, and functional."}
            </p>
            {content.cta && (
              <a
                href={content.cta.href || "#"}
                className="text-primary font-display font-bold text-lg flex items-center gap-3 group hover:text-indigo-700 transition-all"
              >
                <span className="relative">
                  {content.cta.label || "Learn More"}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </span>
                <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <i data-lucide="arrow-right" className="w-5 h-5"></i>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export const VideoGallery = ({ content }: { content: any }) => (
  <section className="py-32 bg-slate-50 dark:bg-slate-900/50" style={getPadding(content.styles)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        {content.tagline && (
          <h2 className="text-accent font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">{content.tagline}</h2>
        )}
        <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl mb-6">
          {content.title || "Video Showcase"}
        </h3>
        {content.subtitle && (
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            {content.subtitle}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {content.items?.map((item: any, index: number) => (
          <div key={index} className="group relative rounded-3xl overflow-hidden aspect-video bg-slate-200 dark:bg-slate-800 shadow-lg">
            {item.thumbnail ? (
              <img src={item.thumbnail} alt={item.title || `Video ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                <i data-lucide="video" className="w-12 h-12 text-slate-500 dark:text-slate-600"></i>
              </div>
            )}
            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {item.videoUrl ? (
                <a href={item.videoUrl} className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 cursor-pointer hover:scale-110 transition-transform">
                  <i data-lucide="play" className="w-8 h-8 text-white fill-white"></i>
                </a>
              ) : (
                <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50">
                  <i data-lucide="play" className="w-8 h-8 text-white fill-white"></i>
                </div>
              )}
            </div>
            {item.title && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900/80 to-transparent">
                <p className="text-white font-bold text-sm">{item.title}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
)

export const Faq = ({ content }: { content: any }) => (
  <section className="py-32 bg-white dark:bg-background-dark" style={getPadding(content.styles)}>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        {content.tagline && (
          <h2 className="text-primary font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">{content.tagline}</h2>
        )}
        <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl mb-6">
          {content.title || "Frequently Asked Questions"}
        </h3>
        {content.subtitle && (
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            {content.subtitle}
          </p>
        )}
      </div>
      <div className="space-y-4">
        {content.items?.map((item: any, index: number) => (
          <details key={index} className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
            <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 pr-4">{item.question || "Question?"}</h4>
              <span className="text-primary transition-transform group-open:rotate-180 flex-shrink-0">
                <i data-lucide="chevron-down" className="w-6 h-6"></i>
              </span>
            </summary>
            <div className="px-6 pb-6">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.answer || "Answer goes here."}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  </section>
)

export const Footer = ({ dashboardUrl, content, settings }: { dashboardUrl: string; content: any; settings?: any }) => {
  const logoText = content?.logoText || settings?.logoText || "KZ Cloud"
  const logoIcon = content?.logoIcon || settings?.logoIcon || "layout"
  const description = content?.description || settings?.footerDescription || "Empowering businesses with cutting-edge digital solutions and forward-thinking design."
  
  // Use custom columns if provided, otherwise fallback to default
  const columns = content?.columns || [
    { title: 'Product', links: [{ label: 'Features', href: '#' }, { label: 'Integrations', href: '#' }, { label: 'Pricing', href: '#' }] },
    { title: 'Company', links: [{ label: 'About Us', href: '#' }, { label: 'Careers', href: '#' }] }
  ]

  const socials = content?.socials || [
    { platform: 'Globe', url: '#', icon: 'globe' },
    { platform: 'Mail', url: '#', icon: 'mail' },
    { platform: 'Share', url: '#', icon: 'share-2' }
  ]

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 pt-32 pb-12 border-t border-slate-200 dark:border-slate-800" style={getPadding(content.styles)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-24">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <i data-lucide={logoIcon} className="text-primary w-9 h-9"></i>
              <span className="text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
                {logoText}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mb-8 leading-relaxed">
              {description}
            </p>
            <div className="flex gap-4">
              {socials.map((social: any, i: number) => (
                <a 
                  key={i} 
                  href={social.url} 
                  title={social.platform}
                  className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all text-slate-600 dark:text-slate-300 shadow-sm"
                >
                  <SocialIcon icon={social.icon || "external-link"} className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>
          
          {columns.map((col: any, i: number) => (
            <div key={i}>
              <h5 className="font-display font-bold text-lg mb-8">{col.title}</h5>
              <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-medium">
                {col.links?.map((link: any, li: number) => (
                  <li key={li}>
                    <a className="hover:text-primary transition-colors" href={link.href}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h5 className="font-display font-bold text-lg mb-8">Admin</h5>
            <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-medium">
              <li><a className="hover:text-primary transition-colors" href={dashboardUrl}>Dashboard</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-10 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">© {new Date().getFullYear()} {logoText} Inc. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
              <i data-lucide="globe" className="w-4 h-4"></i> English (US)
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export const NotFound = ({ homeUrl = "/", dashboardUrl }: { homeUrl?: string; dashboardUrl: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
    <h1 className="text-8xl font-black text-slate-200 mb-4 tracking-tighter uppercase tabular-nums leading-none">404</h1>
    <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
    <p className="text-slate-500 mb-8 max-w-xs mx-auto">This page doesn't exist or isn't published yet.</p>
    <div className="flex gap-4">
      <a href={homeUrl} className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
        Go back home
      </a>
      <a href={dashboardUrl} className="px-6 py-2 bg-white text-slate-900 border border-slate-200 rounded-full text-sm font-semibold hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
        Go to Dashboard
      </a>
    </div>
  </div>
)