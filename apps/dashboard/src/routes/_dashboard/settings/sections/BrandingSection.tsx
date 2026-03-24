import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MediaPicker } from '@/components/cms-editor/MediaPicker'
import { IconPicker } from '@/components/cms-editor/IconPicker'
import { Image as ImageIcon } from 'lucide-react'
import type { ParsedSettings } from '../settings.types'

interface BrandingSectionProps {
  settings: ParsedSettings
  onUpdate: (key: keyof ParsedSettings | Partial<ParsedSettings>, value?: unknown) => void
}

export function BrandingSection({ settings, onUpdate }: BrandingSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Logo
          </CardTitle>
          <CardDescription>Choose how your logo appears</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <div
              className={`cursor-pointer border-2 rounded-lg p-4 flex flex-col items-center justify-center w-32 h-32 transition-colors ${
                settings.logoType === 'icon' ? 'border-primary bg-primary/5' : 'border-muted'
              }`}
              onClick={() => onUpdate('logoType', 'icon')}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-2"
                style={{ backgroundColor: settings.primaryColor + '20' }}
              >
                <span className="text-2xl" style={{ color: settings.primaryColor }}>
                  {settings.logoIcon ? settings.logoIcon.charAt(0).toUpperCase() : 'S'}
                </span>
              </div>
              <span className="text-xs font-medium">Icon</span>
            </div>

            <div
              className={`cursor-pointer border-2 rounded-lg p-4 flex flex-col items-center justify-center w-32 h-32 transition-colors ${
                settings.logoType === 'image' ? 'border-primary bg-primary/5' : 'border-muted'
              }`}
              onClick={() => onUpdate('logoType', 'image')}
            >
              {settings.logoImage ? (
                <img src={settings.logoImage} alt="Logo" className="w-16 h-16 object-contain mb-2" />
              ) : (
                <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
              )}
              <span className="text-xs font-medium">Image</span>
            </div>
          </div>

          {settings.logoType === 'icon' && (
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <IconPicker
                    value={settings.logoIcon}
                    onSelect={(icon) => onUpdate('logoIcon', icon)}
                    trigger={
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <span className="text-lg">{settings.logoIcon?.charAt(0).toUpperCase() || 'A'}</span>
                        <span className="text-muted-foreground">Select icon</span>
                      </Button>
                    }
                    defaultTab="ui"
                  />
                </div>
              </div>
            </div>
          )}

          {settings.logoType === 'image' && (
            <div className="space-y-2">
              <Label>Logo Image</Label>
              <MediaPicker
                onSelect={(url) => onUpdate('logoImage', url)}
                trigger={
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <ImageIcon className="h-4 w-4" />
                    {settings.logoImage ? 'Change Logo' : 'Select Logo'}
                  </Button>
                }
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="logoText">Logo Text</Label>
            <Input
              id="logoText"
              value={settings.logoText}
              onChange={(e) => onUpdate('logoText', e.target.value)}
              placeholder="Your Brand"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Colors
          </CardTitle>
          <CardDescription>Choose your brand colors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => onUpdate('primaryColor', e.target.value)}
                  className="w-14 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => onUpdate('primaryColor', e.target.value)}
                  placeholder="#6366f1"
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accentColor"
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => onUpdate('accentColor', e.target.value)}
                  className="w-14 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={settings.accentColor}
                  onChange={(e) => onUpdate('accentColor', e.target.value)}
                  placeholder="#ff6b35"
                  className="flex-1 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <div
              className="flex-1 h-20 rounded-lg flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: settings.primaryColor }}
            >
              Primary
            </div>
            <div
              className="flex-1 h-20 rounded-lg flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: settings.accentColor }}
            >
              Accent
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Favicon
          </CardTitle>
          <CardDescription>Small icon shown in browser tabs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MediaPicker
            onSelect={(url) => onUpdate('favicon', url)}
            trigger={
              <Button variant="outline" className="w-full justify-start gap-2">
                <ImageIcon className="h-4 w-4" />
                {settings.favicon ? 'Change Favicon' : 'Select Favicon'}
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
