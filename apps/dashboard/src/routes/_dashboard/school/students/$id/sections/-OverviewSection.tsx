import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User, Calendar, Phone, Mail, MapPin } from 'lucide-react'
import type { Student } from './student.types'

interface OverviewSectionProps {
  student: Student
  isEditing: boolean
  editedData: Student | null
  onEditChange: (data: Student) => void
}

export function OverviewSection({ student, isEditing, editedData, onEditChange }: OverviewSectionProps) {
  const display = isEditing && editedData ? editedData : student

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Student Information</CardTitle>
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
                <label className="text-sm font-medium">Gender</label>
                <Select 
                  value={editedData?.gender} 
                  onValueChange={(v) => onEditChange({ ...editedData!, gender: v as Student['gender'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Roll No.</label>
                <Input 
                  value={editedData?.rollNo || ''} 
                  onChange={(e) => onEditChange({ ...editedData!, rollNo: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={editedData?.status} 
                  onValueChange={(v) => onEditChange({ ...editedData!, status: v as Student['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="transferred">Transferred</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium capitalize">{student.gender}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Enrolled</p>
                  <p className="font-medium">{new Date(student.enrollmentDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                  {student.status}
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Parent / Guardian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <label className="text-sm font-medium">Parent Name</label>
                <Input 
                  value={editedData?.parentName || ''} 
                  onChange={(e) => onEditChange({ ...editedData!, parentName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input 
                  value={editedData?.parentPhone || ''} 
                  onChange={(e) => onEditChange({ ...editedData!, parentPhone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input 
                  value={editedData?.parentEmail || ''} 
                  onChange={(e) => onEditChange({ ...editedData!, parentEmail: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Input 
                  value={editedData?.address || ''} 
                  onChange={(e) => onEditChange({ ...editedData!, address: e.target.value })}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Parent Name</p>
                  <p className="font-medium">{student.parentName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{student.parentPhone}</p>
                </div>
              </div>
              {student.parentEmail && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{student.parentEmail}</p>
                  </div>
                </div>
              )}
              {student.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="font-medium">{student.address}</p>
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
