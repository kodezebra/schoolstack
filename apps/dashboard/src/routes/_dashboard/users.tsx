import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useToast } from '@/components/ui/toast'
import {
  MoreVertical,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Loader2
} from 'lucide-react'

export const Route = createFileRoute('/_dashboard/users')({
  component: UsersPage,
})

interface User {
  id: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  createdAt: string
}

function UsersPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const { confirm, renderConfirmDialog } = useConfirmDialog()

  // Form states
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer' as User['role']
  })

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'viewer' as User['role']
  })

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await apiFetch('/users')
      if (!res.ok) throw new Error('Failed to fetch users')
      return res.json() as Promise<User[]>
    }
  })

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await apiFetch('/auth/me')
      if (!res.ok) return null
      return res.json()
    }
  })

  // Permission helpers
  const isOwner = currentUser?.role === 'owner'
  const isAdmin = currentUser?.role === 'admin'
  const canManageUsers = isOwner || isAdmin
  const ownerCount = users?.filter(u => u.role === 'owner').length || 0

  const canDeleteUser = (user: User | null): boolean => {
    if (!user) return false
    if (user.id === currentUser?.id) return false
    if (user.role === 'owner') {
      if (!isOwner) return false
      if (ownerCount <= 1) return false
    }
    return true
  }

  const canEditUser = (user: User | null): boolean => {
    if (!user) return false
    if (user.role === 'owner' && !isOwner) return false
    return true
  }

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: typeof addForm) => {
      const res = await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create user')
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsAddSheetOpen(false)
      setAddForm({ name: '', email: '', password: '', role: 'viewer' })
      toast({
        title: 'User created',
        description: `${data.name || data.email} can now log in.`,
        variant: 'success'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create user',
        description: error.message,
        variant: 'error'
      })
    }
  })

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof editForm }) => {
      const res = await apiFetch(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update user')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsEditSheetOpen(false)
      setSelectedUser(null)
      toast({
        title: 'User updated',
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

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/users/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete user')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({
        title: 'User deleted',
        variant: 'success'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'error'
      })
    }
  })

  const handleAddUser = () => {
    createUserMutation.mutate(addForm)
  }

  const handleEditUser = () => {
    if (!selectedUser) return
    updateUserMutation.mutate({ id: selectedUser.id, data: editForm })
  }

  const handleDeleteUser = () => {
    if (!selectedUser) return
    deleteUserMutation.mutate(selectedUser.id)
    setIsEditSheetOpen(false)
    setSelectedUser(null)
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      name: user.name || '',
      email: user.email,
      role: user.role
    })
    setIsEditSheetOpen(true)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200'
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200'
      case 'editor':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200'
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb items={[{ label: 'Users' }]} />
          <h1 className="text-3xl font-bold tracking-tight mt-2">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage team members and their permissions</p>
        </div>
        {canManageUsers && (
          <Button onClick={() => setIsAddSheetOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>All users with access to the CMS</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || '—'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {canManageUsers && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {canEditUser(user) ? (
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem disabled>
                              <Shield className="h-4 w-4 mr-2" />
                              Edit (Restricted)
                            </DropdownMenuItem>
                          )}
                          {canDeleteUser(user) ? (
                            <DropdownMenuItem
                              onClick={() => {
                                confirm({
                                  title: "Delete User",
                                  description: `Are you sure you want to delete ${user.name || user.email}? This action cannot be undone.`,
                                  confirmText: "Delete",
                                  variant: "destructive",
                                  onConfirm: () => deleteUserMutation.mutate(user.id),
                                })
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem disabled className="text-muted-foreground">
                              <Trash2 className="h-4 w-4 mr-2" />
                              {user.role === 'owner' && ownerCount <= 1 ? 'Cannot delete last owner' : 'Cannot delete'}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[480px] overflow-y-auto p-6">
          <SheetHeader>
            <SheetTitle>Add New User</SheetTitle>
            <SheetDescription>
              Create a new team member account. They will receive login credentials.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-name">Name <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <Input
                id="add-name"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="John Doe"
                maxLength={100}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-email">Email <span className="text-destructive">*</span></Label>
              <Input
                id="add-email"
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                placeholder="john@example.com"
                maxLength={255}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-password">Password <span className="text-destructive">*</span></Label>
              <Input
                id="add-password"
                type="password"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                placeholder="Minimum 8 characters"
                minLength={8}
                maxLength={128}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-role">Role <span className="text-destructive">*</span></Label>
              <Select
                value={addForm.role}
                onValueChange={(value: User['role']) => setAddForm({ ...addForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {isOwner && (
                    <SelectItem value="owner">
                      <div className="flex flex-col">
                        <span>Owner</span>
                        <span className="text-xs text-muted-foreground">Full access, cannot be changed</span>
                      </div>
                    </SelectItem>
                  )}
                  <SelectItem value="admin">
                    <div className="flex flex-col">
                      <span>Admin</span>
                      <span className="text-xs text-muted-foreground">Manage all settings and users</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex flex-col">
                      <span>Editor</span>
                      <span className="text-xs text-muted-foreground">Edit website and manage students</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex flex-col">
                      <span>Viewer</span>
                      <span className="text-xs text-muted-foreground">Read-only access</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {isAdmin && (
                <p className="text-xs text-muted-foreground mt-1">
                  Only owners can create other owners
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 pb-4">
            <Button variant="outline" onClick={() => setIsAddSheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit User Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[480px] overflow-y-auto p-6">
          <SheetHeader>
            <SheetTitle>Edit User</SheetTitle>
            <SheetDescription>
              Update user information and permissions
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="John Doe"
                disabled={!canEditUser(selectedUser)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="john@example.com"
                disabled={!canEditUser(selectedUser)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(value: User['role']) => setEditForm({ ...editForm, role: value })}
                disabled={!canEditUser(selectedUser)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {isOwner && (
                    <SelectItem value="owner">
                      <div className="flex flex-col">
                        <span>Owner</span>
                        <span className="text-xs text-muted-foreground">Full access, cannot be changed</span>
                      </div>
                    </SelectItem>
                  )}
                  <SelectItem value="admin">
                    <div className="flex flex-col">
                      <span>Admin</span>
                      <span className="text-xs text-muted-foreground">Manage all settings and users</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex flex-col">
                      <span>Editor</span>
                      <span className="text-xs text-muted-foreground">Edit website and manage students</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex flex-col">
                      <span>Viewer</span>
                      <span className="text-xs text-muted-foreground">Read-only access</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {selectedUser?.id === currentUser?.id && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="h-3 w-3" /> You cannot change your own role
                </p>
              )}
              {selectedUser?.role === 'owner' && !isOwner && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Only owners can edit other owners
                </p>
              )}
              {selectedUser?.role === 'owner' && isOwner && ownerCount <= 1 && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <Shield className="h-3 w-3" /> You are the only owner - cannot change your role
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 pb-4">
            {canDeleteUser(selectedUser!) && (
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={deleteUserMutation.isPending}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsEditSheetOpen(false)}>
              Cancel
            </Button>
            {canEditUser(selectedUser!) ? (
              <Button onClick={handleEditUser} disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            ) : (
              <Button disabled>
                <Shield className="h-4 w-4 mr-2" />
                Cannot Edit
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {renderConfirmDialog()}
    </div>
  )
}

export default UsersPage
