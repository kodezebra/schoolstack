import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { DEFAULT_SETTINGS } from './settings.data'
import type { ParsedSettings, SiteSettings, NavLink, FooterSocial, FooterColumn } from './settings.types'

export function useSettings() {
  const queryClient = useQueryClient()
  const [parsedSettings, setParsedSettings] = useState<ParsedSettings>(DEFAULT_SETTINGS)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const { data: settingsData, isLoading, error } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const res = await apiFetch('/settings')
      if (!res.ok) throw new Error('Failed to fetch settings')
      return res.json() as Promise<SiteSettings>
    }
  })

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
        theme: settings.theme,
        fontDisplay: settings.fontDisplay,
        fontBody: settings.fontBody,
        borderRadius: settings.borderRadius,
        darkMode: settings.darkMode,
        schoolName: settings.schoolName,
        schoolAddress: settings.schoolAddress,
        schoolPhone: settings.schoolPhone,
        schoolEmail: settings.schoolEmail,
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

  const handleSave = useCallback(() => {
    saveMutation.mutate(parsedSettings)
  }, [saveMutation, parsedSettings])

  const updateSetting = useCallback((key: any, value?: unknown) => {
    setParsedSettings(prev => {
      let updated: ParsedSettings
      
      if (typeof key === 'object') {
        updated = { ...prev, ...key }
      } else {
        updated = { ...prev, [key]: value }
      }
      
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
  }, [])

  const parseSettings = useCallback((data: SiteSettings) => {
    const navbarConfig = data.navbarConfig && data.navbarConfig.trim() !== ''
      ? JSON.parse(data.navbarConfig)
      : null
    const footerConfig = data.footerConfig && data.footerConfig.trim() !== ''
      ? JSON.parse(data.footerConfig)
      : null

    setParsedSettings({
      logoText: data.logoText || DEFAULT_SETTINGS.logoText,
      logoType: (data.logoType as 'icon' | 'image') || DEFAULT_SETTINGS.logoType,
      logoIcon: data.logoIcon || DEFAULT_SETTINGS.logoIcon,
      logoImage: data.logoImage || DEFAULT_SETTINGS.logoImage,
      favicon: data.favicon || DEFAULT_SETTINGS.favicon,
      footerDescription: data.footerDescription || DEFAULT_SETTINGS.footerDescription,
      primaryColor: data.primaryColor || DEFAULT_SETTINGS.primaryColor,
      accentColor: data.accentColor || DEFAULT_SETTINGS.accentColor,
      backgroundLight: data.backgroundLight || DEFAULT_SETTINGS.backgroundLight,
      backgroundDark: data.backgroundDark || DEFAULT_SETTINGS.backgroundDark,
      navbarLinks: navbarConfig?.links || DEFAULT_SETTINGS.navbarLinks,
      navbarCta: data.navbarCta && data.navbarCta.trim() !== ''
        ? JSON.parse(data.navbarCta)
        : DEFAULT_SETTINGS.navbarCta,
      footerColumns: footerConfig?.columns || DEFAULT_SETTINGS.footerColumns,
      footerSocials: data.footerSocials && data.footerSocials.trim() !== ''
        ? JSON.parse(data.footerSocials)
        : DEFAULT_SETTINGS.footerSocials,
      theme: data.theme || DEFAULT_SETTINGS.theme,
      fontDisplay: data.fontDisplay || DEFAULT_SETTINGS.fontDisplay,
      fontBody: data.fontBody || DEFAULT_SETTINGS.fontBody,
      borderRadius: data.borderRadius || DEFAULT_SETTINGS.borderRadius,
      darkMode: (data.darkMode as 'light' | 'dark' | 'system') || DEFAULT_SETTINGS.darkMode,
      schoolName: data.schoolName || DEFAULT_SETTINGS.schoolName,
      schoolAddress: data.schoolAddress || DEFAULT_SETTINGS.schoolAddress,
      schoolPhone: data.schoolPhone || DEFAULT_SETTINGS.schoolPhone,
      schoolEmail: data.schoolEmail || DEFAULT_SETTINGS.schoolEmail,
      reportCardTheme: data.reportCardTheme || DEFAULT_SETTINGS.reportCardTheme
    })
  }, [])

  return {
    parsedSettings,
    setParsedSettings,
    hasUnsavedChanges,
    isLoading,
    error,
    saveMutation,
    handleSave,
    updateSetting,
    parseSettings,
    settingsData
  }
}

export function useNavbarLinks(parsedSettings: ParsedSettings, updateSetting: (key: string, value: unknown) => void) {
  const addLink = () => {
    updateSetting('navbarLinks', [...parsedSettings.navbarLinks, { label: '', href: '' }])
  }

  const updateLink = (index: number, field: keyof NavLink, value: string) => {
    const newLinks = [...parsedSettings.navbarLinks]
    newLinks[index] = { ...newLinks[index], [field]: value }
    updateSetting('navbarLinks', newLinks)
  }

  const removeLink = (index: number) => {
    updateSetting('navbarLinks', parsedSettings.navbarLinks.filter((_, i) => i !== index))
  }

  const moveLink = (index: number, direction: 'up' | 'down') => {
    const newLinks = [...parsedSettings.navbarLinks]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= newLinks.length) return
    ;[newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]]
    updateSetting('navbarLinks', newLinks)
  }

  const addChildLink = (parentIndex: number) => {
    const newLinks = [...parsedSettings.navbarLinks]
    newLinks[parentIndex].children = [...(newLinks[parentIndex].children || []), { label: '', href: '' }]
    updateSetting('navbarLinks', newLinks)
  }

  const updateChildLink = (parentIndex: number, childIndex: number, field: keyof NavLink, value: string) => {
    const newLinks = [...parsedSettings.navbarLinks]
    newLinks[parentIndex].children = [...(newLinks[parentIndex].children || [])]
    newLinks[parentIndex].children[childIndex] = { ...newLinks[parentIndex].children[childIndex], [field]: value }
    updateSetting('navbarLinks', newLinks)
  }

  const removeChildLink = (parentIndex: number, childIndex: number) => {
    const newLinks = [...parsedSettings.navbarLinks]
    newLinks[parentIndex].children = (newLinks[parentIndex].children || []).filter((_, i) => i !== childIndex)
    updateSetting('navbarLinks', newLinks)
  }

  return { addLink, updateLink, removeLink, moveLink, addChildLink, updateChildLink, removeChildLink }
}

