import { BaseLayout } from './base'
import * as Blocks from '../components/blocks'

interface PublicLayoutProps {
  title: string
  description?: string
  dashboardUrl: string
  settings: any
  children: any
}

const DEFAULT_NAVBAR = {
  logoText: 'My Website',
  logoIcon: 'layout',
  links: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' }
  ],
  cta: { label: 'Contact Us', href: '/contact', show: false }
}

const DEFAULT_FOOTER = {
  logoText: 'My Website',
  logoIcon: 'layout',
  description: 'Welcome to our website. We provide quality services to help your business grow.',
  columns: [
    { title: 'Company', links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' }
    ]},
    { title: 'Services', links: [
      { label: 'Our Services', href: '/services' }
    ]}
  ],
  socials: [
    { platform: 'Website', url: '#', icon: 'globe' }
  ]
}

export const PublicLayout = ({
  title,
  description,
  dashboardUrl,
  settings,
  children
}: PublicLayoutProps) => {

  // Always use global navbar from settings, with defaults
  const navbarContent = (() => {
    let config: any = { ...DEFAULT_NAVBAR }
    
    // Override with settings
    if (settings?.logoText) config.logoText = settings.logoText
    if (settings?.logoIcon) config.logoIcon = settings.logoIcon
    if (settings?.logoType) config.logoType = settings.logoType
    if (settings?.logoImage) config.logoImage = settings.logoImage
    
    if (settings?.navbarConfig) {
      const parsed = typeof settings.navbarConfig === 'string' ? JSON.parse(settings.navbarConfig) : settings.navbarConfig
      config = { ...config, ...parsed }
    } else if (settings?.navbarLinks) {
      config.links = settings.navbarLinks
    }
    
    if (settings?.navbarCta) {
      const cta = typeof settings.navbarCta === 'string' ? JSON.parse(settings.navbarCta) : settings.navbarCta
      if (cta.show) {
        config.cta = cta
      }
    }
    
    return config
  })()

  // Always use global footer from settings, with defaults
  const footerContent = (() => {
    let config: any = { ...DEFAULT_FOOTER }
    
    // Override with settings
    if (settings?.logoText) config.logoText = settings.logoText
    if (settings?.logoIcon) config.logoIcon = settings.logoIcon
    if (settings?.footerDescription) config.description = settings.footerDescription
    
    if (settings?.footerConfig) {
      const parsed = typeof settings.footerConfig === 'string' ? JSON.parse(settings.footerConfig) : settings.footerConfig
      config = { ...config, ...parsed }
    } else if (settings?.footerColumns) {
      config.columns = settings.footerColumns
    }
    
    if (settings?.footerSocials) {
      config.socials = typeof settings.footerSocials === 'string' ? JSON.parse(settings.footerSocials) : settings.footerSocials
    }
    
    return config
  })()

  return (
    <BaseLayout title={title} description={description} settings={settings}>
      <Blocks.Navbar content={navbarContent} settings={settings} />
      <main>
        {children}
      </main>
      <Blocks.Footer content={footerContent} settings={settings} dashboardUrl={dashboardUrl} />
    </BaseLayout>
  )
}
