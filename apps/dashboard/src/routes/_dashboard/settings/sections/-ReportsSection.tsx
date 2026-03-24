import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { REPORT_CARD_THEMES } from '../settings.data'
import type { ParsedSettings, ReportCardTheme } from '../settings.types'

interface ReportsSectionProps {
  settings: ParsedSettings
  onUpdate: (key: keyof ParsedSettings | Partial<ParsedSettings>, value?: unknown) => void
}

export function ReportsSection({ settings, onUpdate }: ReportsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Report Card Theme
        </CardTitle>
        <CardDescription>Choose a theme for your student report cards</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REPORT_CARD_THEMES.map((theme: ReportCardTheme) => (
            <button
              key={theme.id}
              onClick={() => onUpdate('reportCardTheme', theme.id)}
              className={`p-4 rounded-lg border text-left transition-all ${
                settings.reportCardTheme === theme.id
                  ? 'border-primary bg-primary/5 ring-2 ring-primary'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">{theme.name}</span>
                {settings.reportCardTheme === theme.id && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{theme.description}</p>
              <div className="flex gap-1">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.primary }} title="Primary" />
                <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.secondary }} title="Secondary" />
                <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.accent }} title="Accent" />
                <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.header }} title="Header" />
                <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.tableHeader }} title="Table Header" />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-muted/30">
          <h4 className="font-medium text-sm mb-3">Preview</h4>
          {(() => {
            const theme = REPORT_CARD_THEMES.find(t => t.id === settings.reportCardTheme) || REPORT_CARD_THEMES[0]
            return (
              <div className="rounded-lg overflow-hidden border" style={{ backgroundColor: theme.colors.background }}>
                <div className="p-4 text-white" style={{ backgroundColor: theme.colors.header }}>
                  <div className="font-bold">{settings.schoolName || 'School Name'}</div>
                  <div className="text-sm opacity-80">Student Report Card</div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between mb-4">
                    <div>
                      <div className="font-semibold">Student Name</div>
                      <div className="text-sm text-muted-foreground">Term 1, 2024</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">Grade: P1</div>
                      <div className="text-sm text-muted-foreground">Class: Primary 1</div>
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: theme.colors.tableHeader, color: 'white' }}>
                        <th className="p-2 text-left">Subject</th>
                        <th className="p-2 text-center">Marks</th>
                        <th className="p-2 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ backgroundColor: theme.colors.tableRow }}>
                        <td className="p-2">Mathematics</td>
                        <td className="p-2 text-center">85</td>
                        <td className="p-2 text-center" style={{ color: theme.colors.primary }}>A</td>
                      </tr>
                      <tr>
                        <td className="p-2">English</td>
                        <td className="p-2 text-center">78</td>
                        <td className="p-2 text-center" style={{ color: theme.colors.primary }}>B+</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="p-3 text-center text-sm" style={{ backgroundColor: theme.colors.footer }}>
                  <span style={{ color: theme.colors.text }}>Total: 163/200</span>
                </div>
              </div>
            )
          })()}
        </div>
      </CardContent>
    </Card>
  )
}
