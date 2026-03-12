import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Settings, 
  Palette, 
  Navigation, 
  LayoutTemplate, 
  Save, 
  Plus, 
  Trash2, 
  GripVertical,
  Globe,
  Image as ImageIcon,
  ExternalLink,
  Info,
  Undo2,
  Type
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { IconPicker } from '@/components/cms-editor/IconPicker'
import { MediaPicker } from '@/components/cms-editor/MediaPicker'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_dashboard/settings')({
  component: SettingsPage,
})

type NavLink = {
  label: string;
  url: string;
  isExternal?: boolean;
}

type FooterSection = {
  title: string;
  links: NavLink[];
}

function SettingsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('general')

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await apiFetch('/settings')
      return res.json()
    }
  })

  // Global form state to allow a single save button
  const [formData, setFormData] = useState<any>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (settings) {
      setFormData(settings)
    }
  }, [settings])

  useEffect(() => {
    if (settings && formData) {
      const isDifferent = JSON.stringify(settings) !== JSON.stringify(formData)
      setHasChanges(isDifferent)
    }
  }, [formData, settings])

  const updateSettings = useMutation({
    mutationFn: async (newSettings: any) => {
      const res = await apiFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify(newSettings)
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      setHasChanges(false)
    }
  })

  const handleReset = () => {
    setFormData(settings)
    setHasChanges(false)
  }

  if (isLoading || !formData) return <div className="p-8 flex items-center justify-center">Loading settings...</div>

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your website's global configuration and appearance.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent mb-2">
          <TabsTrigger value="general" className="gap-2"><Settings className="h-4 w-4" /> General Settings</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2"><Palette className="h-4 w-4" /> Site Appearance</TabsTrigger>
          <TabsTrigger value="navigation" className="gap-2"><Navigation className="h-4 w-4" /> Main Navigation</TabsTrigger>
          <TabsTrigger value="footer" className="gap-2"><LayoutTemplate className="h-4 w-4" /> Footer Layout</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralSettings 
            data={formData} 
            onChange={(newData: any) => setFormData({ ...formData, ...newData })} 
          />
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <AppearanceSettings 
            data={formData} 
            onChange={(newData: any) => setFormData({ ...formData, ...newData })} 
          />
        </TabsContent>

        <TabsContent value="navigation" className="space-y-6">
          <NavigationSettings 
            data={formData} 
            onChange={(newData: any) => setFormData({ ...formData, ...newData })} 
          />
        </TabsContent>

        <TabsContent value="footer" className="space-y-6">
          <FooterSettings 
            data={formData} 
            onChange={(newData: any) => setFormData({ ...formData, ...newData })} 
          />
        </TabsContent>
      </Tabs>

      {/* Sticky Save Bar */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-slate-900 text-white rounded-xl shadow-2xl p-4 flex items-center justify-between gap-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-sm font-medium">You have unsaved changes</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReset}
                className="text-slate-400 hover:text-white hover:bg-white/10"
              >
                <Undo2 className="mr-2 h-4 w-4" />
                Discard
              </Button>
              <Button 
                size="sm" 
                onClick={() => updateSettings.mutate(formData)}
                disabled={updateSettings.isPending}
                className="bg-blue-600 hover:bg-blue-500 text-white border-none px-6"
              >
                {updateSettings.isPending ? <Save className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function GeneralSettings({ data, onChange }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Site Identity</CardTitle>
          <CardDescription>How your brand is identified across the web.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="logoText">Logo Text</Label>
            <Input 
              id="logoText" 
              value={data.logoText || ''} 
              onChange={e => onChange({ logoText: e.target.value })}
              placeholder="e.g. My Awesome Site"
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Logo Style</Label>
              <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                <Button 
                  variant={data.logoType === 'icon' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="h-7 text-xs px-3"
                  onClick={() => onChange({ logoType: 'icon' })}
                >
                  <Navigation className="mr-2 h-3 w-3" /> Icon
                </Button>
                <Button 
                  variant={data.logoType === 'image' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="h-7 text-xs px-3"
                  onClick={() => onChange({ logoType: 'image' })}
                >
                  <ImageIcon className="mr-2 h-3 w-3" /> Image
                </Button>
              </div>
            </div>

            {data.logoType === 'icon' ? (
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
                <div className="p-3 border rounded-lg bg-card shadow-sm">
                  <IconPicker 
                    value={data.logoIcon} 
                    onSelect={icon => onChange({ logoIcon: icon })} 
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">Select Brand Icon</p>
                  <p className="text-xs text-muted-foreground">This icon appears next to your site name.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-6 p-4 border rounded-lg bg-muted/20">
                <div className="h-16 w-32 border rounded-lg bg-card shadow-sm flex items-center justify-center overflow-hidden">
                  {data.logoImage ? (
                    <img src={data.logoImage} alt="Logo" className="max-h-12 max-w-[100px] object-contain" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">Brand Logo Image</p>
                  <MediaPicker 
                    onSelect={(url) => onChange({ logoImage: url })}
                    trigger={<Button variant="outline" size="sm">Replace Image</Button>}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Favicon</CardTitle>
          <CardDescription>The icon displayed in browser tabs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
              {data.favicon ? (
                <img src={data.favicon} alt="Favicon" className="h-10 w-10 object-contain" />
              ) : (
                <Globe className="h-8 w-8 text-muted-foreground/30" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium">Browser Icon (Favicon)</p>
              <MediaPicker 
                onSelect={(url) => onChange({ favicon: url })}
                trigger={<Button variant="outline" size="sm">Choose Image</Button>}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AppearanceSettings({ data, onChange }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Brand Appearance</CardTitle>
        <CardDescription>Set the global theme colors for your website.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid sm:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label>Primary Brand Color</Label>
            <div className="flex gap-3">
              <input 
                type="color" 
                className="h-10 w-20 rounded border bg-transparent p-1 cursor-pointer shadow-sm"
                value={data.primaryColor || '#6366f1'}
                onChange={e => onChange({ primaryColor: e.target.value })}
              />
              <Input 
                value={data.primaryColor || '#6366f1'}
                onChange={e => onChange({ primaryColor: e.target.value })}
                className="font-mono text-sm uppercase"
              />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Used for main navigation, primary buttons, and critical branding elements.
            </p>
          </div>
          <div className="space-y-3">
            <Label>Accent Color</Label>
            <div className="flex gap-3">
              <input 
                type="color" 
                className="h-10 w-20 rounded border bg-transparent p-1 cursor-pointer shadow-sm"
                value={data.accentColor || '#ff6b35'}
                onChange={e => onChange({ accentColor: e.target.value })}
              />
              <Input 
                value={data.accentColor || '#ff6b35'}
                onChange={e => onChange({ accentColor: e.target.value })}
                className="font-mono text-sm uppercase"
              />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Used for focus states, call-to-action buttons, and decorative highlights.
            </p>
          </div>
        </div>

        <div className="p-6 border rounded-xl bg-muted/10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
            <Info className="h-3.5 w-3.5" /> Live Preview
          </div>
          <div className="flex flex-wrap gap-4">
            <Button style={{ backgroundColor: data.primaryColor || '#6366f1' }} className="shadow-lg shadow-primary/20">Primary Action</Button>
            <Button style={{ backgroundColor: data.accentColor || '#ff6b35' }} className="shadow-lg shadow-accent/20">Secondary Action</Button>
            <Button variant="outline" style={{ borderColor: data.primaryColor || '#6366f1', color: data.primaryColor || '#6366f1' }}>Ghost Action</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function NavigationSettings({ data, onChange }: any) {
  const links = (() => {
    try {
      const parsed = JSON.parse(data.navbarConfig || '[]')
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      return []
    }
  })()

  const setLinks = (newLinks: NavLink[]) => {
    onChange({ navbarConfig: JSON.stringify(newLinks) })
  }

  const addLink = () => setLinks([...links, { label: 'New Link', url: '/' }])
  const removeLink = (index: number) => setLinks(links.filter((_, i) => i !== index))
  const updateLink = (index: number, field: keyof NavLink, value: any) => {
    const newLinks = [...links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setLinks(newLinks)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-xl">Navigation Menu</CardTitle>
          <CardDescription>Links shown in the top header.</CardDescription>
        </div>
        <Button onClick={addLink} size="sm" variant="outline" className="gap-2">
          <Plus className="h-4 w-4" /> Add Link
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {links.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/5">
            <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Navigation className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No links added yet</p>
            <Button onClick={addLink} variant="link" size="sm" className="mt-1">Add your first navigation link</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link: NavLink, index: number) => (
              <div key={index} className="flex items-center gap-4 p-3 border rounded-lg bg-card group shadow-sm">
                <div className="cursor-grab text-muted-foreground/30 hover:text-muted-foreground px-1">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="grid flex-1 grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground/70 ml-1">Label</Label>
                    <Input 
                      value={link.label} 
                      onChange={e => updateLink(index, 'label', e.target.value)} 
                      placeholder="e.g. Products"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground/70 ml-1">URL / Path</Label>
                    <Input 
                      value={link.url} 
                      onChange={e => updateLink(index, 'url', e.target.value)} 
                      placeholder="/products"
                      className="h-9"
                    />
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeLink(index)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 self-end"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function FooterSettings({ data, onChange }: any) {
  const sections = (() => {
    try {
      const parsed = JSON.parse(data.footerConfig || '[]')
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      return []
    }
  })()

  const setSections = (newSections: FooterSection[]) => {
    onChange({ footerConfig: JSON.stringify(newSections) })
  }

  const addSection = () => setSections([...sections, { title: 'New Column', links: [] }])
  const removeSection = (index: number) => setSections(sections.filter((_, i) => i !== index))
  const updateSectionTitle = (index: number, title: string) => {
    const newSections = [...sections]
    newSections[index].title = title
    setSections(newSections)
  }

  const addLinkToSection = (sectionIndex: number) => {
    const newSections = [...sections]
    newSections[sectionIndex].links.push({ label: 'New Link', url: '#' })
    setSections(newSections)
  }

  const updateLinkInSection = (sectionIndex: number, linkIndex: number, field: keyof NavLink, value: any) => {
    const newSections = [...sections]
    newSections[sectionIndex].links[linkIndex] = { 
      ...newSections[sectionIndex].links[linkIndex], 
      [field]: value 
    }
    setSections(newSections)
  }

  const removeLinkFromSection = (sectionIndex: number, linkIndex: number) => {
    const newSections = [...sections]
    newSections[sectionIndex].links = newSections[sectionIndex].links.filter((_, i) => i !== linkIndex)
    setSections(newSections)
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Footer Branding</CardTitle>
          <CardDescription>Description and context shown in the footer area.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label htmlFor="footerDesc">About the Site</Label>
            <Textarea 
              id="footerDesc" 
              value={data.footerDescription || ''} 
              onChange={e => onChange({ footerDescription: e.target.value })}
              placeholder="e.g. Leading the way in modern cloud infrastructure."
              className="min-h-[120px] resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-xl">Footer Sitemap</CardTitle>
            <CardDescription>Organize links into structured columns.</CardDescription>
          </div>
          <Button onClick={addSection} size="sm" variant="outline" className="gap-2">
            <Plus className="h-4 w-4" /> Add Column
          </Button>
        </CardHeader>
        <CardContent>
          {sections.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/5">
              <p className="text-sm font-medium text-muted-foreground">Empty sitemap</p>
              <Button onClick={addSection} variant="link" size="sm" className="mt-1">Create first footer column</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {sections.map((section: FooterSection, sIndex: number) => (
                <div key={sIndex} className="p-5 border rounded-xl bg-card shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <Type className="h-4 w-4 text-muted-foreground/40" />
                      <Input 
                        value={section.title} 
                        onChange={e => updateSectionTitle(sIndex, e.target.value)}
                        className="font-bold border-none bg-transparent p-0 focus-visible:ring-0 text-lg h-auto"
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeSection(sIndex)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    {section.links.map((link, lIndex) => (
                      <div key={lIndex} className="flex items-center gap-2 group/link animate-in fade-in slide-in-from-left-2">
                        <Input 
                          value={link.label} 
                          onChange={e => updateLinkInSection(sIndex, lIndex, 'label', e.target.value)}
                          placeholder="Label"
                          className="h-8 text-xs flex-1"
                        />
                        <Input 
                          value={link.url} 
                          onChange={e => updateLinkInSection(sIndex, lIndex, 'url', e.target.value)}
                          placeholder="URL"
                          className="h-8 text-xs flex-[1.5]"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeLinkFromSection(sIndex, lIndex)}
                          className="h-8 w-8 shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addLinkToSection(sIndex)}
                      className="w-full h-8 border-dashed border-2 text-[10px] uppercase font-bold text-muted-foreground/70 hover:bg-muted hover:border-muted-foreground/20"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Link
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}