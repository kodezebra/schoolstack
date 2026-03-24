export interface NavLink {
  label: string
  href: string
  children?: NavLink[]
}

export interface NavbarCta {
  label: string
  href: string
  show: boolean
}

export interface FooterSocial {
  platform: string
  url: string
  icon: string
}

export interface FooterColumn {
  title: string
  links: NavLink[]
}

export interface SiteSettings {
  logoText: string
  logoType: 'icon' | 'image'
  logoIcon: string
  logoImage: string
  favicon: string
  footerDescription: string
  primaryColor: string
  accentColor: string
  backgroundLight: string
  backgroundDark: string
  navbarConfig: string | null
  navbarCta: string | null
  footerConfig: string | null
  footerSocials: string | null
  theme: string
  fontDisplay: string
  fontBody: string
  borderRadius: string
  darkMode: string
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  schoolEmail: string
  reportCardTheme: string
}

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  header: string
  text: string
  background: string
  tableHeader: string
  tableRow: string
  footer: string
}

export interface ReportCardTheme {
  id: string
  name: string
  description: string
  colors: ThemeColors
}

export interface SiteTheme {
  id: string
  name: string
  description: string
  primaryColor: string
  accentColor: string
  backgroundLight: string
  backgroundDark: string
  fontDisplay: string
  fontBody: string
  borderRadius: string
  darkMode: 'light' | 'dark' | 'system'
}

export interface ParsedSettings {
  logoText: string
  logoType: 'icon' | 'image'
  logoIcon: string
  logoImage: string
  favicon: string
  footerDescription: string
  primaryColor: string
  accentColor: string
  backgroundLight: string
  backgroundDark: string
  navbarLinks: NavLink[]
  navbarCta: NavbarCta
  footerColumns: FooterColumn[]
  footerSocials: FooterSocial[]
  theme: string
  fontDisplay: string
  fontBody: string
  borderRadius: string
  darkMode: 'light' | 'dark' | 'system'
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  schoolEmail: string
  reportCardTheme: string
}

export type SettingsTab = 'branding' | 'theme' | 'navigation' | 'footer'
