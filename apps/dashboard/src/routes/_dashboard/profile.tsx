import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhotoUpload } from '@/components/ui/photo-upload'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useToast } from '@/components/ui/toast'
import {
  User,
  Lock,
  Save,
  Loader2,
  CheckCircle2
} from 'lucide-react'

export const Route = createFileRoute('/_dashboard/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('account')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Form states
  const [accountForm, setAccountForm] = useState({ name: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await apiFetch('/auth/me')
      if (!res.ok) return null
      return res.json()
    }
  })

  // Initialize form when user data loads
  useEffect(() => {
    if (user) {
      setAccountForm({
        name: user.name || '',
        email: user.email || ''
      })
    }
  }, [user])

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name?: string; email?: string }) => {
      const res = await apiFetch('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update profile')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      setHasUnsavedChanges(false)
      toast({
        title: 'Profile updated',
        variant: 'success'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'error'
      })
    }
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to change password')
      }
      return res.json()
    },
    onSuccess: () => {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setFormErrors({})
      toast({
        title: 'Password changed',
        variant: 'success'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Password change failed',
        description: error.message,
        variant: 'error'
      })
    }
  })

  const handleAccountSubmit = () => {
    updateProfileMutation.mutate({
      name: accountForm.name,
      email: accountForm.email
    })
  }

  const handlePasswordSubmit = () => {
    const errors: Record<string, string> = {}
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required'
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters'
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Breadcrumb items={[{ label: 'Profile' }]} />
        <h1 className="text-3xl font-bold tracking-tight mt-2">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your name, email, and profile photo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profile Photo */}
                <div className="flex items-center gap-4">
                  <PhotoUpload
                    entityType="user"
                    entityId={user?.id || null}
                    currentPhoto={user?.photo}
                    size="lg"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{user?.name || 'User'}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">{user?.role}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={accountForm.name}
                    onChange={(e) => {
                      setAccountForm({ ...accountForm, name: e.target.value })
                      setHasUnsavedChanges(true)
                    }}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={accountForm.email}
                    onChange={(e) => {
                      setAccountForm({ ...accountForm, email: e.target.value })
                      setHasUnsavedChanges(true)
                    }}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="pt-4">
                  <Button
                    onClick={handleAccountSubmit}
                    disabled={updateProfileMutation.isPending || !hasUnsavedChanges}
                    className="gap-2"
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : hasUnsavedChanges ? (
                      <Save className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {updateProfileMutation.isPending ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password <span className="text-destructive">*</span></Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => {
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      setFormErrors(e => ({ ...e, currentPassword: '' }))
                    }}
                    placeholder="Enter current password"
                    className={formErrors.currentPassword ? 'border-destructive' : ''}
                  />
                  {formErrors.currentPassword && <p className="text-xs text-destructive">{formErrors.currentPassword}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password <span className="text-destructive">*</span></Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => {
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      setFormErrors(e => ({ ...e, newPassword: '' }))
                    }}
                    placeholder="Minimum 8 characters"
                    className={formErrors.newPassword ? 'border-destructive' : ''}
                  />
                  {formErrors.newPassword && <p className="text-xs text-destructive">{formErrors.newPassword}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password <span className="text-destructive">*</span></Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => {
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      setFormErrors(e => ({ ...e, confirmPassword: '' }))
                    }}
                    placeholder="Re-enter new password"
                    className={formErrors.confirmPassword ? 'border-destructive' : ''}
                  />
                  {formErrors.confirmPassword && <p className="text-xs text-destructive">{formErrors.confirmPassword}</p>}
                </div>
                <div className="pt-4">
                  <Button
                    onClick={handlePasswordSubmit}
                    disabled={changePasswordMutation.isPending}
                    className="gap-2"
                  >
                    {changePasswordMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {changePasswordMutation.isPending ? 'Changing Password...' : 'Change Password'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default ProfilePage
