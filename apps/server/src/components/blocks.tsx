// Export modularized block components for server-side rendering
export { Navbar } from './blocks/navbar/Navbar'
export { Hero } from './blocks/hero/Hero'
export { Features } from './blocks/features/Features'
export { Content } from './blocks/content/Content'
export { Stats } from './blocks/stats/Stats'
export { Team } from './blocks/team/Team'
export { Testimonials } from './blocks/testimonials/Testimonials'
export { Cta } from './blocks/cta/Cta'
export { Steps } from './blocks/steps/Steps'
export { Values } from './blocks/values/Values'
export { SplitContent } from './blocks/split-content/SplitContent'
export { VideoGallery } from './blocks/video-gallery/VideoGallery'
export { Faq } from './blocks/faq/Faq'
export { Footer } from './blocks/footer/Footer'
export { Pricing } from './blocks/pricing/Pricing'
export { Gallery } from './blocks/gallery/Gallery'
export { Services } from './blocks/services/Services'
export { ContactForm } from './blocks/contact-form/ContactForm'
export { Map } from './blocks/map/Map'
export { Banner } from './blocks/banner/Banner'
export { Fees } from './blocks/fees/Fees'

// 404 Page Component
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
