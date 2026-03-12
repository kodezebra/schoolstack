/**
 * Theme Presets for Public Pages
 * 
 * Each theme defines a complete visual identity including:
 * - Color palette (primary, accent)
 * - Typography (display fonts, body fonts)
 * - Border radius styling
 * - Dark mode preference
 */

export interface ThemePreset {
  id: string
  name: string
  description: string
  primaryColor: string
  accentColor: string
  fontDisplay: string
  fontBody: string
  borderRadius: string
  darkMode: 'light' | 'dark' | 'system'
  tags: string[]
}

export const THEMES: ThemePreset[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and professional with vibrant accents. Perfect for tech companies.',
    primaryColor: '#6366f1',
    accentColor: '#ff6b35',
    fontDisplay: 'Quicksand',
    fontBody: 'Plus Jakarta Sans',
    borderRadius: 'lg',
    darkMode: 'system',
    tags: ['Professional', 'Tech', 'Clean']
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Monochrome elegance with sharp edges. Ideal for portfolios and luxury brands.',
    primaryColor: '#171717',
    accentColor: '#737373',
    fontDisplay: 'Inter',
    fontBody: 'Inter',
    borderRadius: 'none',
    darkMode: 'light',
    tags: ['Minimal', 'Elegant', 'Sharp']
  },
  {
    id: 'bakery',
    name: 'Bakery & Cafe',
    description: 'Warm, appetizing tones with classic serif headings. Perfect for food businesses.',
    primaryColor: '#854d0e',
    accentColor: '#fde047',
    fontDisplay: 'Playfair Display',
    fontBody: 'Open Sans',
    borderRadius: 'md',
    darkMode: 'light',
    tags: ['Warm', 'Food', 'Classic']
  },
  {
    id: 'high-tech',
    name: 'High-Tech',
    description: 'Futuristic and fast with geometric typography. Best for SaaS and AI products.',
    primaryColor: '#0ea5e9',
    accentColor: '#00f5d4',
    fontDisplay: 'Space Grotesk',
    fontBody: 'Inter',
    borderRadius: 'sm',
    darkMode: 'dark',
    tags: ['Futuristic', 'Tech', 'Geometric']
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Sophisticated gold and black palette for high-end boutique experiences.',
    primaryColor: '#a855f7',
    accentColor: '#fbbf24',
    fontDisplay: 'Playfair Display',
    fontBody: 'Montserrat',
    borderRadius: 'none',
    darkMode: 'dark',
    tags: ['Luxury', 'Elegant', 'Boutique']
  },
  {
    id: 'nature',
    name: 'Nature & Wellness',
    description: 'Calming earth tones and organic feel for eco-friendly and health brands.',
    primaryColor: '#15803d',
    accentColor: '#d97706',
    fontDisplay: 'Quicksand',
    fontBody: 'Plus Jakarta Sans',
    borderRadius: 'full',
    darkMode: 'system',
    tags: ['Organic', 'Eco', 'Wellness']
  },
  {
    id: 'academy',
    name: 'Academy',
    description: 'Trustworthy and scholarly feel for educational institutions and non-profits.',
    primaryColor: '#1e3a8a',
    accentColor: '#f59e0b',
    fontDisplay: 'Poppins',
    fontBody: 'Roboto',
    borderRadius: 'md',
    darkMode: 'light',
    tags: ['Education', 'Trust', 'Scholarly']
  },
  {
    id: 'playful',
    name: 'Playful',
    description: 'Fun and friendly with bouncy curves. Great for toys, games, and children products.',
    primaryColor: '#ec4899',
    accentColor: '#8b5cf6',
    fontDisplay: 'Quicksand',
    fontBody: 'Plus Jakarta Sans',
    borderRadius: 'full',
    darkMode: 'system',
    tags: ['Fun', 'Friendly', 'Kids']
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Serious and stable blue tones for finance, law, and consulting.',
    primaryColor: '#1e40af',
    accentColor: '#0ea5e9',
    fontDisplay: 'Inter',
    fontBody: 'Plus Jakarta Sans',
    borderRadius: 'sm',
    darkMode: 'light',
    tags: ['Serious', 'Finance', 'Corporate']
  },
  {
    id: 'bold',
    name: 'Bold Agency',
    description: 'High contrast and energetic for creative agencies that want to stand out.',
    primaryColor: '#dc2626',
    accentColor: '#fbbf24',
    fontDisplay: 'Poppins',
    fontBody: 'Inter',
    borderRadius: 'xl',
    darkMode: 'dark',
    tags: ['Bold', 'Creative', 'Energetic']
  }
]

/**
 * Get a theme preset by ID
 */
export function getThemeById(id: string): ThemePreset | undefined {
  return THEMES.find(theme => theme.id === id)
}

/**
 * Get all available font options
 */
export const FONT_OPTIONS = [
  { id: 'Quicksand', name: 'Quicksand', category: 'Display' },
  { id: 'Playfair Display', name: 'Playfair Display', category: 'Display' },
  { id: 'Space Grotesk', name: 'Space Grotesk', category: 'Display' },
  { id: 'Poppins', name: 'Poppins', category: 'Display' },
  { id: 'Roboto', name: 'Roboto', category: 'Sans-serif' },
  { id: 'Inter', name: 'Inter', category: 'Sans-serif' },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', category: 'Sans-serif' },
  { id: 'Montserrat', name: 'Montserrat', category: 'Sans-serif' },
  { id: 'Open Sans', name: 'Open Sans', category: 'Sans-serif' },
]

/**
 * Get all border radius options
 */
export const BORDER_RADIUS_OPTIONS = [
  { id: 'none', name: 'Square', value: '0' },
  { id: 'sm', name: 'Slight', value: '0.125rem' },
  { id: 'md', name: 'Moderate', value: '0.375rem' },
  { id: 'lg', name: 'Rounded', value: '0.5rem' },
  { id: 'xl', name: 'Very Rounded', value: '0.75rem' },
  { id: 'full', name: 'Pill', value: '9999px' },
]

/**
 * Get CSS font stack for a font family
 */
export function getFontStack(fontName: string): string {
  const stacks: Record<string, string> = {
    'Quicksand': 'Quicksand, system-ui, sans-serif',
    'Playfair Display': '"Playfair Display", Georgia, serif',
    'Space Grotesk': '"Space Grotesk", system-ui, sans-serif',
    'Poppins': 'Poppins, system-ui, sans-serif',
    'Roboto': 'Roboto, system-ui, sans-serif',
    'Inter': 'Inter, system-ui, sans-serif',
    'Plus Jakarta Sans': '"Plus Jakarta Sans", system-ui, sans-serif',
    'Montserrat': 'Montserrat, system-ui, sans-serif',
    'Open Sans': '"Open Sans", system-ui, sans-serif',
  }
  return stacks[fontName] || `${fontName}, system-ui, sans-serif`
}
