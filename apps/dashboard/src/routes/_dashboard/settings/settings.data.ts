import type { ParsedSettings, SiteTheme, ReportCardTheme } from './settings.types'

export const DEFAULT_SETTINGS: ParsedSettings = {
  logoText: 'SchoolStack',
  logoType: 'icon',
  logoIcon: 'zap',
  logoImage: '',
  favicon: '',
  footerDescription: 'Empowering businesses with cutting-edge digital solutions and forward-thinking design.',
  primaryColor: '#6366f1',
  accentColor: '#ff6b35',
  backgroundLight: '#f6f7f8',
  backgroundDark: '#101922',
  navbarLinks: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' }
  ],
  navbarCta: { label: 'Get Started', href: '/contact', show: false },
  footerColumns: [
    { title: 'Product', links: [{ label: 'Features', href: '#' }, { label: 'Integrations', href: '#' }, { label: 'Pricing', href: '#' }] },
    { title: 'Company', links: [{ label: 'About Us', href: '#' }, { label: 'Careers', href: '#' }] }
  ],
  footerSocials: [
    { platform: 'Globe', url: '#', icon: 'globe' },
    { platform: 'Mail', url: '#', icon: 'mail' },
    { platform: 'Share', url: '#', icon: 'share-2' }
  ],
  theme: 'modern',
  fontDisplay: 'Quicksand',
  fontBody: 'Plus Jakarta Sans',
  borderRadius: 'lg',
  darkMode: 'system',
  schoolName: 'Your School Name',
  schoolAddress: '',
  schoolPhone: '',
  schoolEmail: '',
  reportCardTheme: 'playful'
}

export const THEMES: SiteTheme[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and professional with vibrant accents.',
    primaryColor: '#6366f1',
    accentColor: '#ff6b35',
    backgroundLight: '#ffffff',
    backgroundDark: '#0f172a',
    fontDisplay: 'Quicksand',
    fontBody: 'Plus Jakarta Sans',
    borderRadius: 'lg',
    darkMode: 'system'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Monochrome elegance with sharp edges.',
    primaryColor: '#171717',
    accentColor: '#737373',
    backgroundLight: '#ffffff',
    backgroundDark: '#0a0a0a',
    fontDisplay: 'Inter',
    fontBody: 'Inter',
    borderRadius: 'none',
    darkMode: 'light'
  },
  {
    id: 'bakery',
    name: 'Bakery & Cafe',
    description: 'Warm, appetizing tones with classic serif headings.',
    primaryColor: '#854d0e',
    accentColor: '#fde047',
    backgroundLight: '#fffbeb',
    backgroundDark: '#1c1917',
    fontDisplay: 'Playfair Display',
    fontBody: 'Open Sans',
    borderRadius: 'md',
    darkMode: 'light'
  },
  {
    id: 'high-tech',
    name: 'High-Tech',
    description: 'Futuristic and fast with geometric typography.',
    primaryColor: '#0ea5e9',
    accentColor: '#00f5d4',
    backgroundLight: '#f0f9ff',
    backgroundDark: '#020617',
    fontDisplay: 'Space Grotesk',
    fontBody: 'Inter',
    borderRadius: 'sm',
    darkMode: 'dark'
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Premium feel with gold accents and serif fonts.',
    primaryColor: '#1c1917',
    accentColor: '#d4af37',
    backgroundLight: '#fafaf9',
    backgroundDark: '#1c1917',
    fontDisplay: 'Playfair Display',
    fontBody: 'Lora',
    borderRadius: 'sm',
    darkMode: 'light'
  },
  {
    id: 'creative',
    name: 'Creative Studio',
    description: 'Bold and expressive for creative professionals.',
    primaryColor: '#7c3aed',
    accentColor: '#f472b6',
    backgroundLight: '#fdf4ff',
    backgroundDark: '#1e1b4b',
    fontDisplay: 'Poppins',
    fontBody: 'Inter',
    borderRadius: 'lg',
    darkMode: 'dark'
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Sleek dark theme with vibrant highlights.',
    primaryColor: '#6366f1',
    accentColor: '#a855f7',
    backgroundLight: '#f8fafc',
    backgroundDark: '#09090b',
    fontDisplay: 'Inter',
    fontBody: 'Inter',
    borderRadius: 'none',
    darkMode: 'dark'
  },
  {
    id: 'nature',
    name: 'Nature & Wellness',
    description: 'Calming earth tones and organic feel.',
    primaryColor: '#15803d',
    accentColor: '#d97706',
    backgroundLight: '#f0fdf4',
    backgroundDark: '#022c22',
    fontDisplay: 'Quicksand',
    fontBody: 'Plus Jakarta Sans',
    borderRadius: 'full',
    darkMode: 'system'
  },
  {
    id: 'academy',
    name: 'Academy',
    description: 'Trustworthy and scholarly feel.',
    primaryColor: '#1e3a8a',
    accentColor: '#f59e0b',
    backgroundLight: '#f8fafc',
    backgroundDark: '#0f172a',
    fontDisplay: 'Poppins',
    fontBody: 'Roboto',
    borderRadius: 'md',
    darkMode: 'light'
  },
  {
    id: 'playful',
    name: 'Playful',
    description: 'Fun and friendly with bouncy curves.',
    primaryColor: '#ec4899',
    accentColor: '#8b5cf6',
    backgroundLight: '#fff1f2',
    backgroundDark: '#2e1065',
    fontDisplay: 'Quicksand',
    fontBody: 'Plus Jakarta Sans',
    borderRadius: 'full',
    darkMode: 'system'
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Serious and stable blue tones.',
    primaryColor: '#1e40af',
    accentColor: '#0ea5e9',
    backgroundLight: '#f1f5f9',
    backgroundDark: '#0f172a',
    fontDisplay: 'Inter',
    fontBody: 'Plus Jakarta Sans',
    borderRadius: 'sm',
    darkMode: 'light'
  },
  {
    id: 'bold',
    name: 'Bold Agency',
    description: 'High contrast and energetic.',
    primaryColor: '#dc2626',
    accentColor: '#fbbf24',
    backgroundLight: '#fef2f2',
    backgroundDark: '#111827',
    fontDisplay: 'Poppins',
    fontBody: 'Inter',
    borderRadius: 'xl',
    darkMode: 'dark'
  }
]

