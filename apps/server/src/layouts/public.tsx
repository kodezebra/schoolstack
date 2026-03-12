import { BaseLayout } from './base'
import * as Blocks from '../components/blocks'

interface PublicLayoutProps {
  title: string
  description?: string
  dashboardUrl: string
  settings: any
  navbarOverride?: any
  footerOverride?: any
  children: any
}

export const PublicLayout = ({
  title,
  description,
  dashboardUrl,
  settings,
  navbarOverride,
  footerOverride,
  children
}: PublicLayoutProps) => {

  // Use page-specific navbar if provided, otherwise fallback to global
  const navbarContent = navbarOverride || (() => {
    const config = settings?.navbarConfig ? JSON.parse(settings.navbarConfig) : {
      logoText: settings?.logoText,
      logoIcon: settings?.logoIcon,
      links: [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' }
      ]
    }
    // Merge CTA from navbarCta field if show is true
    if (settings?.navbarCta) {
      const cta = JSON.parse(settings.navbarCta)
      if (cta.show) {
        config.cta = cta
      }
    }
    return config
  })()

  // Use page-specific footer if provided, otherwise fallback to global
  const footerContent = footerOverride || (() => {
    const config = settings?.footerConfig ? JSON.parse(settings.footerConfig) : {
      logoText: settings?.logoText,
      logoIcon: settings?.logoIcon,
      description: settings?.footerDescription
    }
    // Merge socials from footerSocials field
    if (settings?.footerSocials) {
      config.socials = JSON.parse(settings.footerSocials)
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
