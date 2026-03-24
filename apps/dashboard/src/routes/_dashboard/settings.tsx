import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
// import { SITE_URL } from '@/config'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Icon } from '@iconify/react'
import { IconPicker } from '@/components/cms-editor/IconPicker'
import { MediaPicker } from '@/components/cms-editor/MediaPicker'
import { PageSelector } from '@/components/cms-editor/PageSelector'
// import { cn } from '@/lib/utils'
import {
  Palette,
  Link as LinkIcon,
  Share2,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Globe,
  Image as ImageIcon,
  Type,
  Hash,
  LayoutTemplate,
  Monitor,
  Check,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText
} from 'lucide-react'

export const Route = createFileRoute('/_dashboard/settings')({
  component: SettingsPage,
})

// Types
interface NavLink {
  label: string
  href: string
  children?: NavLink[]
}

interface NavbarCta {
  label: string
  href: string
  show: boolean
}

interface FooterSocial {
  platform: string
  url: string
  icon: string
}

interface FooterColumn {
  title: string
  links: NavLink[]
}

interface SiteSettings {
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
  // Theme fields
  theme: string
  fontDisplay: string
  fontBody: string
  borderRadius: string
  darkMode: string
  // School info
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  schoolEmail: string
  // Report card theme
  reportCardTheme: string
}

