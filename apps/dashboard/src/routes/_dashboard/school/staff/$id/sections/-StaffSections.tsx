import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, RoleBadge } from '@/components/ui/status-badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Mail, Phone } from 'lucide-react'

interface Staff {
  id: string
  employeeNo: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: 'teacher' | 'admin' | 'counselor' | 'principal'
  department?: string
  qualifications?: string
  experience?: string
  photo?: string
  status: 'active' | 'inactive'
  joinDate: string
}

interface OverviewSectionProps {
  staff: Staff
  isEditing: boolean
  editedData: Staff | null
  onEditChange: (data: Staff) => void
}

export function OverviewSection({ staff, isEditing, editedData, onEditChange }: OverviewSectionProps) {
  const display = isEditing && editedData ? editedData : staff

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input 
                    value={editedData?.firstName || ''} 
                    onChange={(e) => onEditChange({ ...editedData!, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input 
                    value={editedData?.lastName || ''} 
                    onChange={(e) => onEditChange({ ...editedData!, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select 
                  value={editedData?.role} 
                  onValueChange={(v) => onEditChange({ ...editedData!, role: v as Staff['role'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="counselor">Counselor</SelectItem>
                    <SelectItem value="principal">Principal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={editedData?.status} 
                  onValueChange={(v) => onEditChange({ ...editedData!, status: v as Staff['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <RoleBadge role={staff.role} />
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="font-medium">{new Date(staff.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
              <Badge variant={staff.status === 'active' ? 'default' : 'secondary'}>
                {staff.status}
              </Badge>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input 
                  value={editedData?.email || ''} 
                  onChange={(e) => onEditChange({ ...editedData!, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input 
                  value={editedData?.phone || ''} 
                  onChange={(e) => onEditChange({ ...editedData!, phone: e.target.value })}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{staff.email}</p>
                </div>
              </div>
              {staff.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{staff.phone}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface DetailsSectionProps {
  staff: Staff
  isEditing: boolean
  editedData: Staff | null
  onEditChange: (data: Staff) => void
}

export function DetailsSection({ staff, isEditing, editedData, onEditChange }: DetailsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Professional Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <label className="text-sm font-medium">Department</label>
              <Input 
                value={editedData?.department || ''} 
                onChange={(e) => onEditChange({ ...editedData!, department: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Qualifications</label>
              <Input 
                value={editedData?.qualifications || ''} 
                onChange={(e) => onEditChange({ ...editedData!, qualifications: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Experience</label>
              <Input 
                value={editedData?.experience || ''} 
                onChange={(e) => onEditChange({ ...editedData!, experience: e.target.value })}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="font-medium">{staff.department || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Qualifications</p>
                <p className="font-medium">{staff.qualifications || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Experience</p>
                <p className="font-medium">{staff.experience || '-'}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

import { Briefcase, GraduationCap } from 'lucide-react'

export function NotesSection() {
  return (
    <Card>
      <CardContent className="py-8 text-center text-muted-foreground">
        Notes feature coming soon...
      </CardContent>
    </Card>
  )
}
