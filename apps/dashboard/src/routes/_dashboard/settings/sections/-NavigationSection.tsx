import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { PageSelector } from '@/components/cms-editor/PageSelector'
import { Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react'
import type { ParsedSettings } from '../settings.types'

interface NavigationSectionProps {
  settings: ParsedSettings
  onUpdate: (key: keyof ParsedSettings | Partial<ParsedSettings>, value?: unknown) => void
  navbarActions: {
    addLink: () => void
    updateLink: (index: number, field: any, value: string) => void
    removeLink: (index: number) => void
    moveLink: (index: number, direction: 'up' | 'down') => void
    addChildLink: (parentIndex: number) => void
    updateChildLink: (parentIndex: number, childIndex: number, field: any, value: string) => void
    removeChildLink: (parentIndex: number, childIndex: number) => void
  }
}

export function NavigationSection({ settings, onUpdate, navbarActions }: NavigationSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Navigation Links
          </CardTitle>
          <CardDescription>Manage the links in your site header</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.navbarLinks.map((link, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/20">
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6"
                    onClick={() => navbarActions.moveLink(index, 'up')} disabled={index === 0}>
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6"
                    onClick={() => navbarActions.moveLink(index, 'down')} 
                    disabled={index === settings.navbarLinks.length - 1}>
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  value={link.label}
                  onChange={(e) => navbarActions.updateLink(index, 'label', e.target.value)}
                  placeholder="Link label"
                  className="flex-1"
                />
                <PageSelector
                  value={link.href}
                  onChange={(value) => navbarActions.updateLink(index, 'href', value)}
                  placeholder="/page"
                />
                <Button variant="ghost" size="icon"
                  onClick={() => navbarActions.removeLink(index)}
                  disabled={settings.navbarLinks.length <= 1}>
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
                        onChange={(e) => navbarActions.updateChildLink(index, childIndex, 'label', e.target.value)}
                        placeholder="Child label"
                        className="flex-1"
                      />
                      <PageSelector
                        value={child.href}
                        onChange={(value) => navbarActions.updateChildLink(index, childIndex, 'href', value)}
                        placeholder="/child"
                      />
                      <Button variant="ghost" size="icon"
                        onClick={() => navbarActions.removeChildLink(index, childIndex)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="ghost" size="sm" onClick={() => navbarActions.addChildLink(index)}
                className="ml-8 text-muted-foreground">
                <Plus className="h-3 w-3 mr-1" />
                Add dropdown
              </Button>
            </div>
          ))}

          <Button onClick={navbarActions.addLink} variant="outline" className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Link
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Call-to-Action Button
          </CardTitle>
          <CardDescription>Optional CTA button in the navigation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="ctaShow">Show CTA Button</Label>
            <Switch
              id="ctaShow"
              checked={settings.navbarCta.show}
              onCheckedChange={(checked) =>
                onUpdate('navbarCta', { ...settings.navbarCta, show: checked })
              }
            />
          </div>
          {settings.navbarCta.show && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="ctaLabel">Button Label</Label>
                <Input
                  id="ctaLabel"
                  value={settings.navbarCta.label}
                  onChange={(e) => onUpdate('navbarCta', { ...settings.navbarCta, label: e.target.value })}
                  placeholder="Get Started"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="ctaHref">Button URL</Label>
                <div className="mt-1.5">
                  <PageSelector
                    value={settings.navbarCta.href}
                    onChange={(value) => onUpdate('navbarCta', { ...settings.navbarCta, href: value })}
                    placeholder="/contact"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