export function useFooterColumns(parsedSettings: ParsedSettings, updateSetting: (key: string, value: unknown) => void) {
  const addColumn = () => {
    updateSetting('footerColumns', [...parsedSettings.footerColumns, { title: '', links: [] }])
  }

  const updateColumn = (index: number, field: keyof FooterColumn, value: string | NavLink[]) => {
    const newColumns = [...parsedSettings.footerColumns]
    newColumns[index] = { ...newColumns[index], [field]: value }
    updateSetting('footerColumns', newColumns)
  }

  const removeColumn = (index: number) => {
    updateSetting('footerColumns', parsedSettings.footerColumns.filter((_, i) => i !== index))
  }

  const addLink = (columnIndex: number) => {
    const newColumns = [...parsedSettings.footerColumns]
    newColumns[columnIndex].links = [...newColumns[columnIndex].links, { label: '', href: '' }]
    updateSetting('footerColumns', newColumns)
  }

  const updateLink = (columnIndex: number, linkIndex: number, field: keyof NavLink, value: string) => {
    const newColumns = [...parsedSettings.footerColumns]
    newColumns[columnIndex].links[linkIndex] = { ...newColumns[columnIndex].links[linkIndex], [field]: value }
    updateSetting('footerColumns', newColumns)
  }

  const removeLink = (columnIndex: number, linkIndex: number) => {
    const newColumns = [...parsedSettings.footerColumns]
    newColumns[columnIndex].links = newColumns[columnIndex].links.filter((_, i) => i !== linkIndex)
    updateSetting('footerColumns', newColumns)
  }

  return { addColumn, updateColumn, removeColumn, addLink, updateLink, removeLink }
}

export function useFooterSocials(parsedSettings: ParsedSettings, updateSetting: (key: string, value: unknown) => void) {
  const addSocial = () => {
    updateSetting('footerSocials', [...parsedSettings.footerSocials, { platform: '', url: '', icon: 'globe' }])
  }

  const updateSocial = (index: number, field: keyof FooterSocial, value: string) => {
    const newSocials = [...parsedSettings.footerSocials]
    newSocials[index] = { ...newSocials[index], [field]: value }
    updateSetting('footerSocials', newSocials)
  }

  const removeSocial = (index: number) => {
    updateSetting('footerSocials', parsedSettings.footerSocials.filter((_, i) => i !== index))
  }

  return { addSocial, updateSocial, removeSocial }
}