interface ReportCardTheme {
  id: string
  name: string
  description: string
  colors: {
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
}

interface ParsedSettings {
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
  // Theme fields
  theme: string
  fontDisplay: string
  fontBody: string
  borderRadius: string
  darkMode: 'light' | 'dark' | 'system'
  // School info
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  schoolEmail: string
  // Report card theme
  reportCardTheme: string
}

const DEFAULT_SETTINGS: ParsedSettings = {
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
  // Theme defaults
  theme: 'modern',
  fontDisplay: 'Quicksand',
  fontBody: 'Plus Jakarta Sans',
  borderRadius: 'lg',
  darkMode: 'system',
  // School info defaults
  schoolName: 'Your School Name',
  schoolAddress: '',
  schoolPhone: '',
  schoolEmail: '',
  // Report card theme
  reportCardTheme: 'playful'
}

const THEMES = [
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
    description: 'Sophisticated gold and black palette.',
    primaryColor: '#a855f7',
    accentColor: '#fbbf24',
    backgroundLight: '#faf5ff',
    backgroundDark: '#09090b',
    fontDisplay: 'Playfair Display',
    fontBody: 'Montserrat',
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

const REPORT_CARD_THEMES: ReportCardTheme[] = [
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
      tableRow: '#F3F4F6',
      footer: '#E5E7EB'
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple black and white design',
    colors: {
      primary: '#374151',
      secondary: '#111827',
      accent: '#6B7280',
      header: '#111827',
      text: '#1F2937',
      background: '#FFFFFF',
      tableHeader: '#374151',
      tableRow: '#F9FAFB',
      footer: '#F3F4F6'
    }
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated with navy and gold',
    colors: {
      primary: '#1E3A8A',
      secondary: '#D97706',
      accent: '#FBBF24',
      header: '#1E3A8A',
      text: '#1F2937',
      background: '#FFFFFF',
      tableHeader: '#1E3A8A',
      tableRow: '#EFF6FF',
      footer: '#DBEAFE'
    }
  }
]

const FONT_OPTIONS = [
  'Quicksand',
  'Playfair Display',
  'Space Grotesk',
  'Poppins',
  'Roboto',
  'Inter',
  'Plus Jakarta Sans',
  'Montserrat',
  'Open Sans'
]

const BORDER_RADIUS_OPTIONS = [
  { id: 'none', name: 'Square', value: '0' },
  { id: 'sm', name: 'Slight', value: '0.125rem' },
  { id: 'md', name: 'Moderate', value: '0.375rem' },
  { id: 'lg', name: 'Rounded', value: '0.5rem' },
  { id: 'xl', name: 'Very Rounded', value: '0.75rem' },
  { id: 'full', name: 'Pill', value: '9999px' },
]

function SettingsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('branding')
  const [showPreview, setShowPreview] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showPreviewDarkMode, setShowPreviewDarkMode] = useState(false) // New state for preview dark mode

  // Fetch settings
  const { data: settingsData, isLoading, error } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const res = await apiFetch('/settings')
      if (!res.ok) {
        const text = await res.text()
        console.error('Settings API error:', res.status, text)
        throw new Error(`Failed to fetch settings: ${res.status}`)
      }
      return res.json() as Promise<SiteSettings>
    },
    retry: false
  })

  // Parse settings into usable format
  const [parsedSettings, setParsedSettings] = useState<ParsedSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    if (settingsData) {
      try {
        const navbarConfig = settingsData.navbarConfig && settingsData.navbarConfig.trim() !== ''
          ? JSON.parse(settingsData.navbarConfig)
          : null
        const footerConfig = settingsData.footerConfig && settingsData.footerConfig.trim() !== ''
          ? JSON.parse(settingsData.footerConfig)
          : null

        setParsedSettings({
          logoText: settingsData.logoText || DEFAULT_SETTINGS.logoText,
          logoType: (settingsData.logoType as 'icon' | 'image') || DEFAULT_SETTINGS.logoType,
          logoIcon: settingsData.logoIcon || DEFAULT_SETTINGS.logoIcon,
          logoImage: settingsData.logoImage || DEFAULT_SETTINGS.logoImage,
          favicon: settingsData.favicon || DEFAULT_SETTINGS.favicon,
          footerDescription: settingsData.footerDescription || DEFAULT_SETTINGS.footerDescription,
          primaryColor: settingsData.primaryColor || DEFAULT_SETTINGS.primaryColor,
          accentColor: settingsData.accentColor || DEFAULT_SETTINGS.accentColor,
          backgroundLight: settingsData.backgroundLight || DEFAULT_SETTINGS.backgroundLight,
          backgroundDark: settingsData.backgroundDark || DEFAULT_SETTINGS.backgroundDark,
          navbarLinks: navbarConfig?.links || DEFAULT_SETTINGS.navbarLinks,
          navbarCta: settingsData.navbarCta && settingsData.navbarCta.trim() !== ''
            ? JSON.parse(settingsData.navbarCta)
            : DEFAULT_SETTINGS.navbarCta,
          footerColumns: footerConfig?.columns || DEFAULT_SETTINGS.footerColumns,
          footerSocials: settingsData.footerSocials && settingsData.footerSocials.trim() !== ''
            ? JSON.parse(settingsData.footerSocials)
            : DEFAULT_SETTINGS.footerSocials,
          // Theme fields
          theme: settingsData.theme || DEFAULT_SETTINGS.theme,
          fontDisplay: settingsData.fontDisplay || DEFAULT_SETTINGS.fontDisplay,
          fontBody: settingsData.fontBody || DEFAULT_SETTINGS.fontBody,
          borderRadius: settingsData.borderRadius || DEFAULT_SETTINGS.borderRadius,
          darkMode: (settingsData.darkMode as 'light' | 'dark' | 'system') || DEFAULT_SETTINGS.darkMode,
          // School info
          schoolName: settingsData.schoolName || DEFAULT_SETTINGS.schoolName,
          schoolAddress: settingsData.schoolAddress || DEFAULT_SETTINGS.schoolAddress,
          schoolPhone: settingsData.schoolPhone || DEFAULT_SETTINGS.schoolPhone,
          schoolEmail: settingsData.schoolEmail || DEFAULT_SETTINGS.schoolEmail,
          // Report card theme
          reportCardTheme: settingsData.reportCardTheme || DEFAULT_SETTINGS.reportCardTheme
        })
      } catch (parseError) {
        console.error('Failed to parse settings:', parseError)
      }
    }
  }, [settingsData])

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (settings: ParsedSettings) => {
      const payload: Partial<SiteSettings> = {
        logoText: settings.logoText,
        logoType: settings.logoType,
        logoIcon: settings.logoIcon,
        logoImage: settings.logoImage,
        favicon: settings.favicon,
        footerDescription: settings.footerDescription,
        primaryColor: settings.primaryColor,
        accentColor: settings.accentColor,
        backgroundLight: settings.backgroundLight,
        backgroundDark: settings.backgroundDark,
        navbarConfig: JSON.stringify({
          logoText: settings.logoText,
          logoIcon: settings.logoIcon,
          logoType: settings.logoType,
          logoImage: settings.logoImage,
          links: settings.navbarLinks
        }),
        navbarCta: JSON.stringify(settings.navbarCta),
        footerConfig: JSON.stringify({
          logoText: settings.logoText,
          logoIcon: settings.logoIcon,
          columns: settings.footerColumns
        }),
        footerSocials: JSON.stringify(settings.footerSocials),
        // Theme fields
        theme: settings.theme,
        fontDisplay: settings.fontDisplay,
        fontBody: settings.fontBody,
        borderRadius: settings.borderRadius,
        darkMode: settings.darkMode,
        // School info
        schoolName: settings.schoolName,
        schoolAddress: settings.schoolAddress,
        schoolPhone: settings.schoolPhone,
        schoolEmail: settings.schoolEmail,
        // Report card theme
        reportCardTheme: settings.reportCardTheme
      }

      const res = await apiFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to save settings')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] })
      setHasUnsavedChanges(false)
    }
  })

  const handleSave = () => {
    saveMutation.mutate(parsedSettings)
  }

  const updateSetting = (key: keyof ParsedSettings | Partial<ParsedSettings>, value?: any) => {
    setParsedSettings(prev => {
      let updated: ParsedSettings;
      
      if (typeof key === 'object') {
        updated = { ...prev, ...key }
      } else {
        updated = { ...prev, [key]: value }
      }
      
      // Ensure arrays are always arrays
      if (!Array.isArray(updated.navbarLinks)) {
        updated.navbarLinks = DEFAULT_SETTINGS.navbarLinks
      }
      if (!Array.isArray(updated.footerColumns)) {
        updated.footerColumns = DEFAULT_SETTINGS.footerColumns
      }
      if (!Array.isArray(updated.footerSocials)) {
        updated.footerSocials = DEFAULT_SETTINGS.footerSocials
      }
      return updated
    })
    setHasUnsavedChanges(true)
  }

  // Navbar link handlers
  const addNavbarLink = () => {
    updateSetting('navbarLinks', [...parsedSettings.navbarLinks, { label: '', href: '' }])
  }

  const updateNavbarLink = (index: number, field: keyof NavLink, value: string) => {
    const newLinks = [...parsedSettings.navbarLinks]
    newLinks[index] = { ...newLinks[index], [field]: value }
    updateSetting('navbarLinks', newLinks)
  }

  const removeNavbarLink = (index: number) => {
    updateSetting('navbarLinks', parsedSettings.navbarLinks.filter((_, i) => i !== index))
  }

  const moveNavbarLink = (index: number, direction: 'up' | 'down') => {
    const newLinks = [...parsedSettings.navbarLinks]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= newLinks.length) return
    ;[newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]]
    updateSetting('navbarLinks', newLinks)
  }

  const addNavbarChildLink = (parentIndex: number) => {
    const newLinks = [...parsedSettings.navbarLinks]
    newLinks[parentIndex].children = [...(newLinks[parentIndex].children || []), { label: '', href: '' }]
    updateSetting('navbarLinks', newLinks)
  }

  const updateNavbarChildLink = (parentIndex: number, childIndex: number, field: keyof NavLink, value: string) => {
    const newLinks = [...parsedSettings.navbarLinks]
    newLinks[parentIndex].children = [...(newLinks[parentIndex].children || [])]
    newLinks[parentIndex].children[childIndex] = { ...newLinks[parentIndex].children[childIndex], [field]: value }
    updateSetting('navbarLinks', newLinks)
  }

  const removeNavbarChildLink = (parentIndex: number, childIndex: number) => {
    const newLinks = [...parsedSettings.navbarLinks]
    newLinks[parentIndex].children = (newLinks[parentIndex].children || []).filter((_, i) => i !== childIndex)
    updateSetting('navbarLinks', newLinks)
  }

  // Footer column handlers
  const addFooterColumn = () => {
    updateSetting('footerColumns', [...parsedSettings.footerColumns, { title: '', links: [] }])
  }

  const updateFooterColumn = (index: number, field: keyof FooterColumn, value: string | NavLink[]) => {
    const newColumns = [...parsedSettings.footerColumns]
    newColumns[index] = { ...newColumns[index], [field]: value }
    updateSetting('footerColumns', newColumns)
  }

  const removeFooterColumn = (index: number) => {
    updateSetting('footerColumns', parsedSettings.footerColumns.filter((_, i) => i !== index))
  }

  const addFooterLink = (columnIndex: number) => {
    const newColumns = [...parsedSettings.footerColumns]
    newColumns[columnIndex].links = [...newColumns[columnIndex].links, { label: '', href: '' }]
    updateSetting('footerColumns', newColumns)
  }

  const updateFooterLink = (columnIndex: number, linkIndex: number, field: keyof NavLink, value: string) => {
    const newColumns = [...parsedSettings.footerColumns]
    newColumns[columnIndex].links[linkIndex] = { ...newColumns[columnIndex].links[linkIndex], [field]: value }
    updateSetting('footerColumns', newColumns)
  }

  const removeFooterLink = (columnIndex: number, linkIndex: number) => {
    const newColumns = [...parsedSettings.footerColumns]
    newColumns[columnIndex].links = newColumns[columnIndex].links.filter((_, i) => i !== linkIndex)
    updateSetting('footerColumns', newColumns)
  }

  // Footer social handlers
  const addFooterSocial = () => {
    updateSetting('footerSocials', [...parsedSettings.footerSocials, { platform: '', url: '', icon: 'globe' }])
  }

  const updateFooterSocial = (index: number, field: keyof FooterSocial, value: string) => {
    const newSocials = [...parsedSettings.footerSocials]
    newSocials[index] = { ...newSocials[index], [field]: value }
    updateSetting('footerSocials', newSocials)
  }

  const removeFooterSocial = (index: number) => {
    updateSetting('footerSocials', parsedSettings.footerSocials.filter((_, i) => i !== index))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold mb-2">Could not load settings</h2>
          <p className="text-muted-foreground mb-4">
            Make sure the server is running and accessible. The settings will appear when the API is available.
          </p>
          <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }

  // Guard against incomplete settings
  if (!parsedSettings.navbarLinks || !parsedSettings.footerColumns || !parsedSettings.footerSocials) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Preparing settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full gap-6 p-6 overflow-hidden">
      {/* Main Settings Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Site Settings</h1>
              <p className="text-muted-foreground mt-1">Customize your site&apos;s branding, navigation, and footer</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending || !hasUnsavedChanges}
                className="gap-2"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : hasUnsavedChanges ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {saveMutation.isPending ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="shrink-0">
            <TabsTrigger value="school" className="gap-2">
              <Building2 className="h-4 w-4" />
              School Info
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="h-4 w-4" />
              Report Cards
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-2">
              <Palette className="h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="theme" className="gap-2">
              <LayoutTemplate className="h-4 w-4" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="navbar" className="gap-2">
              <LinkIcon className="h-4 w-4" />
              Navigation
            </TabsTrigger>
            <TabsTrigger value="footer" className="gap-2">
              <Share2 className="h-4 w-4" />
              Footer
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="school" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    School Information
                  </CardTitle>
                  <CardDescription>Basic details about your school for reports and public site</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">School Name</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="schoolName"
                          value={parsedSettings.schoolName}
                          onChange={(e) => updateSetting('schoolName', e.target.value)}
                          placeholder="Your School Name"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schoolAddress">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="schoolAddress"
                          value={parsedSettings.schoolAddress}
                          onChange={(e) => updateSetting('schoolAddress', e.target.value)}
                          placeholder="123 School Street, City"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schoolPhone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="schoolPhone"
                          type="tel"
                          value={parsedSettings.schoolPhone}
                          onChange={(e) => updateSetting('schoolPhone', e.target.value)}
                          placeholder="+256 700 000 000"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schoolEmail">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="schoolEmail"
                          type="email"
                          value={parsedSettings.schoolEmail}
                          onChange={(e) => updateSetting('schoolEmail', e.target.value)}
                          placeholder="info@school.edu"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Report Card Theme
                  </CardTitle>
                  <CardDescription>Choose a visual style for student report cards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {REPORT_CARD_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => updateSetting('reportCardTheme', theme.id)}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                          parsedSettings.reportCardTheme === theme.id
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 hover:border-primary/50'
                        }`}
                      >
                        {parsedSettings.reportCardTheme === theme.id && (
                          <div className="absolute top-2 right-2 text-primary">
                            <Check className="h-5 w-5" />
                          </div>
                        )}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.colors.primary }}>
                            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{theme.name}</h4>
                            <p className="text-xs text-muted-foreground">{theme.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.primary }} title="Primary" />
                          <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.secondary }} title="Secondary" />
                          <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.accent }} title="Accent" />
                          <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.tableHeader }} title="Table Header" />
                          <div className="w-6 h-6 rounded border border-slate-200" style={{ backgroundColor: theme.colors.tableRow }} title="Table Row" />
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LayoutTemplate className="h-5 w-5" />
                    Logo Settings
                  </CardTitle>
                  <CardDescription>Configure how your logo appears across the site</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="logoType">Logo Type</Label>
                      <select
                        id="logoType"
                        value={parsedSettings.logoType}
                        onChange={(e) => updateSetting('logoType', e.target.value)}
                        className="w-full mt-1.5 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="icon">Icon</option>
                        <option value="image">Image</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="logoText">Logo Text</Label>
                      <Input
                        id="logoText"
                        value={parsedSettings.logoText}
                        onChange={(e) => updateSetting('logoText', e.target.value)}
                        placeholder="Your brand name"
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  {parsedSettings.logoType === 'icon' ? (
                    <div>
                      <Label>Logo Icon</Label>
                      <div className="mt-2">
                        <IconPicker
                          value={parsedSettings.logoIcon}
                          onSelect={(icon) => updateSetting('logoIcon', icon)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label>Logo Image</Label>
                      <div className="mt-2 flex items-center gap-4">
                        <MediaPicker
                          onSelect={(url) => updateSetting('logoImage', url)}
                          trigger={
                            <Button variant="outline" size="sm" className="gap-2">
                              <ImageIcon className="h-4 w-4" />
                              {parsedSettings.logoImage ? 'Change Image' : 'Select Image'}
                            </Button>
                          }
                        />
                        {parsedSettings.logoImage && (
                          <div className="relative">
                            <img src={parsedSettings.logoImage} alt="Logo preview" className="h-12 w-auto object-contain rounded border" />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-5 w-5 rounded-full scale-75"
                              onClick={() => updateSetting('logoImage', '')}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="favicon">Favicon URL</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Input
                        id="favicon"
                        value={parsedSettings.favicon}
                        onChange={(e) => updateSetting('favicon', e.target.value)}
                        placeholder="/favicon.ico"
                        className="flex-1"
                      />
                      <MediaPicker
                        onSelect={(url) => updateSetting('favicon', url)}
                        trigger={
                          <Button variant="outline" size="sm">
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                    {parsedSettings.favicon && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <img src={parsedSettings.favicon} alt="Favicon preview" className="h-8 w-8 object-contain rounded" />
                        <span>Favicon preview</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Color Scheme
                  </CardTitle>
                  <CardDescription>Define your brand colors and backgrounds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={parsedSettings.primaryColor}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          className="w-12 h-9 p-1"
                        />
                        <Input
                          type="text"
                          value={parsedSettings.primaryColor}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          className="flex-1 font-mono h-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accentColor">Accent Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="accentColor"
                          type="color"
                          value={parsedSettings.accentColor}
                          onChange={(e) => updateSetting('accentColor', e.target.value)}
                          className="w-12 h-9 p-1"
                        />
                        <Input
                          type="text"
                          value={parsedSettings.accentColor}
                          onChange={(e) => updateSetting('accentColor', e.target.value)}
                          className="flex-1 font-mono h-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="backgroundLight">Background (Light Mode)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="backgroundLight"
                          type="color"
                          value={parsedSettings.backgroundLight}
                          onChange={(e) => updateSetting('backgroundLight', e.target.value)}
                          className="w-12 h-9 p-1"
                        />
                        <Input
                          type="text"
                          value={parsedSettings.backgroundLight}
                          onChange={(e) => updateSetting('backgroundLight', e.target.value)}
                          className="flex-1 font-mono h-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backgroundDark">Background (Dark Mode)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="backgroundDark"
                          type="color"
                          value={parsedSettings.backgroundDark}
                          onChange={(e) => updateSetting('backgroundDark', e.target.value)}
                          className="w-12 h-9 p-1"
                        />
                        <Input
                          type="text"
                          value={parsedSettings.backgroundDark}
                          onChange={(e) => updateSetting('backgroundDark', e.target.value)}
                          className="flex-1 font-mono h-9"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Footer Description
                  </CardTitle>
                  <CardDescription>The tagline that appears in your footer</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={parsedSettings.footerDescription}
                    onChange={(e) => updateSetting('footerDescription', e.target.value)}
                    placeholder="Describe your business..."
                    rows={3}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="theme" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LayoutTemplate className="h-5 w-5" />
                    Theme Preset
                  </CardTitle>
                  <CardDescription>Choose a pre-designed theme identity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          updateSetting({
                            theme: theme.id,
                            primaryColor: theme.primaryColor,
                            accentColor: theme.accentColor,
                            backgroundLight: theme.backgroundLight,
                            backgroundDark: theme.backgroundDark,
                            borderRadius: theme.borderRadius,
                            fontDisplay: theme.fontDisplay,
                            fontBody: theme.fontBody,
                            darkMode: theme.darkMode as any
                          })
                        }}
                        className={`group relative p-4 rounded-xl border-2 text-left transition-all ${
                          parsedSettings.theme === theme.id
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 hover:border-primary/50'
                        }`}
                      >
                        {parsedSettings.theme === theme.id && (
                          <div className="absolute top-2 right-2 text-primary">
                            <Check className="h-5 w-5" />
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-8 h-8 rounded-lg shadow-sm"
                            style={{ backgroundColor: theme.primaryColor }}
                          />
                          <div
                            className="w-6 h-6 rounded-full shadow-sm"
                            style={{ backgroundColor: theme.accentColor }}
                          />
                        </div>
                        <div className="font-semibold text-sm">{theme.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {theme.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Typography
                  </CardTitle>
                  <CardDescription>Choose fonts for your site</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fontDisplay">Display Font (Headings)</Label>
                      <select
                        id="fontDisplay"
                        value={parsedSettings.fontDisplay}
                        onChange={(e) => updateSetting('fontDisplay', e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {FONT_OPTIONS.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                      <div
                        className="text-sm p-2 rounded border bg-muted/30"
                        style={{ fontFamily: parsedSettings.fontDisplay }}
                      >
                        The quick brown fox jumps over the lazy dog
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fontBody">Body Font</Label>
                      <select
                        id="fontBody"
                        value={parsedSettings.fontBody}
                        onChange={(e) => updateSetting('fontBody', e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {FONT_OPTIONS.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                      <div
                        className="text-sm p-2 rounded border bg-muted/30"
                        style={{ fontFamily: parsedSettings.fontBody }}
                      >
                        The quick brown fox jumps over the lazy dog
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Appearance
                  </CardTitle>
                  <CardDescription>Visual styling preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Border Radius</Label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {[
                        { id: 'none', name: 'Square', value: '0' },
                        { id: 'sm', name: 'Slight', value: '0.125rem' },
                        { id: 'md', name: 'Moderate', value: '0.375rem' },
                        { id: 'lg', name: 'Rounded', value: '0.5rem' },
                        { id: 'xl', name: 'Very Rounded', value: '0.75rem' },
                        { id: 'full', name: 'Pill', value: '9999px' },
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => updateSetting('borderRadius', option.id)}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            parsedSettings.borderRadius === option.id
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-slate-200 hover:border-primary/50'
                          }`}
                        >
                          <div
                            className="w-full h-8 bg-slate-200 dark:bg-slate-700 mb-2"
                            style={{ borderRadius: option.value }}
                          />
                          <div className="text-xs font-medium">{option.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Dark Mode</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'light', name: 'Light', icon: '☀️' },
                        { id: 'dark', name: 'Dark', icon: '🌙' },
                        { id: 'system', name: 'System', icon: '💻' },
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => updateSetting('darkMode', option.id as 'light' | 'dark' | 'system')}
                          className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                            parsedSettings.darkMode === option.id
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-slate-200 hover:border-primary/50'
                          }`}
                        >
                          <span>{option.icon}</span>
                          <span className="text-sm font-medium">{option.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="navbar" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Navigation Links
                  </CardTitle>
                  <CardDescription>Manage the links in your site navigation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {parsedSettings.navbarLinks.map((link, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/20">
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => moveNavbarLink(index, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => moveNavbarLink(index, 'down')}
                            disabled={index === parsedSettings.navbarLinks.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                        <Input
                          value={link.label}
                          onChange={(e) => updateNavbarLink(index, 'label', e.target.value)}
                          placeholder="Link label"
                          className="flex-1"
                        />
                        <PageSelector
                          value={link.href}
                          onChange={(value) => updateNavbarLink(index, 'href', value)}
                          placeholder="/page"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeNavbarLink(index)}
                          disabled={parsedSettings.navbarLinks.length <= 1}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      {link.children && link.children.length > 0 && (
                        <div className="ml-8 pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-2">
                          {link.children.map((child, childIndex) => (
                            <div key={childIndex} className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground w-4">└</span>
                              <Input
                                value={child.label}
                                onChange={(e) => updateNavbarChildLink(index, childIndex, 'label', e.target.value)}
                                placeholder="Child label"
                                className="flex-1"
                              />
                              <PageSelector
                                value={child.href}
                                onChange={(value) => updateNavbarChildLink(index, childIndex, 'href', value)}
                                placeholder="/child"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeNavbarChildLink(index, childIndex)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addNavbarChildLink(index)}
                        className="ml-8 text-muted-foreground"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Dropdown Item
                      </Button>
                    </div>
                  ))}
                  <Button onClick={addNavbarLink} variant="outline" className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Add Link
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Call-to-Action Button
                  </CardTitle>
                  <CardDescription>Optional CTA button in the navigation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ctaShow">Show CTA Button</Label>
                    <Switch
                      id="ctaShow"
                      checked={parsedSettings.navbarCta.show}
                      onCheckedChange={(checked) =>
                        updateSetting('navbarCta', { ...parsedSettings.navbarCta, show: checked })
                      }
                    />
                  </div>
                  {parsedSettings.navbarCta.show && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="ctaLabel">Button Label</Label>
                        <Input
                          id="ctaLabel"
                          value={parsedSettings.navbarCta.label}
                          onChange={(e) =>
                            updateSetting('navbarCta', { ...parsedSettings.navbarCta, label: e.target.value })
                          }
                          placeholder="Get Started"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ctaHref">Button URL</Label>
                        <div className="mt-1.5">
                          <PageSelector
                            value={parsedSettings.navbarCta.href}
                            onChange={(value) =>
                              updateSetting('navbarCta', { ...parsedSettings.navbarCta, href: value })
                            }
                            placeholder="/contact"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="footer" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LayoutTemplate className="h-5 w-5" />
                    Footer Columns
                  </CardTitle>
                  <CardDescription>Organize your footer content into columns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {parsedSettings.footerColumns.map((column, colIndex) => (
                    <div key={colIndex} className="p-4 rounded-lg border space-y-3">
                      <div className="flex items-center gap-2">
                        <Input
                          value={column.title}
                          onChange={(e) => updateFooterColumn(colIndex, 'title', e.target.value)}
                          placeholder="Column title"
                          className="flex-1 font-medium"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFooterColumn(colIndex)}
                          disabled={parsedSettings.footerColumns.length <= 1}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="space-y-2 pl-2">
                        {column.links.map((link, linkIndex) => (
                          <div key={linkIndex} className="flex items-center gap-2">
                            <Input
                              value={link.label}
                              onChange={(e) => updateFooterLink(colIndex, linkIndex, 'label', e.target.value)}
                              placeholder="Link label"
                              className="flex-1 text-sm"
                            />
                            <PageSelector
                              value={link.href}
                              onChange={(value) => updateFooterLink(colIndex, linkIndex, 'href', value)}
                              placeholder="/page"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFooterLink(colIndex, linkIndex)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          onClick={() => addFooterLink(colIndex)}
                          variant="ghost"
                          size="sm"
                          className="w-full gap-2 text-xs"
                        >
                          <Plus className="h-3 w-3" />
                          Add Link
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button onClick={addFooterColumn} variant="outline" className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Add Column
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Social Media Links
                  </CardTitle>
                  <CardDescription>Add your social media profiles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {parsedSettings.footerSocials.map((social, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 rounded-lg border bg-muted/20">
                      <IconPicker
                        value={social.icon}
                        onSelect={(icon) => updateFooterSocial(index, 'icon', icon)}
                        trigger={
                          <Button variant="outline" size="sm" className="gap-2 w-[120px] justify-start">
                            <Icon icon={social.icon ? `ph:${social.icon}` : 'ph:globe'} className="h-4 w-4" />
                            <span className="capitalize truncate">{social.icon || 'Icon'}</span>
                          </Button>
                        }
                        defaultTab="social"
                      />
                      <Input
                        value={social.platform}
                        onChange={(e) => updateFooterSocial(index, 'platform', e.target.value)}
                        placeholder="Platform name"
                        className="flex-1"
                      />
                      <Input
                        value={social.url}
                        onChange={(e) => updateFooterSocial(index, 'url', e.target.value)}
                        placeholder="https://..."
                        className="flex-1 font-mono text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFooterSocial(index)}
                        disabled={parsedSettings.footerSocials.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button onClick={addFooterSocial} variant="outline" className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Add Social Link
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className="w-[450px] shrink-0 flex flex-col border rounded-lg overflow-hidden bg-background">
          <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Live Preview
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Approximate preview of your settings</p>
            </div>
            {/* Dark Mode Toggle for Preview */}
            <Switch
              checked={showPreviewDarkMode}
              onCheckedChange={setShowPreviewDarkMode}
              aria-label="Toggle dark mode preview"
              className="ml-auto"
            />
          </div>
          <div className={`flex-1 overflow-y-auto ${showPreviewDarkMode ? 'dark' : ''}`} style={{ 
            backgroundColor: showPreviewDarkMode ? parsedSettings.backgroundDark : parsedSettings.backgroundLight 
          }}>
            {/* Preview Navbar */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b">
              <div className="flex items-center justify-between h-16 px-4">
                <div className="flex items-center gap-2">
                  {parsedSettings.logoType === 'image' && parsedSettings.logoImage ? (
                    <img src={parsedSettings.logoImage} alt="Logo" className="h-8 w-auto object-contain" />
                  ) : (
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center"
                      style={{ backgroundColor: parsedSettings.primaryColor + '20' }}
                    >
                      <Globe className="h-5 w-5" style={{ color: parsedSettings.primaryColor }} />
                    </div>
                  )}
                  <span className="font-bold">{parsedSettings.logoText}</span>
                </div>
                <div className="hidden sm:flex items-center gap-4">
                  {parsedSettings.navbarLinks.slice(0, 3).map((link, i) => (
                    <span key={i} className="text-xs text-muted-foreground">{link.label || 'Link'}</span>
                  ))}
                  {parsedSettings.navbarCta.show && (
                    <span
                      className="text-xs text-white px-3 py-1.5 rounded-full font-medium"
                      style={{ backgroundColor: parsedSettings.primaryColor }}
                    >
                      {parsedSettings.navbarCta.label || 'CTA'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Content Placeholder */}
            <div className="p-8 space-y-6">
              <div className="text-center space-y-4 py-12">
                <div
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
                  style={{ backgroundColor: parsedSettings.accentColor + '20', color: parsedSettings.accentColor }}
                >
                  Preview Content
                </div>
                <h2 className="text-2xl font-bold" style={{ fontFamily: parsedSettings.fontDisplay }}>
                  Your Site Content Here
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto" style={{ fontFamily: parsedSettings.fontBody }}>
                  This is a preview of how your settings will appear. The actual site will render your full content.
                </p>
              </div>

              {/* Theme Settings Preview */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Font Preview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border bg-background text-sm">
                    <p className="text-muted-foreground mb-1">Display Font</p>
                    <p style={{ fontFamily: parsedSettings.fontDisplay }} className="font-bold text-lg">Aa Bb Cc</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-background text-sm">
                    <p className="text-muted-foreground mb-1">Body Font</p>
                    <p style={{ fontFamily: parsedSettings.fontBody }} className="text-lg">Aa Bb Cc</p>
                  </div>
                </div>

                <h3 className="font-semibold text-sm mt-4">Border Radius Preview</h3>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-primary/20 flex items-center justify-center text-primary font-bold text-xs"
                    style={{ borderRadius: BORDER_RADIUS_OPTIONS.find(o => o.id === parsedSettings.borderRadius)?.value || '0.5rem' }}
                  >
                    Radius
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Selected: {parsedSettings.borderRadius} (
                    {BORDER_RADIUS_OPTIONS.find(o => o.id === parsedSettings.borderRadius)?.value})
                  </p>
                </div>
              </div>

              {/* Color Preview Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-lg text-white space-y-2"
                  style={{ backgroundColor: parsedSettings.primaryColor }}
                >
                  <div className="font-semibold">Primary</div>
                  <div className="text-xs opacity-80 font-mono">{parsedSettings.primaryColor}</div>
                </div>
                <div
                  className="p-4 rounded-lg text-white space-y-2"
                  style={{ backgroundColor: parsedSettings.accentColor }}
                >
                  <div className="font-semibold">Accent</div>
                  <div className="text-xs opacity-80 font-mono">{parsedSettings.accentColor}</div>
                </div>
              </div>
            </div>

            {/* Preview Footer */}
            <div className="border-t bg-muted/30 mt-8">
              <div className="p-8">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center"
                        style={{ backgroundColor: parsedSettings.primaryColor + '20' }}
                      >
                        <Globe className="h-4 w-4" style={{ color: parsedSettings.primaryColor }} />
                      </div>
                      <span className="font-bold text-sm">{parsedSettings.logoText}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {parsedSettings.footerDescription}
                    </p>
                    <div className="flex gap-2">
                      {parsedSettings.footerSocials.slice(0, 3).map((socialItem, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-lg bg-background border flex items-center justify-center"
                          title={socialItem.platform}
                        >
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                  {parsedSettings.footerColumns.slice(0, 2).map((column, i) => (
                    <div key={i} className="space-y-2">
                      <h4 className="font-semibold text-sm">{column.title || 'Column'}</h4>
                      <ul className="space-y-1">
                        {column.links.slice(0, 3).map((link, li) => (
                          <li key={li} className="text-xs text-muted-foreground">{link.label || 'Link'}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t text-xs text-muted-foreground text-center">
                  © {new Date().getFullYear()} {parsedSettings.logoText}. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
