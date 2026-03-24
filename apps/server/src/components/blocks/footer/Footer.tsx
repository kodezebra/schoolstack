import { getPadding, renderIcon, IconSvg } from '../utils'

export const Footer = ({ dashboardUrl, content, settings }: { dashboardUrl: string; content: any; settings?: any }) => {
  const logoText = content?.logoText || settings?.logoText || "KZ Cloud"
  const logoIcon = content?.logoIcon || settings?.logoIcon || "layout"
  const logoType = content?.logoType || settings?.logoType || "icon"
  const logoImage = content?.logoImage || settings?.logoImage || ""
  const logoLayout = content?.logoLayout || 'horizontal'
  const isMonochrome = content?.monochrome === true
  
  const description = content?.description || settings?.footerDescription || "Empowering businesses with cutting-edge digital solutions and forward-thinking design."
  
  const schoolName = settings?.schoolName
  const schoolAddress = settings?.schoolAddress
  const schoolPhone = settings?.schoolPhone
  const schoolEmail = settings?.schoolEmail
  
  const showContactInfo = schoolName || schoolAddress || schoolPhone || schoolEmail
  
  const columns = content?.columns || [
    { title: 'Product', links: [{ label: 'Features', href: '#' }, { label: 'Integrations', href: '#' }, { label: 'Pricing', href: '#' }] },
    { title: 'Company', links: [{ label: 'About Us', href: '#' }, { label: 'Careers', href: '#' }] }
  ]

  const socials = content?.socials || [
    { platform: 'Globe', url: '#', icon: 'globe' },
    { platform: 'Email', url: '#', icon: 'email' },
    { platform: 'Share', url: '#', icon: 'share' }
  ]

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 pt-32 pb-12 border-t border-slate-200 dark:border-slate-800" style={getPadding(content.styles)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-24">
          <div className="col-span-2">
            <div className={`flex ${logoLayout === 'vertical' ? 'flex-col items-start gap-4' : 'items-center gap-2'} mb-8 ${isMonochrome ? 'grayscale opacity-80' : ''}`}>
              {logoType === 'image' && logoImage ? (
                <img src={logoImage} alt={logoText} className={`${logoLayout === 'vertical' ? 'h-16' : 'h-9'} w-auto object-contain`} />
              ) : (
                <IconSvg icon={logoIcon} className={`text-primary ${logoLayout === 'vertical' ? 'w-12 h-12' : 'w-9 h-9'}`} />
              )}
              <span className={`${logoLayout === 'vertical' ? 'text-3xl' : 'text-2xl'} font-display font-bold tracking-tight text-slate-900 dark:text-white`}>
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
                  <IconSvg icon={social.icon || "external-link"} className="w-6 h-6" />
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

          {showContactInfo && (
            <div>
              <h5 className="font-display font-bold text-lg mb-8">Contact</h5>
              <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-medium">
                {schoolName && <li>{schoolName}</li>}
                {schoolAddress && <li className="flex items-start gap-2">
                  <IconSvg icon="map-pin" className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{schoolAddress}</span>
                </li>}
                {schoolPhone && <li className="flex items-center gap-2">
                  <IconSvg icon="phone" className="w-4 h-4 shrink-0" />
                  <a href={`tel:${schoolPhone}`} className="hover:text-primary">{schoolPhone}</a>
                </li>}
                {schoolEmail && <li className="flex items-center gap-2">
                  <IconSvg icon="mail" className="w-4 h-4 shrink-0" />
                  <a href={`mailto:${schoolEmail}`} className="hover:text-primary">{schoolEmail}</a>
                </li>}
              </ul>
            </div>
          )}

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
              <IconSvg icon="globe" className="w-4 h-4" /> English (US)
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
