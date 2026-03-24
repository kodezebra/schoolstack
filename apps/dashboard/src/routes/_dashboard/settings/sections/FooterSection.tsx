import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PageSelector } from '@/components/cms-editor/PageSelector'
import { IconPicker } from '@/components/cms-editor/IconPicker'
import { Icon } from '@iconify/react'
import { Trash2, Plus } from 'lucide-react'
import type { ParsedSettings } from '../settings.types'

interface FooterSectionProps {
  settings: ParsedSettings
  onUpdate: (key: keyof ParsedSettings | Partial<ParsedSettings>, value?: unknown) => void
  footerActions: {
    addColumn: () => void
    updateColumn: (index: number, field: any, value: any) => void
    removeColumn: (index: number) => void
    addLink: (columnIndex: number) => void
    updateLink: (columnIndex: number, linkIndex: number, field: any, value: string) => void
    removeLink: (columnIndex: number, linkIndex: number) => void
    addSocial: () => void
    updateSocial: (index: number, field: any, value: string) => void
    removeSocial: (index: number) => void
  }
}

export function FooterSection({ settings, onUpdate, footerActions }: FooterSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Footer Description
          </CardTitle>
          <CardDescription>Brief description shown in footer</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={settings.footerDescription}
            onChange={(e) => onUpdate('footerDescription', e.target.value)}
            placeholder="A brief description of your school or organization..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Footer Columns
          </CardTitle>
          <CardDescription>Organize your footer links into columns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.footerColumns.map((column, colIndex) => (
            <div key={colIndex} className="p-4 rounded-lg border space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={column.title}
                  onChange={(e) => footerActions.updateColumn(colIndex, 'title', e.target.value)}
                  placeholder="Column title"
                  className="flex-1 font-medium"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => footerActions.removeColumn(colIndex)}
                  disabled={settings.footerColumns.length <= 1}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="space-y-2 pl-2">
                {column.links.map((link, linkIndex) => (
                  <div key={linkIndex} className="flex items-center gap-2">
                    <Input
                      value={link.label}
                      onChange={(e) => footerActions.updateLink(colIndex, linkIndex, 'label', e.target.value)}
                      placeholder="Link label"
                      className="flex-1 text-sm"
                    />
                    <PageSelector
                      value={link.href}
                      onChange={(value) => footerActions.updateLink(colIndex, linkIndex, 'href', value)}
                      placeholder="/page"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => footerActions.removeLink(colIndex, linkIndex)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}

                <Button
                  onClick={() => footerActions.addLink(colIndex)}
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

          <Button onClick={footerActions.addColumn} variant="outline" className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Column
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Social Media Links
          </CardTitle>
          <CardDescription>Add your social media profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.footerSocials.map((social, index) => (
            <div key={index} className="flex items-center gap-2 p-3 rounded-lg border bg-muted/20">
              <IconPicker
                value={social.icon}
                onSelect={(icon) => footerActions.updateSocial(index, 'icon', icon)}
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
                onChange={(e) => footerActions.updateSocial(index, 'platform', e.target.value)}
                placeholder="Platform name"
                className="flex-1"
              />
              <Input
                value={social.url}
                onChange={(e) => footerActions.updateSocial(index, 'url', e.target.value)}
                placeholder="https://..."
                className="flex-1 font-mono text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => footerActions.removeSocial(index)}
                disabled={settings.footerSocials.length <= 1}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button onClick={footerActions.addSocial} variant="outline" className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Social Link
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
