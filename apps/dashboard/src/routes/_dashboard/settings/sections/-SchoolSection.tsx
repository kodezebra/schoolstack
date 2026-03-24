import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2, Phone, Mail, MapPin } from 'lucide-react'
import type { ParsedSettings } from '../settings.types'

interface SchoolSectionProps {
  settings: ParsedSettings
  onUpdate: (key: keyof ParsedSettings | Partial<ParsedSettings>, value?: unknown) => void
}

export function SchoolSection({ settings, onUpdate }: SchoolSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
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
                value={settings.schoolName}
                onChange={(e) => onUpdate('schoolName', e.target.value)}
                placeholder="Your School Name"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schoolEmail">School Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="schoolEmail"
                type="email"
                value={settings.schoolEmail}
                onChange={(e) => onUpdate('schoolEmail', e.target.value)}
                placeholder="info@school.edu"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schoolPhone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="schoolPhone"
                type="tel"
                value={settings.schoolPhone}
                onChange={(e) => onUpdate('schoolPhone', e.target.value)}
                placeholder="+256 700 000 000"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schoolAddress">Physical Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="schoolAddress"
                value={settings.schoolAddress}
                onChange={(e) => onUpdate('schoolAddress', e.target.value)}
                placeholder="123 School Street, City"
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
