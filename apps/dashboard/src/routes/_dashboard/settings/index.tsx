import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Loader2, Save, CheckCircle2, Link as LinkIcon, Palette, LayoutTemplate, Share2 } from 'lucide-react'
import { useSettings, useNavbarLinks, useFooterColumns, useFooterSocials } from './settings.hooks'
import {
  NavigationSection,
  BrandingSection,
  ThemeSection,
  FooterSection
} from './sections'
import type { SettingsTab } from './settings.types'

export const Route = createFileRoute('/_dashboard/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('branding')
  
  const {
    parsedSettings,
    hasUnsavedChanges,
    isLoading,
    error,
    saveMutation,
    handleSave,
    updateSetting,
    parseSettings,
    settingsData
  } = useSettings()

  const navbarActions = useNavbarLinks(parsedSettings, updateSetting)
  const footerActions = useFooterColumns(parsedSettings, updateSetting)
  const footerSocialsActions = useFooterSocials(parsedSettings, updateSetting)

  useEffect(() => {
    if (settingsData) {
      parseSettings(settingsData)
    }
  }, [settingsData, parseSettings])

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
            Make sure the server is running and accessible.
          </p>
          <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }

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
    <div className="h-full overflow-hidden">
      <div className="flex flex-col h-full p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Site Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your website configuration</p>
            </div>
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

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingsTab)} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="shrink-0 grid grid-cols-4 w-fit">
            <TabsTrigger value="branding" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Branding</span>
            </TabsTrigger>
            <TabsTrigger value="theme" className="gap-2">
              <LayoutTemplate className="h-4 w-4" />
              <span className="hidden sm:inline">Theme</span>
            </TabsTrigger>
            <TabsTrigger value="navigation" className="gap-2">
              <LinkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Navigation</span>
            </TabsTrigger>
            <TabsTrigger value="footer" className="gap-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Footer</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-6">
            <TabsContent value="branding" className="mt-0">
              <BrandingSection
                settings={parsedSettings}
                onUpdate={updateSetting}
              />
            </TabsContent>

            <TabsContent value="theme" className="mt-0">
              <ThemeSection
                settings={parsedSettings}
                onUpdate={updateSetting}
              />
            </TabsContent>

            <TabsContent value="navigation" className="mt-0">
              <NavigationSection
                settings={parsedSettings}
                onUpdate={updateSetting}
                navbarActions={navbarActions}
              />
            </TabsContent>

            <TabsContent value="footer" className="mt-0">
              <FooterSection
                settings={parsedSettings}
                onUpdate={updateSetting}
                footerActions={{
                  ...footerActions,
                  ...footerSocialsActions
                }}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
