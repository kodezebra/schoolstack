import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { THEMES, FONT_OPTIONS, BORDER_RADIUS_OPTIONS } from '../settings.data'
import type { ParsedSettings, SiteTheme } from '../settings.types'

interface ThemeSectionProps {
  settings: ParsedSettings
  onUpdate: (key: keyof ParsedSettings | Partial<ParsedSettings>, value?: unknown) => void
}

export function ThemeSection({ settings, onUpdate }: ThemeSectionProps) {
  const applyTheme = (theme: SiteTheme) => {
    onUpdate('theme', theme.id)
    onUpdate('primaryColor', theme.primaryColor)
    onUpdate('accentColor', theme.accentColor)
    onUpdate('backgroundLight', theme.backgroundLight)
    onUpdate('backgroundDark', theme.backgroundDark)
    onUpdate('fontDisplay', theme.fontDisplay)
    onUpdate('fontBody', theme.fontBody)
    onUpdate('borderRadius', theme.borderRadius)
    onUpdate('darkMode', theme.darkMode)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Color Theme
          </CardTitle>
          <CardDescription>Choose a preset theme or customize colors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => applyTheme(theme)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  settings.theme === theme.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <div className="flex gap-1 mb-3">
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.backgroundLight, border: '1px solid #e5e5e5' }} />
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.backgroundDark }} />
                </div>
                <div className="font-semibold text-sm">{theme.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {theme.description}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
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
                value={settings.fontDisplay}
                onChange={(e) => onUpdate('fontDisplay', e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {FONT_OPTIONS.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
              <div
                className="text-sm p-2 rounded border bg-muted/30"
                style={{ fontFamily: settings.fontDisplay }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontBody">Body Font</Label>
              <select
                id="fontBody"
                value={settings.fontBody}
                onChange={(e) => onUpdate('fontBody', e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {FONT_OPTIONS.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
              <div
                className="text-sm p-2 rounded border bg-muted/30"
                style={{ fontFamily: settings.fontBody }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Appearance
          </CardTitle>
          <CardDescription>Visual styling preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Border Radius</Label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {BORDER_RADIUS_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onUpdate('borderRadius', option.id)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    settings.borderRadius === option.id
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
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onUpdate('darkMode', mode)}
                  className={`flex-1 p-3 rounded-lg border text-center transition-all capitalize ${
                    settings.darkMode === mode
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-200 hover:border-primary/50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