export const REPORT_CARD_THEMES: ReportCardTheme[] = [
  {
    id: 'playful',
    name: 'Playful',
    description: 'Colorful and fun for young learners',
    colors: {
      primary: '#4ECDC4',
      secondary: '#FF6B6B',
      accent: '#FFE66D',
      header: '#FF6B6B',
      text: '#2D3436',
      background: '#FFFFFF',
      tableHeader: '#4ECDC4',
      tableRow: '#F8F9FA',
      footer: '#F0F4F8'
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean corporate style for serious schools',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#FBBF24',
      header: '#1E3A8A',
      text: '#1F2937',
      background: '#FFFFFF',
      tableHeader: '#3B82F6',
      tableRow: '#F8FAFC',
      footer: '#F1F5F9'
    }
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with vibrant accents',
    colors: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#F472B6',
      header: '#6366F1',
      text: '#1E1B4B',
      background: '#FFFFFF',
      tableHeader: '#6366F1',
      tableRow: '#F5F3FF',
      footer: '#EDE9FE'
    }
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Eco-friendly and calming colors',
    colors: {
      primary: '#22C55E',
      secondary: '#16A34A',
      accent: '#F59E0B',
      header: '#15803D',
      text: '#14532D',
      background: '#F0FDF4',
      tableHeader: '#22C55E',
      tableRow: '#DCFCE7',
      footer: '#BBF7D0'
    }
  }
]

export const FONT_OPTIONS = [
  'Inter',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Quicksand',
  'Playfair Display',
  'Merriweather',
  'Source Sans Pro',
  'Ubuntu',
  'Nunito',
  'Raleway',
  'Oswald',
  'Bebas Neue',
  'Space Grotesk',
  'Plus Jakarta Sans'
]

export const BORDER_RADIUS_OPTIONS = [
  { id: 'none', name: 'Square', value: '0' },
  { id: 'sm', name: 'Slight', value: '0.125rem' },
  { id: 'md', name: 'Moderate', value: '0.375rem' },
  { id: 'lg', name: 'Rounded', value: '0.5rem' },
  { id: 'xl', name: 'Very Rounded', value: '0.75rem' },
  { id: 'full', name: 'Pill', value: '9999px' },
]
