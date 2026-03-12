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
  const navbarContent = navbarOverride || (settings?.navbarConfig ? JSON.parse(settings.navbarConfig) : {
    logoText: settings?.logoText,
    logoIcon: settings?.logoIcon,
    links: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' }
    ]
  })

  // Use page-specific footer if provided, otherwise fallback to global
  const footerContent = footerOverride || (settings?.footerConfig ? JSON.parse(settings.footerConfig) : {
    logoText: settings?.logoText,
    logoIcon: settings?.logoIcon,
    description: settings?.footerDescription
  })

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
